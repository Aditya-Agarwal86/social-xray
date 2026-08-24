import { GoogleGenAI } from '@google/genai';
import type {
  AnalysisRequestPayload,
  SocialXRayAnalysisResult,
  NormalizedApiError,
} from './types';
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
  ANALYSIS_RESPONSE_JSON_SCHEMA,
} from './prompt';
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
 * Executes forensic analysis using Google Gemini gemini-3.5-flash
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
      title: 'Invalid request',
      message: 'The AI analysis request was rejected. Content cannot be empty.',
      retryable: false,
      requiresKeyConfig: false,
    });
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    throw new ForensicAnalysisError({
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Invalid request',
      message: `The AI analysis request was rejected. Post content length (${trimmedContent.length} chars) exceeds the maximum allowed limit of ${MAX_CONTENT_LENGTH} characters.`,
      retryable: false,
      requiresKeyConfig: false,
    });
  }

  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_CONTENT_WORDS) {
    throw new ForensicAnalysisError({
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Invalid request',
      message: 'The AI analysis request was rejected. Please provide at least 1-2 complete sentences for forensic mapping.',
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
      message: 'Gemini API authentication failed. Check your API configuration.',
      retryable: false,
      requiresKeyConfig: true,
    });
  }

  // 3. Stable model: gemini-3.5-flash
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
          responseSchema: ANALYSIS_RESPONSE_JSON_SCHEMA,
          temperature: 0.2, // Low temperature for high precision & reproducibility
        },
      });

      const durationMs = Date.now() - startTime;
      responseText = response.text || '';

      console.log(
        `[Social X-Ray] Gemini API request succeeded with model "${model}" in ${durationMs}ms (attempt ${attempt}/${maxRetries}), response length: ${responseText.length} chars`
      );

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

  // 6. Parse JSON safely
  let rawJson: any;
  try {
    rawJson = extractJsonFromResponse(responseText);
    console.log('[Social X-Ray] JSON parse success. Top-level keys:', Object.keys(rawJson || {}));
  } catch (parseErr: any) {
    console.error('[Social X-Ray] Response JSON extraction failure:', parseErr?.message);
    console.error('[Social X-Ray] Raw preview (first 200 chars):', responseText.slice(0, 200));
    throw new ForensicAnalysisError({
      category: 'MALFORMED_OUTPUT',
      status: 502,
      title: 'Analysis format error',
      message: 'Gemini returned an unexpected analysis format. The request reached the AI service, but the response could not be processed.',
      retryable: true,
      requiresKeyConfig: false,
    });
  }

  // 7. Validate and normalize structure according to analysis schema
  try {
    const validatedResult = validateAndNormalizeAnalysis(rawJson, trimmedContent, targetGoal);
    console.log('[Social X-Ray] Schema validation & normalization success. Overall score:', validatedResult.overallScore);
    return validatedResult;
  } catch (valErr: any) {
    console.error('[Social X-Ray] Response schema normalization failure:', valErr?.message);
    throw new ForensicAnalysisError({
      category: 'MALFORMED_OUTPUT',
      status: 502,
      title: 'Validation error',
      message: 'The AI response was received but failed validation.',
      retryable: true,
      requiresKeyConfig: false,
    });
  }
}
