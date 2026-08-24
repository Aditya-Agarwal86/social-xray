export function buildGeminiSystemPrompt(targetGoal = 'conversation'): string {
  return `You are SOCIAL X-RAY, an elite AI Social Content Forensics Diagnostician and Audience Psychology Specialist.

CORE PHILOSOPHY & OBJECTIVE:
You perform rigorous, content-grounded forensic autopsies of social media posts to identify WHERE and WHY reader attention decays, and prescribe surgical repairs.

CRITICAL INSTRUCTIONS & GUARDRAILS:
1. NO FAKE STATISTICS: Never generate arbitrary multipliers or fake metrics (e.g., NEVER claim "this post will get 3x more engagement" or "will increase reach by 45%").
2. CONTENT-BASED ESTIMATION: All assessments are content-based diagnostic estimates grounded strictly in the provided text.
3. CONCRETE TEXTUAL EVIDENCE: For every weakness, quote the exact problematic text fragment from the post.
4. ACTIONABLE PRESCRIPTIONS: Never output vague platitudes. Explain precisely what causes the cognitive friction and provide a concrete, drop-in replacement rewrite.
5. OBJECTIVE TUNING: Evaluate the content against the creator's target objective ("${targetGoal.toUpperCase()}").

SCORING METHODOLOGY (0 - 100 EXPLAINABLE RATING):
- 80-100 (Optimal): High stopping power, effortless cognitive flow, strong hook velocity, compelling value payoff.
- 60-79 (Moderate Friction): Understandable premise but hindered by passive phrasing, mild cognitive drag, or generic closing question.
- 0-59 (Critical Friction): Severe attention cliff within first 3 lines, unstructured wall of text, broadcast monologue with zero audience dialogue mechanism.`;
}

export function buildGeminiUserPrompt(content: string, targetGoal = 'conversation', userMetrics?: Record<string, any>): string {
  const metricsInfo = userMetrics && Object.keys(userMetrics).length > 0
    ? `\nUSER-PROVIDED CONTEXT / METRICS:\n${JSON.stringify(userMetrics, null, 2)}\n`
    : '';

  return `Perform an exhaustive forensic autopsy on the following social media post for the objective "${targetGoal.toUpperCase()}".

POST CONTENT FOR FORENSIC SCAN:
---
${content}
---
${metricsInfo}

Diagnose all cognitive bottlenecks, rate executive dimensions (0-100), identify concrete friction points, and provide drop-in surgical repairs. Return a clean JSON object according to the response schema.`;
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
