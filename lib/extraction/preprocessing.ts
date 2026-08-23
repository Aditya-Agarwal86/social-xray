/**
 * In-browser Image Preprocessing Engine for Social-Media Screenshot OCR
 *
 * Enhances contrast, normalizes scale, and prepares canvas buffers
 * without destructively modifying the original File object.
 */

export interface PreprocessingOptions {
  maxDimension?: number;
  minDimension?: number;
  enhanceContrast?: boolean;
  grayscale?: boolean;
}

export interface PreprocessedImageResult {
  blob: Blob;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  scaleFactor: number;
}

/**
 * Preprocesses an image file using an offscreen HTML5 Canvas.
 * - Standardizes scale for high-DPI character recognition.
 * - Enhances contrast for low-contrast social media captions.
 * - Preserves aspect ratio.
 */
export async function preprocessImageForOcr(
  file: File,
  options: PreprocessingOptions = {}
): Promise<PreprocessedImageResult> {
  if (typeof window === 'undefined') {
    throw new Error('Image preprocessing is only supported in browser environments.');
  }

  const {
    maxDimension = 2400,
    minDimension = 1000,
    enhanceContrast = true,
    grayscale = true,
  } = options;

  // 1. Load image into an HTMLImageElement
  const imageBitmap = await loadImageElement(file);
  const origW = imageBitmap.naturalWidth || imageBitmap.width;
  const origH = imageBitmap.naturalHeight || imageBitmap.height;

  // 2. Compute optimal scaling for OCR readability
  let scale = 1.0;
  const maxDim = Math.max(origW, origH);
  const minDim = Math.min(origW, origH);

  if (minDim < minDimension && maxDim * (minDimension / minDim) <= maxDimension) {
    // Upscale small mobile screenshots to give Tesseract clearer stroke definition
    scale = minDimension / minDim;
  } else if (maxDim > maxDimension) {
    // Downscale massive screenshots to prevent worker memory exhaustion
    scale = maxDimension / maxDim;
  }

  const targetW = Math.round(origW * scale);
  const targetH = Math.round(origH * scale);

  // 3. Render onto offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Unable to create 2D canvas context for OCR preprocessing.');
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);

  // 4. Apply grayscale and contrast normalization
  if (grayscale || enhanceContrast) {
    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imageData.data;
    const len = data.length;

    // First pass: Calculate min/max luminance for adaptive stretching
    let minLum = 255;
    let maxLum = 0;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Standard Rec. 709 luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    const lumRange = Math.max(maxLum - minLum, 1);

    // Second pass: Apply contrast stretch & grayscale
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (enhanceContrast && lumRange > 20 && lumRange < 240) {
        // Stretch dynamic range
        lum = ((lum - minLum) / lumRange) * 255;
        // Mild S-curve contrast boost
        lum = Math.min(255, Math.max(0, lum));
      }

      data[i] = lum;     // R
      data[i + 1] = lum; // G
      data[i + 2] = lum; // B
      // Alpha data[i + 3] remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // 5. Export processed buffer
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to generate preprocessed OCR Blob.'));
    }, 'image/png');
  });

  return {
    blob,
    dataUrl,
    originalWidth: origW,
    originalHeight: origH,
    processedWidth: targetW,
    processedHeight: targetH,
    scaleFactor: scale,
  };
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file into HTMLImageElement.'));
    };

    img.src = url;
  });
}
