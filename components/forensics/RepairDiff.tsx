'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { RepairData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';

interface RepairDiffProps {
  repair: RepairData;
}

export const RepairDiff: React.FC<RepairDiffProps> = ({ repair }) => {
  const [copiedImproved, setCopiedImproved] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);

  if (!repair) return null;

  const originalContent = repair.original || 'Caption not detected';
  const recommendedContent = repair.improved || (repair as any).recommended || '';
  const explanation = repair.explanation || (repair as any).rationale || '';

  const handleCopyImproved = () => {
    if (recommendedContent) {
      navigator.clipboard.writeText(recommendedContent);
      setCopiedImproved(true);
      setTimeout(() => setCopiedImproved(false), 1500);
    }
  };

  const handleCopyOriginal = () => {
    if (originalContent) {
      navigator.clipboard.writeText(originalContent);
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              08 — RECOMMENDED REPAIR
            </h3>
            <Badge variant="cyan" size="sm">
              ACTIONABLE REPAIR
            </Badge>
          </div>
          <p className="text-[11px] font-mono text-carbon-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
            AI-generated suggestion based on detected content
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCopyImproved}
          leftIcon={copiedImproved ? <Check className="w-4 h-4 text-carbon-950" /> : <Copy className="w-4 h-4 text-carbon-950" />}
          className="text-xs font-mono w-full sm:w-auto"
        >
          {copiedImproved ? 'Recommended Copy Saved!' : 'Copy Recommended Copy'}
        </Button>
      </div>

      <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-5">
        {/* Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Original Draft / Status */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-carbon-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-carbon-500" />
                ORIGINAL (DETECTED STATE)
              </div>
              {originalContent !== 'Caption not detected' && (
                <button
                  type="button"
                  onClick={handleCopyOriginal}
                  className="text-[11px] font-mono text-carbon-400 hover:text-carbon-200 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-carbon-400 rounded px-1.5 py-0.5"
                  aria-label="Copy original post text"
                >
                  {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedOriginal ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className={`p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 ${
              originalContent === 'Caption not detected'
                ? 'bg-carbon-950/60 border border-carbon-800 text-carbon-400 italic'
                : 'bg-carbon-950/80 border border-carbon-800 text-carbon-200'
            }`}>
              {originalContent}
            </div>
          </div>

          {/* 2. Recommended High-Conversion Copy */}
          <div className="space-y-2 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                RECOMMENDED (GROUNDED SUGGESTION)
              </div>
              <button
                type="button"
                onClick={handleCopyImproved}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1.5 py-0.5"
                aria-label="Copy recommended post text"
              >
                {copiedImproved ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedImproved ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-100 font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
              <XRayScanOverlay active={false} showCorners={true} />
              <div className="relative z-10">{recommendedContent}</div>
            </div>
          </div>
        </div>

        {/* 3. Why It Works / Evidence Rationale */}
        <div className="p-4 rounded-xl bg-carbon-950/90 border border-carbon-800 text-xs text-carbon-300 font-sans space-y-1.5">
          <div className="font-mono text-xs text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            WHY THIS REPAIR WORKS (EVIDENCE RATIONALE):
          </div>
          <p className="leading-relaxed text-carbon-200">
            {explanation}
          </p>
        </div>
      </Card>
    </div>
  );
};
