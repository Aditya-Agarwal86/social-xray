/**
 * Social Post Content Extraction Layer
 *
 * Reconstructs clean post copy from structured text regions and generates
 * honest transparency telemetry ("What We Found") for the user review screen.
 */

import type {
  TextRegion,
  SocialPostExtractionResult,
  OcrLineData,
  ExtractionTelemetry,
  ExtractionQuality,
} from './types';

/**
 * Extracts clean social post content and categorizes detected regions.
 */
export function extractSocialPostContent(
  regions: TextRegion[],
  rawLines: OcrLineData[]
): SocialPostExtractionResult {
  if (!regions || regions.length === 0) {
    return {
      captionText: '',
      hashtags: [],
      postContextText: '',
      cleanedFullText: '',
      hasUncertainClassifications: false,
      filteredNoiseCount: 0,
      contentRegions: [],
      uncertainRegions: [],
      filteredRegions: [],
      telemetry: {
        totalDetectedRegions: 0,
        likelyPostCount: 0,
        possibleUiCount: 0,
        lowConfidenceCount: 0,
        quality: 'LOW',
        confidence: 0,
        confidenceLabel: 'No readable text detected',
      },
    };
  }

  // 1. Detect author handle if present in UI header
  let authorHandle: string | undefined;
  const headerUiRegion = regions.find((r) => r.classification === 'UI' && r.bbox.y0 < 300);
  if (headerUiRegion) {
    const handleMatch = headerUiRegion.text.match(/(?:^|\s)@?([a-z0-9._]{3,30})(?:\s|$)/i);
    if (handleMatch) {
      authorHandle = handleMatch[1].replace(/^[._]+|[._]+$/g, '');
    }
  }

  const contentRegions: TextRegion[] = [];
  const uncertainRegions: TextRegion[] = [];
  const filteredRegions: TextRegion[] = [];

  const captionSegments: string[] = [];
  const hashtagsFound: string[] = [];
  const supplementalSegments: string[] = [];

  let lowConfidenceCount = 0;
  let totalConfidenceSum = 0;

  // 2. Classify regions and collect content lines
  for (const region of regions) {
    totalConfidenceSum += region.confidence;
    if (region.confidence < 60) {
      lowConfidenceCount++;
    }

    if (region.classification === 'UI' || region.classification === 'NOISE') {
      filteredRegions.push(region);
      continue;
    }

    if (region.classification === 'CONTENT') {
      contentRegions.push(region);
    } else {
      uncertainRegions.push(region);
    }

    // Process lines inside valid content regions
    for (const rawLine of region.lines) {
      const line = cleanOcrLineArtifacts(rawLine.text);
      if (!line) continue;

      // Hashtag lines
      if (line.startsWith('#') || (line.match(/#/g) || []).length >= 2) {
        const tags = line.match(/#[a-zA-Z0-9_]+/g) || [];
        tags.forEach((t) => {
          if (!hashtagsFound.includes(t)) hashtagsFound.push(t);
        });
        continue;
      }

      // Bracketed alt/descriptor text
      if (/^\[.*\]$/.test(line) || (line.startsWith('[') && line.endsWith(']'))) {
        supplementalSegments.push(line);
        continue;
      }

      // Strip author prefix if attached to start of line
      let cleanedLine = line;
      if (authorHandle) {
        const escaped = authorHandle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const handleRegex = new RegExp(`^@?${escaped}\\s*[:\\-]?\\s*`, 'i');
        cleanedLine = cleanedLine.replace(handleRegex, '').trim();
      }

      // Strip username prefix when followed by sentence start (e.g. "a._n._v._a._y Did the sky...")
      cleanedLine = cleanedLine.replace(/^@?[a-z0-9._]{3,30}\s+(?=[A-Z0-9"'])/, '').trim();

      // Skip spacer dots
      if (/^[.·•\s-]+$/.test(cleanedLine)) continue;

      // Skip single micro artifacts
      if (isMicroArtifact(cleanedLine)) {
        continue;
      }

      if (cleanedLine.length > 0) {
        captionSegments.push(cleanedLine);
      }
    }
  }

  // 3. Assemble clean extracted post text
  const primaryCaption = captionSegments.join('\n').trim();
  const hashtagBlock = hashtagsFound.join(' ');
  const supplementalText = supplementalSegments.join('\n').trim();

  const fullParts: string[] = [];
  if (primaryCaption) fullParts.push(primaryCaption);
  if (hashtagBlock) fullParts.push(hashtagBlock);
  if (supplementalText) fullParts.push(supplementalText);

  let cleanedFullText = fullParts.join('\n\n').trim();

  // Safe fallback if filtering emptied the text
  if (!cleanedFullText && rawLines.length > 0) {
    cleanedFullText = rawLines
      .map((l) => l.text.trim())
      .filter((t) => t.length > 2 && !/^[.·•\s-]+$/.test(t))
      .join('\n');
  }

  // 4. Calculate extraction quality metrics
  const avgConfidence = Math.round(totalConfidenceSum / Math.max(regions.length, 1));
  const quality: ExtractionQuality =
    avgConfidence >= 80 && filteredRegions.length <= 2
      ? 'HIGH'
      : avgConfidence >= 60
      ? 'MEDIUM'
      : 'LOW';

  const confidenceLabel =
    quality === 'HIGH'
      ? `Detection confidence: ${avgConfidence}% (High quality)`
      : quality === 'MEDIUM'
      ? `Detection confidence: ${avgConfidence}% (Review recommended)`
      : `Low-confidence text detection (${avgConfidence}%)`;

  const telemetry: ExtractionTelemetry = {
    totalDetectedRegions: regions.length,
    likelyPostCount: contentRegions.length + (hashtagsFound.length > 0 ? 1 : 0),
    possibleUiCount: filteredRegions.length,
    lowConfidenceCount,
    quality,
    confidence: avgConfidence,
    confidenceLabel,
  };

  const hasUncertain =
    quality === 'LOW' ||
    filteredRegions.length > 0 ||
    captionSegments.length <= 1 ||
    uncertainRegions.length > 0;

  return {
    captionText: primaryCaption,
    hashtags: hashtagsFound,
    postContextText: supplementalText,
    authorHandle,
    cleanedFullText,
    hasUncertainClassifications: hasUncertain,
    filteredNoiseCount: filteredRegions.length,
    contentRegions,
    uncertainRegions,
    filteredRegions,
    telemetry,
    classificationNote: hasUncertain
      ? 'Some text in this screenshot could not be confidently classified. Please review and refine the extracted draft below.'
      : undefined,
  };
}

function cleanOcrLineArtifacts(line: string): string {
  return line
    .replace(/^(?:wm|wn|tw|ld|w=|a\s*I=)\s+/i, '')
    .replace(/^[^a-zA-Z0-9#@[(\s]{1,2}\s*/, '')
    .replace(/\r\n|\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function isMicroArtifact(line: string): boolean {
  const trimmed = line.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    if (/^(?:wn|wm|tw|ld|frr|oo|ler\s*\d|ger\s*stretch|y\s*wage)\b/i.test(trimmed)) {
      return true;
    }
  }
  if (/^[-—_~=+|/\\]{1,4}$/.test(trimmed)) {
    return true;
  }
  return false;
}
