/**
 * Social Post Content Extraction Layer
 *
 * Distinguishes genuine post copy, captions, hashtags, and descriptive text
 * from peripheral platform UI chrome without brittle hardcoded word deletion.
 */

import type { TextRegion, SocialPostExtractionResult, OcrLineData } from './types';

/**
 * Extracts and reconstructs social post content from layout regions.
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
      detectedRegions: [],
    };
  }

  // 1. Identify primary author handle if present in top regions
  let authorHandle: string | undefined;
  const headerRegion = regions.find((r) => r.type === 'header');
  if (headerRegion) {
    const handleMatch = headerRegion.text.match(/(?:^|\s)@?([a-z0-9._]{3,30})(?:\s|$)/i);
    if (handleMatch) {
      authorHandle = handleMatch[1].replace(/^[._]+|[._]+$/g, '');
    }
  }

  const captionSegments: string[] = [];
  const hashtagsFound: string[] = [];
  const supplementalSegments: string[] = [];
  let filteredNoiseCount = 0;
  let hasLowConfidence = false;

  // 2. Process each region
  for (const region of regions) {
    if (region.confidence < 50) {
      hasLowConfidence = true;
    }

    // Skip pure UI noise
    if (region.type === 'ui_noise') {
      filteredNoiseCount++;
      continue;
    }

    // Skip isolated header regions if purely profile/location
    if (region.type === 'header') {
      const lines = region.lines.map((l) => l.text.trim());
      const hasCaptionLikeSentence = lines.some((l) => l.split(/\s+/).length > 5 || /[?.!]/.test(l));
      if (!hasCaptionLikeSentence) {
        filteredNoiseCount++;
        continue;
      }
    }

    // Skip bottom interaction metadata (likes, timestamp, comment bar)
    if (region.type === 'metadata') {
      filteredNoiseCount++;
      continue;
    }

    // Extract lines and clean them
    const regionLines = region.lines.map((l) => l.text);

    for (const rawLine of regionLines) {
      const line = cleanOcrLineArtifacts(rawLine);
      if (!line) continue;

      // Filter footer cues that might have slipped into a cluster
      if (isFooterMetadataLine(line)) {
        filteredNoiseCount++;
        continue;
      }

      // Check for standalone hashtag lines
      if (line.startsWith('#') || (line.match(/#/g) || []).length >= 2) {
        const tags = line.match(/#[a-zA-Z0-9_]+/g) || [];
        tags.forEach((t) => {
          if (!hashtagsFound.includes(t)) hashtagsFound.push(t);
        });
        continue;
      }

      // Check for bracketed descriptors / alt text e.g. [Sunset, viral, pune skyline...]
      if (/^\[.*\]$/.test(line) || (/\[/.test(line) && /\]/.test(line))) {
        supplementalSegments.push(line);
        continue;
      }

      // Check for author prefix at the start of caption line: "author_handle Did the sky turn..."
      let cleanedCaptionLine = line;
      if (authorHandle) {
        const escaped = authorHandle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const handlePrefixRegex = new RegExp(`^@?${escaped}\\s*[:\\-]?\\s*`, 'i');
        cleanedCaptionLine = cleanedCaptionLine.replace(handlePrefixRegex, '').trim();
      }

      // Strip leading username token when followed by capitalized start of sentence (e.g. "a._n._v._a._y Did the sky...")
      cleanedCaptionLine = cleanedCaptionLine
        .replace(/^@?[a-z0-9._]{3,30}\s+(?=[A-Z0-9"'])/, '')
        .trim();

      // Filter out isolated spacer dots common in social captions (e.g. "." or "·")
      if (/^[.·•\s-]+$/.test(cleanedCaptionLine)) {
        continue;
      }

      // Skip obvious micro UI artifacts (e.g. single symbols like "— TI" or "¥ 5" or "Ld Kothrud")
      if (isMicroUiArtifact(cleanedCaptionLine)) {
        filteredNoiseCount++;
        continue;
      }

      if (cleanedCaptionLine.length > 0) {
        captionSegments.push(cleanedCaptionLine);
      }
    }
  }

  // 3. Reconstruct the clean, coherent social post draft
  const primaryCaption = captionSegments.join('\n').trim();
  const hashtagBlock = hashtagsFound.join(' ');
  const supplementalText = supplementalSegments.join('\n').trim();

  const fullDraftParts: string[] = [];
  if (primaryCaption) fullDraftParts.push(primaryCaption);
  if (hashtagBlock) fullDraftParts.push(hashtagBlock);
  if (supplementalText) fullDraftParts.push(supplementalText);

  let cleanedFullText = fullDraftParts.join('\n\n').trim();

  // Fallback: If filtering was too aggressive and produced empty text, fallback to sanitized raw lines
  if (!cleanedFullText && rawLines.length > 0) {
    cleanedFullText = rawLines
      .map((l) => l.text.trim())
      .filter((t) => t.length > 2 && !/^[.·•\s-]+$/.test(t))
      .join('\n');
    hasLowConfidence = true;
  }

  const hasUncertain = hasLowConfidence || (filteredNoiseCount > 0 && captionSegments.length <= 1);

  return {
    captionText: primaryCaption,
    hashtags: hashtagsFound,
    postContextText: supplementalText,
    authorHandle,
    cleanedFullText,
    hasUncertainClassifications: hasUncertain,
    filteredNoiseCount,
    detectedRegions: regions,
    classificationNote: hasUncertain
      ? 'Some peripheral interface text was filtered. Review the editable draft below.'
      : undefined,
  };
}

/**
 * Strips common OCR glyph glitches without destroying genuine text.
 */
function cleanOcrLineArtifacts(line: string): string {
  return line
    .replace(/^[^a-zA-Z0-9#@[(\s]{1,2}\s*/, '') // Strip leading noise like "wm " or "{ " or "¥ "
    .replace(/\r\n|\r/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Identifies isolated micro UI noise (e.g. single icon glyphs, isolated location pills).
 */
function isMicroUiArtifact(line: string): boolean {
  const trimmed = line.trim();
  if (/^(?:wn|wm|tw|ld|frr|oo)\b/i.test(trimmed) && trimmed.split(/\s+/).length <= 2) {
    return true;
  }
  if (/^[-—_~=+|/\\]{1,4}$/.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Identifies common footer action lines that should not be in the caption body.
 */
function isFooterMetadataLine(line: string): boolean {
  const lower = line.toLowerCase();
  if (
    lower.startsWith('liked by') ||
    lower.includes('and others') ||
    lower.includes('add a comment') ||
    lower.includes('view all comments') ||
    lower.includes('see translation')
  ) {
    return true;
  }
  return false;
}
