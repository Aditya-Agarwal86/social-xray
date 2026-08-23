import { extractImageText } from '../extraction/ocr';
import type { NormalizedOcrResult } from '../extraction/types';

export interface OcrExtractionResult {
  text: string;
  confidence: number;
  wordCount: number;
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<OcrExtractionResult> {
  const result: NormalizedOcrResult = await extractImageText(file, { fileName: file.name }, (prog, msg) => {
    onProgress?.(prog, msg);
  });

  return {
    text: result.extractedText,
    confidence: result.confidence,
    wordCount: result.wordCount,
  };
}
