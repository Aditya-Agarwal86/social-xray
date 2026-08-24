import type { ContentInventory } from '@/lib/extraction/types';

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

export function buildGeminiSystemPrompt(targetGoal = 'conversation'): string {
  const goalLabel = getGoalFitLabel(targetGoal);

  return `You are SOCIAL X-RAY, an elite AI Social Content Forensics Diagnostician and Audience Psychology Specialist.

CORE PHILOSOPHY & THREE-LAYER FORENSIC SEPARATION:
Every analysis MUST maintain strict separation across three distinct layers:
1. LAYER A: OBSERVED
   - Facts directly detected from the uploaded post, image, or verified metadata.
   - Example: "Two bouquet photographs are visible; 64 replies, 722 reposts, 1.5K likes, 50K views are visible; no written caption is detected."
2. LAYER B: DIAGNOSED
   - Rigorous, content-grounded psychological interpretation based ONLY on observed content.
   - Example: "The visual presentation creates strong immediate aesthetic appeal, but provides limited conversation triggers."
3. LAYER C: RECOMMENDED
   - Actionable suggestions generated from the diagnosis to satisfy the selected goal ("${targetGoal.toUpperCase()}").
   - Example: "Which bouquet would you choose for someone special — the pink arrangement or the white-and-rose one? 🌷"

CRITICAL FORENSIC RULES & ZERO-HALLUCINATION GUARDRAILS:
1. STRICT DATA TYPE SEPARATION:
   - Never confuse written post copy with platform chrome UI, usernames (@handle), timestamps, or engagement counters.
   - If no caption was written, caption is null ("Caption not detected"). This is NOT an OCR error or text corruption—it is a valid visual post state.
2. ABSOLUTE ZERO HALLUCINATION (NEVER INVENT UNRELATED CONTENT):
   - NEVER invent companies, products, software, productivity tools, B2B services, prices, links, statistics, audience pain points, or business claims.
   - If the visual post shows flowers/bouquets, all repairs, questions, and autopsy insights MUST remain 100% about floral arrangements, flower gifting, color preference, or florist craft.
   - NEVER generate claims like "Most creators waste 10+ hours a week", "We built a simple tool", or "Try our productivity software" for consumer/aesthetic posts.
3. GOAL-SPECIFIC FIT EVALUATION ("${goalLabel.toUpperCase()}"):
   - Score the post's alignment specifically for the "${targetGoal.toUpperCase()}" objective (0-100).
   - A low score for Conversation on an image-only post simply means "No question or discussion trigger is visible"—it does NOT mean the post is bad.
   - If target is CLICKS and no URL/destination is provided: State clearly "No destination is visible. Add the intended link before creating a click-focused CTA."
4. NO FAKE STATISTICS / MULTIPLIERS:
   - Never generate fake statistics or claim "this change will get 3x more reach" or "increase sales by 50%". Ground all assessments in copywriting and cognitive psychology.
5. CONTENT-BASED ESTIMATION:
   - All assessments are content-based diagnostic estimates grounded strictly in the provided text or visual assets.
   - If something cannot be reliably determined from the screenshot alone, state "Insufficient evidence from the supplied content."

SCORING METHODOLOGY (0 - 100 EXPLAINABLE RATING):
- 80-100 (Optimal): High stopping power, effortless cognitive flow, strong hook velocity, compelling value payoff for ${targetGoal.toUpperCase()}.
- 60-79 (Moderate Friction): Understandable premise but hindered by passive phrasing, mild cognitive drag, or missing CTA.
- 0-59 (Critical Friction): Severe friction (e.g., missing question for conversation goal, or missing link for click goal).`;
}

export function buildGeminiUserPrompt(
  content?: string,
  targetGoal = 'conversation',
  inventory?: ContentInventory,
  userMetrics?: Record<string, any>
): string {
  const goalLabel = getGoalFitLabel(targetGoal);

  const inventorySection = inventory
    ? `
CONTENT INVENTORY (VERIFIED GROUND TRUTH):
- Visual Content: ${inventory.hasVisualMedia ? 'DETECTED (Visual photograph/graphic attached)' : 'None (Text-only)'}
- Caption Status: ${inventory.captionStatus === 'NOT_DETECTED' ? 'NOT DETECTED (Visual-only post)' : inventory.captionStatus}
- Extracted Caption / Copy: ${inventory.caption ? `"${inventory.caption}"` : 'None detected'}
- Hashtags: ${inventory.hashtags.length > 0 ? inventory.hashtags.join(' ') : 'None detected'}
- Explicit CTA: ${inventory.cta ? `"${inventory.cta}"` : 'None detected'}
- Links: ${inventory.links.length > 0 ? inventory.links.join(', ') : 'None detected'}
- Observed Performance Metrics: ${
        inventory.engagementMetrics.replies ||
        inventory.engagementMetrics.reposts ||
        inventory.engagementMetrics.likes ||
        inventory.engagementMetrics.views
          ? `Replies: ${inventory.engagementMetrics.replies ?? 'N/A'} | Reposts: ${inventory.engagementMetrics.reposts ?? 'N/A'} | Likes: ${inventory.engagementMetrics.likes ?? 'N/A'} | Views: ${inventory.engagementMetrics.views ?? 'N/A'}`
          : 'None detected'
      }
- Profile / Author: ${inventory.profileMetadata.username ? `@${inventory.profileMetadata.username}` : 'N/A'} ${inventory.profileMetadata.timestamp ? `(${inventory.profileMetadata.timestamp})` : ''}
`
    : '';

  const rawContentSection = content && content.trim()
    ? `
RAW SUBMITTED TEXT / DRAFT:
---
${content.trim()}
---`
    : '';

  const metricsInfo = userMetrics && Object.keys(userMetrics).length > 0
    ? `\nUSER CONTEXT / PREFERENCES:\n${JSON.stringify(userMetrics, null, 2)}\n`
    : '';

  return `Perform a grounded forensic autopsy on this social media post for the objective "${targetGoal.toUpperCase()}" (${goalLabel}).
${inventorySection}${rawContentSection}${metricsInfo}

FORENSIC REQUIREMENTS:
1. LAYER A (OBSERVED): List 3-5 factual observations detected directly from the image/copy (e.g. visual subject, visible metrics, presence/absence of caption).
2. LAYER B (DIAGNOSED):
   - Evaluate "${goalLabel}" (0-100) with grounded reasoning based strictly on the subject matter.
   - Evaluate all 10 diagnostic dimensions (0-100).
   - If no caption was detected, evaluate visual stopping power and aesthetic appeal rather than reporting text corruption.
   - State Primary Friction, Secondary Friction, Hidden Strength, and Grounded Conversation DNA.
3. LAYER C (RECOMMENDED):
   - Prescribe a Recommended Repair that is 100% grounded in the detected visual subject and the selected goal "${targetGoal.toUpperCase()}".
   - If the visual post contains floral bouquets, the recommended repair must be an engaging floral comparison or gifting prompt. NEVER invent software or productivity tools!
   - State honest limitations and confidence level (HIGH / MEDIUM / LOW).
4. Return a structured JSON response conforming exactly to the schema.`;
}

/**
 * Native JSON Schema for Gemini structured output.
 * Ensures the response strictly adheres to the 3-Layer Social X-Ray analysis schema.
 */
export const ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    observedFacts: {
      type: 'array',
      items: { type: 'string' },
      description: 'Factual observations directly detected from the post and verified metadata',
    },
    goalFit: {
      type: 'object',
      properties: {
        objective: { type: 'string' },
        score: { type: 'integer' },
        label: { type: 'string' },
        verdict: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['objective', 'score', 'label', 'verdict', 'reason'],
    },
    overallScore: {
      type: 'integer',
      description: 'Overall goal-specific fit score from 0 to 100',
    },
    hook: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    clarity: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    cognitiveLoad: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    emotion: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    curiosity: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    conversation: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    shareability: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    cta: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    audienceValue: {
      type: 'object',
      properties: {
        score: { type: 'integer' },
        severity: { type: 'string', enum: ['optimal', 'minor', 'moderate', 'critical'] },
        problem: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'severity', 'problem', 'explanation'],
    },
    frictionPoints: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'moderate', 'minor', 'optimal'] },
          text: { type: 'string' },
          explanation: { type: 'string' },
          repair: { type: 'string' },
        },
        required: ['category', 'severity', 'text', 'explanation', 'repair'],
      },
    },
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['title', 'detail'],
      },
    },
    postAutopsy: {
      type: 'object',
      properties: {
        primaryFriction: { type: 'string' },
        secondaryFriction: { type: 'string' },
        hiddenStrength: { type: 'string' },
        treatment: { type: 'string' },
        causeOfDeath: { type: 'string' },
        primaryFailure: { type: 'string' },
        secondaryFailure: { type: 'string' },
      },
      required: ['primaryFriction', 'secondaryFriction', 'hiddenStrength', 'treatment'],
    },
    conversationDNA: {
      type: 'object',
      properties: {
        deliveredToFeed: { type: 'string' },
        audienceReaction: { type: 'string' },
        inducedAction: { type: 'string' },
        conversationOpportunity: { type: 'string' },
        replacementQuestion: { type: 'string' },
        followUpQuestion: { type: 'string' },
        likelyAudienceReaction: { type: 'string' },
        engagementType: { type: 'string' },
        conversationPotential: { type: 'string' },
        betterQuestion: { type: 'string' },
      },
      required: ['deliveredToFeed', 'audienceReaction', 'inducedAction', 'conversationOpportunity', 'replacementQuestion', 'followUpQuestion'],
    },
    repair: {
      type: 'object',
      properties: {
        original: { type: 'string' },
        recommended: { type: 'string' },
        rationale: { type: 'string' },
        improved: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['original', 'recommended', 'rationale'],
    },
    platformVariants: {
      type: 'object',
      properties: {
        linkedin: { type: 'string' },
        instagram: { type: 'string' },
        tiktok: { type: 'string' },
      },
      required: ['linkedin', 'instagram', 'tiktok'],
    },
    goalRecommendation: {
      type: 'object',
      properties: {
        selectedGoal: { type: 'string' },
        reasoning: { type: 'string' },
        recommendedChange: { type: 'string' },
      },
      required: ['selectedGoal', 'reasoning', 'recommendedChange'],
    },
    limitations: {
      type: 'array',
      items: { type: 'string' },
    },
    confidence: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
        reason: { type: 'string' },
      },
      required: ['level', 'reason'],
    },
  },
  required: [
    'observedFacts',
    'goalFit',
    'overallScore',
    'hook',
    'clarity',
    'cognitiveLoad',
    'emotion',
    'curiosity',
    'conversation',
    'shareability',
    'cta',
    'audienceValue',
    'frictionPoints',
    'strengths',
    'postAutopsy',
    'conversationDNA',
    'repair',
    'platformVariants',
    'goalRecommendation',
    'limitations',
    'confidence',
  ],
};
