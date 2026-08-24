'use client';

import React from 'react';
import {
  MessageSquare,
  Share2,
  Bookmark,
  ExternalLink,
  UserPlus,
  Eye,
  Target,
} from 'lucide-react';
import { GOAL_DEFINITIONS } from '@/lib/utils/formatters';
import { GoalType } from '@/types/analysis';
import { cn } from '@/lib/utils/cn';

interface GoalSelectorProps {
  selectedGoal: GoalType;
  onSelectGoal: (goal: GoalType) => void;
  disabled?: boolean;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
  selectedGoal,
  onSelectGoal,
  disabled = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4" />;
      case 'Share2':
        return <Share2 className="w-4 h-4" />;
      case 'Bookmark':
        return <Bookmark className="w-4 h-4" />;
      case 'ExternalLink':
        return <ExternalLink className="w-4 h-4" />;
      case 'UserPlus':
        return <UserPlus className="w-4 h-4" />;
      case 'Eye':
        return <Eye className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2.5 font-sans">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
          <Target className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Target Optimization Objective</span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          Analysis adapts to your selected goal
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {GOAL_DEFINITIONS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <button
              key={goal.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectGoal(goal.id)}
              className={cn(
                'group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-500 dark:border-sky-500/80 text-slate-900 dark:text-white shadow-sm ring-1 ring-sky-500/20'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm dark:shadow-none',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg border mb-2 transition-colors',
                  isSelected
                    ? 'bg-sky-500 text-white dark:bg-sky-500 dark:text-slate-950 border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                )}
              >
                {getIcon(goal.icon)}
              </div>
              <div className="font-semibold text-xs leading-tight mb-1 text-slate-900 dark:text-white">
                {goal.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                {goal.tagline}
              </div>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
