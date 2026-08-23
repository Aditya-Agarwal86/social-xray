import { extractPdfText } from '../extraction/pdf';
import type { NormalizedExtractionResult } from '../extraction/types';

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<PdfExtractionResult> {
  const result: NormalizedExtractionResult = await extractPdfText(file, file.name, (prog, msg) => {
    onProgress?.(prog, msg);
  });

  return {
    text: result.extractedText,
    pageCount: result.pageCount,
    wordCount: result.wordCount,
  };
}
