import type {
  DiagnosticSeverity,
  DimensionDiagnosis,
  FrictionPointItem,
  GoalRecommendationData,
  PlatformVariantsData,
  PostAutopsyData,
  RepairData,
  SocialXRayAnalysisResult,
  ConversationDNAData,
} from './types';

/**
 * Safely parses raw text from LLM response into JSON, handling code fences or surrounding text.
 */
export function extractJsonFromResponse(rawResponse: string): any {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Empty response received from the AI engine.');
  }

  let cleaned = rawResponse.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Find first '{' and last '}'
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    // Attempt basic trailing comma cleanup
    try {
      const sanitized = cleaned.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized);
    } catch (secondErr) {
      throw new Error(`Failed to parse AI JSON response: ${err.message}`);
    }
  }
}

function normalizeSeverity(val: any, defaultScore = 70): DiagnosticSeverity {
  if (['critical', 'moderate', 'minor', 'optimal'].includes(val)) {
    return val as DiagnosticSeverity;
  }
  if (defaultScore >= 80) return 'optimal';
  if (defaultScore >= 65) return 'minor';
  if (defaultScore >= 50) return 'moderate';
  return 'critical';
}

function normalizeDimension(dim: any, fallbackName: string, defaultScore = 70): DimensionDiagnosis {
  const score = typeof dim?.score === 'number' ? Math.min(100, Math.max(0, Math.round(dim.score))) : defaultScore;
  return {
    score,
    severity: normalizeSeverity(dim?.severity, score),
    problem: typeof dim?.problem === 'string' && dim.problem.trim() ? dim.problem.trim() : `${fallbackName} presents opportunity for optimization.`,
    explanation: typeof dim?.explanation === 'string' && dim.explanation.trim() ? dim.explanation.trim() : `Analysis indicates that ${fallbackName.toLowerCase()} can be streamlined to increase reader retention.`,
  };
}

/**
 * Validates and normalizes raw JSON payload into strict SocialXRayAnalysisResult schema.
 */
export function validateAndNormalizeAnalysis(
  raw: any,
  originalContent: string,
  targetGoal = 'conversation'
): SocialXRayAnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Analysis payload must be a valid JSON object.');
  }

  const overallScore = typeof raw.overallScore === 'number'
    ? Math.min(100, Math.max(0, Math.round(raw.overallScore)))
    : 70;

  const hook = normalizeDimension(raw.hook, 'Hook Velocity', 68);
  const clarity = normalizeDimension(raw.clarity, 'Clarity', 75);
  const cognitiveLoad = normalizeDimension(raw.cognitiveLoad, 'Cognitive Ease', 70);
  const emotion = normalizeDimension(raw.emotion, 'Emotional Impact', 65);
  const curiosity = normalizeDimension(raw.curiosity, 'Curiosity Gap', 68);
  const conversation = normalizeDimension(raw.conversation, 'Conversation Catalyst', 65);
  const shareability = normalizeDimension(raw.shareability, 'Shareability', 62);
  const cta = normalizeDimension(raw.cta, 'Call to Action', 70);
  const audienceValue = normalizeDimension(raw.audienceValue, 'Audience Value', 72);

  // Normalize Friction Points
  const frictionPoints: FrictionPointItem[] = [];
  if (Array.isArray(raw.frictionPoints)) {
    for (const item of raw.frictionPoints) {
      if (item && typeof item === 'object') {
        frictionPoints.push({
          category: typeof item.category === 'string' ? item.category : 'Cognitive Drag',
          severity: normalizeSeverity(item.severity),
          text: typeof item.text === 'string' && item.text.trim() ? item.text.trim() : 'Problematic passage in post',
          explanation: typeof item.explanation === 'string' && item.explanation.trim() ? item.explanation.trim() : 'Causes reader momentum to drop.',
          repair: typeof item.repair === 'string' && item.repair.trim() ? item.repair.trim() : 'Streamline sentence structure.',
        });
      }
    }
  }

  if (frictionPoints.length === 0) {
    frictionPoints.push({
      category: 'Hook Deceleration',
      severity: 'minor',
      text: originalContent.slice(0, 80),
      explanation: 'Opening lines could lead more directly with the core tension.',
      repair: 'Front-load the central insight in line 1.',
    });
  }

  // Normalize Post Autopsy
  const postAutopsy: PostAutopsyData = {
    causeOfDeath: typeof raw.postAutopsy?.causeOfDeath === 'string' && raw.postAutopsy.causeOfDeath.trim()
      ? raw.postAutopsy.causeOfDeath.trim()
      : 'Inert audience engagement mechanism and passive phrasing.',
    primaryFailure: typeof raw.postAutopsy?.primaryFailure === 'string' && raw.postAutopsy.primaryFailure.trim()
      ? raw.postAutopsy.primaryFailure.trim()
      : 'Throat-clearing opening preamble.',
    secondaryFailure: typeof raw.postAutopsy?.secondaryFailure === 'string' && raw.postAutopsy.secondaryFailure.trim()
      ? raw.postAutopsy.secondaryFailure.trim()
      : 'Lack of open loops in the middle section.',
    hiddenStrength: typeof raw.postAutopsy?.hiddenStrength === 'string' && raw.postAutopsy.hiddenStrength.trim()
      ? raw.postAutopsy.hiddenStrength.trim()
      : 'Authentic subject matter with valuable core premise.',
    treatment: typeof raw.postAutopsy?.treatment === 'string' && raw.postAutopsy.treatment.trim()
      ? raw.postAutopsy.treatment.trim()
      : 'Reframe opening line with high-tension hook, eliminate passive verbs, and close with a debate-catalyst question.',
  };

  // Normalize Conversation DNA
  const conversationDNA: ConversationDNAData = {
    likelyAudienceReaction: typeof raw.conversationDNA?.likelyAudienceReaction === 'string' && raw.conversationDNA.likelyAudienceReaction.trim()
      ? raw.conversationDNA.likelyAudienceReaction.trim()
      : 'Reader nods passively without feeling compelled to comment.',
    engagementType: typeof raw.conversationDNA?.engagementType === 'string' && raw.conversationDNA.engagementType.trim()
      ? raw.conversationDNA.engagementType.trim()
      : 'Passive Consumption',
    conversationPotential: typeof raw.conversationDNA?.conversationPotential === 'string' && raw.conversationDNA.conversationPotential.trim()
      ? raw.conversationDNA.conversationPotential.trim()
      : 'Moderate probability of comment activity if reframed as a debate.',
    betterQuestion: typeof raw.conversationDNA?.betterQuestion === 'string' && raw.conversationDNA.betterQuestion.trim()
      ? raw.conversationDNA.betterQuestion.trim()
      : 'What is the biggest friction point you face when implementing this?',
    followUpQuestion: typeof raw.conversationDNA?.followUpQuestion === 'string' && raw.conversationDNA.followUpQuestion.trim()
      ? raw.conversationDNA.followUpQuestion.trim()
      : 'Where do most teams go wrong with this approach?',
  };

  // Normalize Repair
  const repair: RepairData = {
    original: typeof raw.repair?.original === 'string' && raw.repair.original.trim()
      ? raw.repair.original.trim()
      : originalContent,
    improved: typeof raw.repair?.improved === 'string' && raw.repair.improved.trim()
      ? raw.repair.improved.trim()
      : originalContent,
    explanation: typeof raw.repair?.explanation === 'string' && raw.repair.explanation.trim()
      ? raw.repair.explanation.trim()
      : 'Rewritten to front-load the hook, reduce cognitive strain, and spark reader conversation.',
  };

  // Normalize Platform Variants
  const platformVariants: PlatformVariantsData = {
    linkedin: typeof raw.platformVariants?.linkedin === 'string' && raw.platformVariants.linkedin.trim()
      ? raw.platformVariants.linkedin.trim()
      : repair.improved,
    instagram: typeof raw.platformVariants?.instagram === 'string' && raw.platformVariants.instagram.trim()
      ? raw.platformVariants.instagram.trim()
      : repair.improved,
    tiktok: typeof raw.platformVariants?.tiktok === 'string' && raw.platformVariants.tiktok.trim()
      ? raw.platformVariants.tiktok.trim()
      : repair.improved,
  };

  // Normalize Goal Recommendation
  const goalRecommendation: GoalRecommendationData = {
    selectedGoal: typeof raw.goalRecommendation?.selectedGoal === 'string' && raw.goalRecommendation.selectedGoal.trim()
      ? raw.goalRecommendation.selectedGoal.trim()
      : targetGoal,
    reasoning: typeof raw.goalRecommendation?.reasoning === 'string' && raw.goalRecommendation.reasoning.trim()
      ? raw.goalRecommendation.reasoning.trim()
      : `Content analyzed against the ${targetGoal.toUpperCase()} optimization goal.`,
    recommendedChange: typeof raw.goalRecommendation?.recommendedChange === 'string' && raw.goalRecommendation.recommendedChange.trim()
      ? raw.goalRecommendation.recommendedChange.trim()
      : `Optimize formatting and tension specifically to drive ${targetGoal.toLowerCase()}.`,
  };

  return {
    overallScore,
    hook,
    clarity,
    cognitiveLoad,
    emotion,
    curiosity,
    conversation,
    shareability,
    cta,
    audienceValue,
    frictionPoints,
    postAutopsy,
    conversationDNA,
    repair,
    platformVariants,
    goalRecommendation,
  };
}
