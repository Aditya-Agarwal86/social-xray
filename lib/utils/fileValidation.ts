export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (10,485,760 bytes)

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'] as const;

export type FileErrorCode =
  | 'FILE_MISSING'
  | 'FILE_EMPTY'
  | 'FILE_TOO_LARGE'
  | 'FILE_UNSUPPORTED_TYPE';

export interface ValidationSuccess {
  isValid: true;
  fileType: 'pdf' | 'image';
  extension: string;
  sizeFormatted: string;
}

export interface ValidationFailure {
  isValid: false;
  error: string;
  code: FileErrorCode;
  details?: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Extracts the lowercase file extension including the leading dot (e.g. '.png', '.pdf').
 */
export function getFileExtension(fileName: string): string {
  if (!fileName || !fileName.includes('.')) return '';
  const parts = fileName.split('.');
  return `.${parts[parts.length - 1].toLowerCase()}`;
}

/**
 * Determines if a file extension or MIME type represents an allowed format.
 */
export function isAllowedFileType(fileName: string, mimeType?: string): boolean {
  const ext = getFileExtension(fileName);
  const hasValidExt = ALLOWED_EXTENSIONS.includes(ext as any);

  if (mimeType) {
    const normMime = mimeType.toLowerCase();
    const hasValidMime = ALLOWED_MIME_TYPES.some((allowed) => normMime === allowed);
    if (hasValidMime || hasValidExt) return true;
  }

  return hasValidExt;
}

/**
 * Validates whether a file size is within the maximum allowed threshold (<= 10MB).
 */
export function isAllowedFileSize(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= MAX_FILE_SIZE_BYTES;
}

/**
 * Comprehensive validator for uploaded files with detailed diagnostic messages.
 */
export function validateUploadedFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      code: 'FILE_MISSING',
      error: 'No file detected. Please select or drop a valid file.',
    };
  }

  // Check empty file
  if (file.size === 0) {
    return {
      isValid: false,
      code: 'FILE_EMPTY',
      error: 'The uploaded file is empty (0 bytes). Please upload a valid document or image.',
    };
  }

  // Check file size cap
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      code: 'FILE_TOO_LARGE',
      error: `File size (${sizeInMB}MB) exceeds the 10MB laboratory limit.`,
      details: 'Please compress the image or reduce the PDF page count before uploading.',
    };
  }

  const fileName = file.name || '';
  const fileType = (file.type || '').toLowerCase();
  const ext = getFileExtension(fileName);

  const isPdf = fileType === 'application/pdf' || ext === '.pdf';
  const isImage =
    fileType.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

  if (!isAllowedFileType(fileName, fileType)) {
    return {
      isValid: false,
      code: 'FILE_UNSUPPORTED_TYPE',
      error: `Unsupported file format "${ext || fileType || 'unknown'}".`,
      details: 'Supported formats: PDF (.pdf), PNG (.png), JPG/JPEG (.jpg, .jpeg), and WEBP (.webp).',
    };
  }

  return {
    isValid: true,
    fileType: isPdf ? 'pdf' : 'image',
    extension: ext || (isPdf ? '.pdf' : '.png'),
    sizeFormatted: formatFileSize(file.size),
  };
}

/**
 * Human-readable byte size formatting with high precision.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Strips invalid path characters to ensure clean display names.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\s.-]/gi, '_');
}
