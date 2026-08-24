'use client';

import React, { useState } from 'react';
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
  X,
  Info,
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
  previewUrl?: string;
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
  previewUrl,
}) => {
  const [showOriginalModal, setShowOriginalModal] = useState(false);
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
    <div className="space-y-3.5 font-sans text-slate-900 dark:text-slate-100">
      {/* Header bar with content summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            Step 3: Content Review &amp; Edit
          </span>
          {sourceType === 'demo' ? (
            <Badge variant="amber" size="sm">
              Demo Post
            </Badge>
          ) : isImageOnly ? (
            <Badge variant="cyan" size="sm">
              Visual Media Detected
            </Badge>
          ) : inventory?.captionStatus === 'DETECTED' ? (
            <Badge variant="emerald" size="sm">
              Caption Detected
            </Badge>
          ) : typeof confidence === 'number' ? (
            <Badge variant={confidence >= 80 ? 'emerald' : confidence >= 60 ? 'amber' : 'red'} size="sm">
              Extraction Confidence: {confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low'}
            </Badge>
          ) : (
            <Badge variant={quality === 'HIGH' ? 'emerald' : 'amber'} size="sm">
              {quality === 'HIGH' ? 'Ready' : 'Review Recommended'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3.5 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{characterCount}</strong> chars
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>
              <strong className="text-slate-800 dark:text-slate-200">{words}</strong> words
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              ~<strong className="text-slate-800 dark:text-slate-200">{seconds}s</strong> read
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT INVENTORY HUD */}
      {inventory && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Visual Media
            </span>
            <span className={`text-xs font-semibold ${inventory.hasVisualMedia ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500'}`}>
              {inventory.hasVisualMedia ? 'Detected' : 'Text Only'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
              <Type className="w-3 h-3 text-slate-500" /> Caption Status
            </span>
            <span className={`text-xs font-semibold ${
              inventory.captionStatus === 'DETECTED'
                ? 'text-emerald-600 dark:text-emerald-400'
                : inventory.captionStatus === 'UNCERTAIN'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500'
            }`}>
              {inventory.captionStatus === 'NOT_DETECTED'
                ? 'Not Detected'
                : inventory.captionStatus}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
              # Hashtags
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {inventory.hashtags.length > 0 ? `${inventory.hashtags.length} Detected` : 'None'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
              CTA / Action
            </span>
            <span className={`text-xs font-semibold ${inventory.cta ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
              {inventory.cta ? 'Detected' : 'None Detected'}
            </span>
          </div>
        </div>
      )}

      {/* OBSERVED PERFORMANCE METRICS (BASELINE) */}
      {hasObservedMetrics && inventory?.engagementMetrics && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Observed Performance Counters (Historical Baseline)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Extracted from visible interface counters</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
            {inventory.engagementMetrics.replies !== null && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Replies</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{inventory.engagementMetrics.replies}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.reposts !== null && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <Repeat2 className="w-3.5 h-3.5 text-emerald-500" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Reposts</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{inventory.engagementMetrics.reposts}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.likes !== null && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Likes</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{inventory.engagementMetrics.likes}</span>
                </div>
              </div>
            )}

            {inventory.engagementMetrics.views !== null && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Views</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{inventory.engagementMetrics.views}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONE Primary Extraction Status Block */}
      {isImageOnly ? (
        <div className="p-3.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 text-sky-900 dark:text-sky-200 text-xs flex items-start gap-2.5">
          <ImageIcon className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-sky-900 dark:text-sky-300 block">Visual-Only Post Detected</span>
            <p className="text-sky-800/90 dark:text-sky-100/90 text-xs leading-relaxed font-sans">
              No written post caption was found in this screenshot. The diagnostic engine will evaluate visual stopping power, composition, and aesthetic resonance, and prescribe goal-specific captions and conversion hooks.
            </p>
          </div>
        </div>
      ) : isReviewRecommended && words > 0 ? (
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-900 dark:text-amber-300 block">
                Extraction Confidence: {typeof confidence === 'number' && confidence < 60 ? 'Low' : 'Medium'}
              </span>
              <p className="leading-relaxed text-amber-800 dark:text-amber-100">
                Text extracted from the uploaded asset. OCR may contain recognition errors. Review and edit the draft below before running analysis.
              </p>
            </div>
          </div>
          {telemetry?.possibleUiCount && telemetry.possibleUiCount > 0 ? (
            <div className="pt-1.5 border-t border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-700 dark:text-amber-300/80">
              {telemetry.possibleUiCount} peripheral UI / metric items filtered from post text.
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Editable Textarea Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            {isImageOnly ? 'Optional Draft Caption' : 'Raw Extracted Text / Analysis Input'}
          </span>
          <span className="text-[11px]">
            {isImageOnly ? 'Leave blank for visual analysis or type draft copy.' : 'Text extracted from asset. OCR may contain recognition errors. Review before analysis.'}
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
            className={`w-full bg-slate-50/60 dark:bg-slate-900/90 border rounded-xl p-4 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none leading-relaxed transition-all resize-y shadow-2xs ${
              isReviewRecommended && sourceType === 'image' && !isImageOnly
                ? 'border-amber-300 dark:border-amber-500/40 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                : 'border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            }`}
          />

          {isEmpty && !isImageOnly && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center space-y-1 bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-[1px]">
              <FileCode2 className="w-7 h-7 text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Awaiting Post Content</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">
                Drop an image or PDF above, load a Demo Post, or type/paste your draft directly into this panel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Notice if too brief */}
      {isTooShort && !isImageOnly && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Post is very brief. Provide at least 3-5 words for meaningful attention mapping.</span>
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Secondary Tool Actions (View Original / Crop / Re-run / Clear) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOriginalModal(true)}
              disabled={isAnalyzing}
              leftIcon={<Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
              className="text-xs"
            >
              View Original Asset
            </Button>
          )}

          {sourceType === 'image' && onOpenCrop && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCrop}
              disabled={isAnalyzing}
              leftIcon={<Crop className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
              className="text-xs"
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
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
              className="text-xs text-slate-600 dark:text-slate-300"
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
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300"
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
            leftIcon={<Zap className="w-4 h-4 text-white dark:text-slate-950 fill-current" />}
            className="w-full sm:w-auto text-xs font-semibold"
          >
            {isAnalyzing
              ? 'RUNNING FORENSIC SCAN...'
              : isImageOnly
              ? 'Analyze Visual Post →'
              : 'Analyze This Post →'}
          </Button>
        </div>
      </div>

      {/* Original Image Inspection Lightbox */}
      {showOriginalModal && previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="original-asset-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowOriginalModal(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 id="original-asset-title" className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Original Uploaded Asset
                </h3>
                <Badge variant="cyan" size="sm">
                  Ground Truth
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                aria-label="Close original asset preview"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Original uploaded post asset"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Compare original screenshot with extracted text to verify accuracy.</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowOriginalModal(false)}
                className="text-xs"
              >
                Done Reviewing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
