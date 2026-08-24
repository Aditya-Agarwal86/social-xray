'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  MapPin,
  Wrench,
  Brain,
  Quote,
  Sparkles,
  Search,
  Crosshair,
  CheckCircle2,
} from 'lucide-react';
import { FrictionPointItem, DiagnosticSeverity } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';
import { cn } from '@/lib/utils/cn';

interface FrictionMapProps {
  frictionPoints: FrictionPointItem[];
  fullPostText?: string;
}

export const FrictionMap: React.FC<FrictionMapProps> = ({
  frictionPoints,
  fullPostText,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!frictionPoints || frictionPoints.length === 0) {
    return (
      <Card className="p-6 text-center space-y-2 bg-carbon-900 border-carbon-750">
        <div className="text-emerald-400 font-mono text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> NO CRITICAL ATTENTION CLIFFS DETECTED
        </div>
        <p className="text-xs text-carbon-400 font-sans">
          The post maintains acceptable reading flow and attention retention.
        </p>
      </Card>
    );
  }

  const selectedPoint = frictionPoints[selectedIndex] || frictionPoints[0];

  const getSeverityStyles = (severity: DiagnosticSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'HIGH FRICTION',
          bg: 'bg-rose-950/50',
          border: 'border-rose-500/50',
          text: 'text-rose-400',
          badgeVariant: 'red' as const,
          pill: 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30',
          indicator: 'bg-rose-500 shadow-[0_0_8px_#EF4444]',
        };
      case 'moderate':
        return {
          label: 'MEDIUM FRICTION',
          bg: 'bg-amber-950/50',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          badgeVariant: 'amber' as const,
          pill: 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30',
          indicator: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]',
        };
      default:
        return {
          label: 'LOW FRICTION',
          bg: 'bg-cyan-950/50',
          border: 'border-cyan-500/50',
          text: 'text-cyan-400',
          badgeVariant: 'cyan' as const,
          pill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30',
          indicator: 'bg-cyan-400 shadow-[0_0_8px_#00F0FF]',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            05 — PRIMARY FRICTION MAP
          </h3>
          <Badge variant="red" size="sm">
            EVIDENCE-BACKED FRICTION
          </Badge>
        </div>
        <span className="text-xs font-mono text-carbon-400">
          Click any dropoff point below to inspect cause &amp; repair
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Friction Point Selector List */}
        <div className="lg:col-span-5 space-y-2.5">
          {frictionPoints.map((point, index) => {
            const isSelected = selectedIndex === index;
            const style = getSeverityStyles(point.severity);
            const isMissingElement =
              !point.text ||
              /^\[.*(?:no\s+text|no\s+caption|missing|not\s+detected).*\]$/i.test(point.text) ||
              point.text.toLowerCase().includes('no caption or conversation prompt detected') ||
              point.text.toLowerCase().includes('no text detected') ||
              point.text.toLowerCase().includes('no caption detected');

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'w-full p-4 rounded-xl border text-left transition-all duration-150 relative overflow-hidden flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  isSelected
                    ? `${style.bg} ${style.border} shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-offset-0 ring-white/10`
                    : 'bg-carbon-900/80 border-carbon-750 hover:border-carbon-600 hover:bg-carbon-850'
                )}
              >
                {/* Visual Indicator Pill */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border',
                    isSelected
                      ? 'bg-carbon-950 text-white border-white/20'
                      : 'bg-carbon-800 text-carbon-400 border-carbon-700'
                  )}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-white truncate">
                      {point.category}
                    </span>
                    <Badge variant={style.badgeVariant} size="sm">
                      {style.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-carbon-300 font-mono truncate italic">
                    {isMissingElement ? 'Detected State: No caption detected' : `“${point.text}”`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Forensic Inspection Dossier */}
        <div className="lg:col-span-7">
          {selectedPoint && (() => {
            const isMissingElement =
              !selectedPoint.text ||
              /^\[.*(?:no\s+text|no\s+caption|missing|not\s+detected).*\]$/i.test(selectedPoint.text) ||
              selectedPoint.text.toLowerCase().includes('no caption or conversation prompt detected') ||
              selectedPoint.text.toLowerCase().includes('no text detected') ||
              selectedPoint.text.toLowerCase().includes('no caption detected');

            return (
              <Card
                variant="accent"
                className={cn(
                  'p-6 space-y-5 bg-carbon-900/95 border-2 transition-all duration-200 shadow-xl relative overflow-hidden',
                  getSeverityStyles(selectedPoint.severity).border
                )}
              >
                <XRayScanOverlay active={true} showCorners={true} />

                {/* Point Dossier Header */}
                <div className="flex items-center justify-between border-b border-carbon-800 pb-3 relative z-10">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="p-1.5 rounded-lg bg-carbon-800 border border-carbon-700 text-cyan-400">
                      <Crosshair className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white uppercase block">
                        {selectedPoint.category}
                      </span>
                      <span className="text-[11px] text-carbon-400">
                        FRICTION POINT #{selectedIndex + 1} OF {frictionPoints.length}
                      </span>
                    </div>
                  </div>

                  <Badge variant={getSeverityStyles(selectedPoint.severity).badgeVariant} size="sm">
                    {getSeverityStyles(selectedPoint.severity).label}
                  </Badge>
                </div>

                {/* 1. Problematic Post Fragment OR Missing Engagement Element */}
                <div className="space-y-1.5 relative z-10">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    {isMissingElement ? 'MISSING ENGAGEMENT ELEMENT' : 'PROBLEMATIC TEXT FRAGMENT'}
                  </span>
                  <div className="p-3.5 rounded-xl border text-rose-200 font-mono text-xs leading-relaxed italic animate-highlight-pulse">
                    {isMissingElement
                      ? 'Detected state: "No caption or conversation prompt detected."'
                      : `“${selectedPoint.text}”`}
                  </div>
                </div>

                {/* 2. Psychological Friction Explanation */}
                <div className="p-4 rounded-xl bg-carbon-950 border border-carbon-800 space-y-1.5 relative z-10">
                  <div className="flex items-center gap-1.5 text-amber-300 font-mono font-semibold text-xs uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    Evidence-Backed Friction Rationale:
                  </div>
                  <p className="text-carbon-200 text-xs font-sans leading-relaxed">
                    {selectedPoint.explanation}
                  </p>
                </div>

                {/* 3. Recommended Surgical Repair */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5 relative z-10">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-semibold text-xs uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    Recommended Engagement Repair:
                  </div>
                  <div className="p-3 rounded-lg bg-carbon-950/80 border border-cyan-800/40 text-cyan-100 font-mono text-xs leading-relaxed">
                    {selectedPoint.repair}
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
