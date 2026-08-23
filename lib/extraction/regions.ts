/**
 * Layout Analysis & Multi-Region Classification Engine
 *
 * Segments raw OCR lines into structured spatial clusters and classifies them into
 * CONTENT, POSSIBLE_CONTENT, UI, and NOISE without hardcoded brittle strings.
 */

import type { OcrLineData, BoundingBox, TextRegion, RegionClassification } from './types';

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

  // 3. Classify each region into CONTENT, POSSIBLE_CONTENT, UI, or NOISE
  return clusters.map((clusterLines, index) => {
    const regionText = clusterLines.map((l) => l.text).join('\n');
    const totalConf = clusterLines.reduce((acc, l) => acc + (l.confidence || 0), 0);
    const avgConf = Math.round(totalConf / clusterLines.length);

    const bbox = computeClusterBoundingBox(clusterLines, width, height);
    const relY = bbox.y0 / height;

    const trimmed = regionText.trim();
    const classification = classifyRegion(trimmed, avgConf, relY, clusterLines.length);

    return {
      id: `region-${index + 1}`,
      text: regionText,
      confidence: avgConf,
      bbox,
      classification,
      lines: clusterLines,
      normalizedScore: computeContentSignificance(trimmed, avgConf, clusterLines.length, classification),
    };
  });
}

/**
 * Classifies a text cluster into CONTENT, POSSIBLE_CONTENT, UI, or NOISE.
 */
function classifyRegion(
  text: string,
  confidence: number,
  relY: number,
  lineCount: number
): RegionClassification {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. NOISE Checks
  // Spacer dots e.g. ". . . ." or single glyph noise
  if (/^[.·•\s\-_~=+|/\\]+$/.test(trimmed)) {
    return 'NOISE';
  }
  // Short low-confidence gibberish (e.g. "— TI" or "FRR" with confidence < 50)
  if (trimmed.length <= 4 && confidence < 50) {
    return 'NOISE';
  }
  // Single-character or double-character non-alphanumeric noise
  if (trimmed.length <= 2 && !/[a-zA-Z0-9]/.test(trimmed)) {
    return 'NOISE';
  }

  // 2. UI Checks (Profile headers, action bars, metadata, comment boxes)
  const isTopZone = relY < 0.22;
  const isBottomZone = relY > 0.72;

  if (containsUiOrInteractionCues(lower)) {
    return 'UI';
  }

  // Short handles / location tags at the very top of the image
  if (isTopZone && lineCount <= 2 && isShortProfileHeader(trimmed)) {
    return 'UI';
  }

  // Bottom action bar items or standalone timestamps
  if (isBottomZone && isBottomChromeMetadata(trimmed)) {
    return 'UI';
  }

  // 3. POSSIBLE_CONTENT Checks (Hashtags, bracketed descriptions/alt text)
  const isHashtagDense = (trimmed.match(/#/g) || []).length >= 1;
  const isBracketedAltText = (/^\[.*\]$/s.test(trimmed) || (trimmed.startsWith('[') && trimmed.endsWith(']')));

  if (isHashtagDense || isBracketedAltText) {
    return 'POSSIBLE_CONTENT';
  }

  // 4. CONTENT Checks (Multi-word sentences, questions, narrative paragraphs)
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 4 || /[?.!]/.test(trimmed) || lineCount >= 2) {
    return 'CONTENT';
  }

  // Fallback for short ambiguous lines
  return confidence >= 70 ? 'POSSIBLE_CONTENT' : 'NOISE';
}

function shouldGroupLines(
  lineA: OcrLineData,
  lineB: OcrLineData,
  totalHeight: number
): boolean {
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

function containsUiOrInteractionCues(lower: string): boolean {
  const uiCues = [
    'liked by',
    'and others',
    'add a comment',
    'view all comments',
    'view comments',
    'see translation',
    'original audio',
    'follow',
    'following',
    'ai content',
  ];

  return uiCues.some((cue) => lower.includes(cue));
}

function isShortProfileHeader(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean);
  // Matches e.g. "a._n._v._a._y" or "Kothrud, Pune"
  if (words.length <= 3 && !/[?.!]/.test(text) && !text.includes('#')) {
    return true;
  }
  return false;
}

function isBottomChromeMetadata(text: string): boolean {
  // Matches dates (e.g. "24 June", "2 hours ago"), single action words
  if (/^\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text)) return true;
  if (/^\d+\s*(?:h|m|s|d|w|mo|y|hours?|days?|minutes?)\s*ago/i.test(text)) return true;
  if (/^(?:post|share|reply|send|comment)$/i.test(text.trim())) return true;
  return false;
}

function computeContentSignificance(
  text: string,
  conf: number,
  lineCount: number,
  classification: RegionClassification
): number {
  if (classification === 'NOISE') return 5;
  if (classification === 'UI') return 10;

  let score = conf * 0.4;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 5) score += 30;
  if (lineCount >= 2) score += 20;
  if (/[?.!]$/.test(text.trim())) score += 15;
  if (text.includes('#')) score += 10;
  if (classification === 'CONTENT') score += 20;

  return Math.min(100, Math.round(score));
}
