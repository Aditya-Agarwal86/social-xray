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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-carbon-200">
            Target Optimization Objective
          </span>
        </div>
        <span className="text-[11px] font-mono text-carbon-400">
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
                'group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150',
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/50'
                  : 'bg-carbon-900/80 border-carbon-750 text-carbon-300 hover:border-carbon-600 hover:text-white hover:bg-carbon-850',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg border mb-2 transition-colors',
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-carbon-800 border-carbon-700 text-carbon-400 group-hover:text-carbon-200'
                )}
              >
                {getIcon(goal.icon)}
              </div>
              <div className="font-mono text-xs font-bold leading-tight mb-1">
                {goal.label}
              </div>
              <div className="text-[10px] text-carbon-400 leading-snug line-clamp-2">
                {goal.tagline}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
