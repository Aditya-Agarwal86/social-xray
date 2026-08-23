import assert from 'assert';
import {
  validateUploadedFile,
  isAllowedFileType,
  isAllowedFileSize,
  formatFileSize,
  getFileExtension,
  sanitizeFileName,
  MAX_FILE_SIZE_BYTES,
} from '../lib/utils/fileValidation.js';

console.log('🧪 RUNNING SOCIAL X-RAY FILE VALIDATION TEST SUITE...\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
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
  const validPdf = { name: 'slide-deck.pdf', size: 1024 * 500, type: 'application/pdf' };
  const res1 = validateUploadedFile(validPdf);
  assert.strictEqual(res1.isValid, true);
  assert.strictEqual(res1.fileType, 'pdf');

  // Mock valid PNG
  const validPng = { name: 'infographic.png', size: 1024 * 200, type: 'image/png' };
  const res2 = validateUploadedFile(validPng);
  assert.strictEqual(res2.isValid, true);
  assert.strictEqual(res2.fileType, 'image');

  // Mock empty file
  const emptyFile = { name: 'empty.pdf', size: 0, type: 'application/pdf' };
  const res3 = validateUploadedFile(emptyFile);
  assert.strictEqual(res3.isValid, false);
  assert.strictEqual(res3.code, 'FILE_EMPTY');

  // Mock oversized file
  const bigFile = { name: 'huge-render.png', size: 15 * 1024 * 1024, type: 'image/png' };
  const res4 = validateUploadedFile(bigFile);
  assert.strictEqual(res4.isValid, false);
  assert.strictEqual(res4.code, 'FILE_TOO_LARGE');

  // Mock invalid type
  const badType = { name: 'archive.zip', size: 1024, type: 'application/zip' };
  const res5 = validateUploadedFile(badType);
  assert.strictEqual(res5.isValid, false);
  assert.strictEqual(res5.code, 'FILE_UNSUPPORTED_TYPE');
});

console.log(`\n📊 RESULTS: ${passed}/${total} tests passed.\n`);

if (passed !== total) {
  process.exit(1);
}
