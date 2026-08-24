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

export type RegionClassification = 'CONTENT' | 'POSSIBLE_CONTENT' | 'UI' | 'NOISE';

export type OcrRegionType =
  | 'POST_TEXT'          // Genuine author post copy / paragraphs
  | 'IMAGE_TEXT'         // Text embedded inside meme/graphic/infographic
  | 'PROFILE_METADATA'   // Handles, display names, timestamps (@username, 20h)
  | 'PLATFORM_UI'        // Buttons, tabs, follow chips, interface text
  | 'ENGAGEMENT_METRIC'  // Like/comment/share/view counters (64, 722, 1.5K, 50K)
  | 'HASHTAG'            // #tags
  | 'CTA'                // Explicit call to action phrases
  | 'LINK'               // URLs or link chips
  | 'UNKNOWN';           // Low-confidence or unclassified fragments

export type ExtractionQuality = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TextRegion {
  id: string;
  text: string;
  confidence: number;
  bbox: BoundingBox;
  classification: RegionClassification;
  regionType: OcrRegionType;
  lines: OcrLineData[];
  normalizedScore: number;
}

export interface ObservedEngagementMetrics {
  replies: number | string | null;
  reposts: number | string | null;
  likes: number | string | null;
  views: number | string | null;
  saves: number | string | null;
}

export interface ProfileMetadata {
  username: string | null;
  displayName: string | null;
  timestamp: string | null;
}

export type CaptionStatus = 'DETECTED' | 'UNCERTAIN' | 'NOT_DETECTED';

export interface ContentInventory {
  hasVisualMedia: boolean;
  visualSummary?: string;
  caption: string | null;
  captionStatus: CaptionStatus;
  hashtags: string[];
  cta: string | null;
  links: string[];
  engagementMetrics: ObservedEngagementMetrics;
  profileMetadata: ProfileMetadata;
  extractionWarnings: string[];
}

export interface ExtractionTelemetry {
  totalDetectedRegions: number;
  likelyPostCount: number;
  possibleUiCount: number;
  lowConfidenceCount: number;
  quality: ExtractionQuality;
  confidence: number;
  confidenceLabel: string;
}

export interface SocialPostExtractionResult {
  captionText: string | null;
  hashtags: string[];
  postContextText: string;
  authorHandle?: string;
  cleanedFullText: string;
  hasUncertainClassifications: boolean;
  filteredNoiseCount: number;
  contentRegions: TextRegion[];
  uncertainRegions: TextRegion[];
  filteredRegions: TextRegion[];
  telemetry: ExtractionTelemetry;
  inventory: ContentInventory;
  classificationNote?: string;
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
  inventory?: ContentInventory;
}

export interface NormalizedOcrResult {
  sourceType: 'image';
  fileName: string;
  fileSize: number;
  extractedText: string;
  confidence: number;
  confidenceLabel: string;
  detectedLanguage: string;
  characterCount: number;
  wordCount: number;
  readingTimeSeconds: number;
  lines: OcrLineData[];
  socialContent?: SocialPostExtractionResult;
  inventory?: ContentInventory;
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
