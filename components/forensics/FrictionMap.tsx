'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  Wrench,
  Brain,
  Quote,
  Crosshair,
  CheckCircle2,
} from 'lucide-react';
import { FrictionPointItem, DiagnosticSeverity } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
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
      <Card className="p-6 text-center space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> No Critical Attention Cliffs Detected
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
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
          label: 'High Friction',
          bg: 'bg-rose-50/70 dark:bg-rose-950/30',
          border: 'border-rose-300 dark:border-rose-800/80',
          text: 'text-rose-700 dark:text-rose-300',
          badgeVariant: 'red' as const,
        };
      case 'moderate':
        return {
          label: 'Medium Friction',
          bg: 'bg-amber-50/70 dark:bg-amber-950/30',
          border: 'border-amber-300 dark:border-amber-800/80',
          text: 'text-amber-700 dark:text-amber-300',
          badgeVariant: 'amber' as const,
        };
      default:
        return {
          label: 'Low Friction',
          bg: 'bg-sky-50/70 dark:bg-sky-950/30',
          border: 'border-sky-300 dark:border-sky-800/80',
          text: 'text-sky-700 dark:text-sky-300',
          badgeVariant: 'cyan' as const,
        };
    }
  };

  return (
    <div className="space-y-3 font-sans text-slate-900 dark:text-slate-100">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            05 — Primary Friction Map
          </h3>
          <Badge variant="red" size="sm">
            Evidence-Backed
          </Badge>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Select any dropoff point below to inspect cause &amp; repair
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Friction Point Selector List */}
        <div className="lg:col-span-5 space-y-2">
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
                  'w-full p-3.5 rounded-xl border text-left transition-all duration-150 relative flex items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer',
                  isSelected
                    ? `${style.bg} ${style.border} shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10`
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-2xs'
                )}
              >
                {/* Number Badge */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border',
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  )}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 space-y-0.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {point.category}
                    </span>
                    <Badge variant={style.badgeVariant} size="sm">
                      {style.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate italic">
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
                className="p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
              >
                {/* Point Dossier Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
                      <Crosshair className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase block">
                        {selectedPoint.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Friction Point #{selectedIndex + 1} of {frictionPoints.length}
                      </span>
                    </div>
                  </div>

                  <Badge variant={getSeverityStyles(selectedPoint.severity).badgeVariant} size="sm">
                    {getSeverityStyles(selectedPoint.severity).label}
                  </Badge>
                </div>

                {/* 1. Analyzed Statement OR Missing Engagement Element */}
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    {isMissingElement ? 'Missing Engagement Element' : 'Analyzed Text Fragment'}
                  </span>
                  <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-xs leading-relaxed italic">
                    {isMissingElement
                      ? 'Detected state: "No caption or conversation prompt detected."'
                      : `“${selectedPoint.text}”`}
                  </div>
                </div>

                {/* 2. Psychological Friction Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Evidence-Backed Friction Rationale:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    {selectedPoint.explanation}
                  </p>
                </div>

                {/* 3. Recommended Surgical Repair */}
                <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-300 font-semibold text-xs uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Recommended Engagement Repair:
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900/60 text-slate-800 dark:text-slate-100 text-xs leading-relaxed">
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
