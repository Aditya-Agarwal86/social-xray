import {
  ExtractionError,
  ExtractionProgressCallback,
  NormalizedOcrResult,
  OcrLineData,
  OcrWordData,
  ContentInventory,
} from './types';
import { preprocessImageForOcr } from './preprocessing';
import { segmentTextRegions } from './regions';
import { extractSocialPostContent } from './socialContent';

export interface OcrExtractionOptions {
  language?: string; // Default: 'eng'
  fileName?: string;
  enableSocialScreenshotMode?: boolean; // Default: true
}

/**
 * Executes in-browser Optical Character Recognition on image files using Tesseract.js
 * with intelligent preprocessing, layout segmentation, and social post content classification.
 */
export async function extractImageText(
  fileOrBlob: File | Blob,
  options: OcrExtractionOptions = {},
  onProgress?: ExtractionProgressCallback
): Promise<NormalizedOcrResult> {
  const {
    language = 'eng',
    fileName = 'image.png',
    enableSocialScreenshotMode = true,
  } = options;

  // 1. Basic validation
  const fileSize = fileOrBlob.size || 0;
  if (fileSize === 0) {
    throw new ExtractionError(
      'The uploaded image file is empty (0 bytes).',
      'OCR_EMPTY_FILE',
      'Please upload a valid screenshot or graphic.'
    );
  }

  onProgress?.(5, 'Detecting image dimensions and optimizing contrast...', 'preprocess');

  // 2. Preprocess image via HTML5 Canvas (scale & contrast enhancement)
  let preprocessedBlob = fileOrBlob;
  let dimensions = { width: 1000, height: 1000 };

  try {
    if (typeof window !== 'undefined' && fileOrBlob instanceof File) {
      const preprocessed = await preprocessImageForOcr(fileOrBlob, {
        enhanceContrast: true,
        grayscale: true,
      });
      preprocessedBlob = preprocessed.blob;
      dimensions = {
        width: preprocessed.processedWidth,
        height: preprocessed.processedHeight,
      };
    }
  } catch (prepErr) {
    console.warn('Canvas preprocessing skipped; falling back to raw buffer:', prepErr);
  }

  onProgress?.(15, 'Initializing OCR Web Worker neural core...', 'init');

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

  const imageUrl = URL.createObjectURL(preprocessedBlob);

  try {
    onProgress?.(25, 'Loading typography character dictionaries...', 'load');

    const result = await tesseract.recognize(imageUrl, language, {
      logger: (m: { status: string; progress: number }) => {
        const rawStatus = m.status || '';
        const rawProgress = typeof m.progress === 'number' ? m.progress : 0;

        if (rawStatus === 'loading tesseract core') {
          onProgress?.(30, 'Loading OCR neural core...', 'core');
        } else if (rawStatus === 'initializing tesseract') {
          onProgress?.(38, 'Initializing language recognition model...', 'init_lang');
        } else if (rawStatus === 'loading language traineddata') {
          onProgress?.(48, 'Loading character dictionaries...', 'dict');
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

    onProgress?.(88, 'Segmenting text regions and spatial layout...', 'segmentation');

    const overallConfidence =
      typeof result.data.confidence === 'number'
        ? Math.round(result.data.confidence)
        : 0;

    // 3. Extract structured lines, words, and bounding boxes
    const parsedLines: OcrLineData[] = [];
    if (Array.isArray(result.data.lines)) {
      for (const line of result.data.lines) {
        const lineText = (line.text || '').trim();
        if (!lineText) continue;

        const lineConfidence =
          typeof line.confidence === 'number'
            ? Math.round(line.confidence)
            : overallConfidence;

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
                confidence:
                  typeof w.confidence === 'number'
                    ? Math.round(w.confidence)
                    : lineConfidence,
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

    onProgress?.(94, 'Extracting social post caption & hashtags...', 'social_extraction');

    // 4. Perform Layout Segmentation & Social Content Filtering
    const regions = segmentTextRegions(parsedLines, dimensions);
    const socialExtraction = extractSocialPostContent(regions, parsedLines, true);

    const finalExtractedText = enableSocialScreenshotMode
      ? (socialExtraction.cleanedFullText || '')
      : parsedLines.map((l) => l.text).join('\n');

    const words = finalExtractedText.split(/\s+/).filter(Boolean).length;
    const chars = finalExtractedText.length;
    const readingTimeSeconds = Math.max(5, Math.ceil((words / 200) * 60));

    // 5. Build defensible confidence label and actionable warnings
    const confidenceLabel =
      socialExtraction.inventory.captionStatus === 'NOT_DETECTED'
        ? 'Visual content detected (No written caption)'
        : overallConfidence >= 80
        ? `Text detection confidence: ${overallConfidence}% (Optimal)`
        : overallConfidence >= 60
        ? `Text detection confidence: ${overallConfidence}% (Moderate)`
        : `Low-confidence extraction (${overallConfidence}%)`;

    const processingWarnings: string[] = [];

    if (socialExtraction.inventory.captionStatus === 'NOT_DETECTED') {
      processingWarnings.push(
        'No post caption was detected in this screenshot. The AI engine will analyze visual stopping power and layout directly.'
      );
    } else if (overallConfidence < 70) {
      processingWarnings.push(
        `Low detection confidence (${overallConfidence}%). Review recommended — this screenshot contains interface text or low-contrast typography.`
      );
    }

    if (socialExtraction.hasUncertainClassifications && socialExtraction.inventory.captionStatus !== 'NOT_DETECTED') {
      processingWarnings.push(
        'Some text in this screenshot could not be confidently classified. Please review and refine the extracted draft below.'
      );
    }

    if (socialExtraction.filteredNoiseCount > 0) {
      processingWarnings.push(
        `Filtered ${socialExtraction.filteredNoiseCount} peripheral UI / metric items (profile, buttons, or counters).`
      );
    }

    onProgress?.(100, 'Extraction complete.', 'done');

    return {
      sourceType: 'image',
      fileName,
      fileSize,
      extractedText: finalExtractedText,
      confidence: overallConfidence,
      confidenceLabel,
      detectedLanguage: language,
      characterCount: chars,
      wordCount: words,
      readingTimeSeconds,
      lines: parsedLines,
      socialContent: socialExtraction,
      inventory: socialExtraction.inventory,
      processingWarnings,
      hasText: words > 0 || socialExtraction.inventory.captionStatus !== 'NOT_DETECTED',
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
