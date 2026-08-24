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
   - Example: "Outer post: 'Truth is better than fiction' by @elonmusk; Nested quote post: 'Preorder Roll the Calls ⬇️' by @AriEmanuel with Amazon shortlink a.co/d/0gaDvahC; Book cover image for 'Roll the Calls / Ari Emanuel: A Memoir'; 935 replies, 1K reposts, 5K likes, 5.2M views."
   - Never add unsupported creator intent or assumed background facts.
2. LAYER B: INFERENCES & DIAGNOSIS
   - Rigorous, content-grounded interpretation based ONLY on observed content.
   - Distinctly label inferences and assign confidence levels:
     * HIGH: Directly visible or detectable elements (visual composition, conversation weakness, presence of nested CTA/link).
     * MEDIUM: Reasonable interpretation from visible content (audience emotional response, visual processing ease).
     * LOW: Requires information not available in screenshot (creator intent, why reposts occurred).
   - Example: "Likely audience response: visual appreciation without a strong conversation trigger (Confidence: Medium)."
   - Never present inferred audience behavior as observed fact.
3. LAYER C: RECOMMENDATION (AI-GENERATED SUGGESTION)
   - Actionable suggestions generated from the diagnosis to satisfy the selected goal ("${targetGoal.toUpperCase()}").
   - Clearly understand this is an AI recommendation not present in the original post.
   - Example: "Do you think truth really is better than fiction? Why?"

CRITICAL FORENSIC RULES & SCIENTIFIC GROUNDING:
1. NESTED / QUOTED POST AWARENESS (MULTI-LAYER CONTENT):
   - A screenshot may contain multiple content layers:
     * OUTER POST (e.g. "Truth is better than fiction" by @elonmusk)
     * NESTED / QUOTED POST (e.g. "Preorder Roll the Calls ⬇️" with shortlink a.co/d/0gaDvahC by @AriEmanuel)
     * IMAGE / GRAPHIC (e.g. Book cover for "Roll the Calls / Ari Emanuel: A Memoir")
     * PLATFORM METRICS & UI (e.g. 935 replies, 1K reposts, 5K likes, 5.2M views)
   - Analyze each content layer separately; do NOT collapse them into one ambiguous quote.
2. CTA DETECTION ACROSS NESTED POSTS:
   - If the nested post contains a call to action (e.g. "Preorder Roll the Calls ⬇️") and a visible link ("a.co/d/0gaDvahC"), then CTA DETECTED = TRUE.
   - Do NOT say "No CTA exists".
   - Report:
     * Outer CTA: Not detected
     * Nested CTA: Detected ("Preorder Roll the Calls ⬇️")
     * CTA Type: Purchase / preorder
     * CTA Visibility: Secondary / nested
     * Visible Link: "a.co/d/0gaDvahC"
   - In CTA Quality scoring, acknowledge the presence of the nested CTA and link, but note that the outer post does not explicitly reinforce it.
3. FRICTION TERMINOLOGY (NEVER LABEL ORDINARY COPY AS "PROBLEMATIC"):
   - Never label ordinary, well-written copy as a "PROBLEMATIC TEXT FRAGMENT" unless the text is actually malformed, contradictory, or misleading.
   - For a closed statement like "Truth is better than fiction", categorize as:
     * Category: "Conversation Friction" or "Missing Question Anchor"
     * Text: "Truth is better than fiction"
     * Rationale: "The statement expresses a viewpoint but does not explicitly invite the audience to respond."
     * Repair: "Do you think truth really is better than fiction? Why?"
   - For image-only posts with no text, label as MISSING ENGAGEMENT ELEMENT with detected state: "No caption or conversation prompt detected."
4. CAUSALITY GUARDRAIL (NEVER CLAIM SINGLE FACTOR CAUSED METRIC):
   - Never claim that a single factor caused an observed engagement metric.
   - BAD: "The lack of a question caused the low reply rate."
   - GOOD: "The post has 935 visible replies against 5.2M visible views, indicating a relatively low reply-to-view rate (~0.018%). The absence of an explicit conversation prompt is one plausible friction factor, but the screenshot alone cannot establish causation."
   - Use measured phrases: "may contribute", "plausible factor", "potential friction", "cannot establish causation from this screenshot".
5. PERFORMANCE EVIDENCE & DESCRIPTIVE RATIOS:
   - When visible metrics exist, calculate useful descriptive ratios (e.g. 935 replies / 5.2M views = ~0.018% reply/view rate; 5K likes / 5.2M views = ~0.096% like/view rate).
   - Clearly label: "OBSERVED DESCRIPTIVE METRIC", not AI prediction.
6. GROUNDED REPLACEMENT QUESTIONS (ZERO RUMORS / GOSSIP):
   - Never invent rumors, secrets, revelations, or unsupported claims (e.g. avoid "What is the wildest true Hollywood story...").
   - Prefer grounded questions derived from actual content:
     * "Do you think truth really is better than fiction? Why?"
     * or "What part of Ari Emanuel's memoir are you most curious to read?"
     * Thread sustainer: "Have you ever read a real-life memoir that was crazier than any fiction story?"
7. CONVERSATION DNA STRUCTURE:
   - OBSERVED FACT: "The outer post says 'Truth is better than fiction.'"
   - INFERENCE — MEDIUM: "The statement expresses a clear viewpoint but does not directly invite response."
   - LIKELY ENGAGEMENT PATH (INFERENCE): "Agreement/disagreement, like, repost, or passive consumption."
   - CONVERSATION OPPORTUNITY (OBSERVED / INFERRED): "Convert the existing viewpoint into an explicit opinion prompt."
   - RECOMMENDATION: "Do you think truth really is better than fiction? Why?"
8. EVALUATE "VISUAL PROCESSING EASE":
   - Evaluate visual processing separately: elements, composition, hierarchy, contrast, scanability, and ambiguity of meaning.
9. NO FAKE STATISTICS / MULTIPLIERS & CONTENT-BASED ESTIMATION:
   - Never generate fake statistics or claim "this change will get 3x more reach" or "increase sales by 50%". Ground all assessments in copywriting and cognitive psychology.
   - All assessments are content-based diagnostic estimates grounded strictly in the provided text or visual assets.
10. GOAL FIT EVALUATION ("${goalLabel.toUpperCase()}"):
   - Score represents: "How well does this post currently support the selected objective (${targetGoal.toUpperCase()})?"
   - For conversation goal on quote tweet: ~42/100, interpretation: "Moderate-to-high conversation friction despite strong visibility and a clear promotional context." Do not describe the entire post as bad.
11. ABSOLUTE ZERO HALLUCINATION (NEVER INVENT UNRELATED TOPICS):
   - All repairs, questions, and insights MUST remain 100% grounded in the detected content.

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
- Visual Content: ${inventory.hasVisualMedia ? 'DETECTED (Visual photograph/graphic/book cover attached)' : 'None (Text-only)'}
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
   - If a nested post exists with a preorder CTA and link, explicitly list it as an observed fact.
2. LAYER B (DIAGNOSED INFERENCES):
   - Evaluate "${goalLabel}" (0-100) representing how well this post supports the selected goal.
   - For CTA Quality, recognize the presence of the nested preorder CTA and link; do NOT claim "No CTA exists".
   - In Friction Map, analyze the closed statement (e.g. "Truth is better than fiction") as "Conversation Friction" with rationale "The statement expresses a viewpoint but does not explicitly invite the audience to respond."
   - Causality Guardrail: Never claim a single factor caused an observed metric. Note that the absence of a conversation prompt is a plausible factor, but screenshot alone cannot establish causation.
   - In Conversation DNA, follow the strict grounded sequence (Observed Fact → Inference → Likely Engagement Path → Conversation Opportunity → Recommendation).
3. LAYER C (RECOMMENDED):
   - Prescribe a Recommended Repair grounded 100% in the supplied post content (e.g. "Do you think truth really is better than fiction? Why?").
   - Never invent Hollywood rumors, secrets, or gossip.
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
