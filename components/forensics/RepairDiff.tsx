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

  const handleCopyImproved = () => {
    if (repair.improved) {
      navigator.clipboard.writeText(repair.improved);
      setCopiedImproved(true);
      setTimeout(() => setCopiedImproved(false), 1500);
    }
  };

  const handleCopyOriginal = () => {
    if (repair.original) {
      navigator.clipboard.writeText(repair.original);
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            Surgical Post Repair (Before vs After)
          </h3>
          <Badge variant="cyan" size="sm">
            DIFF ANALYSIS
          </Badge>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCopyImproved}
          leftIcon={copiedImproved ? <Check className="w-4 h-4 text-carbon-950" /> : <Copy className="w-4 h-4 text-carbon-950" />}
          className="text-xs font-mono w-full sm:w-auto"
        >
          {copiedImproved ? 'Repaired Copy Saved!' : 'Copy Complete Repaired Post'}
        </Button>
      </div>

      <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-5">
        {/* Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Original High Friction Post */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Original Draft (High Friction)
              </div>
              <button
                type="button"
                onClick={handleCopyOriginal}
                className="text-[11px] font-mono text-carbon-400 hover:text-carbon-200 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded px-1.5 py-0.5"
              >
                {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedOriginal ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200 font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1">
              {repair.original}
            </div>
          </div>

          {/* 2. Repaired High Retention Post */}
          <div className="space-y-2 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                Repaired Post (High Retention Velocity)
              </div>
              <button
                type="button"
                onClick={handleCopyImproved}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1.5 py-0.5"
              >
                {copiedImproved ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedImproved ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-100 font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
              <XRayScanOverlay active={false} showCorners={true} />
              <div className="relative z-10">{repair.improved}</div>
            </div>
          </div>
        </div>

        {/* 3. Why It Works / Forensic Rationale */}
        <div className="p-4 rounded-xl bg-carbon-950/90 border border-carbon-800 text-xs text-carbon-300 font-sans space-y-1.5">
          <div className="font-mono text-xs text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Why This Repair Works (Cognitive Mechanics):
          </div>
          <p className="leading-relaxed text-carbon-200">
            {repair.explanation}
          </p>
        </div>
      </Card>
    </div>
  );
};
