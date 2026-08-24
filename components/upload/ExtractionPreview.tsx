'use client';

import React from 'react';
import {
  FileCode2,
  Crop,
  RefreshCw,
  Zap,
  RotateCcw,
  Type,
  AlignLeft,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Repeat2,
  Heart,
  Eye,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { calculateReadingTime } from '@/lib/utils/formatters';
import type { ExtractionTelemetry, ContentInventory } from '@/lib/extraction/types';

interface ExtractionPreviewProps {
  text: string;
  onTextChange: (newText: string) => void;
  onStartAnalysis: () => void;
  onReset: () => void;
  onOpenCrop?: () => void;
  onRerunOcr?: () => void;
  isAnalyzing: boolean;
  sourceType?: 'pdf' | 'image' | 'text' | 'demo';
  telemetry?: ExtractionTelemetry;
  inventory?: ContentInventory;
  warnings?: string[];
  confidence?: number;
}

export const ExtractionPreview: React.FC<ExtractionPreviewProps> = ({
  text,
  onTextChange,
  onStartAnalysis,
  onReset,
  onOpenCrop,
  onRerunOcr,
  isAnalyzing,
  sourceType = 'text',
  telemetry,
  inventory,
  warnings = [],
  confidence,
}) => {
  const { words, seconds } = calculateReadingTime(text);
  const characterCount = text.length;

  const isImageOnly = Boolean(
    sourceType === 'image' &&
    inventory?.captionStatus === 'NOT_DETECTED' &&
    words === 0
  );

  const isEmpty = words === 0 && !isImageOnly;
  const isTooShort = words > 0 && words < 3;

  const quality = telemetry?.quality || (typeof confidence === 'number' ? (confidence >= 80 ? 'HIGH' : confidence >= 60 ? 'MEDIUM' : 'LOW') : 'HIGH');
  const isReviewRecommended = quality === 'LOW' || quality === 'MEDIUM' || (warnings && warnings.length > 0);

  const hasObservedMetrics = Boolean(
    inventory?.engagementMetrics &&
    (inventory.engagementMetrics.replies ||
      inventory.engagementMetrics.reposts ||
      inventory.engagementMetrics.likes ||
      inventory.engagementMetrics.views ||
      inventory.engagementMetrics.saves)
  );

  return (
    <div className={`space-y-4 rounded-2xl transition-all ${
      isReviewRecommended && sourceType === 'image' && !isImageOnly
        ? 'p-1 bg-amber-500/5'
        : ''
    }`}>
      {/* Header bar with forensic telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-carbon-900 border border-carbon-750 rounded-xl font-mono text-xs text-carbon-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider">
            STEP 2: CONTENT INVENTORY &amp; REVIEW
          </span>
          {sourceType === 'demo' ? (
            <Badge variant="amber" size="sm">
              DEMO POST
            </Badge>
          ) : isImageOnly ? (
            <Badge variant="cyan" size="sm">
              VISUAL CONTENT DETECTED
            </Badge>
          ) : inventory?.captionStatus === 'DETECTED' ? (
            <Badge variant="emerald" size="sm">
              CAPTION DETECTED
            </Badge>
          ) : inventory?.captionStatus === 'UNCERTAIN' ? (
            <Badge variant="amber" size="sm">
              REVIEW RECOMMENDED
            </Badge>
          ) : (
            <Badge variant={quality === 'HIGH' ? 'emerald' : quality === 'MEDIUM' ? 'amber' : 'red'} size="sm">
              {quality === 'HIGH' ? 'READY' : 'REVIEW RECOMMENDED'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-carbon-400">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-carbon-500" />
            <span>
              <strong className="text-white">{characterCount}</strong> chars
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-carbon-500" />
            <span>
              <strong className="text-white">{words}</strong> words
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-carbon-500" />
            <span>
              ~<strong className="text-white">{seconds}s</strong> read
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT INVENTORY HUD */}
      {inventory && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-carbon-950/90 border border-carbon-800 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-carbon-900/70 border border-carbon-800 space-y-1">
            <span className="text-carbon-400 text-[10px] uppercase flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-cyan-400" /> Visual Media
            </span>
            <span className={`text-sm font-bold ${inventory.hasVisualMedia ? 'text-cyan-400' : 'text-carbon-400'}`}>
              {inventory.hasVisualMedia ? 'DETECTED' : 'TEXT ONLY'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-carbon-900/70 border border-carbon-800 space-y-1">
            <span className="text-carbon-400 text-[10px] uppercase flex items-center gap-1">
              <Type className="w-3 h-3 text-carbon-400" /> Caption Text
            </span>
            <span className={`text-sm font-bold ${
              inventory.captionStatus === 'DETECTED'
                ? 'text-emerald-400'
                : inventory.captionStatus === 'UNCERTAIN'
                ? 'text-amber-400'
                : 'text-carbon-400'
            }`}>
              {inventory.captionStatus === 'NOT_DETECTED'
                ? 'NOT DETECTED'
                : inventory.captionStatus}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-carbon-900/70 border border-carbon-800 space-y-1">
            <span className="text-carbon-400 text-[10px] uppercase flex items-center gap-1">
              # Hashtags
            </span>
            <span className="text-sm font-bold text-carbon-200">
              {inventory.hashtags.length > 0 ? `${inventory.hashtags.length} Detected` : 'NONE'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-carbon-900/70 border border-carbon-800 space-y-1">
            <span className="text-carbon-400 text-[10px] uppercase flex items-center gap-1">
              CTA / Action
            </span>
            <span className={`text-sm font-bold ${inventory.cta ? 'text-emerald-400' : 'text-carbon-400'}`}>
              {inventory.cta ? 'DETECTED' : 'NONE DETECTED'}
            </span>
          </div>
        </div>
      )}

      {/* OBSERVED PERFORMANCE METRICS (From screenshot UI) */}
      {hasObservedMetrics && inventory?.engagementMetrics && (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" /> OBSERVED SCREENSHOT PERFORMANCE (BASELINE)
            </span>
            <span className="text-[10px] text-carbon-400">Extracted from interface counters</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {inventory.engagementMetrics.replies !== null && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-carbon-900/80 border border-carbon-800">
                <MessageSquare className="w-3.5 h-3.5 text-carbon-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block">Replies</span>
                  <span className="font-bold text-white text-sm">{inventory.engagementMetrics.replies}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.reposts !== null && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-carbon-900/80 border border-carbon-800">
                <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block">Reposts</span>
                  <span className="font-bold text-white text-sm">{inventory.engagementMetrics.reposts}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.likes !== null && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-carbon-900/80 border border-carbon-800">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block">Likes</span>
                  <span className="font-bold text-white text-sm">{inventory.engagementMetrics.likes}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.views !== null && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-carbon-900/80 border border-carbon-800">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block">Views</span>
                  <span className="font-bold text-white text-sm">{inventory.engagementMetrics.views}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image-Only Post Notice */}
      {isImageOnly && (
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-cyan-200 text-xs font-mono flex items-start gap-2.5">
          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-cyan-300 block">VISUAL-ONLY POST DETECTED</span>
            <p className="font-sans text-cyan-100/90 leading-relaxed">
              No written post caption was found in this screenshot. The AI diagnostician will directly evaluate visual stopping power, composition, and aesthetic resonance, and prescribe goal-specific captions and conversion hooks.
            </p>
          </div>
        </div>
      )}

      {/* Actionable Review Warnings */}
      {warnings && warnings.length > 0 && !isImageOnly && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs font-mono"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300 uppercase block">Review Recommended</span>
                <span className="font-sans leading-relaxed text-amber-100">{warning}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editable Textarea Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-carbon-400">
          <span className="uppercase font-semibold text-carbon-300">
            {isImageOnly ? 'OPTIONAL DRAFT CAPTION (OR PROCEED WITH VISUAL SCAN)' : 'EXTRACTED POST COPY'}
          </span>
          <span className="text-[11px] text-carbon-500 font-sans">
            {isImageOnly ? 'Leave blank to analyze visual asset alone, or add text below.' : 'Detected from your uploaded asset. Edit freely before analysis.'}
          </span>
        </div>

        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={
              isImageOnly
                ? 'Visual asset detected without caption. Leave blank to run multimodal visual diagnosis, or type your proposed draft here...'
                : 'Paste social post copy here or upload an image/PDF to extract text automatically...'
            }
            rows={isImageOnly ? 4 : 8}
            disabled={isAnalyzing}
            className={`w-full bg-carbon-900/90 border rounded-xl p-4 font-sans text-sm text-carbon-100 placeholder-carbon-500 outline-none leading-relaxed transition-all resize-y selection:bg-cyan-500/30 selection:text-white ${
              isReviewRecommended && sourceType === 'image' && !isImageOnly
                ? 'border-amber-500/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                : 'border-carbon-700 group-hover:border-carbon-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
            }`}
          />

          {isEmpty && !isImageOnly && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center space-y-1 bg-carbon-900/40 rounded-xl backdrop-blur-[1px]">
              <FileCode2 className="w-8 h-8 text-carbon-600 mb-1" />
              <p className="text-sm font-mono text-carbon-400">AWAITING POST CONTENT</p>
              <p className="text-xs text-carbon-500 font-sans">
                Drop an image or PDF above, load a Demo Post, or type/paste your draft directly into this panel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Notice if too brief */}
      {isTooShort && !isImageOnly && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Post is very brief. Provide at least 3-5 words for meaningful forensic attention mapping.</span>
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Secondary Tool Actions (Crop / Re-run / Clear) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {sourceType === 'image' && onOpenCrop && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCrop}
              disabled={isAnalyzing}
              leftIcon={<Crop className="w-3.5 h-3.5 text-cyan-400" />}
              className="text-xs font-mono border-cyan-500/40 text-cyan-200 hover:border-cyan-400"
            >
              Crop &amp; Re-extract
            </Button>
          )}

          {sourceType === 'image' && onRerunOcr && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRerunOcr}
              disabled={isAnalyzing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-carbon-400" />}
              className="text-xs font-mono text-carbon-300"
            >
              Re-run OCR
            </Button>
          )}

          {text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isAnalyzing}
              className="text-xs font-mono text-carbon-400 hover:text-rose-300"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={onStartAnalysis}
            disabled={(isEmpty && !isImageOnly) || (isTooShort && !isImageOnly) || isAnalyzing}
            isLoading={isAnalyzing}
            leftIcon={<Zap className="w-4 h-4 text-carbon-950 fill-carbon-950" />}
            className="w-full sm:w-auto font-mono text-xs tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            {isAnalyzing
              ? 'RUNNING FORENSIC SCAN...'
              : isImageOnly
              ? 'ANALYZE VISUAL POST'
              : 'CONTINUE TO SOCIAL X-RAY'}
          </Button>
        </div>
      </div>
    </div>
  );
};
