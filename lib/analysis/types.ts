import type {
  ContentInventory,
  ObservedEngagementMetrics,
  ProfileMetadata,
  CaptionStatus,
} from '@/lib/extraction/types';

export type {
  ContentInventory,
  ObservedEngagementMetrics,
  ProfileMetadata,
  CaptionStatus,
};

export type DiagnosticSeverity = 'critical' | 'moderate' | 'minor' | 'optimal';

export interface DimensionDiagnosis {
  score: number; // 0 - 100 explainable rating
  severity: DiagnosticSeverity;
  problem: string; // Specific textual or visual bottleneck identified
  explanation: string; // Grounded content-based explanation
}

export interface FrictionPointItem {
  category: string; // e.g., "Hook Deceleration", "Cognitive Drag", "Tone Barrier", "Missing Call-to-Action", "Inert Question"
  severity: DiagnosticSeverity;
  text: string; // Concrete problematic excerpt or visual description
  explanation: string; // Why readers bounce or disengage at this exact point
  repair: string; // Surgical replacement text or proposed visual caption
}

export interface PostAutopsyData {
  causeOfDeath: string; // Core reason for attention loss
  primaryFailure: string; // Primary structural/psychological issue
  secondaryFailure: string; // Secondary friction point
  hiddenStrength: string; // Element that worked well (e.g. visual composition, stopping power)
  treatment: string; // Concrete clinical remediation advice
}

export interface ConversationDNAData {
  likelyAudienceReaction: string; // Unspoken reader internal reaction
  engagementType: string; // e.g. "Passive Nod", "Debate Catalyst", "Silent Bookmark", "Passive Like"
  conversationPotential: string; // Content-based estimate of dialogue probability
  betterQuestion: string; // High-conversion replacement question grounded in content
  followUpQuestion: string; // Deep-dive question to sustain comment threads
}

export interface RepairData {
  original: string; // High-friction original post (or "[No caption detected in visual asset]")
  improved: string; // Repaired high-retention version grounded in subject
  explanation: string; // Grounded rationale explaining why the rewrite reduces friction
}

export interface PlatformVariantsData {
  linkedin: string; // Professional storytelling with line-breaks and executive framing
  instagram: string; // Carousel/photo caption with strong visual hook and engagement prompt
  tiktok: string; // Spoken script with visual cue directions
}

export interface GoalRecommendationData {
  selectedGoal: string; // e.g. "conversation", "shares", "saves", "clicks", "followers", "awareness"
  reasoning: string; // Why the post currently aligns or conflicts with the selected goal
  recommendedChange: string; // Concrete strategic modification to maximize goal alignment
}

export interface SocialXRayAnalysisResult {
  overallScore: number; // 0 - 100 composite survivability index
  hook: DimensionDiagnosis;
  clarity: DimensionDiagnosis;
  cognitiveLoad: DimensionDiagnosis;
  emotion: DimensionDiagnosis;
  curiosity: DimensionDiagnosis;
  conversation: DimensionDiagnosis;
  shareability: DimensionDiagnosis;
  cta: DimensionDiagnosis;
  audienceValue: DimensionDiagnosis;
  frictionPoints: FrictionPointItem[];
  postAutopsy: PostAutopsyData;
  conversationDNA: ConversationDNAData;
  repair: RepairData;
  platformVariants: PlatformVariantsData;
  goalRecommendation: GoalRecommendationData;
  contentInventory?: ContentInventory;
  observedMetrics?: ObservedEngagementMetrics;
}

export interface AnalysisRequestPayload {
  content?: string;
  targetGoal?: string;
  userMetrics?: {
    platform?: string;
    targetAudience?: string;
    contentType?: string;
  };
  inventory?: ContentInventory;
  imageData?: {
    mimeType: string;
    base64: string;
  };
}

export type ApiErrorCategory =
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_ERROR'
  | 'MODEL_NOT_FOUND'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'MALFORMED_OUTPUT';

export interface NormalizedApiError {
  category: ApiErrorCategory;
  status: number;
  title: string;
  message: string;
  retryable: boolean;
  requiresKeyConfig: boolean;
}
