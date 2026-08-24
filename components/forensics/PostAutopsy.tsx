'use client';

import React from 'react';
import { AlertTriangle, Sparkles, Stethoscope, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';
import { GroundedPostAutopsy, PostAutopsyData, StrengthItem } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface PostAutopsyProps {
  autopsy: (GroundedPostAutopsy & PostAutopsyData) | any;
  strengths?: StrengthItem[];
  targetGoal?: string;
}

export const PostAutopsy: React.FC<PostAutopsyProps> = ({ autopsy, strengths, targetGoal = 'conversation' }) => {
  if (!autopsy) return null;

  const primaryFriction = autopsy.primaryFriction || autopsy.primaryFailure || autopsy.causeOfDeath || 'Limited conversation trigger';
  const secondaryFriction = autopsy.secondaryFriction || autopsy.secondaryFailure || 'No explicit CTA is visible';
  const hiddenStrength = autopsy.hiddenStrength || 'Strong visual presentation';
  const treatment = autopsy.treatment || 'Add a specific audience prompt aligned with the selected objective.';

  const isConversation = targetGoal.toLowerCase() === 'conversation';

  return (
    <div className="space-y-3.5 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            06 — Strengths &amp; Post Autopsy
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          Forensic Autopsy
        </Badge>
      </div>

      {/* Hero Primary Friction Banner */}
      <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 space-y-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {isConversation ? 'Primary Conversation Friction' : 'Primary Engagement Friction'}
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {primaryFriction}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The main structural or psychological friction point dampening audience conversion.
        </p>
      </Card>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Primary Friction */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Primary Friction Point
            </div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
              {primaryFriction}
            </h5>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            Identified barrier limiting audience response.
          </p>
        </Card>

        {/* 2. Secondary Friction */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Secondary Friction Point
            </div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
              {secondaryFriction}
            </h5>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            Secondary element that could be improved for higher conversion.
          </p>
        </Card>

        {/* 3. Hidden Strength */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Hidden Strength
            </div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
              {hiddenStrength}
            </h5>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            Strong foundational asset preserved in the recommendation.
          </p>
        </Card>

        {/* 4. Recommended Treatment */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5" />
              Recommended Treatment
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {treatment}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            Actionable next step aligned with the selected objective.
          </p>
        </Card>
      </div>

      {/* Additional Strengths List if provided */}
      {strengths && strengths.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Observed Assets &amp; Advantages
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {strengths.map((str, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">{str.title}</span>
                <span className="text-slate-500 dark:text-slate-400">{str.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
