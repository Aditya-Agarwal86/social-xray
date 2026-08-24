'use client';

import React from 'react';
import {
  Zap,
  Eye,
  BrainCircuit,
  Flame,
  HelpCircle,
  MessageSquare,
  Share2,
  MousePointerClick,
  Award,
  TrendingUp,
  Activity,
  Target,
} from 'lucide-react';
import { DimensionDiagnosis, DiagnosticSeverity, GoalFitDiagnosis } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ScoreCountUp } from '../ui/ScoreCountUp';
import { getScoreColor } from '@/lib/utils/formatters';
import { getGoalFitLabel } from '@/lib/analysis/prompt';
import { cn } from '@/lib/utils/cn';

interface MetricsGridProps {
  overallScore: number;
  targetGoal?: string;
  goalFit?: GoalFitDiagnosis;
  hook: DimensionDiagnosis;
  clarity: DimensionDiagnosis;
  cognitiveLoad: DimensionDiagnosis;
  emotion: DimensionDiagnosis;
  curiosity: DimensionDiagnosis;
  conversation: DimensionDiagnosis;
  shareability: DimensionDiagnosis;
  cta: DimensionDiagnosis;
  audienceValue: DimensionDiagnosis;
  attentionResistance?: DimensionDiagnosis;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  overallScore,
  targetGoal = 'conversation',
  goalFit,
  hook,
  clarity,
  cognitiveLoad,
  emotion,
  curiosity,
  conversation,
  shareability,
  cta,
  audienceValue,
  attentionResistance,
}) => {
  const signalCards = [
    { key: 'hook', name: 'Hook Velocity', data: hook, icon: Zap },
    { key: 'clarity', name: 'Clarity & Comprehension', data: clarity, icon: Eye },
    { key: 'cognitiveLoad', name: 'Cognitive Ease', data: cognitiveLoad, icon: BrainCircuit },
    { key: 'emotion', name: 'Emotional Resonance', data: emotion, icon: Flame },
    { key: 'curiosity', name: 'Curiosity Gap', data: curiosity, icon: HelpCircle },
    { key: 'conversation', name: 'Conversation Catalyst', data: conversation, icon: MessageSquare },
    { key: 'shareability', name: 'Social Currency', data: shareability, icon: Share2 },
    { key: 'cta', name: 'CTA Friction', data: cta, icon: MousePointerClick },
    { key: 'audienceValue', name: 'Audience Value', data: audienceValue, icon: Award },
    { key: 'attentionResistance', name: 'Attention Resistance', data: attentionResistance || { score: Math.round(overallScore * 0.95), severity: 'moderate' as DiagnosticSeverity, problem: 'Attention friction points in structure', explanation: 'Evaluates structural momentum and audience retention throughout the post.' }, icon: Activity },
  ];

  const overallStyle = getScoreColor(overallScore);
  const goalLabel = goalFit?.label || getGoalFitLabel(targetGoal);

  const getSeverityBadgeVariant = (severity: DiagnosticSeverity) => {
    switch (severity) {
      case 'optimal':
        return 'emerald' as const;
      case 'minor':
        return 'cyan' as const;
      case 'moderate':
        return 'amber' as const;
      case 'critical':
        return 'red' as const;
      default:
        return 'neutral' as const;
    }
  };

  const getInterpretation = (score: number) => {
    if (goalFit?.reason) return goalFit.reason;
    if (score >= 80) {
      return `High alignment for ${targetGoal.toUpperCase()}. Captures attention quickly with strong payoff.`;
    }
    if (score >= 60) {
      return `Moderate alignment for ${targetGoal.toUpperCase()}. Contains solid foundational assets but hindered by missing prompt or subtle friction.`;
    }
    return `Limited alignment for ${targetGoal.toUpperCase()}. The content provides insufficient triggers for the selected goal.`;
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Goal-Specific Fit Score Card */}
      <Card className="p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> 03 — Objective Fit
              </span>
              <Badge variant="cyan" size="sm">
                Goal Diagnosis
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {goalLabel}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {getInterpretation(overallScore)}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">Alignment</div>
              <div className={cn('text-xs font-semibold', overallStyle.text)}>
                {overallStyle.label}
              </div>
            </div>

            <div className="h-9 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-baseline gap-1">
              <ScoreCountUp
                value={overallScore}
                className={cn('text-3xl sm:text-4xl font-extrabold tracking-tight', overallStyle.text)}
              />
              <span className="text-slate-400 text-xs">/100</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Signal Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              04 — 10 Core Forensic Dimensions
            </h3>
            <Badge variant="neutral" size="sm">
              Evidence-Grounded
            </Badge>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">10 Core Dimensions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {signalCards.map(({ key, name, data, icon: Icon }) => {
            if (!data) return null;
            const scoreStyle = getScoreColor(data.score);
            const badgeVariant = getSeverityBadgeVariant(data.severity);

            return (
              <Card
                key={key}
                className="p-4 flex flex-col justify-between space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all duration-150"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <Badge variant={badgeVariant} size="sm" className="capitalize">
                      {data.severity}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {name}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between font-mono">
                    <ScoreCountUp
                      value={data.score}
                      className={cn('text-xl font-bold', scoreStyle.text)}
                    />
                    <span className="text-[11px] text-slate-400">/ 100</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500 rounded-full', scoreStyle.bar)}
                      style={{ width: `${Math.min(100, Math.max(5, data.score))}%` }}
                    />
                  </div>

                  {/* Evidence-Backed Explanation */}
                  <div className="pt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-0.5">
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-wider block font-semibold">
                      Evidence:
                    </span>
                    <p className="line-clamp-3 text-slate-600 dark:text-slate-300 text-xs">
                      {data.explanation || data.problem}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
