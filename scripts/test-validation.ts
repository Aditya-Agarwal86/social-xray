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
  classifyGeminiError,
  STABLE_GEMINI_MODEL,
} from '../lib/analysis/validator.ts';
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
  ANALYSIS_RESPONSE_JSON_SCHEMA,
} from '../lib/analysis/prompt.ts';
import {
  segmentTextRegions,
  classifyRegionType,
} from '../lib/extraction/regions.ts';
import {
  extractSocialPostContent,
  parseEngagementMetrics,
  parseProfileMetadata,
} from '../lib/extraction/socialContent.ts';

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
  assert.ok(regions.some((r) => r.classification === 'UI'));
  assert.ok(regions.some((r) => r.classification === 'CONTENT'));
  assert.ok(regions.some((r) => r.classification === 'POSSIBLE_CONTENT'));
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

  // Verifies telemetry structure
  assert.ok(result.telemetry.totalDetectedRegions >= 3);
  assert.ok(result.telemetry.likelyPostCount >= 1);
  assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(result.telemetry.quality));
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

// 17. Stable Model Verification
test('verifies standard production Gemini model is gemini-3.5-flash', () => {
  assert.strictEqual(STABLE_GEMINI_MODEL, 'gemini-3.5-flash');
});

// 18. HTTP 503 / High Demand Error Classification
test('correctly normalizes 503 high-demand into SERVICE_UNAVAILABLE with retryable status', () => {
  const err503 = {
    status: 503,
    statusText: 'Service Unavailable',
    message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary.',
  };
  const classified = classifyGeminiError(err503);
  assert.strictEqual(classified.category, 'SERVICE_UNAVAILABLE');
  assert.strictEqual(classified.status, 503);
  assert.strictEqual(classified.title, 'Gemini is temporarily busy');
  assert.strictEqual(classified.retryable, true);
  assert.strictEqual(classified.requiresKeyConfig, false);
});

// 19. HTTP 404 / Model Not Found Error Classification
test('correctly normalizes 404 into MODEL_NOT_FOUND', () => {
  const err404 = {
    status: 404,
    message: 'models/unknown-model is not found for API version v1beta',
  };
  const classified = classifyGeminiError(err404);
  assert.strictEqual(classified.category, 'MODEL_NOT_FOUND');
  assert.strictEqual(classified.status, 404);
  assert.strictEqual(classified.title, 'AI model unavailable');
  assert.strictEqual(classified.retryable, false);
  assert.strictEqual(classified.requiresKeyConfig, true);
});

// 20. HTTP 429 / Rate Limit Error Classification
test('correctly normalizes 429 into RATE_LIMITED', () => {
  const err429 = {
    status: 429,
    message: 'Resource exhausted: quota exceeded',
  };
  const classified = classifyGeminiError(err429);
  assert.strictEqual(classified.category, 'RATE_LIMITED');
  assert.strictEqual(classified.status, 429);
  assert.strictEqual(classified.title, 'Request limit reached');
  assert.strictEqual(classified.retryable, true);
  assert.strictEqual(classified.requiresKeyConfig, false);
});

// 21. HTTP 401 / 403 Authentication Error Classification
test('correctly normalizes 401/403 into AUTHENTICATION_ERROR', () => {
  const err401 = {
    status: 401,
    message: 'API_KEY_INVALID: The provided API key is expired or invalid',
  };
  const classified = classifyGeminiError(err401);
  assert.strictEqual(classified.category, 'AUTHENTICATION_ERROR');
  assert.strictEqual(classified.status, 401);
  assert.strictEqual(classified.title, 'API configuration required');
  assert.strictEqual(classified.retryable, false);
  assert.strictEqual(classified.requiresKeyConfig, true);
});

// 22. HTTP 500 Server Error Classification
test('correctly normalizes 500 into SERVER_ERROR', () => {
  const err500 = {
    status: 500,
    message: 'Internal server error encountered',
  };
  const classified = classifyGeminiError(err500);
  assert.strictEqual(classified.category, 'SERVER_ERROR');
  assert.strictEqual(classified.status, 500);
  assert.strictEqual(classified.title, 'AI service error');
  assert.strictEqual(classified.retryable, true);
});

// 23. Timeout & Abort Error Classification
test('correctly normalizes timeout/abort into TIMEOUT', () => {
  const errTimeout = {
    name: 'AbortError',
    message: 'The operation was aborted due to timeout',
  };
  const classified = classifyGeminiError(errTimeout);
  assert.strictEqual(classified.category, 'TIMEOUT');
  assert.strictEqual(classified.status, 408);
  assert.strictEqual(classified.title, 'Request timed out');
  assert.strictEqual(classified.retryable, true);
});

// 24. X/Twitter Bouquet Image-Only Post Regression Test
test('correctly isolates image-only post without corrupting caption or dumping metrics into copy', () => {
  const bouquetScreenshotLines = [
    { text: '2) ¥% © @guloona der - 20h', confidence: 60, bbox: { x0: 20, y0: 50, x1: 300, y1: 80 } },
    { text: '64 722 1.5K 50K', confidence: 85, bbox: { x0: 20, y0: 850, x1: 400, y1: 880 } },
  ];

  const regions = segmentTextRegions(bouquetScreenshotLines);
  const result = extractSocialPostContent(regions, bouquetScreenshotLines, true);

  // Verifies NO text dumped into caption
  assert.strictEqual(result.captionText, null);
  assert.strictEqual(result.cleanedFullText, '');
  assert.strictEqual(result.inventory.hasVisualMedia, true);
  assert.strictEqual(result.inventory.captionStatus, 'NOT_DETECTED');

  // Verifies metadata parsed cleanly into inventory
  assert.strictEqual(result.inventory.profileMetadata.username, 'guloona');
  assert.strictEqual(result.inventory.profileMetadata.timestamp, '20h');

  // Verifies metrics parsed into observed metrics
  assert.strictEqual(result.inventory.engagementMetrics.replies, 64);
  assert.strictEqual(result.inventory.engagementMetrics.reposts, 722);
  assert.strictEqual(result.inventory.engagementMetrics.likes, '1.5K');
  assert.strictEqual(result.inventory.engagementMetrics.views, '50K');
});

// 25. Engagement Metric Parser Unit Test
test('parses labeled engagement metrics correctly', () => {
  const labeled = '64 replies 722 reposts 1.5K likes 50K views';
  const metrics = parseEngagementMetrics(labeled);
  assert.strictEqual(metrics.replies, 64);
  assert.strictEqual(metrics.reposts, 722);
  assert.strictEqual(metrics.likes, '1.5K');
  assert.strictEqual(metrics.views, '50K');
});

// 26. Profile Metadata Parser Unit Test
test('extracts username and timestamp from noisy OCR header line', () => {
  const meta = parseProfileMetadata('2) ¥% © @guloona der - 20h');
  assert.strictEqual(meta.username, 'guloona');
  assert.strictEqual(meta.timestamp, '20h');
});

// 27. 9-Way Region Type Classifier Test
test('classifies diverse social regions accurately', () => {
  assert.strictEqual(classifyRegionType('64 722 1.5K 50K', 90, 0.85, 1), 'ENGAGEMENT_METRIC');
  assert.strictEqual(classifyRegionType('@guloona · 20h', 85, 0.05, 1), 'PROFILE_METADATA');
  assert.strictEqual(classifyRegionType('View all 14 comments', 90, 0.8, 1), 'PLATFORM_UI');
  assert.strictEqual(classifyRegionType('Click the link in bio to order now', 95, 0.5, 1), 'CTA');
  assert.strictEqual(classifyRegionType('#flowers #bouquets #giftideas', 92, 0.6, 1), 'HASHTAG');
  assert.strictEqual(classifyRegionType('Which bouquet would you choose for your best friend?', 95, 0.4, 1), 'POST_TEXT');
});

// 28. Grounded Image-Only Autopsy Prompt Generation Test
test('generates grounded Content Inventory prompt for image-only bouquet post without hallucinating business SaaS', () => {
  const inventory = {
    hasVisualMedia: true,
    caption: null,
    captionStatus: 'NOT_DETECTED' as const,
    hashtags: [],
    cta: null,
    links: [],
    engagementMetrics: {
      replies: 64,
      reposts: 722,
      likes: '1.5K',
      views: '50K',
      saves: null,
    },
    profileMetadata: {
      username: 'guloona',
      displayName: null,
      timestamp: '20h',
    },
    extractionWarnings: ['No written post caption was detected.'],
  };

  const userPrompt = buildGeminiUserPrompt('', 'conversation', inventory);
  assert.ok(userPrompt.includes('CONTENT INVENTORY (VERIFIED GROUND TRUTH)'));
  assert.ok(userPrompt.includes('Visual Content: DETECTED'));
  assert.ok(userPrompt.includes('NOT DETECTED (Visual-only post)'));
  assert.ok(userPrompt.includes('Replies: 64 | Reposts: 722 | Likes: 1.5K | Views: 50K'));
  assert.ok(userPrompt.includes('@guloona (20h)'));
});

// 29. TEST 1: X/Twitter Bouquet Image-Only Post End-to-End Grounding
test('TEST 1: X/Twitter bouquet image-only post normalizes 3 layers with 0 productivity software claims', () => {
  const rawBouquetResponse = {
    observedFacts: [
      'Two bouquet photographs are visible in the screenshot',
      '64 replies, 722 reposts, 1.5K likes, 50K views are visible',
      'No written post caption is detected',
    ],
    goalFit: {
      objective: 'conversation',
      score: 40,
      label: 'Conversation Fit',
      verdict: 'Limited conversation trigger',
      reason: 'No explicit question or comparison prompt is visible to spark comments.',
    },
    hook: {
      score: 85,
      severity: 'optimal',
      problem: 'None.',
      explanation: 'High visual stopping power with contrasting floral color palettes.',
    },
    clarity: {
      score: 90,
      severity: 'optimal',
      problem: 'None.',
      explanation: 'Subject matter (two distinct floral arrangements) is immediately recognizable.',
    },
    cognitiveLoad: {
      score: 95,
      severity: 'optimal',
      problem: 'None.',
      explanation: 'Zero cognitive friction; effortless visual presentation.',
    },
    emotion: {
      score: 75,
      severity: 'moderate',
      problem: 'Aesthetic pleasure without storytelling context.',
      explanation: 'Appealing floral visuals but lacking gifting or emotional context.',
    },
    curiosity: {
      score: 45,
      severity: 'critical',
      problem: 'No inquiry or choice catalyst.',
      explanation: 'Without a question comparing the two arrangements, viewers appreciate silently.',
    },
    conversation: {
      score: 40,
      severity: 'critical',
      problem: 'Missing conversational hook.',
      explanation: 'No prompt asking the audience which arrangement they prefer.',
    },
    shareability: {
      score: 78,
      severity: 'optimal',
      problem: 'None.',
      explanation: 'High aesthetic value makes it naturally shareable for floral/gift inspiration.',
    },
    cta: {
      score: 30,
      severity: 'critical',
      problem: 'Zero call to action.',
      explanation: 'No caption, link, or inquiry prompt detected.',
    },
    audienceValue: {
      score: 70,
      severity: 'moderate',
      problem: 'Aesthetic value without flower care or ordering details.',
      explanation: 'Delivers aesthetic enjoyment but missing florist/order details.',
    },
    frictionPoints: [
      {
        category: 'Missing Conversation Hook',
        severity: 'critical',
        text: '[No caption detected in visual asset]',
        explanation: 'Without a question, viewers admire the bouquets and scroll past.',
        repair: 'Which bouquet would you choose for someone special — Left or Right? 💐',
      },
    ],
    strengths: [
      {
        title: 'Strong Visual Contrast',
        detail: 'Contrasting floral arrangements create immediate aesthetic stopping power.',
      },
      {
        title: 'High Observed Engagement Baseline',
        detail: 'Visible metrics indicate 1.5K likes and 50K views on the post.',
      },
    ],
    postAutopsy: {
      primaryFriction: 'Limited conversation trigger',
      secondaryFriction: 'No explicit CTA is visible',
      hiddenStrength: 'Strong visual presentation and color contrast',
      treatment: 'Add an A/B choice question comparing the two floral arrangements.',
    },
    conversationDNA: {
      deliveredToFeed: 'Audience encounters two bouquet photographs.',
      audienceReaction: 'Likely visual appreciation / aesthetic interest.',
      inducedAction: 'Specific action cannot be determined from the screenshot alone.',
      conversationOpportunity: 'No explicit conversation prompt is visible.',
      replacementQuestion: 'Which bouquet would you choose for someone special — the pink arrangement or the white-and-rose one?',
      followUpQuestion: 'What flowers do you always look for when buying a bouquet?',
    },
    repair: {
      original: 'Caption not detected',
      recommended: 'Which bouquet would you choose for someone special — the pink arrangement or the white-and-rose one? 🌷 Drop 1 or 2 below!',
      rationale: 'Transforms an image-only post into an interactive choice prompt grounded in the floral imagery.',
    },
    platformVariants: {
      linkedin: 'Design is in the details. Which bouquet color palette aligns best with your visual aesthetic?',
      instagram: '1 or 2? 🌸 Tag someone who deserves fresh flowers today!',
      tiktok: 'Would you choose arrangement #1 or #2? Drop your favorite in the comments!',
    },
    goalRecommendation: {
      selectedGoal: 'conversation',
      reasoning: 'Visual stopping power is high, but conversational conversion requires a choice question.',
      recommendedChange: 'Add an A/B comparison question to spark comment debates.',
    },
    limitations: [
      'No caption was detected in the screenshot',
      'Creator intent cannot be determined from the screenshot alone',
    ],
    confidence: {
      level: 'HIGH',
      reason: 'High diagnostic confidence based on directly detected visual elements and verified content inventory.',
    },
  };

  const normalized = validateAndNormalizeAnalysis(rawBouquetResponse, 'Caption not detected', 'conversation');

  assert.strictEqual(normalized.goalFit.label, 'Conversation Fit');
  assert.strictEqual(normalized.goalFit.score, 40);
  assert.strictEqual(normalized.observedFacts.length >= 3, true);
  assert.strictEqual(normalized.strengths.length >= 2, true);
  assert.strictEqual(normalized.repair.original, 'Caption not detected');
  assert.strictEqual(normalized.repair.recommended.includes('bouquet'), true);
  assert.strictEqual(normalized.conversationDNA.replacementQuestion.includes('bouquet'), true);

  // Verifies friction points do not use "[No text detected]" as a problematic text fragment
  assert.strictEqual(normalized.frictionPoints[0].text, 'No caption or conversation prompt detected.');
  assert.strictEqual(normalized.frictionPoints[0].category, 'Missing Conversation Hook');

  // Verifies confidence breakdown domains exist
  assert.ok(normalized.confidence.breakdown && normalized.confidence.breakdown.length >= 4);
  const visualComp = normalized.confidence.breakdown?.find(b => b.domain === 'Visual composition');
  assert.strictEqual(visualComp?.level, 'HIGH');

  // ABSOLUTE ANTI-HALLUCINATION CHECK:
  const fullSerialized = JSON.stringify(normalized);
  assert.strictEqual(fullSerialized.includes('productivity'), false);
  assert.strictEqual(fullSerialized.includes('software'), false);
  assert.strictEqual(fullSerialized.includes('workflow'), false);
  assert.strictEqual(fullSerialized.includes('10+ hours'), false);
});

// 30. TEST 2: Instagram Dog Meme with Caption & CTA
test('TEST 2: Instagram meme with caption and CTA evaluates both visual and text layers', () => {
  const memeText = 'When your dog pretends they did not just eat your shoe.\n\nTag a dog owner who knows this look! #dogmemes';
  const memeRegions = segmentTextRegions([
    { text: 'When your dog pretends they did not just eat your shoe.', confidence: 95, bbox: { x0: 50, y0: 100, x1: 900, y1: 150 } },
    { text: 'Tag a dog owner who knows this look! #dogmemes', confidence: 92, bbox: { x0: 50, y0: 600, x1: 850, y1: 650 } },
  ]);
  const result = extractSocialPostContent(memeRegions, [], true);

  assert.strictEqual(result.inventory.hasVisualMedia, true);
  assert.strictEqual(result.inventory.captionStatus, 'DETECTED');
  assert.ok(result.inventory.caption?.includes('When your dog pretends'));
  assert.ok(result.inventory.cta?.includes('Tag a dog owner'));
  assert.ok(result.inventory.hashtags.includes('#dogmemes'));
});

// 31. TEST 3: Instagram Sunset with Caption + Hashtags (Filters UI)
test('TEST 3: Instagram sunset post extracts clean caption and hashtags while excluding chrome UI', () => {
  const sunsetLines = [
    { text: '@photographer · 2h', confidence: 85, bbox: { x0: 50, y0: 50, x1: 300, y1: 80 } },
    { text: 'Golden hour hitting the skyline just right today.', confidence: 94, bbox: { x0: 50, y0: 500, x1: 800, y1: 530 } },
    { text: '#sunset #goldenhour #photography', confidence: 91, bbox: { x0: 50, y0: 540, x1: 600, y1: 570 } },
    { text: 'View all 24 comments', confidence: 88, bbox: { x0: 50, y0: 900, x1: 400, y1: 930 } },
  ];
  const regions = segmentTextRegions(sunsetLines);
  const result = extractSocialPostContent(regions, sunsetLines, true);

  assert.strictEqual(result.inventory.captionStatus, 'DETECTED');
  assert.ok(result.cleanedFullText.includes('Golden hour hitting the skyline'));
  assert.ok(result.cleanedFullText.includes('#sunset'));
  assert.strictEqual(result.cleanedFullText.includes('View all 24 comments'), false);
  assert.strictEqual(result.cleanedFullText.includes('@photographer'), false);
});

// 32. TEST 4: Text-Only LinkedIn Post
test('TEST 4: Text-only LinkedIn post analyzes textual copy without requiring visual assets', () => {
  const linkedInPost = `Most engineering leaders optimize for velocity before they optimize for clarity.

When requirements are ambiguous, writing code faster only produces bugs faster.

3 steps to fix requirement ambiguity before sprint planning:
1. Write acceptance tests first.
2. Define failure modes explicitly.
3. Review edge cases with QA beforehand.

How does your engineering team validate requirements before kickoff?`;

  const validated = validateAndNormalizeAnalysis(
    {
      overallScore: 82,
      goalFit: {
        objective: 'conversation',
        score: 82,
        label: 'Conversation Fit',
        verdict: 'High discussion catalyst',
        reason: 'Strong counter-intuitive hook and concrete closing question.',
      },
      hook: { score: 88, severity: 'optimal', problem: 'None.', explanation: 'Strong paradox opening.' },
      clarity: { score: 90, severity: 'optimal', problem: 'None.', explanation: 'Clear 3-step breakdown.' },
      cognitiveLoad: { score: 85, severity: 'optimal', problem: 'None.', explanation: 'Good spacing and bulleted stanzas.' },
      emotion: { score: 70, severity: 'minor', problem: 'Analytical tone.', explanation: 'Focuses on logic over emotion.' },
      curiosity: { score: 80, severity: 'optimal', problem: 'None.', explanation: 'Addresses engineering management dilemmas.' },
      conversation: { score: 85, severity: 'optimal', problem: 'None.', explanation: 'Specific question about team validation.' },
      shareability: { score: 80, severity: 'optimal', problem: 'None.', explanation: 'High professional badge value for managers.' },
      cta: { score: 85, severity: 'optimal', problem: 'None.', explanation: 'Low-friction comment prompt.' },
      audienceValue: { score: 90, severity: 'optimal', problem: 'None.', explanation: 'Actionable 3-step heuristic.' },
      frictionPoints: [],
      strengths: [{ title: 'Actionable Framework', detail: 'Provides concrete 3-step tactical advice.' }],
      postAutopsy: {
        primaryFriction: 'Analytical tone may slightly limit emotional resonance',
        secondaryFriction: 'None',
        hiddenStrength: 'Clear structural clarity and high professional utility',
        treatment: 'Preserve the current layout and test with tech leads.',
      },
      conversationDNA: {
        deliveredToFeed: 'Leader encounters tactical leadership advice.',
        audienceReaction: 'Nodding in agreement, mentally reviewing their own team process.',
        inducedAction: 'Comment / Share',
        conversationOpportunity: 'High comment potential.',
        replacementQuestion: 'What is the biggest red flag you look for in requirements before sprint kickoff?',
        followUpQuestion: 'How many sprints did it take to fix once you noticed it?',
      },
      repair: {
        original: linkedInPost,
        recommended: linkedInPost,
        rationale: 'Current draft is already well-optimized for engineering discussion.',
      },
      platformVariants: { linkedin: linkedInPost, instagram: linkedInPost, tiktok: linkedInPost },
      goalRecommendation: { selectedGoal: 'conversation', reasoning: 'Strong alignment', recommendedChange: 'None needed' },
      limitations: ['Analysis based on text copy.'],
      confidence: { level: 'HIGH', reason: 'Complete post copy provided.' },
    },
    linkedInPost,
    'conversation'
  );

  assert.strictEqual(validated.overallScore, 82);
  assert.strictEqual(validated.goalFit.label, 'Conversation Fit');
  assert.strictEqual(validated.repair.original, linkedInPost);
});

// 33. TEST 5: Screenshot with Low-Confidence OCR Noise
test('TEST 5: Screenshot with severe OCR noise flags extraction warning without claiming post content is poor', () => {
  const noisyLines = [
    { text: '%^&*( ~~~', confidence: 15, bbox: { x0: 10, y0: 10, x1: 100, y1: 30 } },
    { text: '||| ___', confidence: 20, bbox: { x0: 10, y0: 40, x1: 100, y1: 60 } },
  ];
  const regions = segmentTextRegions(noisyLines);
  const result = extractSocialPostContent(regions, noisyLines, true);

  assert.strictEqual(result.captionText, null);
  assert.strictEqual(result.inventory.captionStatus, 'NOT_DETECTED');
  assert.ok(result.inventory.extractionWarnings.length > 0);
});

console.log(`\n📊 RESULTS: ${passed}/${total} test specifications passed successfully.\n`);

if (passed !== total) {
  process.exit(1);
}

