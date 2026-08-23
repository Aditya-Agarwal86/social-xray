export type ExtractionSourceType = 'pdf' | 'image' | 'text' | 'demo';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OcrWordData {
  text: string;
  confidence: number;
  bbox?: BoundingBox;
}

export interface OcrLineData {
  text: string;
  confidence: number;
  bbox?: BoundingBox;
  words?: OcrWordData[];
}

export interface PageExtractionData {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

export interface NormalizedExtractionResult {
  sourceType: ExtractionSourceType;
  fileName: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
  characterCount: number;
  wordCount: number;
  readingTimeSeconds: number;
  pages: PageExtractionData[];
  extractionWarnings: string[];
  hasText: boolean;
}

export interface NormalizedOcrResult {
  sourceType: 'image';
  fileName: string;
  fileSize: number;
  extractedText: string;
  confidence: number;
  detectedLanguage: string;
  characterCount: number;
  wordCount: number;
  readingTimeSeconds: number;
  lines: OcrLineData[];
  processingWarnings: string[];
  hasText: boolean;
}

export interface ExtractionProgressCallback {
  (progress: number, message: string, stage?: string): void;
}

export type ExtractionErrorCode =
  | 'PDF_EMPTY_FILE'
  | 'PDF_INVALID_FORMAT'
  | 'PDF_ZERO_PAGES'
  | 'PDF_NO_TEXT'
  | 'PDF_CORRUPTED'
  | 'PDF_PASSWORD_PROTECTED'
  | 'PDF_UNKNOWN_ERROR'
  | 'OCR_EMPTY_FILE'
  | 'OCR_INVALID_IMAGE'
  | 'OCR_NO_TEXT'
  | 'OCR_LOW_CONFIDENCE'
  | 'OCR_FAILED'
  | 'OCR_WORKER_ERROR';

export class ExtractionError extends Error {
  code: ExtractionErrorCode;
  details?: string;
  recoverableWithOcr?: boolean;

  constructor(
    message: string,
    code: ExtractionErrorCode,
    details?: string,
    recoverableWithOcr = false
  ) {
    super(message);
    this.name = 'ExtractionError';
    this.code = code;
    this.details = details;
    this.recoverableWithOcr = recoverableWithOcr;
  }
}
