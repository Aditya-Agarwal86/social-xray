export * from '@/lib/analysis/types';

export type GoalType =
  | 'conversation'
  | 'shares'
  | 'saves'
  | 'clicks'
  | 'followers'
  | 'awareness';

export interface GoalDefinition {
  id: GoalType;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  priorityMetrics: string[];
}

export type SeverityLevel = 'critical' | 'moderate' | 'minor';

export interface ExecutiveMetric {
  key: string;
  name: string;
  score: number; // 0 - 100
  benchmark: number; // e.g. 70 standard benchmark
  status: 'optimal' | 'warning' | 'critical';
  diagnosis: string;
  description: string;
}

export interface ExecutiveMetrics {
  hookStrength: ExecutiveMetric;
  clarity: ExecutiveMetric;
  cognitiveLoad: ExecutiveMetric;
  emotionalImpact: ExecutiveMetric;
  curiosity: ExecutiveMetric;
  conversationPotential: ExecutiveMetric;
  shareability: ExecutiveMetric;
  ctaQuality: ExecutiveMetric;
  audienceValue: ExecutiveMetric;
  frictionScore: ExecutiveMetric;
}

export interface FrictionPoint {
  id: string;
  fragment: string;
  location: string;
  severity: SeverityLevel;
  rootCause: string;
  psychologicalImpact: string;
  immediateRepair: string;
}

export interface PostAutopsy {
  primaryWeakness: {
    title: string;
    detail: string;
  };
  secondaryIssue: {
    title: string;
    detail: string;
  };
  hiddenStrength: {
    title: string;
    detail: string;
  };
  recommendedTreatment: {
    title: string;
    steps: string[];
  };
}

export interface ConversationDNA {
  actionEncouraged: string;
  conversationalQuality: 'high' | 'moderate' | 'low' | 'inert';
  predictedAudienceReaction: string;
  killerOpeningQuestion: string;
  frictionMechanic: string;
}

export interface RepairDiffItem {
  sectionName: string;
  originalText: string;
  repairedText: string;
  rationale: string;
}

export interface PlatformVariant {
  platform: 'linkedin' | 'instagram' | 'tiktok';
  displayName: string;
  content: string;
  formattingNotes: string;
  targetHook: string;
}

export interface PlatformVariants {
  linkedin: PlatformVariant;
  instagram: PlatformVariant;
  tiktok: PlatformVariant;
}

export interface GoalAdaptiveInsights {
  selectedGoal: GoalType;
  goalFitScore: number;
  goalVerdict: string;
  strategicAdjustments: string[];
}

export interface AnalysisResult {
  id: string;
  analyzedAt: string;
  wordCount: number;
  readingTimeSeconds: number;
  originalContent: string;
  targetGoal: GoalType;
  overallScore: number;
  verdictSummary: string;
  executiveMetrics: ExecutiveMetrics;
  frictionMap: FrictionPoint[];
  postAutopsy: PostAutopsy;
  conversationDNA: ConversationDNA;
  repairDiff: RepairDiffItem[];
  platformVariants: PlatformVariants;
  goalAdaptiveInsights: GoalAdaptiveInsights;
}

export interface ExtractionProgress {
  stage: 'idle' | 'extracting' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export type UploadState =
  | 'IDLE'
  | 'DRAGGING'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR';

export interface UploadedFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  extractedText: string;
  source: 'pdf' | 'image' | 'text' | 'demo';
  wordCount?: number;
  charCount?: number;
  pageCount?: number;
  confidence?: number;
  confidenceLabel?: string;
  warnings?: string[];
  telemetry?: any;
}
