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
      'Missing Google Gemini API key. Please configure GEMINI_API_KEY in your server environment (.env.local).'
    );
    error.code = 'AUTH_KEY_MISSING';
    error.statusCode = 401;
    throw error;
  }

  const modelName = options.modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // 3. Instantiate official Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildGeminiSystemPrompt(targetGoal);
  const userPrompt = buildGeminiUserPrompt(trimmedContent, targetGoal, userMetrics);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high analytical accuracy and consistency
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error('Received an empty response from the Gemini AI diagnostic engine.');
    }

    // 4. Parse JSON safely
    const rawJson = extractJsonFromResponse(responseText);

    // 5. Validate and normalize structure
    const validatedResult = validateAndNormalizeAnalysis(rawJson, trimmedContent, targetGoal);

    return validatedResult;
  } catch (err: any) {
    console.error('Gemini Forensic Analysis Error:', err);

    // Handle known error signatures
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
