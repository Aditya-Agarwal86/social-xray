/**
 * Layout Analysis & Text Region Segmentation Engine
 *
 * Groups OCR lines into cohesive spatial clusters and evaluates
 * layout hierarchy for social media screenshot structures.
 */

import type { OcrLineData, BoundingBox, TextRegion } from './types';

export interface LayoutDimensions {
  width: number;
  height: number;
}

/**
 * Segments an array of OCR lines into layout-aware Text Regions.
 */
export function segmentTextRegions(
  lines: OcrLineData[],
  dimensions?: LayoutDimensions
): TextRegion[] {
  if (!lines || lines.length === 0) return [];

  const width = dimensions?.width || 1000;
  const height = dimensions?.height || 1000;

  // Filter out pure whitespace / empty lines
  const validLines = lines.filter((l) => l.text && l.text.trim().length > 0);
  if (validLines.length === 0) return [];

  // Group vertically and horizontally close lines into spatial clusters
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

  // Convert clusters into normalized TextRegions
  return clusters.map((clusterLines, index) => {
    const regionText = clusterLines.map((l) => l.text).join('\n');
    const totalConf = clusterLines.reduce((acc, l) => acc + (l.confidence || 0), 0);
    const avgConf = Math.round(totalConf / clusterLines.length);

    // Compute bounding box encompassing all lines in cluster
    const bbox = computeClusterBoundingBox(clusterLines, width, height);

    // Relative vertical position (0.0 = top, 1.0 = bottom)
    const relY = bbox.y0 / height;
    const isTopHeader = relY < 0.25;

    // Detect structural nature of text
    const trimmed = regionText.trim();
    const isHashtagDense = (trimmed.match(/#/g) || []).length >= 2;
    const isShortGlitch = trimmed.length < 3 && avgConf < 45;

    let type: TextRegion['type'] = 'unclassified';

    if (isShortGlitch) {
      type = 'ui_noise';
    } else if (isHashtagDense) {
      type = 'hashtags';
    } else if (containsFooterOrActionCues(trimmed)) {
      type = 'metadata';
    } else if (isTopHeader && containsProfileOrLocationCues(trimmed)) {
      type = 'header';
    } else {
      type = 'caption';
    }

    return {
      id: `region-${index + 1}`,
      text: regionText,
      confidence: avgConf,
      bbox,
      type,
      lines: clusterLines,
      normalizedScore: computeContentSignificance(trimmed, avgConf, clusterLines.length),
    };
  });
}

/**
 * Determines whether two OCR lines are part of the same text paragraph/block.
 */
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

  // If vertical gap between lines is within paragraph spacing threshold
  const isVerticallyAdjacent = verticalDistance >= -5 && verticalDistance < avgLineHeight * 2.5;

  // Horizontal overlap check
  const horizontalOverlap =
    Math.min(lineA.bbox.x1, lineB.bbox.x1) - Math.max(lineA.bbox.x0, lineB.bbox.x0);
  const isHorizontallyAligned = horizontalOverlap > -50;

  return isVerticallyAdjacent && isHorizontallyAligned;
}

/**
 * Computes the union bounding box of lines in a cluster.
 */
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

/**
 * Heuristics for detecting header profile/location metadata.
 */
function containsProfileOrLocationCues(text: string): boolean {
  const lower = text.toLowerCase();
  if (/^@?[a-z0-9._]{3,30}$/i.test(text.trim())) return true;
  if (lower.includes('content') || lower.includes('location') || lower.includes('following')) return true;
  return false;
}

/**
 * Heuristics for detecting footer/action metadata.
 */
function containsFooterOrActionCues(text: string): boolean {
  const lower = text.toLowerCase();
  if (
    lower.includes('liked by') ||
    lower.includes('others') ||
    lower.includes('add a comment') ||
    lower.includes('view all') ||
    lower.includes('hours ago') ||
    lower.includes('days ago') ||
    lower.includes('see translation')
  ) {
    return true;
  }
  return false;
}

/**
 * Scores the semantic value of a region (higher = more likely actual post copy).
 */
function computeContentSignificance(text: string, conf: number, lineCount: number): number {
  let score = conf * 0.4;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 5) score += 30;
  if (lineCount >= 2) score += 20;
  if (/[?.!]$/.test(text.trim())) score += 15;
  if (text.includes('#')) score += 10;

  return Math.min(100, Math.round(score));
}
