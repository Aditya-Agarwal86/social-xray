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
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      bar: 'bg-emerald-500',
      label: 'Optimal',
    };
  }
  if (score >= 60) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      bar: 'bg-amber-500',
      label: 'Moderate Friction',
    };
  }
  return {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
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
        text: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-800/60',
        dot: 'bg-rose-500',
        label: 'CRITICAL DROP',
      };
    case 'moderate':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-800/60',
        dot: 'bg-amber-500',
        label: 'MODERATE FRICTION',
      };
    case 'minor':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-950/40',
        border: 'border-cyan-800/60',
        dot: 'bg-cyan-400',
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
