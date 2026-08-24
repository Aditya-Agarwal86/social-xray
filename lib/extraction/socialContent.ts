/**
 * Social Post Content Extraction & Content Inventory Layer
 *
 * Reconstructs clean post copy from structured text regions and generates
 * a strict Content Inventory separating post content from UI, metrics, and metadata.
 */

import type {
  TextRegion,
  SocialPostExtractionResult,
  OcrLineData,
  ExtractionTelemetry,
  ExtractionQuality,
  ContentInventory,
  ObservedEngagementMetrics,
  ProfileMetadata,
  CaptionStatus,
} from './types';

/**
 * Extracts clean social post content and constructs the Content Inventory.
 */
export function extractSocialPostContent(
  regions: TextRegion[],
  rawLines: OcrLineData[],
  hasVisualMedia = true
): SocialPostExtractionResult {
  const emptyInventory: ContentInventory = {
    hasVisualMedia,
    caption: null,
    captionStatus: 'NOT_DETECTED',
    hashtags: [],
    cta: null,
    links: [],
    engagementMetrics: {
      replies: null,
      reposts: null,
      likes: null,
      views: null,
      saves: null,
    },
    profileMetadata: {
      username: null,
      displayName: null,
      timestamp: null,
    },
    extractionWarnings: [],
  };

  if (!regions || regions.length === 0) {
    return {
      captionText: null,
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
      inventory: emptyInventory,
    };
  }

  const contentRegions: TextRegion[] = [];
  const uncertainRegions: TextRegion[] = [];
  const filteredRegions: TextRegion[] = [];

  const captionSegments: string[] = [];
  const hashtagsFound: string[] = [];
  const ctaSegments: string[] = [];
  const linkSegments: string[] = [];
  const supplementalSegments: string[] = [];

  let parsedHandle: string | null = null;
  let parsedDisplayName: string | null = null;
  let parsedTimestamp: string | null = null;

  let nestedAuthorHandle: string | null = null;
  let nestedDisplayName: string | null = null;
  let nestedTimestamp: string | null = null;
  const nestedCaptionSegments: string[] = [];
  const nestedCtaSegments: string[] = [];
  const nestedLinkSegments: string[] = [];

  let inNestedSection = false;

  const observedMetrics: ObservedEngagementMetrics = {
    replies: null,
    reposts: null,
    likes: null,
    views: null,
    saves: null,
  };

  let lowConfidenceCount = 0;
  let totalConfidenceSum = 0;

  // 1. Process and route each region based on regionType
  for (const region of regions) {
    totalConfidenceSum += region.confidence;
    if (region.confidence < 60) {
      lowConfidenceCount++;
    }

    const { regionType, text } = region;

    // Filtered / Peripheral UI & Noise
    if (regionType === 'PLATFORM_UI' || regionType === 'UNKNOWN') {
      filteredRegions.push(region);
      continue;
    }

    // Profile Metadata (Outer vs Nested / Quoted Post)
    if (regionType === 'PROFILE_METADATA') {
      filteredRegions.push(region);
      const meta = parseProfileMetadata(text);
      if (!parsedHandle) {
        if (meta.username) parsedHandle = meta.username;
        if (meta.displayName) parsedDisplayName = meta.displayName;
        if (meta.timestamp) parsedTimestamp = meta.timestamp;
      } else {
        // Subsequent profile header indicates a quoted / nested post!
        inNestedSection = true;
        if (meta.username) nestedAuthorHandle = meta.username;
        if (meta.displayName) nestedDisplayName = meta.displayName;
        if (meta.timestamp) nestedTimestamp = meta.timestamp;
      }
      continue;
    }

    // Engagement Metrics
    if (regionType === 'ENGAGEMENT_METRIC') {
      filteredRegions.push(region);
      const metrics = parseEngagementMetrics(text);
      if (metrics.replies) observedMetrics.replies = metrics.replies;
      if (metrics.reposts) observedMetrics.reposts = metrics.reposts;
      if (metrics.likes) observedMetrics.likes = metrics.likes;
      if (metrics.views) observedMetrics.views = metrics.views;
      if (metrics.saves) observedMetrics.saves = metrics.saves;
      continue;
    }

    // Hashtags
    if (regionType === 'HASHTAG') {
      uncertainRegions.push(region);
      const tags = text.match(/#[a-zA-Z0-9_]+/g) || [];
      tags.forEach((t) => {
        if (!hashtagsFound.includes(t)) hashtagsFound.push(t);
      });
      continue;
    }

    // CTA
    if (regionType === 'CTA') {
      contentRegions.push(region);
      const trimmedCta = text.trim();
      if (inNestedSection) {
        nestedCtaSegments.push(trimmedCta);
        nestedCaptionSegments.push(trimmedCta);
      } else {
        ctaSegments.push(trimmedCta);
        captionSegments.push(trimmedCta);
      }
      const tags = text.match(/#[a-zA-Z0-9_]+/g) || [];
      tags.forEach((t) => {
        if (!hashtagsFound.includes(t)) hashtagsFound.push(t);
      });
      continue;
    }

    // Link
    if (regionType === 'LINK') {
      uncertainRegions.push(region);
      const urls =
        text.match(
          /https?:\/\/[^\s]+|bit\.ly\/[^\s]+|t\.co\/[^\s]+|a\.co\/[^\s]+|amzn\.to\/[^\s]+|tinyurl\.com\/[^\s]+|linktr\.ee\/[^\s]+|(?:^|\s)(?:www\.)?[a-zA-Z0-9-]+\.(?:com|co|org|io|me|app)\/[a-zA-Z0-9_\-\/]+/gi
        ) || [];
      urls.forEach((u) => {
        const cleanUrl = u.trim();
        if (inNestedSection) {
          if (!nestedLinkSegments.includes(cleanUrl)) nestedLinkSegments.push(cleanUrl);
        }
        if (!linkSegments.includes(cleanUrl)) linkSegments.push(cleanUrl);
      });
      continue;
    }

    // Image-Embedded Text
    if (regionType === 'IMAGE_TEXT') {
      uncertainRegions.push(region);
      supplementalSegments.push(text.trim());
      continue;
    }

    // Genuine Post Text
    if (regionType === 'POST_TEXT') {
      contentRegions.push(region);

      for (const rawLine of region.lines) {
        const line = cleanOcrLineArtifacts(rawLine.text);
        if (!line) continue;

        // Hashtags inside text lines
        if (line.startsWith('#') || (line.match(/#/g) || []).length >= 2) {
          const tags = line.match(/#[a-zA-Z0-9_]+/g) || [];
          tags.forEach((t) => {
            if (!hashtagsFound.includes(t)) hashtagsFound.push(t);
          });
          continue;
        }

        // Strip author prefix if accidentally prepended to text
        let cleanedLine = line;
        const currentHandle = inNestedSection ? nestedAuthorHandle : parsedHandle;
        if (currentHandle) {
          const escaped = currentHandle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const handleRegex = new RegExp(`^@?${escaped}\\s*[:\\-]?\\s*`, 'i');
          cleanedLine = cleanedLine.replace(handleRegex, '').trim();
        }

        // Strip generic username prefix before sentence start
        cleanedLine = cleanedLine.replace(/^@?[a-z0-9._]{3,30}\s+(?=[A-Z0-9"'])/, '').trim();

        if (/^[.·•\s-]+$/.test(cleanedLine)) continue;
        if (isMicroArtifact(cleanedLine)) continue;

        if (cleanedLine.length > 0) {
          if (inNestedSection) {
            nestedCaptionSegments.push(cleanedLine);
          } else {
            captionSegments.push(cleanedLine);
          }
        }
      }
    }
  }

  // 2. Assemble caption and check caption status
  const primaryCaption = captionSegments.length > 0 ? captionSegments.join('\n').trim() : null;
  const nestedCaption = nestedCaptionSegments.length > 0 ? nestedCaptionSegments.join('\n').trim() : null;
  const hashtagBlock = hashtagsFound.join(' ');
  const supplementalText = supplementalSegments.join('\n').trim();

  const fullParts: string[] = [];
  if (primaryCaption) fullParts.push(primaryCaption);
  if (nestedCaption) fullParts.push(`[Nested Post: ${nestedCaption}]`);
  if (hashtagBlock) fullParts.push(hashtagBlock);
  if (supplementalText) fullParts.push(supplementalText);

  const cleanedFullText = fullParts.join('\n\n').trim();

  // 3. Determine Caption Detection Status
  let captionStatus: CaptionStatus = 'NOT_DETECTED';
  if (primaryCaption && primaryCaption.length > 0) {
    const avgPostConf = contentRegions.length > 0
      ? contentRegions.reduce((sum, r) => sum + r.confidence, 0) / contentRegions.length
      : 0;
    captionStatus = avgPostConf >= 70 ? 'DETECTED' : 'UNCERTAIN';
  } else if (nestedCaption && nestedCaption.length > 0) {
    captionStatus = 'DETECTED';
  }

  // 4. Construct Nested Post Inventory (if secondary author or nested copy detected)
  const isNestedDetected = !!(nestedAuthorHandle || nestedDisplayName || nestedCaption || nestedCtaSegments.length > 0 || nestedLinkSegments.length > 0);
  const nestedPost = isNestedDetected
    ? {
        detected: true,
        authorHandle: nestedAuthorHandle,
        displayName: nestedDisplayName,
        timestamp: nestedTimestamp,
        text: nestedCaption,
        cta: nestedCtaSegments.length > 0 ? nestedCtaSegments.join('; ') : null,
        links: nestedLinkSegments,
        hasMedia: hasVisualMedia,
        mediaSummary: supplementalSegments.length > 0 ? supplementalSegments.join(' ') : undefined,
      }
    : undefined;

  // 5. Construct CTA Details Breakdown
  const hasOuterCta = ctaSegments.length > 0;
  const hasNestedCta = nestedCtaSegments.length > 0 || nestedLinkSegments.length > 0;
  const hasAnyLink = linkSegments.length > 0;

  const rawCtaText = hasOuterCta
    ? ctaSegments.join('; ')
    : hasNestedCta
    ? (nestedCtaSegments.length > 0 ? nestedCtaSegments.join('; ') : nestedLinkSegments.join(', '))
    : hasAnyLink
    ? linkSegments.join(', ')
    : undefined;

  const ctaType = rawCtaText
    ? /preorder|pre-order/i.test(rawCtaText)
      ? ('preorder' as const)
      : /order|buy|purchase/i.test(rawCtaText)
      ? ('purchase' as const)
      : /link|a\.co|amzn|t\.co|bit\.ly/i.test(rawCtaText)
      ? ('link' as const)
      : /comment|reply|drop|share|tag/i.test(rawCtaText)
      ? ('conversation' as const)
      : ('link' as const)
    : ('none' as const);

  const ctaVisibility = hasOuterCta ? ('primary' as const) : hasNestedCta ? ('nested' as const) : hasAnyLink ? ('secondary' as const) : ('none' as const);
  const ctaLocation = hasOuterCta ? ('outer_post' as const) : hasNestedCta ? ('nested_post' as const) : ('none' as const);

  const ctaDetails = {
    detected: hasOuterCta || hasNestedCta || hasAnyLink,
    text: rawCtaText,
    type: ctaType,
    visibility: ctaVisibility,
    location: ctaLocation,
    destinationUrl: linkSegments[0] || nestedLinkSegments[0] || undefined,
  };

  // 6. Construct Content Inventory
  const inventory: ContentInventory = {
    hasVisualMedia,
    caption: primaryCaption,
    captionStatus,
    hashtags: hashtagsFound,
    cta: rawCtaText || null,
    ctaDetails,
    links: linkSegments,
    engagementMetrics: observedMetrics,
    profileMetadata: {
      username: parsedHandle,
      displayName: parsedDisplayName,
      timestamp: parsedTimestamp,
    },
    nestedPost,
    extractionWarnings: [],
  };

  if (captionStatus === 'NOT_DETECTED') {
    inventory.extractionWarnings.push('No written post caption or copy was detected. Visual content will be analyzed directly.');
  } else if (captionStatus === 'UNCERTAIN') {
    inventory.extractionWarnings.push('Caption extraction is uncertain. Please review the detected draft before running diagnostics.');
  }

  // 5. Telemetry & Quality
  const avgConfidence = Math.round(totalConfidenceSum / Math.max(regions.length, 1));
  const quality: ExtractionQuality =
    captionStatus === 'DETECTED' && avgConfidence >= 80
      ? 'HIGH'
      : captionStatus !== 'NOT_DETECTED' && avgConfidence >= 60
      ? 'MEDIUM'
      : 'LOW';

  const confidenceLabel =
    captionStatus === 'NOT_DETECTED'
      ? 'Image-only / visual post (No caption detected)'
      : quality === 'HIGH'
      ? `Detection confidence: ${avgConfidence}% (High quality)`
      : `Detection confidence: ${avgConfidence}% (Review recommended)`;

  const telemetry: ExtractionTelemetry = {
    totalDetectedRegions: regions.length,
    likelyPostCount: contentRegions.length,
    possibleUiCount: filteredRegions.length,
    lowConfidenceCount,
    quality,
    confidence: avgConfidence,
    confidenceLabel,
  };

  return {
    captionText: primaryCaption,
    hashtags: hashtagsFound,
    postContextText: supplementalText,
    authorHandle: parsedHandle || undefined,
    cleanedFullText,
    hasUncertainClassifications: captionStatus === 'UNCERTAIN' || filteredRegions.length > 0,
    filteredNoiseCount: filteredRegions.length,
    contentRegions,
    uncertainRegions,
    filteredRegions,
    telemetry,
    inventory,
    classificationNote:
      captionStatus === 'NOT_DETECTED'
        ? 'No caption text was detected in this screenshot. The AI diagnostician will analyze visual stopping power and layout directly.'
        : captionStatus === 'UNCERTAIN'
        ? 'Some text in this screenshot could not be confidently classified. Please review and refine the extracted draft below.'
        : undefined,
  };
}

/**
 * Parses engagement metrics from strings like:
 * "64 722 1.5K 50K", "64 replies 722 reposts 1.5K likes 50K views", "1.5K likes"
 */
export function parseEngagementMetrics(text: string): ObservedEngagementMetrics {
  const result: ObservedEngagementMetrics = {
    replies: null,
    reposts: null,
    likes: null,
    views: null,
    saves: null,
  };

  const trimmed = text.trim();

  // Pattern A: Labeled items (e.g. "64 replies", "1.5K likes", "50K views", "722 reposts")
  const labeledRegex = /(\d+(\.\d+)?[KkMmBb]?)\s*(replies|reposts|retweets|likes|views|shares|saves|bookmarks)/gi;
  let match;
  let hasLabeled = false;

  while ((match = labeledRegex.exec(trimmed)) !== null) {
    hasLabeled = true;
    const value = match[1];
    const label = match[3].toLowerCase();

    if (label.includes('repl')) result.replies = formatMetricValue(value);
    else if (label.includes('repost') || label.includes('retweet') || label.includes('share'))
      result.reposts = formatMetricValue(value);
    else if (label.includes('like')) result.likes = formatMetricValue(value);
    else if (label.includes('view')) result.views = formatMetricValue(value);
    else if (label.includes('save') || label.includes('bookmark')) result.saves = formatMetricValue(value);
  }

  if (hasLabeled) return result;

  // Pattern B: Sequence of numbers on Twitter/X bottom bar:
  // e.g. "64 722 1.5K 50K" -> [replies, reposts, likes, views]
  const tokens = trimmed.split(/[\s·|/•-]+/).filter((t) => /^\d+(\.\d+)?[KkMmBb]?$/.test(t));
  if (tokens.length >= 3) {
    result.replies = formatMetricValue(tokens[0]);
    result.reposts = formatMetricValue(tokens[1]);
    result.likes = formatMetricValue(tokens[2]);
    if (tokens.length >= 4) {
      result.views = formatMetricValue(tokens[3]);
    }
  } else if (tokens.length === 2) {
    result.likes = formatMetricValue(tokens[0]);
    result.views = formatMetricValue(tokens[1]);
  }

  return result;
}

function formatMetricValue(val: string): number | string {
  if (/^\d+$/.test(val)) {
    return parseInt(val, 10);
  }
  return val.toUpperCase();
}

/**
 * Extracts username handle, display name, and timestamp from profile header text:
 * e.g. "2) ¥% © @guloona der - 20h" -> { username: "guloona", timestamp: "20h" }
 * e.g. "Aditya Agarwal @aditya_86 · 2h" -> { displayName: "Aditya Agarwal", username: "aditya_86", timestamp: "2h" }
 */
export function parseProfileMetadata(text: string): ProfileMetadata {
  let username: string | null = null;
  let displayName: string | null = null;
  let timestamp: string | null = null;

  // Extract handle
  const handleMatch = text.match(/@([a-zA-Z0-9._]{2,30})/);
  if (handleMatch) {
    username = handleMatch[1].replace(/^[._]+|[._]+$/g, '');
  }

  // Extract timestamp
  const timeMatch = text.match(/\b(\d+\s*(?:h|m|s|d|w|mo|y|hours?|days?|minutes?|ago))\b/i);
  if (timeMatch) {
    timestamp = timeMatch[1].trim();
  }

  // Extract display name before handle
  if (handleMatch && handleMatch.index && handleMatch.index > 0) {
    const before = text.substring(0, handleMatch.index).trim();
    const cleanBefore = before.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9\s]+$/, '').trim();
    if (cleanBefore.length >= 2 && cleanBefore.length <= 40) {
      displayName = cleanBefore;
    }
  }

  return {
    username,
    displayName,
    timestamp,
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
