import {
  ExtractionError,
  ExtractionProgressCallback,
  NormalizedExtractionResult,
  PageExtractionData,
} from './types';

/**
 * Extracts structured text from PDF files using pdfjs-dist in client environments.
 */
export async function extractPdfText(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
  fileName = 'document.pdf',
  onProgress?: ExtractionProgressCallback
): Promise<NormalizedExtractionResult> {
  // Check empty file
  let byteLength = 0;
  let arrayBuffer: ArrayBuffer;

  if (fileOrBuffer instanceof File) {
    byteLength = fileOrBuffer.size;
    if (byteLength === 0) {
      throw new ExtractionError(
        'The uploaded PDF file is empty (0 bytes).',
        'PDF_EMPTY_FILE',
        'Please upload a valid PDF document with content.'
      );
    }
    fileName = fileOrBuffer.name;
    onProgress?.(10, 'Reading PDF binary buffer...', 'init');
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    byteLength = fileOrBuffer.byteLength;
    if (byteLength === 0) {
      throw new ExtractionError(
        'The PDF ArrayBuffer is empty (0 bytes).',
        'PDF_EMPTY_FILE'
      );
    }
    arrayBuffer = fileOrBuffer;
  } else {
    byteLength = fileOrBuffer.byteLength;
    if (byteLength === 0) {
      throw new ExtractionError(
        'The PDF Uint8Array is empty (0 bytes).',
        'PDF_EMPTY_FILE'
      );
    }
    arrayBuffer = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength
    ) as ArrayBuffer;
  }

  onProgress?.(20, 'Loading PDF document structure...', 'parse');

  // Dynamic import to maintain strict client-side isolation
  let pdfjs: any;
  try {
    pdfjs = await import('pdfjs-dist');
  } catch (err: any) {
    throw new ExtractionError(
      'Failed to load the PDF parsing engine.',
      'PDF_UNKNOWN_ERROR',
      err?.message
    );
  }

  // Set worker source
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
  }

  let pdfDoc: any;
  try {
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      stopAtErrors: false,
    });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    const errorMsg = (err?.message || '').toLowerCase();
    if (errorMsg.includes('password')) {
      throw new ExtractionError(
        'This PDF document is password-protected and cannot be parsed.',
        'PDF_PASSWORD_PROTECTED',
        'Please decrypt or remove the password protection before uploading.'
      );
    } else if (errorMsg.includes('invalid') || errorMsg.includes('corrupted') || errorMsg.includes('format')) {
      throw new ExtractionError(
        'The PDF document is corrupted or invalid.',
        'PDF_CORRUPTED',
        'Please export the PDF again from the source application.'
      );
    } else {
      throw new ExtractionError(
        `Failed to parse PDF document: ${err?.message || 'Unknown parsing failure.'}`,
        'PDF_INVALID_FORMAT',
        err?.message
      );
    }
  }

  const numPages: number = pdfDoc.numPages || 0;

  if (numPages === 0) {
    throw new ExtractionError(
      'The uploaded PDF document contains 0 pages.',
      'PDF_ZERO_PAGES'
    );
  }

  const pagesData: PageExtractionData[] = [];
  const extractionWarnings: string[] = [];
  let blankPageCount = 0;

  // Page-by-page structured extraction
  for (let pageIndex = 1; pageIndex <= numPages; pageIndex++) {
    const progressPercent = 25 + Math.floor(((pageIndex - 0.5) / numPages) * 65);
    onProgress?.(
      progressPercent,
      `Extracting page ${pageIndex} of ${numPages}...`,
      'extracting'
    );

    try {
      const page = await pdfDoc.getPage(pageIndex);
      const textContent = await page.getTextContent();

      let lastY: number | null = null;
      let pageRawText = '';

      for (const item of textContent.items) {
        if ('str' in item && typeof item.str === 'string') {
          const str = item.str;
          const transform = item.transform as number[];
          const currentY = transform && transform.length >= 6 ? transform[5] : null;

          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
            pageRawText += '\n';
          } else if (
            pageRawText.length > 0 &&
            !pageRawText.endsWith('\n') &&
            !pageRawText.endsWith(' ')
          ) {
            pageRawText += ' ';
          }

          pageRawText += str;
          if (currentY !== null) {
            lastY = currentY;
          }
        }
      }

      // Clean up whitespace while preserving paragraphs
      const cleanedPageText = pageRawText
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const wordCount = cleanedPageText.split(/\s+/).filter(Boolean).length;
      const charCount = cleanedPageText.length;

      if (wordCount === 0) {
        blankPageCount++;
        extractionWarnings.push(`Page ${pageIndex} contains no extractable text.`);
      }

      pagesData.push({
        pageNumber: pageIndex,
        text: cleanedPageText,
        wordCount,
        charCount,
      });
    } catch (pageErr: any) {
      extractionWarnings.push(
        `Failed to parse text on page ${pageIndex}: ${pageErr?.message || 'Page read error'}`
      );
      pagesData.push({
        pageNumber: pageIndex,
        text: '',
        wordCount: 0,
        charCount: 0,
      });
    }
  }

  onProgress?.(95, 'Structuring extracted copy & paragraphs...', 'finalize');

  const combinedText = pagesData
    .map((p) => p.text)
    .filter(Boolean)
    .join('\n\n')
    .trim();

  const totalWords = combinedText.split(/\s+/).filter(Boolean).length;
  const totalChars = combinedText.length;
  const readingTimeSeconds = Math.max(5, Math.ceil((totalWords / 200) * 60));

  // Check if PDF has no extractable text (e.g. scanned image-only PDF)
  if (!combinedText || totalWords === 0) {
    throw new ExtractionError(
      'No extractable text was found in this PDF document.',
      'PDF_NO_TEXT',
      'This document may contain scanned images or flattened graphics without digital text layers. Please export it as an image (PNG/JPG) for optical character recognition (OCR).',
      true // recoverable with OCR
    );
  }

  // Check if partially blank
  if (blankPageCount > 0 && blankPageCount < numPages) {
    extractionWarnings.push(
      `${blankPageCount} of ${numPages} pages contained no extractable text.`
    );
  }

  if (totalWords < 5) {
    extractionWarnings.push(
      'Very low text volume extracted. Ensure the post is complete before AI analysis.'
    );
  }

  onProgress?.(100, 'PDF extraction complete.', 'done');

  return {
    sourceType: 'pdf',
    fileName,
    fileSize: byteLength,
    pageCount: numPages,
    extractedText: combinedText,
    characterCount: totalChars,
    wordCount: totalWords,
    readingTimeSeconds,
    pages: pagesData,
    extractionWarnings,
    hasText: totalWords > 0,
  };
}
