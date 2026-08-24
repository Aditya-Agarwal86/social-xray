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
   - Facts directly detected from the uploaded post, image, or verified metadata.
   - Example: "Two bouquet photographs are visible; no caption was detected; no CTA was detected; 64 replies, 722 reposts, 1.5K likes, 50K views are visible."
   - Never add unsupported creator intent or assumed background facts.
2. LAYER B: INFERENCES & DIAGNOSIS
   - Rigorous, content-grounded interpretation based ONLY on observed content.
   - Distinctly label inferences and assign confidence levels:
     * HIGH: Directly visible or detectable elements (visual composition, conversation weakness).
     * MEDIUM: Reasonable interpretation from visible content (audience emotional response, visual processing ease).
     * LOW: Requires information not available in screenshot (creator intent, why reposts occurred).
   - Example: "Likely audience response: visual appreciation without a strong conversation trigger (Confidence: Medium)."
   - Never present inferred audience behavior as observed fact.
3. LAYER C: RECOMMENDATION (AI-GENERATED SUGGESTION)
   - Actionable suggestions generated from the diagnosis to satisfy the selected goal ("${targetGoal.toUpperCase()}").
   - Clearly understand this is an AI recommendation not present in the original post.
   - Example: "Left or right? Which bouquet style has your heart? 🌷"

CRITICAL FORENSIC RULES & SCIENTIFIC GROUNDING:
1. NEVER DISPLAY "NO TEXT DETECTED" AS A TEXT FRAGMENT:
   - If a post has no caption, do NOT create a friction item calling absence of text a "problematic text fragment".
   - Instead, treat it as a MISSING ENGAGEMENT ELEMENT with detected state: "No caption or conversation prompt detected."
2. EVALUATE "VISUAL PROCESSING EASE" (FORMERLY COGNITIVE EASE):
   - Do NOT automatically give an image-only post a high cognitive ease score just because there is no text.
   - Evaluate visual processing separately: number of visual elements, composition, visual hierarchy, contrast, scanability, and ambiguity of meaning.
   - For image-only floral bouquets, diagnosis: "Visually easy to scan, but context is limited."
3. GROUNDED SHAREABILITY SEPARATION:
   - Do not claim "People may share it for aesthetic inspiration" as a proven fact.
   - Separate OBSERVED ("722 reposts are visible") from INFERENCE ("The visual format appears compatible with peer-to-peer sharing").
   - If metrics are available, use them as evidence; never confuse observed performance with AI predictions.
4. GOAL FIT EVALUATION ("${goalLabel.toUpperCase()}"):
   - Score represents: "How well does this post currently support the selected objective (${targetGoal.toUpperCase()})?"
   - It does NOT mean "How good is this post overall?".
   - Example: Conversation Fit: 40/100 does NOT mean "Bad post"; it means "Limited conversation architecture / No question, opinion prompt, or explicit response mechanism is visible."
   - If target is CLICKS and no URL is visible: "No destination is visible. Add the intended link before creating a click-focused CTA."
5. EVIDENCE REQUIRED FOR EVERY SCORE:
   - Every dimension score MUST explain what specific evidence supports it.
   - Conversation (35/100) -> Evidence: "No question, opinion prompt, or explicit response mechanism is visible."
   - CTA (10/100) -> Evidence: "No CTA or destination instruction is visible."
   - Visual Hook (85/100) -> Evidence: "Two visually distinctive bouquet arrangements create immediate visual contrast."
6. FORENSIC LANGUAGE & SCIENTIFIC HUMILITY (AVOID HYPERBOLE):
   - Avoid unsupported scientific claims like "dramatically lowers the barrier", "attention dropped below retention threshold", "psychological certainty", "audience definitely does X".
   - Use measured, evidence-grounded phrasing: "may reduce response effort", "likely friction", "observed", "inferred", "confidence: medium".
8. NO FAKE STATISTICS / MULTIPLIERS:
   - Never generate fake statistics or claim "this change will get 3x more reach" or "increase sales by 50%". Ground all assessments in copywriting and cognitive psychology.
9. CONTENT-BASED ESTIMATION:
   - All assessments are content-based diagnostic estimates grounded strictly in the provided text or visual assets.
   - If something cannot be reliably determined from the screenshot alone, state "Insufficient evidence from the supplied content."
10. ABSOLUTE ZERO HALLUCINATION (NEVER INVENT UNRELATED TOPICS):
   - NEVER invent companies, products, software, productivity tools, B2B services, prices, links, statistics, or creator business context.
   - If the visual post shows floral bouquets, all repairs, questions, and insights MUST remain 100% about floral arrangements, color palettes, and gifting choice.

SCORING METHODOLOGY (0 - 100 EXPLAINABLE RATING):
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
1. LAYER A (OBSERVED FACTS): List 3-5 factual observations detected directly from the image/copy without adding unsupported creator intent.
2. LAYER B (DIAGNOSED INFERENCES):
   - Evaluate "${goalLabel}" (0-100) representing how well this post supports the selected goal. Explain the exact evidence.
   - Evaluate all 10 diagnostic dimensions (0-100) with concrete evidence citations.
   - For visual-only posts, evaluate Visual Processing Ease (composition, visual hierarchy, contrast, scanability) rather than default high cognitive ease.
   - In Conversation DNA, use grounded inference language ("Likely audience response: visual appreciation without a strong conversation trigger", "Likely engagement path: visual appreciation → like/repost or passive consumption", "The post provides no explicit mechanism for starting a conversation").
3. LAYER C (RECOMMENDED):
   - Prescribe a Recommended Repair that is 100% grounded in the detected visual subject and the selected goal "${targetGoal.toUpperCase()}".
   - If the visual post contains floral bouquets, the recommended repair must be a floral choice prompt ("Left or right? Which bouquet style has your heart? 🌷"). NEVER invent software or productivity tools!
   - Provide an evidence-grounded rationale ("A binary choice gives viewers a specific response format and may reduce the effort required to participate").
   - Include confidence breakdown across domains (HIGH for visual composition & conversation weakness; MEDIUM for audience emotional response & visual processing ease; LOW for creator intent).
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
