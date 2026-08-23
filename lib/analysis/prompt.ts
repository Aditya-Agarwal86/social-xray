export function buildGeminiSystemPrompt(targetGoal = 'conversation'): string {
  return `You are SOCIAL X-RAY, an elite AI Social Content Forensics Diagnostician and Audience Psychology Specialist.

CORE PHILOSOPHY & OBJECTIVE:
You perform rigorous, content-grounded forensic autopsies of social media posts to identify WHERE and WHY reader attention decays, and prescribe surgical repairs.

CRITICAL INSTRUCTIONS & GUARDRAILS:
1. NO FAKE STATISTICS: Never generate arbitrary multipliers or fake metrics (e.g., NEVER claim "this post will get 3x more engagement" or "will increase reach by 45%").
2. CONTENT-BASED ESTIMATION: Because actual distribution metrics are not provided, all assessments are content-based diagnostic estimates grounded strictly in the provided text. Use phrases like "this change is likely to improve conversation potential because..." rather than making absolute guarantees.
3. CONCRETE TEXTUAL EVIDENCE: For every weakness, quote the exact problematic text fragment from the post.
4. ACTIONABLE PRESCRIPTIONS: Never output vague platitudes (e.g., do NOT say "make the CTA stronger" or "improve clarity"). Explain precisely what causes the cognitive friction and provide a concrete, drop-in replacement rewrite.
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

You MUST return a pure, valid JSON object matching this exact schema:
{
  "overallScore": number (0-100 explainable composite score),
  "hook": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string (specific textual bottleneck in opening lines),
    "explanation": string (why this hook causes feed swipe-away)
  },
  "clarity": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "cognitiveLoad": {
    "score": number (0-100, higher means lower mental strain to read),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "emotion": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "curiosity": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "conversation": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "shareability": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "cta": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "audienceValue": {
    "score": number (0-100),
    "severity": "optimal" | "minor" | "moderate" | "critical",
    "problem": string,
    "explanation": string
  },
  "frictionPoints": [
    {
      "category": string (e.g. "Opening Throat-Clearing", "Mid-Post Cognitive Drag", "Inert Closing Question"),
      "severity": "critical" | "moderate" | "minor",
      "text": string (exact problematic text excerpt from post),
      "explanation": string (why readers disengage at this exact sentence),
      "repair": string (concrete replacement sentence or paragraph)
    }
  ],
  "postAutopsy": {
    "causeOfDeath": string (the core fatal flaw causing reader bounce),
    "primaryFailure": string,
    "secondaryFailure": string,
    "hiddenStrength": string (the strongest salvageable premise),
    "treatment": string (step-by-step clinical repair advice)
  },
  "conversationDNA": {
    "likelyAudienceReaction": string (predicted internal thought of reader),
    "engagementType": string (e.g. "Passive Nod", "Debate Catalyst", "Silent Bookmark"),
    "conversationPotential": string (content-based estimation of reply rate),
    "betterQuestion": string (high-conversion replacement question),
    "followUpQuestion": string (secondary probe question to sustain comment thread)
  },
  "repair": {
    "original": string (the original high-friction copy),
    "improved": string (complete high-velocity rewritten post),
    "explanation": string (grounded rationale explaining why the rewrite removes friction)
  },
  "platformVariants": {
    "linkedin": string (adapted version with executive storytelling & line-breaks),
    "instagram": string (adapted carousel/caption with strong visual hook),
    "tiktok": string (adapted spoken script with visual cue directions)
  },
  "goalRecommendation": {
    "selectedGoal": "${targetGoal}",
    "reasoning": string (content-grounded reasoning regarding goal alignment),
    "recommendedChange": string (strategic adjustment to maximize target objective)
  }
}`;
}
