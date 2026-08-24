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
  category: string; // e.g., "Missing Conversation Hook", "Inert CTA", "Cognitive Drag", "Tone Barrier"
  severity: DiagnosticSeverity;
  text: string; // Concrete problematic excerpt or visual description
  explanation: string; // Why readers bounce or disengage at this exact point
  repair: string; // Surgical replacement text or proposed visual caption
}

export interface GroundedPostAutopsy {
  primaryFriction: string; // e.g. "Limited conversation trigger"
  secondaryFriction: string; // e.g. "No explicit CTA is visible"
  hiddenStrength: string; // Element that worked well (e.g. "Strong visual presentation")
  treatment: string; // Concrete clinical remediation advice
}

// Backwards compatibility alias
export type PostAutopsyData = {
  causeOfDeath: string;
  primaryFailure: string;
  secondaryFailure: string;
  hiddenStrength: string;
  treatment: string;
};

export interface GroundedConversationDNA {
  deliveredToFeed: string; // e.g. "Audience encounters two bouquet photographs."
  audienceReaction: string; // e.g. "Likely visual appreciation / aesthetic interest."
  inducedAction: string; // e.g. "Specific action cannot be determined from screenshot alone."
  conversationOpportunity: string; // e.g. "No explicit conversation prompt is visible."
  replacementQuestion: string; // e.g. "Which bouquet would you choose for someone special?"
  followUpQuestion: string; // e.g. "What flowers do you always look for when buying a bouquet?"
}

// Backwards compatibility alias
export type ConversationDNAData = {
  likelyAudienceReaction: string;
  engagementType: string;
  conversationPotential: string;
  betterQuestion: string;
  followUpQuestion: string;
};

export interface GroundedRepair {
  original: string; // e.g. "Caption not detected" (or original copy)
  recommended: string; // Grounded suggestion based on detected content
  rationale: string; // Short evidence-based explanation
}

// Backwards compatibility alias
export type RepairData = {
  original: string;
  improved: string;
  explanation: string;
};

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

export interface GoalFitDiagnosis {
  objective: string; // e.g. "conversation", "shares", "saves", "clicks", "followers", "awareness"
  score: number; // 0 - 100
  label: string; // e.g. "Conversation Fit", "Shareability Fit", "Click / Traffic Fit"
  verdict: string; // Grounded verdict summary
  reason: string; // Grounded reason for the score
}

export interface StrengthItem {
  title: string;
  detail: string;
}

export interface ConfidenceItem {
  domain: string; // e.g. "Visual composition", "Conversation weakness", "Audience emotional response", "Creator intent"
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
}

export interface AnalysisConfidence {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  breakdown?: ConfidenceItem[];
}

export interface SocialXRayAnalysisResult {
  // LAYER A: OBSERVED (Directly detected facts)
  observedFacts: string[];
  contentInventory?: ContentInventory;
  observedMetrics?: ObservedEngagementMetrics;

  // LAYER B: DIAGNOSED (Grounded forensic interpretations)
  goalFit: GoalFitDiagnosis;
  overallScore: number; // Goal-specific composite score (0 - 100)
  hook: DimensionDiagnosis;
  clarity: DimensionDiagnosis;
  cognitiveLoad: DimensionDiagnosis; // Visual Processing Ease (or Reading Cognitive Load for text)
  emotion: DimensionDiagnosis;
  curiosity: DimensionDiagnosis;
  conversation: DimensionDiagnosis;
  shareability: DimensionDiagnosis;
  cta: DimensionDiagnosis;
  audienceValue: DimensionDiagnosis;
  frictionPoints: FrictionPointItem[];
  strengths: StrengthItem[];
  postAutopsy: GroundedPostAutopsy & PostAutopsyData;
  conversationDNA: GroundedConversationDNA & ConversationDNAData;

  // LAYER C: RECOMMENDED (Actionable suggestions)
  repair: GroundedRepair & RepairData;
  platformVariants: PlatformVariantsData;
  goalRecommendation: GoalRecommendationData;
  limitations: string[];
  confidence: AnalysisConfidence;
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
