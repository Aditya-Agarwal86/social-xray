'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Copy,
  Check,
  HelpCircle,
  Info,
} from 'lucide-react';
import { RepairData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

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
    <div className="space-y-3.5 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              08 — Recommended Repair
            </h3>
            <Badge variant="cyan" size="sm">
              Evidence-Grounded Suggestion
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            Not present in the original post • Grounded suggestion based on detected content
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCopyImproved}
          leftIcon={copiedImproved ? <Check className="w-4 h-4 text-white dark:text-slate-950" /> : <Copy className="w-4 h-4 text-white dark:text-slate-950" />}
          className="text-xs w-full sm:w-auto"
        >
          {copiedImproved ? 'Recommended Copy Saved!' : 'Copy Recommended Copy'}
        </Button>
      </div>

      <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {/* Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Original Draft / Status */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Original (Detected State)
              </div>
              {originalContent !== 'Caption not detected' && (
                <button
                  type="button"
                  onClick={handleCopyOriginal}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  aria-label="Copy original post text"
                >
                  {copiedOriginal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedOriginal ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap flex-1 ${
              originalContent === 'Caption not detected'
                ? 'bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-400 italic font-mono'
                : 'bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              {originalContent}
            </div>
          </div>

          {/* 2. Recommended High-Conversion Copy */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Recommended (Grounded Suggestion)
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyImproved}
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer"
                aria-label="Copy recommended post text"
              >
                {copiedImproved ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedImproved ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap flex-1 shadow-2xs font-medium">
              {recommendedContent}
            </div>
          </div>
        </div>

        {/* 3. Why It Works / Evidence Rationale */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="text-xs text-sky-700 dark:text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Why This Repair May Help (Evidence Rationale):
          </div>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            {explanation}
          </p>
        </div>
      </Card>
    </div>
  );
};
