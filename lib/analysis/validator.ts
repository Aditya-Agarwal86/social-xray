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
  NormalizedApiError,
  ApiErrorCategory,
} from './types';

export const STABLE_GEMINI_MODEL = 'gemini-2.5-flash';

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
      message:
        'The AI service is experiencing high demand. Your uploaded post and extracted content are still safe. Please try again in a moment.',
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
      message: 'The AI service has temporarily limited requests. Please wait before trying again.',
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
      message: 'Invalid or missing Google Gemini API key. Please check your key configuration.',
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
      message: 'The configured Gemini model could not be found. Check the model configuration.',
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
      message: 'The AI diagnostic analysis timed out. Please try again.',
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
      message: 'Unable to reach the AI diagnostic engine. Please check your internet connection.',
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
      message: err?.message || 'The post text is empty or invalid.',
      retryable: false,
      requiresKeyConfig: false,
    };
  }

  // 8. Default fallback 500 SERVER_ERROR
  return {
    category: 'SERVER_ERROR',
    status: 500,
    title: 'AI service error',
    message: 'The AI service encountered an unexpected error. Please try again.',
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
    } catch {
      throw new Error(`Failed to parse AI JSON response: ${err.message}`);
    }
  }
}

/**
 * Validates and normalizes the parsed JSON into a strictly conforming SocialXRayAnalysisResult.
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

  // Overall Score (0-100)
  const overallScore = normalizeScore(raw.overallScore, 68);

  // Core Executive Metrics
  const hook = normalizeDimension(
    raw.hook,
    'Slow opening narrative decelerates audience velocity.',
    'Opening lines do not establish an immediate open loop or counter-intuitive premise.'
  );

  const clarity = normalizeDimension(
    raw.clarity,
    'Unclear core thesis or convoluted argument phrasing.',
    'Sentence structures create ambiguity around the core takeaway.'
  );

  const cognitiveLoad = normalizeDimension(
    raw.cognitiveLoad,
    'Dense line formatting and lack of white space.',
    'Heavy paragraph blocks exhaust reader working memory before the payoff.'
  );

  const emotion = normalizeDimension(
    raw.emotion,
    'Detached corporate tone lacking visceral resonance.',
    'Language is descriptive rather than emotionally evocative.'
  );

  const curiosity = normalizeDimension(
    raw.curiosity,
    'Resolves all tension before the reader feels compelled to engage.',
    'Lacks curiosity gaps or unresolved intrigue.'
  );

  const conversation = normalizeDimension(
    raw.conversation,
    'Broadcast style statement rather than dialogue catalyst.',
    'Fails to invite differing perspectives or relatable lived experiences.'
  );

  const shareability = normalizeDimension(
    raw.shareability,
    'Low identity affiliation or badge value.',
    'Readers cannot easily use this post as a reflection of their own intelligence or taste.'
  );

  const cta = normalizeDimension(
    raw.cta,
    'Generic or high-friction call to action.',
    'Asks for too much commitment without demonstrating proportional immediate value.'
  );

  const audienceValue = normalizeDimension(
    raw.audienceValue,
    'Theoretical fluff without concrete actionable insight.',
    'Audience finishes the post without a clear mental model or actionable step.'
  );

  // Friction Points List
  const rawFriction = Array.isArray(raw.frictionPoints) ? raw.frictionPoints : [];
  const frictionPoints: FrictionPointItem[] = rawFriction.slice(0, 5).map((fp: any, idx: number) => ({
    category: typeof fp?.category === 'string' && fp.category.trim() ? fp.category.trim() : `Friction Point #${idx + 1}`,
    severity: ['critical', 'moderate', 'minor', 'optimal'].includes(fp?.severity) ? fp.severity : 'moderate',
    text: typeof fp?.text === 'string' && fp.text.trim() ? fp.text.trim() : originalContent.slice(0, 60),
    explanation: typeof fp?.explanation === 'string' && fp.explanation.trim() ? fp.explanation.trim() : 'Bottleneck causes attention drop-off.',
    repair: typeof fp?.repair === 'string' && fp.repair.trim() ? fp.repair.trim() : 'Refine phrasing for impact.',
  }));

  // Normalize Post Autopsy
  const postAutopsy: PostAutopsyData = {
    causeOfDeath: typeof raw.postAutopsy?.causeOfDeath === 'string' && raw.postAutopsy.causeOfDeath.trim()
      ? raw.postAutopsy.causeOfDeath.trim()
      : 'Engagement bottleneck caused by delayed value delivery and weak conversation mechanics.',
    primaryFailure: typeof raw.postAutopsy?.primaryFailure === 'string' && raw.postAutopsy.primaryFailure.trim()
      ? raw.postAutopsy.primaryFailure.trim()
      : 'Opening hook lacks immediate tension or curiosity gap.',
    secondaryFailure: typeof raw.postAutopsy?.secondaryFailure === 'string' && raw.postAutopsy.secondaryFailure.trim()
      ? raw.postAutopsy.secondaryFailure.trim()
      : 'Call-to-action is passive and inert.',
    hiddenStrength: typeof raw.postAutopsy?.hiddenStrength === 'string' && raw.postAutopsy.hiddenStrength.trim()
      ? raw.postAutopsy.hiddenStrength.trim()
      : 'The underlying subject matter has intrinsic appeal if reframed.',
    treatment: typeof raw.postAutopsy?.treatment === 'string' && raw.postAutopsy.treatment.trim()
      ? raw.postAutopsy.treatment.trim()
      : 'Front-load the counter-intuitive hook, break dense sentences, and end with a binary prompt.',
  };

  // Normalize Conversation DNA
  const conversationDNA: ConversationDNAData = {
    likelyAudienceReaction: typeof raw.conversationDNA?.likelyAudienceReaction === 'string' && raw.conversationDNA.likelyAudienceReaction.trim()
      ? raw.conversationDNA.likelyAudienceReaction.trim()
      : 'Passive agreement without feeling compelled to comment.',
    engagementType: typeof raw.conversationDNA?.engagementType === 'string' && raw.conversationDNA.engagementType.trim()
      ? raw.conversationDNA.engagementType.trim()
      : 'Passive Scroll',
    conversationPotential: typeof raw.conversationDNA?.conversationPotential === 'string' && raw.conversationDNA.conversationPotential.trim()
      ? raw.conversationDNA.conversationPotential.trim()
      : 'Low - Broadcast style dominates.',
    betterQuestion: typeof raw.conversationDNA?.betterQuestion === 'string' && raw.conversationDNA.betterQuestion.trim()
      ? raw.conversationDNA.betterQuestion.trim()
      : 'What is the #1 mistake you see most teams make here?',
    followUpQuestion: typeof raw.conversationDNA?.followUpQuestion === 'string' && raw.conversationDNA.followUpQuestion.trim()
      ? raw.conversationDNA.followUpQuestion.trim()
      : 'How did you handle this the last time it happened?',
  };

  // Normalize Repair Diff
  const repair: RepairData = {
    original: typeof raw.repair?.original === 'string' && raw.repair.original.trim()
      ? raw.repair.original.trim()
      : originalContent,
    improved: typeof raw.repair?.improved === 'string' && raw.repair.improved.trim()
      ? raw.repair.improved.trim()
      : originalContent,
    explanation: typeof raw.repair?.explanation === 'string' && raw.repair.explanation.trim()
      ? raw.repair.explanation.trim()
      : 'Restructured the copy to eliminate cognitive drag, heighten hook velocity, and provoke debate.',
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
