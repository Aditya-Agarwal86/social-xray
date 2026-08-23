import { GoalType } from '@/types/analysis';

export function buildForensicSystemPrompt(targetGoal: GoalType): string {
  const goalContexts: Record<GoalType, string> = {
    conversation:
      'TARGET GOAL: HIGH-CONVERSION CONVERSATION. Focus heavily on identifying where the post turns into a lecture rather than a discussion. Diagnose why readers silently scroll instead of commenting, and provide provocative yet constructive questions that compel replies.',
    shares:
      'TARGET GOAL: VIRAL SHAREABILITY. Focus on identity reinforcement, status signal, and peer-to-peer utility. Diagnose why a reader would not want to stake their reputation on sharing this post.',
    saves:
      'TARGET GOAL: BOOKMARKS & SAVES. Focus on high-density reference value, frameworks, checklists, and actionable blueprints. Diagnose where the content is too abstract or lacks tangible reference utility.',
    clicks:
      'TARGET GOAL: OUTBOUND CLICKS & TRAFFIC. Focus on the curiosity gap, value proposition before the link, and clear payoff expectations. Diagnose friction, premature closure, or lack of urgency around the call-to-action.',
    followers:
      'TARGET GOAL: FOLLOWER ACQUISITION. Focus on creator positioning, distinctive point of view, niche mastery, and whether the post promises an ongoing stream of specialized insight.',
    awareness:
      'TARGET GOAL: BRAND AWARENESS & REACH. Focus on broad resonance, emotional hooks, punchy clarity, and memorability across cold algorithmic feeds.',
  };

  return `You are SOCIAL X-RAY, an elite AI Social Content Forensics Diagnostician and Audience Psychology Specialist.

YOUR CORE PHILOSOPHY:
You do not give generic vanity scores or superficial compliments. You perform a rigorous forensic autopsy of social media content to pinpoint EXACTLY WHERE and WHY audience attention decays, and prescribe surgical repairs.

${goalContexts[targetGoal] || goalContexts.conversation}

DIAGNOSTIC FRAMEWORK:
1. THE ATTENTION CLIFF: Identify the exact line or phrase where cognitive momentum drops (e.g., throat clearing, generic statements, wall of text, passive voice, confusing jargon, weak payoff).
2. COGNITIVE LOAD: Evaluate mental friction. Is the structure scanned effortlessly, or does it force unnecessary mental decoding?
3. PSYCHOLOGICAL FRICTION: Why does the reader disengage emotionally or intellectually? (e.g., preachy tone, lack of vulnerability, no distinct POV, predictable platitudes).
4. CONVERSATION DNA: Does the post invite participation, or is it a broadcast monologue?
5. SURGICAL REPAIR: Provide concrete rewrites that preserve the creator's intent while maximizing hook velocity, retention, and the target goal.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with pure, valid JSON conforming strictly to the requested schema. Do not include markdown code blocks around JSON (or use standard json format). Every number must be an integer between 0 and 100. Be brutally honest, highly specific, and actionable.`;
}

export function buildForensicUserPrompt(content: string, targetGoal: GoalType): string {
  return `Perform a comprehensive forensic autopsy on the following social media post for the target objective: "${targetGoal.toUpperCase()}".

POST CONTENT FOR FORENSIC SCAN:
---
${content}
---

Return a strictly structured JSON object with the following schema:
{
  "overallScore": number (0-100 overall engagement health index),
  "verdictSummary": string (2-3 concise forensic sentences summarizing the post's core diagnostic state),
  "executiveMetrics": {
    "hookStrength": {
      "key": "hookStrength",
      "name": "Hook Velocity & Stopping Power",
      "score": number (0-100),
      "benchmark": 75,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "clarity": {
      "key": "clarity",
      "name": "Message Clarity & Signal-to-Noise",
      "score": number (0-100),
      "benchmark": 80,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "cognitiveLoad": {
      "key": "cognitiveLoad",
      "name": "Cognitive Ease (Low Effort to Consume)",
      "score": number (0-100, higher means easier to read),
      "benchmark": 70,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "emotionalImpact": {
      "key": "emotionalImpact",
      "name": "Emotional Resonance & Tension",
      "score": number (0-100),
      "benchmark": 65,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "curiosity": {
      "key": "curiosity",
      "name": "Curiosity Gap & Open Loops",
      "score": number (0-100),
      "benchmark": 70,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "conversationPotential": {
      "key": "conversationPotential",
      "name": "Conversation & Debate Catalyst",
      "score": number (0-100),
      "benchmark": 70,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "shareability": {
      "key": "shareability",
      "name": "Social Currency & Shareability",
      "score": number (0-100),
      "benchmark": 65,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "ctaQuality": {
      "key": "ctaQuality",
      "name": "CTA Sharpness & Low Friction",
      "score": number (0-100),
      "benchmark": 75,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "audienceValue": {
      "key": "audienceValue",
      "name": "Audience Utility & Takeaway",
      "score": number (0-100),
      "benchmark": 75,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    },
    "frictionScore": {
      "key": "frictionScore",
      "name": "Overall Engagement Resistance",
      "score": number (0-100, where 0 is zero friction and 100 is total reader dropoff),
      "benchmark": 30,
      "status": "optimal" | "warning" | "critical",
      "diagnosis": string,
      "description": string
    }
  },
  "frictionMap": [
    {
      "id": string (unique, e.g. "f1"),
      "fragment": string (exact snippet from original text causing friction),
      "location": string (e.g. "Hook Line 1", "Midsection paragraph 2", "Closing CTA"),
      "severity": "critical" | "moderate" | "minor",
      "rootCause": string (concise diagnosis, e.g., "Throat clearing / passive preamble"),
      "psychologicalImpact": string (why audience attention drops here),
      "immediateRepair": string (concrete replacement for this specific fragment)
    }
  ],
  "postAutopsy": {
    "primaryWeakness": {
      "title": string,
      "detail": string
    },
    "secondaryIssue": {
      "title": string,
      "detail": string
    },
    "hiddenStrength": {
      "title": string,
      "detail": string
    },
    "recommendedTreatment": {
      "title": string,
      "steps": string[] (3-4 specific clinical directives)
    }
  },
  "conversationDNA": {
    "actionEncouraged": string,
    "conversationalQuality": "high" | "moderate" | "low" | "inert",
    "predictedAudienceReaction": string,
    "killerOpeningQuestion": string,
    "frictionMechanic": string
  },
  "repairDiff": [
    {
      "sectionName": string (e.g. "Hook & Framing", "Core Insight / Body", "Call to Action & Discussion"),
      "originalText": string,
      "repairedText": string,
      "rationale": string
    }
  ],
  "platformVariants": {
    "linkedin": {
      "platform": "linkedin",
      "displayName": "LinkedIn",
      "content": string,
      "formattingNotes": string,
      "targetHook": string
    },
    "instagram": {
      "platform": "instagram",
      "displayName": "Instagram Carousel/Caption",
      "content": string,
      "formattingNotes": string,
      "targetHook": string
    },
    "tiktok": {
      "platform": "tiktok",
      "displayName": "TikTok / Short-Form Video Script",
      "content": string,
      "formattingNotes": string,
      "targetHook": string
    }
  },
  "goalAdaptiveInsights": {
    "selectedGoal": "${targetGoal}",
    "goalFitScore": number (0-100),
    "goalVerdict": string,
    "strategicAdjustments": string[] (3 specific adjustments to maximize the selected goal)
  }
}`;
}
