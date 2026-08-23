export type DiagnosticSeverity = 'critical' | 'moderate' | 'minor' | 'optimal';

export interface DimensionDiagnosis {
  score: number; // 0 - 100 explainable rating
  severity: DiagnosticSeverity;
  problem: string; // Specific textual bottleneck identified
  explanation: string; // Grounded content-based explanation
}

export interface FrictionPointItem {
  category: string; // e.g., "Hook Deceleration", "Cognitive Drag", "Tone Barrier", "Weak Payoff"
  severity: DiagnosticSeverity;
  text: string; // Concrete problematic excerpt from the post
  explanation: string; // Why readers bounce or disengage at this exact point
  repair: string; // Surgical replacement text
}

export interface PostAutopsyData {
  causeOfDeath: string; // Core reason for attention loss
  primaryFailure: string; // Primary structural/psychological issue
  secondaryFailure: string; // Secondary friction point
  hiddenStrength: string; // Element that worked well
  treatment: string; // Concrete clinical remediation advice
}

export interface ConversationDNAData {
  likelyAudienceReaction: string; // Unspoken reader internal reaction
  engagementType: string; // e.g. "Passive Nod", "Debate Catalyst", "Silent Bookmark"
  conversationPotential: string; // Content-based estimate of dialogue probability
  betterQuestion: string; // High-conversion replacement question
  followUpQuestion: string; // Deep-dive question to sustain comment threads
}

export interface RepairData {
  original: string; // High-friction original post
  improved: string; // Repaired high-retention version
  explanation: string; // Grounded rationale explaining why the rewrite reduces friction
}

export interface PlatformVariantsData {
  linkedin: string; // Professional storytelling with line-breaks and executive framing
  instagram: string; // Carousel caption with strong visual hook and swipe indicators
  tiktok: string; // Spoken script with audio hooks and on-screen visual directions
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
}

export interface AnalysisRequestPayload {
  content: string;
  targetGoal?: string;
  userMetrics?: {
    platform?: string;
    targetAudience?: string;
    contentType?: string;
  };
}
