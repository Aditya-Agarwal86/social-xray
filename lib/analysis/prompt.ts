import type { ContentInventory } from '@/lib/extraction/types';

export function buildGeminiSystemPrompt(targetGoal = 'conversation'): string {
  return `You are SOCIAL X-RAY, an elite AI Social Content Forensics Diagnostician and Audience Psychology Specialist.

CORE PHILOSOPHY & FORENSIC MISSION:
You perform rigorous, grounded forensic autopsies of social media posts to diagnose WHERE and WHY reader attention and conversion decay, and prescribe surgical repairs.

CRITICAL FORENSIC RULES & GUARDRAILS:
1. STRICT DATA TYPE SEPARATION:
   - Never confuse written post copy with platform UI, username metadata, timestamps, or engagement metric counters.
   - If no caption was written, treat "Caption: Not detected" as a valid state. Do NOT treat OCR absence as text corruption.
2. ZERO HALLUCINATION & STRICT GROUNDING:
   - NEVER invent unrelated topics, fake businesses, productivity software, B2B tools, statistics, or fabricated products.
   - If the post contains visual imagery (e.g. floral bouquets, cars, food, art, memes), all repairs, questions, and autopsy insights MUST remain 100% grounded in that exact visual subject.
   - If source content is sparse, state honest forensic observations rather than hallucinating an imaginary business context.
3. OBJECTIVE-TUNED DIAGNOSIS ("${targetGoal.toUpperCase()}"):
   - CLICKS / TRAFFIC: Diagnose whether a clear link trigger, reason to click, or destination is provided.
   - CONVERSATION: Diagnose dialogue catalysts. Prescribe specific, polarizing, or curiosity-inducing questions grounded in the post's subject.
   - SHARES: Diagnose relational utility and whether someone would send this to a friend.
   - SAVES: Diagnose evergreen reference value or aesthetic bookmark worthiness.
   - FOLLOWERS: Diagnose creator identity, value promise, and incentive to follow.
   - AWARENESS: Diagnose visual memorability, brand recall, and distinctiveness.
4. NO FAKE STATISTICS / MULTIPLIERS:
   - Never generate fake statistics or claim "this change will get 3x more reach" or "increase sales by 50%". Ground all assessments in copywriting and cognitive psychology.
5. CONTENT-BASED ESTIMATION:
   - All assessments are content-based diagnostic estimates grounded strictly in the provided text or visual assets.

SCORING METHODOLOGY (0 - 100 EXPLAINABLE RATING):
- 80-100 (Optimal): High stopping power, effortless cognitive flow, strong hook velocity, compelling value payoff.
- 60-79 (Moderate Friction): Understandable premise but hindered by passive phrasing, mild cognitive drag, or generic CTA.
- 0-59 (Critical Friction): Severe friction (e.g., missing CTA for a click goal, buried hook, or cognitive barrier).`;
}

export function buildGeminiUserPrompt(
  content?: string,
  targetGoal = 'conversation',
  inventory?: ContentInventory,
  userMetrics?: Record<string, any>
): string {
  const inventorySection = inventory
    ? `
CONTENT INVENTORY (VERIFIED GROUND TRUTH):
- Visual Content: ${inventory.hasVisualMedia ? 'DETECTED (Visual asset attached)' : 'None (Text-only)'}
- Caption Status: ${inventory.captionStatus === 'NOT_DETECTED' ? 'NOT DETECTED (Visual-only post)' : inventory.captionStatus}
- Extracted Caption / Copy: ${inventory.caption ? `"${inventory.caption}"` : 'None'}
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
RAW SUBMITTED CONTENT:
---
${content.trim()}
---`
    : '';

  const metricsInfo = userMetrics && Object.keys(userMetrics).length > 0
    ? `\nUSER CONTEXT / PREFERENCES:\n${JSON.stringify(userMetrics, null, 2)}\n`
    : '';

  return `Perform a forensic autopsy on this social media post for the objective "${targetGoal.toUpperCase()}".
${inventorySection}${rawContentSection}${metricsInfo}

FORENSIC INSTRUCTIONS:
1. Inspect the visual content (if image attached) and any written copy.
2. Evaluate all 10 diagnostic dimensions (0-100).
3. If no caption exists, note the lack of caption/CTA as a goal-specific friction point and prescribe a compelling, drop-in replacement caption grounded directly in the visual subject.
4. If written text exists, identify exact textual bottlenecks and quote the problematic fragments in the friction map.
5. Return a pure JSON object conforming to the response schema.`;
}

/**
 * Native JSON Schema for Gemini structured output.
 * Ensures the response strictly adheres to the Social X-Ray analysis schema.
 */
export const ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: {
      type: 'integer',
      description: 'Overall survivability score from 0 to 100',
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
    postAutopsy: {
      type: 'object',
      properties: {
        causeOfDeath: { type: 'string' },
        primaryFailure: { type: 'string' },
        secondaryFailure: { type: 'string' },
        hiddenStrength: { type: 'string' },
        treatment: { type: 'string' },
      },
      required: ['causeOfDeath', 'primaryFailure', 'secondaryFailure', 'hiddenStrength', 'treatment'],
    },
    conversationDNA: {
      type: 'object',
      properties: {
        likelyAudienceReaction: { type: 'string' },
        engagementType: { type: 'string' },
        conversationPotential: { type: 'string' },
        betterQuestion: { type: 'string' },
        followUpQuestion: { type: 'string' },
      },
      required: ['likelyAudienceReaction', 'engagementType', 'conversationPotential', 'betterQuestion', 'followUpQuestion'],
    },
    repair: {
      type: 'object',
      properties: {
        original: { type: 'string' },
        improved: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['original', 'improved', 'explanation'],
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
  },
  required: [
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
    'postAutopsy',
    'conversationDNA',
    'repair',
    'platformVariants',
    'goalRecommendation',
  ],
};
