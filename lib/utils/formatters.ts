import { GoalDefinition, GoalType, SeverityLevel } from '@/types/analysis';

export const GOAL_DEFINITIONS: GoalDefinition[] = [
  {
    id: 'conversation',
    label: 'Conversation',
    tagline: 'Spark active comments & debates',
    description: 'Optimizes for thought-provoking questions, relatable tension, and high comment volume.',
    icon: 'MessageSquare',
    priorityMetrics: ['conversationPotential', 'curiosity', 'emotionalImpact'],
  },
  {
    id: 'shares',
    label: 'Shares',
    tagline: 'High virality & peer distribution',
    description: 'Diagnoses whether content offers identity-reinforcing insights worth passing to peers.',
    icon: 'Share2',
    priorityMetrics: ['shareability', 'audienceValue', 'hookStrength'],
  },
  {
    id: 'saves',
    label: 'Saves / Bookmarks',
    tagline: 'High-utility reference material',
    description: 'Focuses on structured blueprints, frameworks, checklists, and actionable reference value.',
    icon: 'Bookmark',
    priorityMetrics: ['audienceValue', 'clarity', 'cognitiveLoad'],
  },
  {
    id: 'clicks',
    label: 'Clicks / Traffic',
    tagline: 'Compel outbound link actions',
    description: 'Diagnoses curiosity gaps, friction before the link, and clear payoff expectations.',
    icon: 'ExternalLink',
    priorityMetrics: ['ctaQuality', 'curiosity', 'hookStrength'],
  },
  {
    id: 'followers',
    label: 'Followers',
    tagline: 'Establish authority & subscribe reason',
    description: 'Evaluates unique perspective, clear niche positioning, and long-term value promise.',
    icon: 'UserPlus',
    priorityMetrics: ['hookStrength', 'audienceValue', 'clarity'],
  },
  {
    id: 'awareness',
    label: 'Brand Awareness',
    tagline: 'Maximum memorable impression',
    description: 'Focuses on strong brand recall, punchy clarity, and emotional resonance.',
    icon: 'Eye',
    priorityMetrics: ['hookStrength', 'emotionalImpact', 'clarity'],
  },
];

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  bar: string;
  label: string;
} {
  if (score >= 80) {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      bar: 'bg-emerald-500',
      label: 'Optimal',
    };
  }
  if (score >= 60) {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/40',
      bar: 'bg-amber-500',
      label: 'Moderate Friction',
    };
  }
  return {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800/40',
    bar: 'bg-rose-500',
    label: 'High Friction',
  };
}

export function getSeverityBadge(severity: SeverityLevel): {
  text: string;
  bg: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (severity) {
    case 'critical':
      return {
        text: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-800/50',
        dot: 'bg-rose-500',
        label: 'CRITICAL DROP',
      };
    case 'moderate':
      return {
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/50',
        dot: 'bg-amber-500',
        label: 'MODERATE FRICTION',
      };
    case 'minor':
      return {
        text: 'text-sky-700 dark:text-sky-300',
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        border: 'border-sky-200 dark:border-sky-800/50',
        dot: 'bg-sky-500',
        label: 'MINOR FRICTION',
      };
  }
}

export function calculateReadingTime(text: string): { words: number; seconds: number } {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute (3.33 words/sec)
  const seconds = Math.max(5, Math.ceil((words / 200) * 60));
  return { words, seconds };
}
