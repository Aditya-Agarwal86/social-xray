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

// Current stable production model for Social X-Ray AI forensics
const DEFAULT_MODEL = 'gemini-2.5-flash';

export async function runGeminiForensicAnalysis(
  payload: AnalysisRequestPayload,
  options: GeminiAnalysisOptions = {}
): Promise<SocialXRayAnalysisResult> {
  const { content, targetGoal = 'conversation', userMetrics } = payload;

  // 1. Content validation
  if (!content || typeof content !== 'string' || !content.trim()) {
    const error: any = new Error('Content is empty. Please provide or extract readable text before running forensic analysis.');
    error.statusCode = 400;
    error.code = 'EMPTY_CONTENT';
    throw error;
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    const error: any = new Error(`Content length (${trimmedContent.length} chars) exceeds the maximum allowed prompt size of ${MAX_CONTENT_LENGTH} characters.`);
    error.statusCode = 400;
    error.code = 'CONTENT_TOO_LARGE';
    throw error;
  }

  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_CONTENT_WORDS) {
    const error: any = new Error('Content is too brief for forensic attention mapping. Please provide at least 1-2 complete sentences.');
    error.statusCode = 400;
    error.code = 'CONTENT_TOO_SHORT';
    throw error;
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

  // 3. Model selection (gemini-2.5-flash)
  const selectedModel = options.modelName || process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // 4. Instantiate official Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildGeminiSystemPrompt(targetGoal);
  const userPrompt = buildGeminiUserPrompt(trimmedContent, targetGoal, userMetrics);

  let responseText = '';

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for consistent forensic accuracy
      },
    });

    responseText = response.text || '';
  } catch (apiErr: any) {
    // Server-side logging for developer diagnosis without leaking secrets
    console.error(`[Social X-Ray] Gemini API invocation error on model "${selectedModel}":`, apiErr?.message || apiErr);

    const rawMsg = (apiErr?.message || '').toLowerCase();
    const status = apiErr?.status || apiErr?.statusCode || 500;

    // Graceful error mapping (never dump raw JSON to client)
    if (rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('rate limit') || rawMsg.includes('resource_exhausted')) {
      const error: any = new Error('Google Gemini API rate limit reached. Please wait a moment and try again.');
      error.statusCode = 429;
      error.code = 'RATE_LIMIT_EXCEEDED';
      throw error;
    }

    if (rawMsg.includes('api key') || rawMsg.includes('unauthenticated') || rawMsg.includes('401') || rawMsg.includes('403') || rawMsg.includes('permission_denied')) {
      const error: any = new Error('Invalid or unauthorized Google Gemini API key. Please verify your API key configuration.');
      error.statusCode = 401;
      error.code = 'INVALID_API_KEY';
      throw error;
    }

    if (rawMsg.includes('404') || rawMsg.includes('not found') || rawMsg.includes('no longer available') || rawMsg.includes('not supported')) {
      const error: any = new Error(`AI model "${selectedModel}" is currently unavailable. Please verify your Gemini API access or try again.`);
      error.statusCode = 503;
      error.code = 'MODEL_UNAVAILABLE';
      throw error;
    }

    const customError: any = new Error('AI analysis is temporarily unavailable. Please check your API configuration and try again.');
    customError.statusCode = status;
    customError.code = apiErr?.code || 'ANALYSIS_FAILED';
    throw customError;
  }

  if (!responseText || !responseText.trim()) {
    const error: any = new Error('Received an empty response from the Gemini AI diagnostic engine. Please try again.');
    error.statusCode = 502;
    error.code = 'EMPTY_RESPONSE';
    throw error;
  }

  try {
    // 5. Parse JSON safely
    const rawJson = extractJsonFromResponse(responseText);

    // 6. Validate and normalize structure according to analysis schema
    const validatedResult = validateAndNormalizeAnalysis(rawJson, trimmedContent, targetGoal);

    return validatedResult;
  } catch (parseErr: any) {
    console.error('[Social X-Ray] Response normalization error:', parseErr);
    const error: any = new Error('Failed to parse diagnostic output from the AI engine. Please retry.');
    error.statusCode = 502;
    error.code = 'MALFORMED_OUTPUT';
    throw error;
  }
}
