'use client';

import React from 'react';
import { Target, Sparkles, Zap } from 'lucide-react';
import { GoalRecommendationData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GoalAdaptiveCardProps {
  recommendation: GoalRecommendationData;
}

export const GoalAdaptiveCard: React.FC<GoalAdaptiveCardProps> = ({ recommendation }) => {
  if (!recommendation) return null;

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm font-sans text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            10 — Goal-Adaptive Strategic Tuning
          </h3>
          <Badge variant="cyan" size="sm">
            {recommendation.selectedGoal.toUpperCase()} Objective
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Reasoning */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Goal Alignment Reasoning:
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Highest-Priority Change */}
        <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-sky-800 dark:text-sky-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Highest-Priority Strategic Change:
          </span>
          <p className="text-xs text-slate-900 dark:text-white leading-relaxed font-semibold">
            {recommendation.recommendedChange}
          </p>
        </div>
      </div>
    </Card>
  );
};
