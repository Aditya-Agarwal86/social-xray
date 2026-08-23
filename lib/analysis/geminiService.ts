import { GoogleGenAI } from '@google/genai';
import type { AnalysisRequestPayload, SocialXRayAnalysisResult } from './types';
import { buildGeminiSystemPrompt, buildGeminiUserPrompt } from './prompt';
import { extractJsonFromResponse, validateAndNormalizeAnalysis } from './validator';

export const MAX_CONTENT_LENGTH = 50000; // 50k characters safe request size cap
export const MIN_CONTENT_WORDS = 3;

export interface GeminiAnalysisOptions {
  apiKey?: string;
  modelName?: string;
}

// Ordered candidate models for high resilience across all API key tiers
const DEFAULT_CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-pro',
];

export async function runGeminiForensicAnalysis(
  payload: AnalysisRequestPayload,
  options: GeminiAnalysisOptions = {}
): Promise<SocialXRayAnalysisResult> {
  const { content, targetGoal = 'conversation', userMetrics } = payload;

  // 1. Content validation
  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new Error('Content is empty. Please provide or extract readable text before running forensic analysis.');
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content length (${trimmedContent.length} chars) exceeds the maximum allowed prompt size of ${MAX_CONTENT_LENGTH} characters.`);
  }

  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_CONTENT_WORDS) {
    throw new Error('Content is too brief for forensic attention mapping. Please provide at least 1-2 complete sentences.');
  }

  // 2. API Key Resolution (Server Env > Option override)
  // NEVER exposed to client-side code
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error: any = new Error(
      'Missing Google Gemini API key. Please configure GEMINI_API_KEY in your server environment (.env.local or Vercel Environment Variables).'
    );
    error.code = 'AUTH_KEY_MISSING';
    error.statusCode = 401;
    throw error;
  }

  // 3. Build candidate model chain
  const candidateModels: string[] = [];
  if (options.modelName) candidateModels.push(options.modelName);
  if (process.env.GEMINI_MODEL) candidateModels.push(process.env.GEMINI_MODEL);
  for (const m of DEFAULT_CANDIDATE_MODELS) {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  }

  // 4. Instantiate official Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildGeminiSystemPrompt(targetGoal);
  const userPrompt = buildGeminiUserPrompt(trimmedContent, targetGoal, userMetrics);

  let responseText = '';
  let lastError: any = null;

  // 5. Model execution waterfall
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      responseText = response.text || '';
      if (responseText) {
        break; // Successfully generated analysis
      }
    } catch (err: any) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const is404OrUnsupported =
        err?.status === 404 ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('no longer available') ||
        msg.includes('not supported');

      if (is404OrUnsupported) {
        console.warn(`Model "${model}" unavailable on this API key tier. Trying next candidate...`);
        continue;
      }

      // Fast-fail on authentication or rate limit errors
      throw err;
    }
  }

  if (!responseText && lastError) {
    throw lastError;
  }

  if (!responseText) {
    throw new Error('Received an empty response from the Gemini AI diagnostic engine.');
  }

  try {
    // 6. Parse JSON safely
    const rawJson = extractJsonFromResponse(responseText);

    // 7. Validate and normalize structure
    const validatedResult = validateAndNormalizeAnalysis(rawJson, trimmedContent, targetGoal);

    return validatedResult;
  } catch (err: any) {
    console.error('Gemini Forensic Analysis Error:', err);

    const msg = (err?.message || '').toLowerCase();
    const status = err?.status || err?.statusCode || 500;

    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
      const error: any = new Error('Google Gemini API rate limit reached. Please wait a moment and try again.');
      error.statusCode = 429;
      error.code = 'RATE_LIMIT_EXCEEDED';
      throw error;
    }

    if (msg.includes('api key') || msg.includes('unauthenticated') || msg.includes('401') || msg.includes('403')) {
      const error: any = new Error('Invalid or unauthorized Google Gemini API key.');
      error.statusCode = 401;
      error.code = 'INVALID_API_KEY';
      throw error;
    }

    if (err?.code === 'AUTH_KEY_MISSING') {
      throw err;
    }

    const customError: any = new Error(err?.message || 'An unexpected error occurred during AI forensic analysis.');
    customError.statusCode = status;
    customError.code = err?.code || 'ANALYSIS_FAILED';
    throw customError;
  }
}
