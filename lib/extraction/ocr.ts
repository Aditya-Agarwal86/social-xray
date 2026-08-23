import {
  ExtractionError,
  ExtractionProgressCallback,
  NormalizedOcrResult,
  OcrLineData,
  OcrWordData,
} from './types';

export interface OcrExtractionOptions {
  language?: string; // Default: 'eng'
  fileName?: string;
}

/**
 * Executes in-browser Optical Character Recognition on image files using Tesseract.js.
 */
export async function extractImageText(
  fileOrBlob: File | Blob,
  options: OcrExtractionOptions = {},
  onProgress?: ExtractionProgressCallback
): Promise<NormalizedOcrResult> {
  const { language = 'eng', fileName = 'image.png' } = options;

  // 1. Validation check
  const fileSize = fileOrBlob.size || 0;
  if (fileSize === 0) {
    throw new ExtractionError(
      'The uploaded image file is empty (0 bytes).',
      'OCR_EMPTY_FILE',
      'Please upload a valid screenshot or graphic.'
    );
  }

  onProgress?.(5, 'Preparing image and initializing neural vision pipeline...', 'init');

  let tesseract: any;
  try {
    tesseract = await import('tesseract.js');
  } catch (err: any) {
    throw new ExtractionError(
      'Failed to load OCR neural engine.',
      'OCR_WORKER_ERROR',
      err?.message
    );
  }

  const imageUrl = URL.createObjectURL(fileOrBlob);

  try {
    onProgress?.(15, 'Loading language dictionaries and neural models...', 'load');

    const result = await tesseract.recognize(imageUrl, language, {
      logger: (m: { status: string; progress: number }) => {
        const rawStatus = m.status || '';
        const rawProgress = typeof m.progress === 'number' ? m.progress : 0;

        if (rawStatus === 'loading tesseract core') {
          onProgress?.(20, 'Loading OCR neural core...', 'core');
        } else if (rawStatus === 'initializing tesseract') {
          onProgress?.(28, 'Initializing language recognition model...', 'init_lang');
        } else if (rawStatus === 'loading language traineddata') {
          onProgress?.(38, 'Loading typography character dictionaries...', 'dict');
        } else if (rawStatus === 'initializing api') {
          onProgress?.(50, 'Configuring visual matrix...', 'api');
        } else if (rawStatus === 'recognizing text') {
          // Map 0 -> 1 progress to 50% -> 85%
          const pct = 50 + Math.floor(rawProgress * 35);
          onProgress?.(
            pct,
            `Reading text & recognizing characters (${Math.floor(rawProgress * 100)}%)...`,
            'reading'
          );
        }
      },
    });

    onProgress?.(88, 'Detecting words and bounding coordinates...', 'structure');

    const rawText = result.data.text || '';
    const overallConfidence = typeof result.data.confidence === 'number' ? Math.round(result.data.confidence) : 0;

    // Clean text lines while preserving logical layout
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const words = cleanedText.split(/\s+/).filter(Boolean).length;
    const chars = cleanedText.length;
    const readingTimeSeconds = Math.max(5, Math.ceil((words / 200) * 60));

    // Handle images with zero readable text
    if (!cleanedText || words === 0) {
      throw new ExtractionError(
        'Forensic OCR could not detect any readable text in this image.',
        'OCR_NO_TEXT',
        'Please ensure the screenshot or graphic contains clear, high-contrast typography rather than pure illustrations or blurry photos.'
      );
    }

    onProgress?.(95, 'Building text structure and telemetry map...', 'finalize');

    // Extract line and bounding-box information if available from Tesseract
    const parsedLines: OcrLineData[] = [];
    if (Array.isArray(result.data.lines)) {
      for (const line of result.data.lines) {
        const lineText = (line.text || '').trim();
        if (!lineText) continue;

        const lineConfidence = typeof line.confidence === 'number' ? Math.round(line.confidence) : overallConfidence;

        let bbox = undefined;
        if (line.bbox) {
          bbox = {
            x0: line.bbox.x0,
            y0: line.bbox.y0,
            x1: line.bbox.x1,
            y1: line.bbox.y1,
          };
        }

        const lineWords: OcrWordData[] = [];
        if (Array.isArray(line.words)) {
          for (const w of line.words) {
            const wText = (w.text || '').trim();
            if (wText) {
              lineWords.push({
                text: wText,
                confidence: typeof w.confidence === 'number' ? Math.round(w.confidence) : lineConfidence,
                bbox: w.bbox
                  ? { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 }
                  : undefined,
              });
            }
          }
        }

        parsedLines.push({
          text: lineText,
          confidence: lineConfidence,
          bbox,
          words: lineWords.length > 0 ? lineWords : undefined,
        });
      }
    }

    const processingWarnings: string[] = [];

    // Check low OCR confidence
    if (overallConfidence < 60) {
      processingWarnings.push(
        `Low recognition confidence (${overallConfidence}%). Check the extracted text preview below and correct any minor OCR character artifacts.`
      );
    }

    if (words < 4) {
      processingWarnings.push(
        'Very short text detected. Provide complete post copy for optimal attention friction mapping.'
      );
    }

    onProgress?.(100, 'Extraction complete.', 'done');

    return {
      sourceType: 'image',
      fileName,
      fileSize,
      extractedText: cleanedText,
      confidence: overallConfidence,
      detectedLanguage: language,
      characterCount: chars,
      wordCount: words,
      readingTimeSeconds,
      lines: parsedLines,
      processingWarnings,
      hasText: words > 0,
    };
  } catch (err: any) {
    if (err instanceof ExtractionError) {
      throw err;
    }
    throw new ExtractionError(
      `OCR processing failed: ${err?.message || 'Unknown recognition error.'}`,
      'OCR_FAILED',
      'Please check that the image format is valid and not corrupted.'
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
