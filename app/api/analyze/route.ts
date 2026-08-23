import { NextRequest, NextResponse } from 'next/server';
import {
  runGeminiForensicAnalysis,
  MAX_CONTENT_LENGTH,
  classifyGeminiError,
  ForensicAnalysisError,
} from '@/lib/analysis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            category: 'INVALID_REQUEST',
            status: 400,
            title: 'Malformed Request',
            message: 'Malformed JSON payload in request body.',
            retryable: false,
            requiresKeyConfig: false,
          },
        },
        { status: 400 }
      );
    }

    const { content, targetGoal = 'conversation', userMetrics } = body || {};

    const clientKey = req.headers.get('x-gemini-key')?.trim();
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // Execute Gemini forensic engine with gemini-3.5-flash
    const analysisResult = await runGeminiForensicAnalysis(
      {
        content,
        targetGoal,
        userMetrics,
      },
      {
        apiKey: apiKey || undefined,
      }
    );

    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error: any) {
    const normalized =
      error instanceof ForensicAnalysisError
        ? error.normalized
        : error?.normalized || classifyGeminiError(error);

    return NextResponse.json(
      {
        success: false,
        error: normalized,
      },
      { status: normalized.status }
    );
  }
}
