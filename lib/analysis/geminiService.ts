import { GoogleGenAI } from '@google/genai';
import type {
  AnalysisRequestPayload,
  SocialXRayAnalysisResult,
  NormalizedApiError,
} from './types';
import { buildGeminiSystemPrompt, buildGeminiUserPrompt } from './prompt';
import {
  extractJsonFromResponse,
  validateAndNormalizeAnalysis,
  classifyGeminiError,
  STABLE_GEMINI_MODEL,
} from './validator';

export { classifyGeminiError, STABLE_GEMINI_MODEL };

export const MAX_CONTENT_LENGTH = 50000; // 50k characters safe request size cap
export const MIN_CONTENT_WORDS = 3;

export interface GeminiAnalysisOptions {
  apiKey?: string;
  modelName?: string;
  maxRetries?: number;
}

/**
 * Custom Error subclass carrying the NormalizedApiError payload.
 */
export class ForensicAnalysisError extends Error {
  normalized: NormalizedApiError;

  constructor(normalized: NormalizedApiError) {
    super(normalized.message);
    this.name = 'ForensicAnalysisError';
    this.normalized = normalized;
  }
}

/**
 * Executes forensic analysis using Google Gemini gemini-2.5-flash
 * with exponential backoff retries for transient service errors.
 */
export async function runGeminiForensicAnalysis(
  payload: AnalysisRequestPayload,
  options: GeminiAnalysisOptions = {}
): Promise<SocialXRayAnalysisResult> {
  const { content, targetGoal = 'conversation', userMetrics } = payload;

  // 1. Content validation
  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new ForensicAnalysisError({
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Empty Content',
      message: 'Cannot run AI forensic diagnosis on empty content. Please provide or extract valid text.',
      retryable: false,
      requiresKeyConfig: false,
    });
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    throw new ForensicAnalysisError({
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Content Too Large',
      message: `Post content length (${trimmedContent.length} characters) exceeds the maximum allowed limit of ${MAX_CONTENT_LENGTH} characters.`,
      retryable: false,
      requiresKeyConfig: false,
    });
  }

  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_CONTENT_WORDS) {
    throw new ForensicAnalysisError({
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Content Too Brief',
      message: 'Post is too brief for forensic attention mapping. Please provide at least 1-2 complete sentences.',
      retryable: false,
      requiresKeyConfig: false,
    });
  }

  // 2. API Key Resolution (Server Env > Option override)
  // NEVER exposed to client-side code
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ForensicAnalysisError({
      category: 'AUTHENTICATION_ERROR',
      status: 401,
      title: 'API configuration required',
      message: 'Missing Google Gemini API key. Please configure GEMINI_API_KEY in your server environment (.env.local or Vercel Settings).',
      retryable: false,
      requiresKeyConfig: true,
    });
  }

  // 3. Stable model: gemini-2.5-flash
  const model = options.modelName || process.env.GEMINI_MODEL || STABLE_GEMINI_MODEL;
  const maxRetries = typeof options.maxRetries === 'number' ? options.maxRetries : 3;

  // 4. Instantiate official Google GenAI SDK
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = buildGeminiSystemPrompt(targetGoal);
  const userPrompt = buildGeminiUserPrompt(trimmedContent, targetGoal, userMetrics);

  let responseText = '';
  let lastClassifiedError: NormalizedApiError | null = null;

  // 5. Execution with Exponential Backoff Retry Waterfall
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for high precision & reproducibility
        },
      });

      const durationMs = Date.now() - startTime;
      console.log(`[Social X-Ray] Gemini API request succeeded with model "${model}" in ${durationMs}ms (attempt ${attempt}/${maxRetries})`);

      responseText = response.text || '';
      if (responseText) {
        break; // Successfully received response
      }
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const classified = classifyGeminiError(err);
      lastClassifiedError = classified;

      // Safe server logging without leaking secrets or payload
      console.error(
        `[Social X-Ray] Gemini API failure (attempt ${attempt}/${maxRetries}): status=${classified.status}, category=${classified.category}, duration=${durationMs}ms`
      );

      // If error is transient & retryable (503, 500, 408) and attempts remain:
      if (classified.retryable && attempt < maxRetries) {
        // Exponential backoff: ~1s on 1st, ~2s on 2nd, ~4s on 3rd with random jitter
        const baseDelay = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.random() * 400;
        const totalDelay = Math.round(baseDelay + jitter);

        console.warn(`[Social X-Ray] Transient ${classified.category} encountered. Retrying in ${totalDelay}ms...`);
        await new Promise((res) => setTimeout(res, totalDelay));
        continue;
      }

      // Non-retryable errors (401, 403, 404, 400) or final attempt exhausted
      throw new ForensicAnalysisError(classified);
    }
  }

  if (!responseText) {
    if (lastClassifiedError) {
      throw new ForensicAnalysisError(lastClassifiedError);
    }
    throw new ForensicAnalysisError({
      category: 'MALFORMED_OUTPUT',
      status: 502,
      title: 'AI service error',
      message: 'Received an empty response from the Gemini AI diagnostic engine. Please try again.',
      retryable: true,
      requiresKeyConfig: false,
    });
  }

  try {
    // 6. Parse JSON safely
    const rawJson = extractJsonFromResponse(responseText);

    // 7. Validate and normalize structure according to analysis schema
    const validatedResult = validateAndNormalizeAnalysis(rawJson, trimmedContent, targetGoal);

    return validatedResult;
  } catch (parseErr: any) {
    console.error('[Social X-Ray] Response JSON parsing/normalization failure:', parseErr?.message);
    throw new ForensicAnalysisError({
      category: 'MALFORMED_OUTPUT',
      status: 502,
      title: 'AI service error',
      message: 'The AI diagnostic engine returned an unparseable response structure. Please retry.',
      retryable: true,
      requiresKeyConfig: false,
    });
  }
}
