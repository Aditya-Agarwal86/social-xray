import assert from 'node:assert';
import {
  validateUploadedFile,
  isAllowedFileType,
  isAllowedFileSize,
  formatFileSize,
  getFileExtension,
  sanitizeFileName,
  MAX_FILE_SIZE_BYTES,
} from '../lib/utils/fileValidation.ts';
import {
  ExtractionError,
} from '../lib/extraction/types.ts';
import type {
  NormalizedExtractionResult,
  NormalizedOcrResult,
} from '../lib/extraction/types.ts';
import {
  extractJsonFromResponse,
  validateAndNormalizeAnalysis,
} from '../lib/analysis/validator.ts';
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
} from '../lib/analysis/prompt.ts';

console.log('🧪 RUNNING SOCIAL X-RAY TEST SUITE (VALIDATION, PDF, OCR & AI SCHEMAS)...\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. File extension tests
test('extracts lowercase file extension correctly', () => {
  assert.strictEqual(getFileExtension('post-carousel.PDF'), '.pdf');
  assert.strictEqual(getFileExtension('screenshot.PNG'), '.png');
  assert.strictEqual(getFileExtension('graphic.JPEG'), '.jpeg');
  assert.strictEqual(getFileExtension('banner.webp'), '.webp');
  assert.strictEqual(getFileExtension('no-ext'), '');
});

// 2. Allowed file types
test('accepts allowed extensions and mime types', () => {
  assert.strictEqual(isAllowedFileType('document.pdf', 'application/pdf'), true);
  assert.strictEqual(isAllowedFileType('image.png', 'image/png'), true);
  assert.strictEqual(isAllowedFileType('photo.jpg', 'image/jpeg'), true);
  assert.strictEqual(isAllowedFileType('asset.webp', 'image/webp'), true);
});

test('rejects unallowed extensions and mime types', () => {
  assert.strictEqual(isAllowedFileType('virus.exe', 'application/x-msdownload'), false);
  assert.strictEqual(isAllowedFileType('data.zip', 'application/zip'), false);
  assert.strictEqual(isAllowedFileType('script.py', 'text/x-python'), false);
  assert.strictEqual(isAllowedFileType('video.mp4', 'video/mp4'), false);
});

// 3. File size limits
test('enforces 10MB size boundaries', () => {
  assert.strictEqual(isAllowedFileSize(100), true);
  assert.strictEqual(isAllowedFileSize(MAX_FILE_SIZE_BYTES), true);
  assert.strictEqual(isAllowedFileSize(MAX_FILE_SIZE_BYTES + 1), false);
  assert.strictEqual(isAllowedFileSize(0), false);
  assert.strictEqual(isAllowedFileSize(-5), false);
});

// 4. File formatting
test('formats byte sizes accurately', () => {
  assert.strictEqual(formatFileSize(500), '500 B');
  assert.strictEqual(formatFileSize(2048), '2.0 KB');
  assert.strictEqual(formatFileSize(5 * 1024 * 1024), '5.00 MB');
});

// 5. Filename sanitization
test('sanitizes filename characters safely', () => {
  assert.strictEqual(sanitizeFileName('my file (1).pdf'), 'my file _1_.pdf');
});

// 6. Comprehensive object validation mock
test('validates mock File objects correctly', () => {
  // Mock valid PDF
  const validPdf = { name: 'slide-deck.pdf', size: 1024 * 500, type: 'application/pdf' } as File;
  const res1 = validateUploadedFile(validPdf);
  assert.strictEqual(res1.isValid, true);
  if (res1.isValid) {
    assert.strictEqual(res1.fileType, 'pdf');
  }

  // Mock valid PNG
  const validPng = { name: 'infographic.png', size: 1024 * 200, type: 'image/png' } as File;
  const res2 = validateUploadedFile(validPng);
  assert.strictEqual(res2.isValid, true);
  if (res2.isValid) {
    assert.strictEqual(res2.fileType, 'image');
  }

  // Mock empty file
  const emptyFile = { name: 'empty.pdf', size: 0, type: 'application/pdf' } as File;
  const res3 = validateUploadedFile(emptyFile);
  assert.strictEqual(res3.isValid, false);
  if (!res3.isValid) {
    assert.strictEqual(res3.code, 'FILE_EMPTY');
  }

  // Mock oversized file
  const bigFile = { name: 'huge-render.png', size: 15 * 1024 * 1024, type: 'image/png' } as File;
  const res4 = validateUploadedFile(bigFile);
  assert.strictEqual(res4.isValid, false);
  if (!res4.isValid) {
    assert.strictEqual(res4.code, 'FILE_TOO_LARGE');
  }

  // Mock invalid type
  const badType = { name: 'archive.zip', size: 1024, type: 'application/zip' } as File;
  const res5 = validateUploadedFile(badType);
  assert.strictEqual(res5.isValid, false);
  if (!res5.isValid) {
    assert.strictEqual(res5.code, 'FILE_UNSUPPORTED_TYPE');
  }
});

// 7. PDF Extraction Error Classes & Codes
test('instantiates ExtractionError with proper error codes and recovery flags', () => {
  const errNoText = new ExtractionError(
    'No text found in PDF',
    'PDF_NO_TEXT',
    'Document may be scanned images',
    true // recoverableWithOcr
  );
  assert.strictEqual(errNoText.code, 'PDF_NO_TEXT');
  assert.strictEqual(errNoText.recoverableWithOcr, true);

  const errPassword = new ExtractionError(
    'Password required',
    'PDF_PASSWORD_PROTECTED'
  );
  assert.strictEqual(errPassword.code, 'PDF_PASSWORD_PROTECTED');
  assert.strictEqual(errPassword.recoverableWithOcr, false);
});

// 8. Normalized PDF Extraction Schema validation
test('structures normalized extraction schema with multi-page telemetry', () => {
  const mockResult: NormalizedExtractionResult = {
    sourceType: 'pdf',
    fileName: 'founder-story.pdf',
    fileSize: 45000,
    pageCount: 3,
    extractedText: 'Page 1 text.\n\nPage 2 text.\n\nPage 3 text.',
    characterCount: 36,
    wordCount: 9,
    readingTimeSeconds: 5,
    pages: [
      { pageNumber: 1, text: 'Page 1 text.', wordCount: 3, charCount: 12 },
      { pageNumber: 2, text: 'Page 2 text.', wordCount: 3, charCount: 12 },
      { pageNumber: 3, text: 'Page 3 text.', wordCount: 3, charCount: 12 },
    ],
    extractionWarnings: [],
    hasText: true,
  };

  assert.strictEqual(mockResult.pageCount, 3);
  assert.strictEqual(mockResult.pages.length, 3);
  assert.strictEqual(mockResult.hasText, true);
  assert.strictEqual(mockResult.wordCount, 9);
});

// 9. OCR Extraction Errors & Fallbacks
test('instantiates OCR-specific ExtractionError codes correctly', () => {
  const errNoOcr = new ExtractionError(
    'No text recognized in screenshot',
    'OCR_NO_TEXT',
    'Ensure image contains typography'
  );
  assert.strictEqual(errNoOcr.code, 'OCR_NO_TEXT');

  const errWorker = new ExtractionError(
    'Worker crashed',
    'OCR_WORKER_ERROR'
  );
  assert.strictEqual(errWorker.code, 'OCR_WORKER_ERROR');
});

// 10. Normalized OCR Schema with Bounding-Box Coordinates
test('structures normalized OCR payload with bounding-box telemetry', () => {
  const mockOcr: NormalizedOcrResult = {
    sourceType: 'image',
    fileName: 'hook-screenshot.png',
    fileSize: 120000,
    extractedText: 'Stop building in silence.\nTalk to your users daily.',
    confidence: 94,
    detectedLanguage: 'eng',
    characterCount: 52,
    wordCount: 9,
    readingTimeSeconds: 5,
    lines: [
      {
        text: 'Stop building in silence.',
        confidence: 96,
        bbox: { x0: 20, y0: 30, x1: 400, y1: 70 },
        words: [
          { text: 'Stop', confidence: 98, bbox: { x0: 20, y0: 30, x1: 80, y1: 70 } },
          { text: 'building', confidence: 95, bbox: { x0: 90, y0: 30, x1: 210, y1: 70 } },
        ],
      },
      {
        text: 'Talk to your users daily.',
        confidence: 92,
        bbox: { x0: 20, y0: 85, x1: 390, y1: 125 },
      },
    ],
    processingWarnings: [],
    hasText: true,
  };

  assert.strictEqual(mockOcr.sourceType, 'image');
  assert.strictEqual(mockOcr.confidence, 94);
  assert.strictEqual(mockOcr.lines.length, 2);
  assert.strictEqual(mockOcr.lines[0].bbox?.x0, 20);
  assert.strictEqual(mockOcr.lines[0].words?.[0].text, 'Stop');
  assert.strictEqual(mockOcr.hasText, true);
});

// 11. AI Response JSON Extraction (fences, surrounding text)
test('extracts and parses JSON from markdown code blocks and messy responses', () => {
  const fenced = '```json\n{\n  "overallScore": 82,\n  "hook": { "score": 85 }\n}\n```';
  const parsed1 = extractJsonFromResponse(fenced);
  assert.strictEqual(parsed1.overallScore, 82);
  assert.strictEqual(parsed1.hook.score, 85);

  const messy = 'Here is the forensic report:\n{"overallScore": 76}\nThank you for scanning.';
  const parsed2 = extractJsonFromResponse(messy);
  assert.strictEqual(parsed2.overallScore, 76);
});

// 12. Normalization & Fallback of AI Analysis Payload
test('normalizes complete SocialXRayAnalysisResult schema with fallback protection', () => {
  const rawPayload = {
    overallScore: 65,
    hook: { score: 60, severity: 'moderate', problem: 'Throat-clearing line 1', explanation: 'Delays core premise' },
    clarity: { score: 80 },
    frictionPoints: [
      { category: 'Hook Deceleration', severity: 'critical', text: 'I have been thinking lately...', explanation: 'Passive', repair: 'Lead with the contrarian fact.' }
    ],
    postAutopsy: {
      causeOfDeath: 'Throat clearing',
      primaryFailure: 'Slow hook',
      secondaryFailure: 'Wall of text',
      hiddenStrength: 'Great insight',
      treatment: 'Cut paragraph 1.'
    },
    conversationDNA: {
      likelyAudienceReaction: 'Nods passively',
      engagementType: 'Passive',
      conversationPotential: 'Low',
      betterQuestion: 'Have you seen this in your team?',
      followUpQuestion: 'Why does this happen?'
    },
    repair: {
      original: 'Original draft',
      improved: 'Improved draft',
      explanation: 'Front-loads the hook'
    },
    platformVariants: {
      linkedin: 'LinkedIn copy',
      instagram: 'IG caption',
      tiktok: 'TikTok script'
    },
    goalRecommendation: {
      selectedGoal: 'conversation',
      reasoning: 'Needs sharper questions',
      recommendedChange: 'End with debate question'
    }
  };

  const validated = validateAndNormalizeAnalysis(rawPayload, 'Original draft', 'conversation');
  assert.strictEqual(validated.overallScore, 65);
  assert.strictEqual(validated.hook.score, 60);
  assert.strictEqual(validated.hook.severity, 'moderate');
  assert.strictEqual(validated.clarity.score, 80);
  assert.strictEqual(validated.frictionPoints.length, 1);
  assert.strictEqual(validated.postAutopsy.causeOfDeath, 'Throat clearing');
  assert.strictEqual(validated.conversationDNA.betterQuestion, 'Have you seen this in your team?');
  assert.strictEqual(validated.platformVariants.linkedin, 'LinkedIn copy');
  assert.strictEqual(validated.goalRecommendation.selectedGoal, 'conversation');
});

// 13. AI Prompt Construction (Grounded, explainable, non-predictive)
test('constructs system and user prompts with non-predictive guardrails', () => {
  const sysPrompt = buildGeminiSystemPrompt('shares');
  assert.ok(sysPrompt.includes('NO FAKE STATISTICS'));
  assert.ok(sysPrompt.includes('CONTENT-BASED ESTIMATION'));
  assert.ok(sysPrompt.includes('SHARES'));

  const userPrompt = buildGeminiUserPrompt('My post content text.', 'shares');
  assert.ok(userPrompt.includes('My post content text.'));
  assert.ok(userPrompt.includes('SHARES'));
});

// 14. Layout Segmentation Test
import { segmentTextRegions } from '../lib/extraction/regions.ts';
import { extractSocialPostContent } from '../lib/extraction/socialContent.ts';

test('segments lines into spatial text regions with layout hierarchy', () => {
  const mockLines = [
    { text: 'a._n._v._a._y', confidence: 85, bbox: { x0: 450, y0: 60, x1: 580, y1: 85 } },
    { text: 'AI content', confidence: 75, bbox: { x0: 450, y0: 95, x1: 540, y1: 115 } },
    { text: 'Kothrud, Pune', confidence: 80, bbox: { x0: 450, y0: 125, x1: 560, y1: 145 } },
    { text: 'Did the sky turn into a golden sea...?', confidence: 92, bbox: { x0: 450, y0: 250, x1: 850, y1: 280 } },
    { text: '#pixelstretch #sunsetphotography', confidence: 90, bbox: { x0: 450, y0: 480, x1: 780, y1: 510 } },
    { text: 'Liked by aditya_xdddd and others', confidence: 85, bbox: { x0: 450, y0: 760, x1: 720, y1: 785 } },
  ];

  const regions = segmentTextRegions(mockLines, { width: 1000, height: 1000 });
  assert.ok(regions.length >= 3);
  assert.ok(regions.some((r) => r.type === 'header'));
  assert.ok(regions.some((r) => r.type === 'caption'));
  assert.ok(regions.some((r) => r.type === 'hashtags'));
});

// 15. REGRESSION TEST: Exact User Instagram Screenshot Extraction
test('regression: extracts Instagram post caption & hashtags while filtering UI noise', () => {
  const rawNoisyOcrLines = [
    { text: 'wn anvay', confidence: 55, bbox: { x0: 450, y0: 50, x1: 550, y1: 75 } },
    { text: 'Tw Alcontent oo', confidence: 60, bbox: { x0: 450, y0: 80, x1: 560, y1: 100 } },
    { text: 'Ld Kothrud, Pune', confidence: 65, bbox: { x0: 450, y0: 105, x1: 580, y1: 125 } },
    { text: 'wm a._n._v._a._y Did the sky turn into a golden sea...?', confidence: 90, bbox: { x0: 450, y0: 240, x1: 860, y1: 270 } },
    { text: '{ #pixelstretch #sunsetphotography', confidence: 88, bbox: { x0: 450, y0: 480, x1: 780, y1: 505 } },
    { text: '¥ 5 #mobilephotography #fyp #foryou', confidence: 85, bbox: { x0: 450, y0: 515, x1: 800, y1: 540 } },
    { text: 'a. [Sunset, viral, pune skyline, pune sunset, pixel', confidence: 80, bbox: { x0: 450, y0: 550, x1: 880, y1: 575 } },
    { text: 'FRR stretch]', confidence: 75, bbox: { x0: 450, y0: 580, x1: 560, y1: 605 } },
    { text: 'Liked by aditya_xdddd and others', confidence: 82, bbox: { x0: 450, y0: 760, x1: 720, y1: 785 } },
    { text: '— TI', confidence: 40, bbox: { x0: 450, y0: 880, x1: 500, y1: 900 } },
  ];

  const regions = segmentTextRegions(rawNoisyOcrLines, { width: 1000, height: 1000 });
  const result = extractSocialPostContent(regions, rawNoisyOcrLines);

  // Verifies caption extracted cleanly without UI noise
  assert.ok(result.cleanedFullText.includes('Did the sky turn into a golden sea...?'));
  assert.ok(result.cleanedFullText.includes('#pixelstretch'));
  assert.ok(result.cleanedFullText.includes('#sunsetphotography'));
  assert.ok(result.cleanedFullText.includes('#mobilephotography'));
  assert.ok(result.cleanedFullText.includes('#fyp'));
  assert.ok(result.cleanedFullText.includes('#foryou'));

  // Verifies UI noise and glitches were filtered
  assert.strictEqual(result.cleanedFullText.includes('Liked by aditya_xdddd'), false);
  assert.strictEqual(result.cleanedFullText.includes('— TI'), false);
  assert.ok(result.filteredNoiseCount >= 2);
});

// 16. Multi-format & Non-Social Image Handling
test('extracts clean non-social text without over-filtering', () => {
  const genericLines = [
    { text: '5 Leadership Principles for Modern Engineering Teams', confidence: 95 },
    { text: '1. Give context over control.', confidence: 92 },
    { text: '2. Create psychological safety.', confidence: 90 },
    { text: '3. Focus on outcomes over hours.', confidence: 91 },
  ];

  const regions = segmentTextRegions(genericLines);
  const result = extractSocialPostContent(regions, genericLines);

  assert.ok(result.cleanedFullText.includes('5 Leadership Principles'));
  assert.ok(result.cleanedFullText.includes('context over control'));
  assert.ok(result.cleanedFullText.includes('psychological safety'));
  assert.strictEqual(result.filteredNoiseCount, 0);
});

console.log(`\n📊 RESULTS: ${passed}/${total} test specifications passed successfully.\n`);

if (passed !== total) {
  process.exit(1);
}
