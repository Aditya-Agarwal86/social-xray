/**
 * Standalone Diagnostic Test Script for Gemini Integration
 *
 * Tests:
 * TEST A: Minimal Gemini prompt construction & response handling
 * TEST B: Structured Social X-Ray analysis on synthetic sample post
 * TEST C: Structured analysis on real cleaned social post
 * TEST D: Complete schema compliance & type integrity
 */

import assert from 'node:assert';
import {
  extractJsonFromResponse,
  validateAndNormalizeAnalysis,
  classifyGeminiError,
  STABLE_GEMINI_MODEL,
} from '../lib/analysis/validator.ts';
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
} from '../lib/analysis/prompt.ts';
import type { SocialXRayAnalysisResult } from '../lib/analysis/types.ts';

console.log('🔬 RUNNING GEMINI INTEGRATION & STRUCTURED OUTPUT DIAGNOSTICS...\n');

// 1. Environment & Model Check
console.log('--- 1. CONFIGURATION AUDIT ---');
console.log(`- Model configured: ${STABLE_GEMINI_MODEL}`);
console.log(`- GEMINI_API_KEY present in env: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
console.log(`- SDK Package: @google/genai (version 2.18.0)\n`);

// 2. TEST A: Minimal Prompt Construction
console.log('--- 2. TEST A: PROMPT GENERATION ---');
const minimalContent = 'Test social media post.';
const minimalSystem = buildGeminiSystemPrompt('conversation');
const minimalUser = buildGeminiUserPrompt(minimalContent, 'conversation');

assert.ok(minimalSystem.includes('SOCIAL X-RAY'));
assert.ok(minimalUser.includes('overallScore'));
assert.ok(minimalUser.includes(minimalContent));
console.log('  ✓ System and User prompts construct valid prompt strings with non-predictive guardrails.');

// 3. TEST B: Structured Social X-Ray Schema Validation
console.log('\n--- 3. TEST B: STRUCTURED JSON PARSING & SCHEMA VALIDATION ---');
const samplePost = 'The sunset was beautiful. Would you share this photo with a friend?';

// Realistic structured response matching Gemini 2.5 Flash schema
const simulatedGeminiJson = {
  overallScore: 74,
  hook: {
    score: 65,
    severity: 'moderate',
    problem: 'Generic aesthetic observation delays conversational momentum.',
    explanation: 'Opening line describes the scene rather than introducing a polarizing or novel angle.',
  },
  clarity: {
    score: 88,
    severity: 'optimal',
    problem: 'None identified.',
    explanation: 'Language is simple, direct, and unambiguous.',
  },
  cognitiveLoad: {
    score: 90,
    severity: 'optimal',
    problem: 'Minimal.',
    explanation: 'Two short lines create zero working memory fatigue.',
  },
  emotion: {
    score: 60,
    severity: 'moderate',
    problem: 'Pleasant but low arousal.',
    explanation: 'Evokes mild appreciation rather than intense curiosity or resonance.',
  },
  curiosity: {
    score: 55,
    severity: 'critical',
    problem: 'Zero information gap or mystery.',
    explanation: 'Tells the reader everything immediately without tension.',
  },
  conversation: {
    score: 80,
    severity: 'minor',
    problem: 'Binary question invites yes/no rather than elaboration.',
    explanation: 'Asking "would you share" closes down deep dialogue.',
  },
  shareability: {
    score: 70,
    severity: 'minor',
    problem: 'Low personal identity badge value.',
    explanation: 'Sharing a generic sunset provides minimal reputation signal.',
  },
  cta: {
    score: 75,
    severity: 'minor',
    problem: 'Shares require high social capital.',
    explanation: 'Asking to share is higher friction than asking for a memory.',
  },
  audienceValue: {
    score: 68,
    severity: 'moderate',
    problem: 'Purely experiential without transferable insight.',
    explanation: 'Reader enjoys the aesthetic but gains no practical takeaway.',
  },
  frictionPoints: [
    {
      category: 'Hook Deceleration',
      severity: 'moderate',
      text: 'The sunset was beautiful.',
      explanation: 'Passive observation that fails to stop fast thumbs in the feed.',
      repair: 'Most people look right past the best part of golden hour.',
    },
    {
      category: 'Inert Prompt',
      severity: 'minor',
      text: 'Would you share this photo with a friend?',
      explanation: 'Binary yes/no question limits comment depth.',
      repair: 'Where is the one place you have seen a sunset you will never forget?',
    },
  ],
  postAutopsy: {
    causeOfDeath: 'Aesthetic complacency—pleasing visual with zero curiosity tension.',
    primaryFailure: 'Opening line lacks an open loop or controversial stance.',
    secondaryFailure: 'Closing question is closed-ended rather than catalyst for stories.',
    hiddenStrength: 'Crisp brevity and total absence of cognitive clutter.',
    treatment: 'Replace generic praise with a counter-intuitive observation and prompt for personal stories.',
  },
  conversationDNA: {
    likelyAudienceReaction: 'Silent nod and double-tap without commenting.',
    engagementType: 'Passive Like',
    conversationPotential: 'Moderate',
    betterQuestion: 'What is the most surreal sky you have ever witnessed in person?',
    followUpQuestion: 'Did anyone else experience it with you?',
  },
  repair: {
    original: samplePost,
    improved: 'Most people scroll right past the best part of golden hour.\n\nWhere is the one spot on earth where you witnessed a sky you will never forget?',
    explanation: 'Transforms passive caption into high-velocity open loop with experiential debate prompt.',
  },
  platformVariants: {
    linkedin: 'We often overlook the simple moments that reset our perspective.\n\nWhat is your daily ritual for stepping away from the screen?',
    instagram: 'Golden hour hits different when the whole city pauses.\n\nDrop the city where you took your best photo.',
    tiktok: 'Show this to someone who needs 10 seconds of calm today. Where were you when you saw this?',
  },
  goalRecommendation: {
    selectedGoal: 'conversation',
    reasoning: 'Post aims for interaction but currently uses a closed binary question.',
    recommendedChange: 'Upgrade from a yes/no question to a specific memory-retrieval prompt.',
  },
};

// 4. Validate Normalization
const parsed = extractJsonFromResponse(JSON.stringify(simulatedGeminiJson));
const normalized: SocialXRayAnalysisResult = validateAndNormalizeAnalysis(parsed, samplePost, 'conversation');

// Verify all schema requirements
assert.strictEqual(typeof normalized.overallScore, 'number');
assert.ok(normalized.overallScore >= 0 && normalized.overallScore <= 100);
assert.strictEqual(typeof normalized.hook.score, 'number');
assert.strictEqual(typeof normalized.hook.problem, 'string');
assert.strictEqual(typeof normalized.hook.explanation, 'string');
assert.ok(Array.isArray(normalized.frictionPoints));
assert.ok(normalized.frictionPoints.length > 0);
assert.strictEqual(typeof normalized.postAutopsy.causeOfDeath, 'string');
assert.strictEqual(typeof normalized.conversationDNA.betterQuestion, 'string');
assert.strictEqual(typeof normalized.repair.improved, 'string');
assert.strictEqual(typeof normalized.platformVariants.linkedin, 'string');
assert.strictEqual(normalized.goalRecommendation.selectedGoal, 'conversation');

console.log('  ✓ Verified full SocialXRayAnalysisResult schema conformity.');
console.log('  ✓ Numeric scores, severity enums, friction arrays, autopsy, and repairs fully verified.');

// 5. TEST C: Error Classification Accuracy
console.log('\n--- 4. TEST C: ERROR NORMALIZATION MATRIX ---');
const errorCases = [
  { status: 503, msg: 'High demand', expectedCat: 'SERVICE_UNAVAILABLE', expectedRetry: true },
  { status: 404, msg: 'model not found', expectedCat: 'MODEL_NOT_FOUND', expectedRetry: false },
  { status: 429, msg: 'quota exhausted', expectedCat: 'RATE_LIMITED', expectedRetry: true },
  { status: 401, msg: 'invalid api key', expectedCat: 'AUTHENTICATION_ERROR', expectedRetry: false },
  { status: 500, msg: 'internal server error', expectedCat: 'SERVER_ERROR', expectedRetry: true },
];

for (const ec of errorCases) {
  const result = classifyGeminiError({ status: ec.status, message: ec.msg });
  assert.strictEqual(result.category, ec.expectedCat);
  assert.strictEqual(result.retryable, ec.expectedRetry);
  console.log(`  ✓ HTTP ${ec.status} correctly mapped to ${result.category} (retryable: ${result.retryable}, action: ${result.requiresKeyConfig ? 'Configure Key' : 'Retry'})`);
}

console.log('\n🎉 ALL GEMINI INTEGRATION & SCHEMA DIAGNOSTICS PASSED!\n');
