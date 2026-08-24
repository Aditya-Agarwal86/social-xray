import type {
  DiagnosticSeverity,
  DimensionDiagnosis,
  FrictionPointItem,
  GoalRecommendationData,
  PlatformVariantsData,
  GroundedPostAutopsy,
  PostAutopsyData,
  GroundedRepair,
  RepairData,
  SocialXRayAnalysisResult,
  GroundedConversationDNA,
  ConversationDNAData,
  GoalFitDiagnosis,
  StrengthItem,
  AnalysisConfidence,
  NormalizedApiError,
  ApiErrorCategory,
} from './types';

export function getGoalFitLabel(goal: string): string {
  switch ((goal || '').toLowerCase()) {
    case 'conversation':
      return 'Conversation Fit';
    case 'shares':
      return 'Shareability Fit';
    case 'saves':
      return 'Save Value Fit';
    case 'clicks':
      return 'Click / Traffic Fit';
    case 'followers':
      return 'Follower Conversion Fit';
    case 'awareness':
      return 'Brand Awareness Fit';
    default:
      return 'Goal Alignment Fit';
  }
}

export const STABLE_GEMINI_MODEL = 'gemini-3.5-flash';

/**
 * Pure, deterministic classifier for Gemini API and network errors.
 * Preserves the actual HTTP status and error category without conflating 503 with 404.
 */
export function classifyGeminiError(err: any): NormalizedApiError {
  const status =
    typeof err?.status === 'number'
      ? err.status
      : typeof err?.statusCode === 'number'
      ? err.statusCode
      : 500;

  const rawMsg = (err?.message || '').toLowerCase();
  const rawStatusText = (err?.statusText || '').toLowerCase();

  // 1. Check for 503 SERVICE_UNAVAILABLE (High Demand / Spikes / Temporarily Overloaded)
  if (
    status === 503 ||
    rawStatusText.includes('unavailable') ||
    rawMsg.includes('high demand') ||
    rawMsg.includes('spikes in demand') ||
    rawMsg.includes('temporarily overloaded') ||
    (rawMsg.includes('unavailable') && !rawMsg.includes('model not found'))
  ) {
    return {
      category: 'SERVICE_UNAVAILABLE',
      status: 503,
      title: 'Gemini is temporarily busy',
      message: 'Gemini is temporarily unavailable. Please try again shortly.',
      retryable: true,
      requiresKeyConfig: false,
    };
  }

  // 2. Check for 429 RATE_LIMITED (Quota / Request frequency cap)
  if (
    status === 429 ||
    rawMsg.includes('429') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('rate limit') ||
    rawMsg.includes('resource_exhausted')
  ) {
    return {
      category: 'RATE_LIMITED',
      status: 429,
      title: 'Request limit reached',
      message: 'Gemini request limit reached. Please wait and try again.',
      retryable: true,
      requiresKeyConfig: false,
    };
  }

  // 3. Check for 401 / 403 AUTHENTICATION_ERROR (Invalid key, unauthorized, missing)
  if (
    status === 401 ||
    status === 403 ||
    err?.code === 'AUTH_KEY_MISSING' ||
    rawMsg.includes('api_key') ||
    rawMsg.includes('api key') ||
    rawMsg.includes('unauthenticated') ||
    rawMsg.includes('permission_denied') ||
    rawMsg.includes('unauthorized')
  ) {
    return {
      category: 'AUTHENTICATION_ERROR',
      status: 401,
      title: 'API configuration required',
      message: 'Gemini API authentication failed. Check your API configuration.',
      retryable: false,
      requiresKeyConfig: true,
    };
  }

  // 4. Check for genuine 404 MODEL_NOT_FOUND (Model string does not exist)
  if (
    status === 404 ||
    (rawMsg.includes('404') && (rawMsg.includes('not found') || rawMsg.includes('call modelservice.listmodels')))
  ) {
    return {
      category: 'MODEL_NOT_FOUND',
      status: 404,
      title: 'AI model unavailable',
      message: 'The configured Gemini model could not be found.',
      retryable: false,
      requiresKeyConfig: true,
    };
  }

  // 5. Check for 408 / TIMEOUT / Abort
  if (
    status === 408 ||
    err?.name === 'AbortError' ||
    rawMsg.includes('timeout') ||
    rawMsg.includes('aborted') ||
    rawMsg.includes('etimedout')
  ) {
    return {
      category: 'TIMEOUT',
      status: 408,
      title: 'Request timed out',
      message: 'The AI analysis request timed out.',
      retryable: true,
      requiresKeyConfig: false,
    };
  }

  // 6. Check for Network connection failures
  if (
    rawMsg.includes('fetch failed') ||
    rawMsg.includes('econnrefused') ||
    rawMsg.includes('enotfound') ||
    rawMsg.includes('network')
  ) {
    return {
      category: 'NETWORK_ERROR',
      status: 503,
      title: 'Network connection issue',
      message: 'Unable to reach the AI analysis service.',
      retryable: true,
      requiresKeyConfig: false,
    };
  }

  // 7. Check for 400 INVALID_REQUEST
  if (
    status === 400 ||
    err?.code === 'EMPTY_CONTENT' ||
    err?.code === 'CONTENT_TOO_LARGE' ||
    err?.code === 'CONTENT_TOO_SHORT'
  ) {
    return {
      category: 'INVALID_REQUEST',
      status: 400,
      title: 'Invalid request',
      message: 'The AI analysis request was rejected. Check the request configuration.',
      retryable: false,
      requiresKeyConfig: false,
    };
  }

  // 8. Default fallback 500 SERVER_ERROR
  return {
    category: 'SERVER_ERROR',
    status: 500,
    title: 'AI service error',
    message: 'The AI analysis service encountered an unexpected error.',
    retryable: true,
    requiresKeyConfig: false,
  };
}

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

  // Find outermost '{' and '}'
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  // Direct parse attempt
  try {
    return JSON.parse(cleaned);
  } catch {
    // Advanced recovery attempt for messy LLM strings
    try {
      const sanitized = cleaned
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); // remove non-printable control characters
      return JSON.parse(sanitized);
    } catch (secondErr: any) {
      throw new Error(`Failed to parse AI JSON response: ${secondErr.message}`);
    }
  }
}

/**
 * Validates and normalizes the parsed JSON into a strictly conforming 3-Layer SocialXRayAnalysisResult.
 */
export function validateAndNormalizeAnalysis(
  raw: any,
  originalContent: string,
  targetGoal: string = 'conversation'
): SocialXRayAnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid analysis object received from LLM.');
  }

  const normalizeScore = (val: any, fallback = 70): number => {
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  const normalizeSeverity = (score: number): DiagnosticSeverity => {
    if (score < 40) return 'critical';
    if (score < 65) return 'moderate';
    if (score < 85) return 'minor';
    return 'optimal';
  };

  const normalizeDimension = (
    dim: any,
    defaultProblem: string,
    defaultExplanation: string
  ): DimensionDiagnosis => {
    const score = normalizeScore(dim?.score, 70);
    const severity: DiagnosticSeverity =
      dim?.severity && ['critical', 'moderate', 'minor', 'optimal'].includes(dim.severity)
        ? dim.severity
        : normalizeSeverity(score);

    return {
      score,
      severity,
      problem: typeof dim?.problem === 'string' && dim.problem.trim() ? dim.problem.trim() : defaultProblem,
      explanation:
        typeof dim?.explanation === 'string' && dim.explanation.trim()
          ? dim.explanation.trim()
          : defaultExplanation,
    };
  };

  // Overall & Goal Fit Score (0-100)
  const overallScore = normalizeScore(raw.goalFit?.score ?? raw.overallScore, 68);
  const goalLabel = getGoalFitLabel(targetGoal);

  // Goal Fit Data
  const goalFit: GoalFitDiagnosis = {
    objective: targetGoal.toLowerCase(),
    score: overallScore,
    label: typeof raw.goalFit?.label === 'string' && raw.goalFit.label.trim() ? raw.goalFit.label.trim() : goalLabel,
    verdict:
      typeof raw.goalFit?.verdict === 'string' && raw.goalFit.verdict.trim()
        ? raw.goalFit.verdict.trim()
        : overallScore >= 75
        ? 'Well-aligned with objective targets'
        : overallScore >= 50
        ? 'Moderate friction with goal mechanics'
        : 'Significant friction preventing goal conversion',
    reason:
      typeof raw.goalFit?.reason === 'string' && raw.goalFit.reason.trim()
        ? raw.goalFit.reason.trim()
        : `Evaluated specifically against the ${targetGoal.toUpperCase()} optimization objective.`,
  };

  // Layer A: Observed Facts
  const rawObserved = Array.isArray(raw.observedFacts) ? raw.observedFacts : [];
  const observedFacts: string[] = rawObserved
    .filter((fact: any) => typeof fact === 'string' && fact.trim())
    .map((fact: string) => fact.trim());

  if (observedFacts.length === 0) {
    if (!originalContent || originalContent.includes('[Visual-only') || originalContent.includes('Caption not detected')) {
      observedFacts.push('Visual image asset detected.');
      observedFacts.push('No written post caption was detected in the screenshot.');
    } else {
      observedFacts.push(`Extracted post text detected (${originalContent.split(/\s+/).filter(Boolean).length} words).`);
    }
  }

  // Core Executive Metrics
  const hook = normalizeDimension(
    raw.hook,
    'Opening narrative decelerates audience velocity.',
    'Opening lines or visual framing do not establish an immediate open loop or compelling curiosity.'
  );

  const clarity = normalizeDimension(
    raw.clarity,
    'Unclear core premise or convoluted presentation.',
    'Content presentation creates cognitive hesitation around the core focus.'
  );

  const isVisualPost = !originalContent || originalContent.includes('[Visual-only') || originalContent.includes('Caption not detected');

  const cognitiveLoad = normalizeDimension(
    raw.cognitiveLoad,
    isVisualPost ? 'Limited contextual framing for the visual composition.' : 'Dense formatting or lack of breathing room.',
    isVisualPost ? 'Visually easy to scan, but context is limited.' : 'Visual or textual arrangement creates friction for quick scanning.'
  );

  const emotion = normalizeDimension(
    raw.emotion,
    'Neutral tone lacking affective connection.',
    'Content is descriptive rather than emotionally evocative.'
  );

  const curiosity = normalizeDimension(
    raw.curiosity,
    'Resolves all tension before the audience feels compelled to engage.',
    'Lacks curiosity triggers, open loops, or comparison tension.'
  );

  const conversation = normalizeDimension(
    raw.conversation,
    'No question, opinion prompt, or explicit response mechanism is visible.',
    'No question, opinion prompt, or explicit response mechanism is visible.'
  );

  const shareability = normalizeDimension(
    raw.shareability,
    'The visual format appears compatible with peer-to-peer sharing, but lacks a relational catalyst.',
    'The visual format appears compatible with peer-to-peer sharing.'
  );

  const cta = normalizeDimension(
    raw.cta,
    'No CTA or destination instruction is visible.',
    'No CTA or destination instruction is visible.'
  );

  const audienceValue = normalizeDimension(
    raw.audienceValue,
    'Limited standalone utility or takeaway.',
    'Audience finishes viewing without a concrete emotional, visual, or practical payoff.'
  );

  // Friction Points List (Never present absence of text as a "problematic text fragment")
  const rawFriction = Array.isArray(raw.frictionPoints) ? raw.frictionPoints : [];
  const frictionPoints: FrictionPointItem[] = rawFriction.slice(0, 5).map((fp: any, idx: number) => {
    let text = typeof fp?.text === 'string' && fp.text.trim() ? fp.text.trim() : (isVisualPost ? 'No caption or conversation prompt detected.' : originalContent.slice(0, 80));
    if (/^\[.*(?:no\s+text|no\s+caption|missing|not\s+detected).*\]$/i.test(text) || text.toLowerCase() === 'no text detected' || text.toLowerCase() === '[no text detected]') {
      text = 'No caption or conversation prompt detected.';
    }

    return {
      category: typeof fp?.category === 'string' && fp.category.trim() ? fp.category.trim() : (isVisualPost ? 'Missing Engagement Element' : `Friction Area #${idx + 1}`),
      severity: ['critical', 'moderate', 'minor', 'optimal'].includes(fp?.severity) ? fp.severity : 'moderate',
      text,
      explanation: typeof fp?.explanation === 'string' && fp.explanation.trim() ? fp.explanation.trim() : 'Missing conversation prompt leaves audience with no clear response path.',
      repair: typeof fp?.repair === 'string' && fp.repair.trim() ? fp.repair.trim() : 'Add a specific, grounded audience prompt.',
    };
  });

  // Strengths List
  const rawStrengths = Array.isArray(raw.strengths) ? raw.strengths : [];
  const strengths: StrengthItem[] = rawStrengths.slice(0, 4).map((str: any, idx: number) => ({
    title: typeof str?.title === 'string' && str.title.trim() ? str.title.trim() : `Key Strength #${idx + 1}`,
    detail: typeof str?.detail === 'string' && str.detail.trim() ? str.detail.trim() : 'Strong underlying presentation or subject interest.',
  }));

  if (strengths.length === 0) {
    strengths.push({
      title: 'Strong Visual Subject',
      detail: typeof raw.postAutopsy?.hiddenStrength === 'string' && raw.postAutopsy.hiddenStrength.trim()
        ? raw.postAutopsy.hiddenStrength.trim()
        : 'Subject matter carries clear visual stopping power.',
    });
  }

  // Normalize Grounded Post Autopsy
  const causeOfDeath = typeof raw.postAutopsy?.causeOfDeath === 'string' && raw.postAutopsy.causeOfDeath.trim()
    ? raw.postAutopsy.causeOfDeath.trim()
    : (raw.postAutopsy?.primaryFriction ?? raw.postAutopsy?.primaryFailure ?? 'Limited conversation trigger');

  const primaryFriction = typeof (raw.postAutopsy?.primaryFriction ?? raw.postAutopsy?.primaryFailure ?? raw.postAutopsy?.causeOfDeath) === 'string' && (raw.postAutopsy?.primaryFriction ?? raw.postAutopsy?.primaryFailure ?? raw.postAutopsy?.causeOfDeath).trim()
    ? (raw.postAutopsy?.primaryFriction ?? raw.postAutopsy?.primaryFailure ?? raw.postAutopsy?.causeOfDeath).trim()
    : 'Limited conversation trigger';

  const secondaryFriction = typeof (raw.postAutopsy?.secondaryFriction ?? raw.postAutopsy?.secondaryFailure) === 'string' && (raw.postAutopsy?.secondaryFriction ?? raw.postAutopsy?.secondaryFailure).trim()
    ? (raw.postAutopsy?.secondaryFriction ?? raw.postAutopsy?.secondaryFailure).trim()
    : 'No explicit CTA is visible';

  const hiddenStrength = typeof raw.postAutopsy?.hiddenStrength === 'string' && raw.postAutopsy.hiddenStrength.trim()
    ? raw.postAutopsy.hiddenStrength.trim()
    : 'Strong visual presentation';

  const treatment = typeof raw.postAutopsy?.treatment === 'string' && raw.postAutopsy.treatment.trim()
    ? raw.postAutopsy.treatment.trim()
    : `Add a specific audience prompt aligned with the ${targetGoal} objective.`;

  const postAutopsy: GroundedPostAutopsy & PostAutopsyData = {
    primaryFriction,
    secondaryFriction,
    hiddenStrength,
    treatment,
    causeOfDeath,
    primaryFailure: typeof raw.postAutopsy?.primaryFailure === 'string' && raw.postAutopsy.primaryFailure.trim() ? raw.postAutopsy.primaryFailure.trim() : primaryFriction,
    secondaryFailure: typeof raw.postAutopsy?.secondaryFailure === 'string' && raw.postAutopsy.secondaryFailure.trim() ? raw.postAutopsy.secondaryFailure.trim() : secondaryFriction,
  };

  // Normalize Grounded Conversation DNA
  const deliveredToFeed = typeof raw.conversationDNA?.deliveredToFeed === 'string' && raw.conversationDNA.deliveredToFeed.trim()
    ? raw.conversationDNA.deliveredToFeed.trim()
    : 'Audience encounters post in feed.';

  const audienceReaction = typeof (raw.conversationDNA?.audienceReaction ?? raw.conversationDNA?.likelyAudienceReaction) === 'string' && (raw.conversationDNA?.audienceReaction ?? raw.conversationDNA?.likelyAudienceReaction).trim()
    ? (raw.conversationDNA?.audienceReaction ?? raw.conversationDNA?.likelyAudienceReaction).trim()
    : 'Likely visual interest, but moves past without replying.';

  const inducedAction = typeof (raw.conversationDNA?.inducedAction ?? raw.conversationDNA?.engagementType) === 'string' && (raw.conversationDNA?.inducedAction ?? raw.conversationDNA?.engagementType).trim()
    ? (raw.conversationDNA?.inducedAction ?? raw.conversationDNA?.engagementType).trim()
    : 'Passive View / Like';

  const conversationOpportunity = typeof (raw.conversationDNA?.conversationOpportunity ?? raw.conversationDNA?.conversationPotential) === 'string' && (raw.conversationDNA?.conversationOpportunity ?? raw.conversationDNA?.conversationPotential).trim()
    ? (raw.conversationDNA?.conversationOpportunity ?? raw.conversationDNA?.conversationPotential).trim()
    : 'No explicit conversation prompt is visible.';

  const replacementQuestion = typeof (raw.conversationDNA?.replacementQuestion ?? raw.conversationDNA?.betterQuestion) === 'string' && (raw.conversationDNA?.replacementQuestion ?? raw.conversationDNA?.betterQuestion).trim()
    ? (raw.conversationDNA?.replacementQuestion ?? raw.conversationDNA?.betterQuestion).trim()
    : 'Which option would you choose for someone special?';

  const followUpQuestion = typeof raw.conversationDNA?.followUpQuestion === 'string' && raw.conversationDNA.followUpQuestion.trim()
    ? raw.conversationDNA.followUpQuestion.trim()
    : 'What do you always look for first?';

  const conversationDNA: GroundedConversationDNA & ConversationDNAData = {
    deliveredToFeed,
    audienceReaction,
    inducedAction,
    conversationOpportunity,
    replacementQuestion,
    followUpQuestion,
    likelyAudienceReaction: audienceReaction,
    engagementType: inducedAction,
    conversationPotential: conversationOpportunity,
    betterQuestion: replacementQuestion,
  };

  // Normalize Grounded Repair
  const originalDisplay =
    !originalContent || originalContent.includes('[Visual-only') || originalContent.includes('Caption not detected')
      ? 'Caption not detected'
      : originalContent;

  const rawRepairOriginal = typeof raw.repair?.original === 'string' && raw.repair.original.trim() ? raw.repair.original.trim() : originalDisplay;
  const recommendedRepair = typeof (raw.repair?.recommended ?? raw.repair?.improved) === 'string' && (raw.repair?.recommended ?? raw.repair?.improved).trim()
    ? (raw.repair?.recommended ?? raw.repair?.improved).trim()
    : 'Which one would you choose? Tell me below! 👇';

  const repairRationale = typeof (raw.repair?.rationale ?? raw.repair?.explanation) === 'string' && (raw.repair?.rationale ?? raw.repair?.explanation).trim()
    ? (raw.repair?.rationale ?? raw.repair?.explanation).trim()
    : `Added a grounded engagement prompt aligned with the ${targetGoal.toUpperCase()} goal.`;

  const repair: GroundedRepair & RepairData = {
    original: rawRepairOriginal,
    recommended: recommendedRepair,
    rationale: repairRationale,
    improved: recommendedRepair,
    explanation: repairRationale,
  };

  // Normalize Platform Variants
  const platformVariants: PlatformVariantsData = {
    linkedin: typeof raw.platformVariants?.linkedin === 'string' && raw.platformVariants.linkedin.trim()
      ? raw.platformVariants.linkedin.trim()
      : repair.recommended,
    instagram: typeof raw.platformVariants?.instagram === 'string' && raw.platformVariants.instagram.trim()
      ? raw.platformVariants.instagram.trim()
      : repair.recommended,
    tiktok: typeof raw.platformVariants?.tiktok === 'string' && raw.platformVariants.tiktok.trim()
      ? raw.platformVariants.tiktok.trim()
      : repair.recommended,
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
      : `Add a specific audience prompt to maximize ${targetGoal.toLowerCase()}.`,
  };

  // Limitations
  const rawLimitations = Array.isArray(raw.limitations) ? raw.limitations : [];
  const limitations: string[] = rawLimitations
    .filter((lim: any) => typeof lim === 'string' && lim.trim())
    .map((lim: string) => lim.trim());

  if (limitations.length === 0) {
    if (!originalContent || originalContent.includes('[Visual-only') || originalContent.includes('Caption not detected')) {
      limitations.push('No written post caption was detected in the supplied asset.');
      limitations.push('Creator intended objective cannot be definitively established from the screenshot alone.');
    } else {
      limitations.push('Analysis is based on visible text and screenshot evidence.');
    }
  }

  // Confidence with domain breakdown
  const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
    raw.confidence?.level && ['HIGH', 'MEDIUM', 'LOW'].includes(raw.confidence.level)
      ? raw.confidence.level
      : 'HIGH';

  const defaultBreakdown = [
    { domain: 'Visual composition', level: 'HIGH' as const, reason: 'Directly visible in uploaded asset' },
    { domain: 'Conversation weakness', level: 'HIGH' as const, reason: 'Absence of question/prompt is directly verifiable' },
    { domain: 'Audience emotional response', level: 'MEDIUM' as const, reason: 'Inferred based on content aesthetics' },
    { domain: 'Visual processing ease', level: 'MEDIUM' as const, reason: 'Inferred layout and hierarchy' },
    { domain: 'Creator intent', level: 'LOW' as const, reason: 'Requires information not available in screenshot' },
    { domain: 'Why reposts occurred', level: 'LOW' as const, reason: 'Historical context not in image' },
  ];

  const rawBreakdown = Array.isArray(raw.confidence?.breakdown) ? raw.confidence.breakdown : defaultBreakdown;
  const breakdown = rawBreakdown.map((item: any) => ({
    domain: typeof item?.domain === 'string' ? item.domain : 'General Analysis',
    level: ['HIGH', 'MEDIUM', 'LOW'].includes(item?.level) ? item.level : ('MEDIUM' as const),
    reason: typeof item?.reason === 'string' ? item.reason : undefined,
  }));

  const confidence: AnalysisConfidence = {
    level: confidenceLevel,
    reason:
      typeof raw.confidence?.reason === 'string' && raw.confidence.reason.trim()
        ? raw.confidence.reason.trim()
        : 'High diagnostic confidence based on directly detected visual elements and verified content inventory.',
    breakdown,
  };

  return {
    observedFacts,
    goalFit,
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
    strengths,
    postAutopsy,
    conversationDNA,
    repair,
    platformVariants,
    goalRecommendation,
    limitations,
    confidence,
  };
}
