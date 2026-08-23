'use client';

import React from 'react';
import {
  FileCode2,
  Sparkles,
  Edit3,
  AlignLeft,
  Clock,
  Type,
  AlertTriangle,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { calculateReadingTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface ExtractionPreviewProps {
  text: string;
  onTextChange: (newText: string) => void;
  onStartAnalysis: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  sourceType?: 'pdf' | 'image' | 'text' | 'demo';
  warnings?: string[];
  confidence?: number;
}

export const ExtractionPreview: React.FC<ExtractionPreviewProps> = ({
  text,
  onTextChange,
  onStartAnalysis,
  onReset,
  isAnalyzing,
  sourceType = 'text',
  warnings = [],
  confidence,
}) => {
  const { words, seconds } = calculateReadingTime(text);
  const characterCount = text.length;
  const isEmpty = words === 0;
  const isTooShort = words > 0 && words < 3;

  return (
    <div className="space-y-4">
      {/* Header bar with forensic telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-carbon-900 border border-carbon-750 rounded-xl font-mono text-xs text-carbon-300">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white uppercase tracking-wider">
            Content Extraction Review
          </span>
          {sourceType === 'demo' ? (
            <Badge variant="amber" size="sm">
              DEMO POST
            </Badge>
          ) : (
            <Badge variant="cyan" size="sm">
              EDITABLE PREVIEW
            </Badge>
          )}
          {typeof confidence === 'number' && (
            <Badge variant={confidence >= 70 ? 'emerald' : 'amber'} size="sm">
              DETECTION: {confidence}%
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

      {/* Extraction Warnings & Guidance */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-mono"
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

      {/* Editable Laboratory Textarea */}
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste social post copy here or upload an image/PDF to extract text automatically..."
          rows={8}
          disabled={isAnalyzing}
          className="w-full bg-carbon-900/90 border border-carbon-700 group-hover:border-carbon-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-4 font-sans text-sm text-carbon-100 placeholder-carbon-500 outline-none leading-relaxed transition-all resize-y selection:bg-cyan-500/30 selection:text-white"
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

      {/* Validation Warnings */}
      {isTooShort && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Post is very brief. Provide at least 3-5 words for meaningful forensic attention mapping.</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="text-xs text-carbon-400 font-sans">
          💡 You can edit typos, clean OCR artifacts, or tweak formatting before launching AI diagnostics.
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {text && (
            <Button
              variant="secondary"
              size="md"
              onClick={onReset}
              disabled={isAnalyzing}
              className="text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={onStartAnalysis}
            disabled={isEmpty || isTooShort || isAnalyzing}
            isLoading={isAnalyzing}
            leftIcon={<Zap className="w-4 h-4 text-carbon-950 fill-carbon-950" />}
            className="w-full sm:w-auto font-mono text-xs tracking-wider"
          >
            {isAnalyzing ? 'RUNNING FORENSIC SCAN...' : 'RUN FORENSIC SCAN'}
          </Button>
        </div>
      </div>
    </div>
  );
};
