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
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { calculateReadingTime } from '@/lib/utils/formatters';
import type { ExtractionTelemetry } from '@/lib/extraction/types';

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
  warnings = [],
  confidence,
}) => {
  const { words, seconds } = calculateReadingTime(text);
  const characterCount = text.length;
  const isEmpty = words === 0;
  const isTooShort = words > 0 && words < 3;

  const quality = telemetry?.quality || (typeof confidence === 'number' ? (confidence >= 80 ? 'HIGH' : confidence >= 60 ? 'MEDIUM' : 'LOW') : 'HIGH');
  const isReviewRecommended = quality === 'LOW' || quality === 'MEDIUM' || (warnings && warnings.length > 0);

  return (
    <div className={`space-y-4 rounded-2xl transition-all ${
      isReviewRecommended && sourceType === 'image'
        ? 'p-1 bg-amber-500/5'
        : ''
    }`}>
      {/* Header bar with forensic telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-carbon-900 border border-carbon-750 rounded-xl font-mono text-xs text-carbon-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider">
            STEP 2: REVIEW &amp; REFINE EXTRACTED POST COPY
          </span>
          {sourceType === 'demo' ? (
            <Badge variant="amber" size="sm">
              DEMO POST
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

      {/* "WHAT WE FOUND" TRANSPARENCY TELEMETRY HUD (Only for images/screenshots) */}
      {sourceType === 'image' && telemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-carbon-950/80 border border-carbon-800 text-xs font-mono">
          <div className="p-2 rounded-lg bg-carbon-900/60 border border-carbon-800 space-y-1">
            <span className="text-carbon-400 text-[10px] uppercase block">Text Regions</span>
            <span className="text-base font-bold text-white">{telemetry.totalDetectedRegions}</span>
          </div>

          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
            <span className="text-emerald-400 text-[10px] uppercase block">Likely Post Text</span>
            <span className="text-base font-bold text-emerald-300">{telemetry.likelyPostCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-1">
            <span className="text-amber-400 text-[10px] uppercase block">Filtered UI / Noise</span>
            <span className="text-base font-bold text-amber-300">{telemetry.possibleUiCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-900/40 space-y-1">
            <span className="text-cyan-400 text-[10px] uppercase block">Detection Quality</span>
            <span className={`text-base font-bold ${
              quality === 'HIGH' ? 'text-emerald-400' : quality === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {quality}
            </span>
          </div>
        </div>
      )}

      {/* Actionable Review Warnings */}
      {warnings && warnings.length > 0 && (
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
          <span className="uppercase font-semibold text-carbon-300">EXTRACTED POST COPY</span>
          <span className="text-[11px] text-carbon-500 font-sans">
            Detected from your uploaded asset. Edit freely before analysis.
          </span>
        </div>

        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste social post copy here or upload an image/PDF to extract text automatically..."
            rows={8}
            disabled={isAnalyzing}
            className={`w-full bg-carbon-900/90 border rounded-xl p-4 font-sans text-sm text-carbon-100 placeholder-carbon-500 outline-none leading-relaxed transition-all resize-y selection:bg-cyan-500/30 selection:text-white ${
              isReviewRecommended && sourceType === 'image'
                ? 'border-amber-500/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                : 'border-carbon-700 group-hover:border-carbon-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
            }`}
          />

          {isEmpty && (
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
      {isTooShort && (
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
            disabled={isEmpty || isTooShort || isAnalyzing}
            isLoading={isAnalyzing}
            leftIcon={<Zap className="w-4 h-4 text-carbon-950 fill-carbon-950" />}
            className="w-full sm:w-auto font-mono text-xs tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            {isAnalyzing ? 'RUNNING FORENSIC SCAN...' : 'CONTINUE TO SOCIAL X-RAY'}
          </Button>
        </div>
      </div>
    </div>
  );
};
