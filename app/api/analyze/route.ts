import { NextRequest, NextResponse } from 'next/server';
import { runGeminiForensicAnalysis, MAX_CONTENT_LENGTH } from '@/lib/analysis';

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
          error: 'Invalid Request',
          message: 'Malformed JSON payload in request body.',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const { content, targetGoal = 'conversation', userMetrics } = body || {};

    // 1. Content validation
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        {
          error: 'Empty Content',
          message: 'Cannot run AI forensic diagnosis on empty content. Please provide or extract valid text.',
          code: 'EMPTY_CONTENT',
        },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        {
          error: 'Content Too Large',
          message: `Post content length (${trimmedContent.length} characters) exceeds the maximum allowed limit of ${MAX_CONTENT_LENGTH} characters.`,
          code: 'CONTENT_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // 2. Client header override or Server Env resolution
    // Note: NEVER send the server API key to the client!
    const clientKey = req.headers.get('x-gemini-key')?.trim();
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // 3. Execute Gemini forensic engine
    const analysisResult = await runGeminiForensicAnalysis(
      {
        content: trimmedContent,
        targetGoal,
        userMetrics,
      },
      {
        apiKey: apiKey || undefined,
      }
    );

    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error: any) {
    console.error('Forensic Route Error:', error);

    const statusCode = error?.statusCode || error?.status || 500;
    const errorCode = error?.code || 'ANALYSIS_ERROR';
    const message = error?.message || 'An error occurred during forensic analysis.';

    return NextResponse.json(
      {
        error: 'Analysis Error',
        message,
        code: errorCode,
      },
      { status: statusCode }
    );
  }
}
