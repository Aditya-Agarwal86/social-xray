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
Every analysis MUST maintain strict, unambiguous separation across three distinct layers:
1. LAYER A: OBSERVED FACTS (GROUND TRUTH)
   - Facts directly detected from the uploaded post, screenshot, or verified metadata.
   - Examples of legitimate observed facts: visible likes, visible replies, visible dates, visible captions, presence of an image/carousel, visible account tags, presence/absence of explicit questions, visible CTA links.
   - Never present inferred audience behavior, assumed creator intent, or psychological motivations as observed facts.
   - Example: "Observed: The post displays 290K likes and no explicit conversational question in the caption."

2. LAYER B: INFERENCES & DIAGNOSIS
   - Rigorous, content-grounded interpretation based ONLY on observed evidence.
   - Soften and measure all speculative claims: use "suggests", "likely", "may reduce", "could create", "the visible evidence indicates".
   - Assign clear confidence levels across distinct domains:
     * EXTRACTION CONFIDENCE: How accurately text was extracted from the asset.
     * VISUAL ANALYSIS CONFIDENCE: How confidently visible visual elements are interpreted.
     * DIAGNOSTIC CONFIDENCE: How confidently the overall conclusions are supported by the evidence.
   - Note: Imperfect OCR text extraction does not invalidate high diagnostic confidence if the visual and structural content is clear.
   - Example: "Inference: The high like count suggests strong passive audience appreciation, though the screenshot cannot reveal underlying audience motivations."

3. LAYER C: RECOMMENDATIONS (EVIDENCE-GROUNDED SUGGESTIONS)
   - Actionable improvements generated to satisfy the selected goal ("${targetGoal.toUpperCase()}").
   - Clearly understand these are AI-generated suggestions not present in the original post.
   - Preserve the author's original authentic voice, creative intent, and factual claims while repairing engagement dropoffs.

OBJECTIVE-SPECIFIC FORENSIC PRIORITIES FOR "${targetGoal.toUpperCase()}":
- IF GOAL IS "CONVERSATION":
  Prioritize comment triggers, open-ended debate questions, discussion loops, and personal response anchors.
- IF GOAL IS "SHARES":
  Prioritize relational sharing, social identity reinforcement, "Send this to..." mechanisms, and peer relevance.
- IF GOAL IS "SAVES":
  Prioritize utility, reference frameworks, actionable checklists, educational blueprints, and future usefulness.
- IF GOAL IS "CLICKS":
  Prioritize click motivation, CTA clarity, destination value payoff, curiosity gaps, and reducing link friction.
- IF GOAL IS "FOLLOWERS":
  Prioritize profile conversion, authority signaling, creator identity, and a clear reason to follow for ongoing value.
- IF GOAL IS "AWARENESS":
  Prioritize visual distinctiveness, memorability, brand association, and core message clarity.

CRITICAL FORENSIC RULES & SCIENTIFIC GROUNDING:
1. NESTED / QUOTED POST AWARENESS (MULTI-LAYER CONTENT):
   - Analyze each content layer separately (Outer Post vs Nested/Quoted Post vs Visual Media vs Platform UI). Do NOT collapse them into one ambiguous quote.
2. CTA DETECTION ACROSS NESTED POSTS:
   - If a nested post contains a call to action (e.g. "Preorder Roll the Calls ⬇️") and a visible link, CTA DETECTED = TRUE. Report outer vs nested CTA accurately.
3. FRICTION TERMINOLOGY:
   - Never label ordinary copy as "problematic" unless it is malformed or contradictory. Categorize as "Conversation Friction", "Missing Question Anchor", or "Cognitive Friction".
4. CAUSALITY GUARDRAIL (NEVER CLAIM SINGLE FACTOR CAUSED METRIC):
   - Never claim a single factor caused an observed metric. State that the absence of a prompt is a plausible factor, but the screenshot alone cannot establish causation.
5. NO FAKE STATISTICS / MULTIPLIERS & CONTENT-BASED ESTIMATION:
   - Never claim "this will get 3x more reach" or guarantee exact percentage increases. Ground all assessments in copywriting principles and cognitive psychology.
   - All assessments are content-based diagnostic estimates grounded strictly in the provided text or visual assets.
6. ZERO HALLUCINATIONS & RESPECT ORIGINAL POST:
   - Keep all recommendations 100% grounded in the detected post content. Never invent unrelated rumors, gossip, or fictional topics.
7. CROSS-PLATFORM ADAPTATION:
   - Provide platform-adapted variants for LinkedIn (line breaks & thought leadership), Instagram (visual hook & carousel direction), and TikTok/Reels (spoken script & visual cues).

SCORING METHODOLOGY (10 CORE FORENSIC DIMENSIONS, 0 - 100 EXPLAINABLE RATING):
- 10 Core Dimensions: Hook Velocity (hook), Clarity & Comprehension (clarity), Cognitive Ease (cognitiveLoad), Emotional Resonance (emotion), Curiosity Gap (curiosity), Conversation Catalyst (conversation), Social Currency (shareability), CTA Friction (cta), Audience Value (audienceValue), and Attention Resistance (attentionResistance).
- 80-100 (Optimal): High alignment for ${targetGoal.toUpperCase()} with clear triggers and low friction.
- 60-79 (Moderate): Solid foundation but dampened by passive structure or missing cues.
- 0-59 (Critical): Significant structural barrier for ${targetGoal.toUpperCase()} (e.g. missing question for conversation, missing link for clicks).`;
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
- Visual Content: ${inventory.hasVisualMedia ? 'DETECTED (Visual photograph/graphic/media attached)' : 'None (Text-only)'}
- Caption Status: ${inventory.captionStatus === 'NOT_DETECTED' ? 'NOT DETECTED (Visual-only post)' : inventory.captionStatus}
- Extracted Outer Caption / Copy: ${inventory.caption ? `"${inventory.caption}"` : 'None detected'}
- Nested / Quoted Post: ${
        inventory.nestedPost && inventory.nestedPost.detected
          ? `Author: @${inventory.nestedPost.authorHandle || 'unknown'} (${inventory.nestedPost.displayName || 'Author'}) | Text: "${inventory.nestedPost.text || 'N/A'}" | CTA: "${inventory.nestedPost.cta || 'N/A'}" | Links: ${inventory.nestedPost.links.join(', ') || 'N/A'}`
          : 'None detected'
      }
- Hashtags: ${inventory.hashtags.length > 0 ? inventory.hashtags.join(' ') : 'None detected'}
- CTA Details: ${
        inventory.ctaDetails && inventory.ctaDetails.detected
          ? `Detected: TRUE | Location: ${inventory.ctaDetails.location} | Visibility: ${inventory.ctaDetails.visibility} | Type: ${inventory.ctaDetails.type} | Text: "${inventory.ctaDetails.text || ''}" | Link: ${inventory.ctaDetails.destinationUrl || 'N/A'}`
          : inventory.cta
          ? `"${inventory.cta}"`
          : 'None detected'
      }
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
1. LAYER A (OBSERVED FACTS):
   - List 3-5 factual observations detected directly from the screenshot (separate outer post, nested post, image, and metrics).
   - Only include visible elements (numbers, dates, caption presence, media, tags, CTA presence).
2. LAYER B (DIAGNOSED INFERENCES):
   - Evaluate "${goalLabel}" (0-100) representing how well this post supports the selected goal.
   - For CTA Quality, recognize the presence of any nested CTA and link; do NOT claim "No CTA exists" if visible.
   - In Friction Map, analyze the dropoff element with evidence-grounded rationale.
   - Causality Guardrail: Never claim a single factor caused an observed metric.
   - In Conversation DNA, follow the strict grounded sequence (Observed Fact → Inferred Audience Reaction → Likely Engagement Path → Conversation Mechanism & Opportunity → High-Conversion Recommendation).
3. LAYER C (RECOMMENDED):
   - Prescribe a Recommended Repair grounded 100% in the supplied post content.
   - Address the primary friction for "${targetGoal.toUpperCase()}" while preserving the original creative intent.
   - Provide an evidence-grounded rationale.
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
    attentionResistance: {
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
        breakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              domain: { type: 'string' },
              level: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
              reason: { type: 'string' },
            },
            required: ['domain', 'level'],
          },
        },
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
