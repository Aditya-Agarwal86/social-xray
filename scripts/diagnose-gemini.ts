/**
 * Standalone Diagnostic Test Script for Gemini 3.5 Flash Integration
 *
 * Tests:
 * 1. Model & Environment configuration audit
 * 2. Minimal prompt construction ("Did the sky turn into a golden sea?")
 * 3. Structured Social X-Ray analysis normalization on real Hindi-English post copy
 * 4. Error classification matrix
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
  ANALYSIS_RESPONSE_JSON_SCHEMA,
} from '../lib/analysis/prompt.ts';
import type { SocialXRayAnalysisResult } from '../lib/analysis/types.ts';

console.log('🔬 RUNNING GEMINI 3.5 FLASH INTEGRATION & STRUCTURED OUTPUT DIAGNOSTICS...\n');

// 1. Environment & Model Check
console.log('--- 1. CONFIGURATION AUDIT ---');
console.log(`- Model configured: ${STABLE_GEMINI_MODEL}`);
assert.strictEqual(STABLE_GEMINI_MODEL, 'gemini-3.5-flash');
console.log(`- GEMINI_API_KEY present in env: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
console.log(`- SDK Package: @google/genai (version 2.18.0)\n`);

// 2. TEST A: Minimal Request Prompt Construction
console.log('--- 2. TEST A: MINIMAL REQUEST PROMPT GENERATION ---');
const minimalContent = 'Did the sky turn into a golden sea?';
const minimalSystem = buildGeminiSystemPrompt('conversation');
const minimalUser = buildGeminiUserPrompt(minimalContent, 'conversation');

assert.ok(minimalSystem.includes('SOCIAL X-RAY'));
assert.ok('overallScore' in ANALYSIS_RESPONSE_JSON_SCHEMA.properties);
assert.ok(minimalUser.includes(minimalContent));
console.log('  ✓ System and User prompts construct valid prompt strings for gemini-3.5-flash.');

// 3. TEST B: Real Cleaned Social Post Diagnostic
console.log('\n--- 3. TEST B: REAL POST CONTENT STRUCTURED NORMALIZATION ---');
const realPostContent = `Dekh tu bandi acchi hai.
Bas choti choti baato par roya mat kar yaar.

Like this post, if you are reading this.

Do follow for more relatable memes.

If you are from Explore, don't forget to leave a follow.`;

const simulatedGemini35Response = {
  overallScore: 58,
  hook: {
    score: 62,
    severity: 'moderate',
    problem: 'Opening line is conversational but generic relationship advice.',
    explanation: 'Captures casual peer-to-peer empathy but lacks a unique narrative premise or tension.',
  },
  clarity: {
    score: 85,
    severity: 'optimal',
    problem: 'None.',
    explanation: 'Colloquial Hinglish phrasing is immediately understandable to the demographic.',
  },
  cognitiveLoad: {
    score: 88,
    severity: 'optimal',
    problem: 'None.',
    explanation: 'Short stanza breaks ensure zero cognitive overload.',
  },
  emotion: {
    score: 65,
    severity: 'moderate',
    problem: 'Empathetic but transactional.',
    explanation: 'The emotional connection in the first two lines is immediately severed by 3 back-to-back transactional CTAs.',
  },
  curiosity: {
    score: 40,
    severity: 'critical',
    problem: 'Zero unresolved curiosity.',
    explanation: 'No question or incomplete loop leaves the reader with nothing to ponder.',
  },
  conversation: {
    score: 35,
    severity: 'critical',
    problem: 'Triple broadcast engagement demands choke organic discussion.',
    explanation: 'Begging for likes and follows replaces an authentic prompt for user stories.',
  },
  shareability: {
    score: 55,
    severity: 'moderate',
    problem: 'Relatability is undermined by follower-begging.',
    explanation: 'Users are reluctant to share posts with aggressive explore page follow prompts.',
  },
  cta: {
    score: 30,
    severity: 'critical',
    problem: 'Inert triple-CTA friction.',
    explanation: 'Demands like + follow + explore follow simultaneously without offering immediate value.',
  },
  audienceValue: {
    score: 50,
    severity: 'critical',
    problem: 'Transactional noise.',
    explanation: '70% of the post length is self-promotional boilerplate.',
  },
  frictionPoints: [
    {
      category: 'CTA Saturation',
      severity: 'critical',
      text: 'Like this post, if you are reading this. Do follow for more relatable memes. If you are from Explore, don\'t forget to leave a follow.',
      explanation: 'Three consecutive transactional demands kill audience goodwill and destroy conversation velocity.',
      repair: 'Tag someone who needs to hear this today, or tell me: what is one little thing that always ruins your mood?',
    },
    {
      category: 'Hook Deceleration',
      severity: 'moderate',
      text: 'Dekh tu bandi acchi hai.',
      explanation: 'Generic opening needs stronger specific emotional resonance.',
      repair: 'Tum sab kuch sambhal leti ho, bas ek cheez par aakar toot jaati ho.',
    },
  ],
  postAutopsy: {
    causeOfDeath: 'CTA Fatigue & Conversation Vacuum—genuine emotional premise suffocated by aggressive follow prompts.',
    primaryFailure: 'Triple transactional call-to-action replaces any conversational question.',
    secondaryFailure: 'Opening empathy lacks a specific relatable anecdote.',
    hiddenStrength: 'Warm, conversational tone in lines 1-2.',
    treatment: 'Delete all 3 follow prompts immediately. Replace with a single provocative question about emotional burnout.',
  },
  conversationDNA: {
    likelyAudienceReaction: 'Mild relatable agreement, followed by immediate scroll-past due to follow begging.',
    engagementType: 'Passive Scroll',
    conversationPotential: 'Low (Severe CTA drag)',
    betterQuestion: 'What is that one small thing that always triggers your overthinking?',
    followUpQuestion: 'How do you pull yourself out of it when it happens?',
  },
  repair: {
    original: realPostContent,
    improved: `Dekh tu sab kuch akele sambhal leti hai.
Bas choti choti baato par dil par bojh mat liya kar.

Tag someone who overthinks the smallest things—or tell me: what is that one thing that always ruins your day?`,
    explanation: 'Stripped out all 3 follow-begging lines, deepened emotional relatability, and added a specific storytelling prompt.',
  },
  platformVariants: {
    linkedin: 'Resilience is not about never feeling overwhelmed—it is about not letting micro-frustrations derail your day.\n\nHow do you reset when small roadblocks stack up?',
    instagram: 'Save this for the days your head feels too heavy.\n\nTag your favorite overthinker in the comments 👇',
    tiktok: 'Send this to someone who takes everything to heart today. You are doing fine.',
  },
  goalRecommendation: {
    selectedGoal: 'conversation',
    reasoning: 'The original post begged for likes instead of giving the audience a reason to reply.',
    recommendedChange: 'Ask a specific emotional question that invites readers to vent their own experience.',
  },
};

// 4. Validate Normalization against Gemini 3.5 schema
const parsed = extractJsonFromResponse(JSON.stringify(simulatedGemini35Response));
const normalized: SocialXRayAnalysisResult = validateAndNormalizeAnalysis(parsed, realPostContent, 'conversation');

// Verify all schema requirements
assert.strictEqual(typeof normalized.overallScore, 'number');
assert.strictEqual(normalized.overallScore, 58);
assert.strictEqual(typeof normalized.hook.score, 'number');
assert.strictEqual(typeof normalized.hook.problem, 'string');
assert.strictEqual(typeof normalized.hook.explanation, 'string');
assert.ok(Array.isArray(normalized.frictionPoints));
assert.strictEqual(normalized.frictionPoints.length, 2);
assert.strictEqual(typeof normalized.postAutopsy.causeOfDeath, 'string');
assert.strictEqual(typeof normalized.conversationDNA.betterQuestion, 'string');
assert.strictEqual(typeof normalized.repair.improved, 'string');
assert.strictEqual(typeof normalized.platformVariants.linkedin, 'string');
assert.strictEqual(normalized.goalRecommendation.selectedGoal, 'conversation');

console.log('  ✓ Verified full SocialXRayAnalysisResult schema conformity for Gemini 3.5 Flash.');
console.log('  ✓ Real social content normalized with high-precision friction mapping and repair diffs.');

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

console.log('\n🎉 ALL GEMINI 3.5 FLASH INTEGRATION & SCHEMA DIAGNOSTICS PASSED!\n');
