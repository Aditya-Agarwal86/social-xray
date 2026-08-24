/**
 * Layout Analysis & Multi-Region Classification Engine
 *
 * Segments raw OCR lines into structured spatial clusters and classifies them into:
 * POST_TEXT, IMAGE_TEXT, PROFILE_METADATA, PLATFORM_UI, ENGAGEMENT_METRIC,
 * HASHTAG, CTA, LINK, and UNKNOWN.
 */

import type {
  OcrLineData,
  BoundingBox,
  TextRegion,
  RegionClassification,
  OcrRegionType,
} from './types';

export interface LayoutDimensions {
  width: number;
  height: number;
}

/**
 * Segments an array of OCR lines into classified Text Regions.
 */
export function segmentTextRegions(
  lines: OcrLineData[],
  dimensions?: LayoutDimensions
): TextRegion[] {
  if (!lines || lines.length === 0) return [];

  const width = dimensions?.width || 1000;
  const height = dimensions?.height || 1000;

  // 1. Filter out completely empty lines
  const validLines = lines.filter((l) => l.text && l.text.trim().length > 0);
  if (validLines.length === 0) return [];

  // 2. Spatial Clustering
  const clusters: OcrLineData[][] = [];
  let currentCluster: OcrLineData[] = [];

  for (let i = 0; i < validLines.length; i++) {
    const currentLine = validLines[i];

    if (currentCluster.length === 0) {
      currentCluster.push(currentLine);
      continue;
    }

    const prevLine = currentCluster[currentCluster.length - 1];

    if (shouldGroupLines(prevLine, currentLine, height)) {
      currentCluster.push(currentLine);
    } else {
      clusters.push(currentCluster);
      currentCluster = [currentLine];
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 3. Classify each cluster into fine-grained region types
  return clusters.map((clusterLines, index) => {
    const regionText = clusterLines.map((l) => l.text).join('\n');
    const totalConf = clusterLines.reduce((acc, l) => acc + (l.confidence || 0), 0);
    const avgConf = Math.round(totalConf / clusterLines.length);

    const bbox = computeClusterBoundingBox(clusterLines, width, height);
    const relY = bbox.y0 / height;

    const trimmed = regionText.trim();
    const regionType = classifyRegionType(trimmed, avgConf, relY, clusterLines.length);
    const classification = mapRegionTypeToClassification(regionType, avgConf);

    return {
      id: `region-${index + 1}`,
      text: regionText,
      confidence: avgConf,
      bbox,
      classification,
      regionType,
      lines: clusterLines,
      normalizedScore: computeContentSignificance(trimmed, avgConf, clusterLines.length, regionType),
    };
  });
}

/**
 * Classifies a text cluster into one of 9 discrete OCR region types.
 */
export function classifyRegionType(
  text: string,
  confidence: number,
  relY: number,
  lineCount: number
): OcrRegionType {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Noise check (Spacer dots, non-alphanumeric noise, low confidence short fragments)
  if (/^[^a-zA-Z0-9]+$/.test(trimmed) || /^[.·•\s\-_~=+|/\\]+$/.test(trimmed)) {
    return 'UNKNOWN';
  }
  if (confidence < 35 && trimmed.replace(/[^a-zA-Z]/g, '').length < 4) {
    return 'UNKNOWN';
  }
  if (trimmed.length <= 3 && confidence < 50) {
    return 'UNKNOWN';
  }

  // 2. Engagement Metrics Check (e.g. "64 722 1.5K 50K", "12.4K likes", "50K Views", "64 replies")
  if (isEngagementMetric(trimmed)) {
    return 'ENGAGEMENT_METRIC';
  }

  // 3. Profile Metadata Check (e.g. "@guloona der - 20h", "@username", "name · 2h", "20h ago")
  if (isProfileMetadata(trimmed, relY, lineCount)) {
    return 'PROFILE_METADATA';
  }

  // 4. Platform UI Check (Navigation, buttons, comment chrome)
  if (isPlatformUi(lower, trimmed, relY)) {
    return 'PLATFORM_UI';
  }

  // 5. Link Check (including short links a.co, amzn.to, t.co, bit.ly, tinyurl, linktr.ee)
  if (
    /https?:\/\/[^\s]+|bit\.ly\/[^\s]+|t\.co\/[^\s]+|a\.co\/[^\s]+|amzn\.to\/[^\s]+|tinyurl\.com\/[^\s]+|linktr\.ee\/[^\s]+|(?:^|\s)(?:www\.)?[a-zA-Z0-9-]+\.(?:com|co|org|io|me|app)\/[a-zA-Z0-9_\-\/]+/i.test(
      trimmed
    )
  ) {
    return 'LINK';
  }

  // 6. Explicit CTA Check
  if (isCallToAction(lower)) {
    return 'CTA';
  }

  // 7. Hashtag Check
  const hashtagCount = (trimmed.match(/#[a-zA-Z0-9_]+/g) || []).length;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (hashtagCount >= 1 && (hashtagCount >= words.length * 0.5 || trimmed.startsWith('#'))) {
    return 'HASHTAG';
  }

  // 8. Image-Embedded Text Check (Bracketed alt text or graphic captions)
  if (/^\[.*\]$/s.test(trimmed) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return 'IMAGE_TEXT';
  }

  // 9. Post Copy Check (Sentences, paragraphs, narrative, questions)
  if (words.length >= 3 || /[?.!]/.test(trimmed) || lineCount >= 2) {
    return 'POST_TEXT';
  }

  return confidence >= 70 ? 'POST_TEXT' : 'UNKNOWN';
}

function mapRegionTypeToClassification(
  regionType: OcrRegionType,
  confidence: number
): RegionClassification {
  switch (regionType) {
    case 'POST_TEXT':
    case 'CTA':
      return 'CONTENT';
    case 'HASHTAG':
    case 'IMAGE_TEXT':
    case 'LINK':
      return 'POSSIBLE_CONTENT';
    case 'PROFILE_METADATA':
    case 'PLATFORM_UI':
    case 'ENGAGEMENT_METRIC':
      return 'UI';
    case 'UNKNOWN':
    default:
      return confidence < 60 ? 'NOISE' : 'POSSIBLE_CONTENT';
  }
}

/**
 * Detects engagement metric patterns like:
 * "64 722 1.5K 50K", "1.5K", "50K Views", "64 replies 722 reposts"
 */
export function isEngagementMetric(text: string): boolean {
  const trimmed = text.trim();

  // Sequence of counts: e.g. "64 722 1.5K 50K" or "64 | 722 | 1.5K"
  const metricSequenceRegex = /^(\d+(\.\d+)?[KkMmBb]?\s*[·|/•-]?\s*){2,}$/;
  if (metricSequenceRegex.test(trimmed)) {
    return true;
  }

  // Single metric with label: e.g. "1.5K likes", "50K Views", "64 replies", "722 reposts", "12 bookmarks"
  if (
    /^\d+(\.\d+)?[KkMmBb]?\s*(?:replies|reposts|retweets|likes|views|shares|comments|bookmarks|quotes)$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Standalone metric token e.g. "1.5K" or "50K" or "1.2M"
  if (/^\d+(\.\d+)?[KkMmBb]$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Detects profile headers & timestamps:
 * "@guloona der - 20h", "Aditya Agarwal @aditya_86 · 2h", "20h", "5m"
 */
export function isProfileMetadata(text: string, relY: number, lineCount: number): boolean {
  const trimmed = text.trim();

  // Header handle with timestamp or separator: e.g. "Elon Musk @elonmusk · Aug 23", "@AriEmanuel · Aug 22", "2) ¥% © @guloona der - 20h"
  if (/@\w+.*(?:\d+[hdwmy]|\bago\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|[·•\-])/i.test(trimmed)) {
    return true;
  }

  // Handle alone e.g. "@username"
  if (/^@[a-zA-Z0-9._]{2,30}$/.test(trimmed)) {
    return true;
  }

  // Top header zone with handle or short name + timestamp (hours or date)
  if (relY < 0.25 && lineCount <= 2) {
    if (
      /(?:^|\s)@?[a-zA-Z0-9._]{3,30}\s*[-·•]\s*(?:\d+\s*(?:h|m|s|d|w|mo|y|hours?|days?|ago)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d+|\d+\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))\b/i.test(
        trimmed
      )
    ) {
      return true;
    }
    // Short author name alone at the top (1-3 words, no sentence punctuation)
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= 3 && !/[?.!]/.test(trimmed) && !trimmed.includes('#') && relY < 0.15) {
      if (/(?:verified|follow|following|subscribe)/i.test(trimmed) || /^[a-zA-Z0-9._\s-]+$/.test(trimmed)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects platform chrome UI (buttons, navigation, comment input prompts).
 */
export function isPlatformUi(lower: string, rawText: string, relY: number): boolean {
  if (
    /view\s+all(?:\s+\d+)?\s+comments/i.test(lower) ||
    /add\s+a\s+comment/i.test(lower) ||
    /liked\s+by/i.test(lower) ||
    /and\s+\d+\s+others/i.test(lower) ||
    /see\s+translation/i.test(lower) ||
    /translate\s+post/i.test(lower) ||
    /original\s+audio/i.test(lower) ||
    /post\s+your\s+reply/i.test(lower) ||
    /show\s+this\s+thread/i.test(lower)
  ) {
    return true;
  }

  const uiPhrases = [
    'liked by',
    'and others',
    'add a comment',
    'view all comments',
    'view comments',
    'see translation',
    'translate post',
    'original audio',
    'post your reply',
    'show this thread',
    'follow',
    'following',
    'ai content',
    'explore',
    'notifications',
    'messages',
    'bookmarks',
    'verified orgs',
    'subscribe to premium',
    'who to follow',
  ];

  if (uiPhrases.some((phrase) => lower.includes(phrase))) {
    return true;
  }

  // Standalone single action verbs
  const trimmed = rawText.trim();
  if (/^(?:post|share|reply|send|comment|retweet|repost|like|bookmark)$/i.test(trimmed)) {
    return true;
  }

  // Bottom action bar items or standalone timestamps
  if (relY > 0.75) {
    if (/^\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed)) return true;
    if (/^\d+\s*(?:h|m|s|d|w|mo|y|hours?|days?|minutes?)\s*ago/i.test(trimmed)) return true;
  }

  return false;
}

/**
 * Detects explicit Calls to Action.
 */
export function isCallToAction(lower: string): boolean {
  if (
    /preorder\s+/i.test(lower) ||
    /pre-order\s+/i.test(lower) ||
    /order\s+(?:now|today|your|at|on|below)/i.test(lower) ||
    /buy\s+(?:now|today|your|at|on|below)/i.test(lower) ||
    /get\s+(?:your\s+copy|started|access|tickets)/i.test(lower) ||
    /grab\s+(?:your|a\s+copy)/i.test(lower) ||
    /check\s+(?:out|it\s+out)/i.test(lower) ||
    /tag\s+(?:a|someone|your|a\s+friend|an?\s+\w+)/i.test(lower) ||
    /share\s+(?:this|with)/i.test(lower) ||
    /save\s+(?:this|for)/i.test(lower) ||
    /comment\s+(?:below|down\s+below|with)/i.test(lower) ||
    /drop\s+(?:a|your)\s+(?:comment|thoughts|reply)/i.test(lower) ||
    /follow\s+(?:for\s+more|us|me)/i.test(lower) ||
    /link\s+in\s+bio/i.test(lower) ||
    /click\s+(?:the\s+link|here|below)/i.test(lower) ||
    /tap\s+(?:the\s+link|here|below)/i.test(lower) ||
    /dm\s+(?:me|us)/i.test(lower)
  ) {
    return true;
  }

  const ctaPhrases = [
    'preorder',
    'pre-order',
    'order now',
    'order today',
    'buy now',
    'get your copy',
    'link in bio',
    'click the link',
    'tap the link',
    'comment below',
    'save this post',
    'share this with',
    'follow for more',
    'dm me',
    'swipe left',
    'drop a comment',
    'tag someone who',
    'tag a',
    'leave a follow',
    'like and subscribe',
    'sign up today',
  ];

  return ctaPhrases.some((phrase) => lower.includes(phrase));
}

function shouldGroupLines(
  lineA: OcrLineData,
  lineB: OcrLineData,
  totalHeight: number
): boolean {
  // Never group profile headers with post copy or other elements
  const relYA = lineA.bbox ? lineA.bbox.y0 / totalHeight : 0;
  const relYB = lineB.bbox ? lineB.bbox.y0 / totalHeight : 0;

  if (isProfileMetadata(lineA.text, relYA, 1) || isProfileMetadata(lineB.text, relYB, 1)) {
    return false;
  }

  // Never group engagement metrics with post copy or other elements
  if (isEngagementMetric(lineA.text) || isEngagementMetric(lineB.text)) {
    return false;
  }

  // Keep explicit CTA lines separate
  if (isCallToAction(lineA.text.toLowerCase()) || isCallToAction(lineB.text.toLowerCase())) {
    return false;
  }

  // Keep link lines separate
  const linkRegex = /https?:\/\/[^\s]+|bit\.ly\/[^\s]+|t\.co\/[^\s]+|a\.co\/[^\s]+|amzn\.to\/[^\s]+/i;
  if (linkRegex.test(lineA.text) || linkRegex.test(lineB.text)) {
    return false;
  }

  if (!lineA.bbox || !lineB.bbox) {
    return true;
  }

  const verticalDistance = lineB.bbox.y0 - lineA.bbox.y1;
  const avgLineHeight = Math.max(
    lineA.bbox.y1 - lineA.bbox.y0,
    lineB.bbox.y1 - lineB.bbox.y0,
    14
  );

  const isVerticallyAdjacent = verticalDistance >= -5 && verticalDistance < avgLineHeight * 2.5;

  const horizontalOverlap =
    Math.min(lineA.bbox.x1, lineB.bbox.x1) - Math.max(lineA.bbox.x0, lineB.bbox.x0);
  const isHorizontallyAligned = horizontalOverlap > -50;

  return isVerticallyAdjacent && isHorizontallyAligned;
}

function computeClusterBoundingBox(
  lines: OcrLineData[],
  defaultW: number,
  defaultH: number
): BoundingBox {
  let minX = defaultW;
  let minY = defaultH;
  let maxX = 0;
  let maxY = 0;
  let hasBbox = false;

  for (const line of lines) {
    if (line.bbox) {
      hasBbox = true;
      if (line.bbox.x0 < minX) minX = line.bbox.x0;
      if (line.bbox.y0 < minY) minY = line.bbox.y0;
      if (line.bbox.x1 > maxX) maxX = line.bbox.x1;
      if (line.bbox.y1 > maxY) maxY = line.bbox.y1;
    }
  }

  if (!hasBbox) {
    return { x0: 0, y0: 0, x1: defaultW, y1: defaultH };
  }

  return { x0: minX, y0: minY, x1: maxX, y1: maxY };
}

function computeContentSignificance(
  text: string,
  conf: number,
  lineCount: number,
  regionType: OcrRegionType
): number {
  if (regionType === 'UNKNOWN') return 5;
  if (regionType === 'PLATFORM_UI' || regionType === 'ENGAGEMENT_METRIC' || regionType === 'PROFILE_METADATA') {
    return 10;
  }

  let score = conf * 0.4;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 5) score += 30;
  if (lineCount >= 2) score += 20;
  if (/[?.!]$/.test(text.trim())) score += 15;
  if (regionType === 'HASHTAG') score += 10;
  if (regionType === 'POST_TEXT' || regionType === 'CTA') score += 25;

  return Math.min(100, Math.round(score));
}
