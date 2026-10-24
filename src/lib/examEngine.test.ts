import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areQuestionsSubstantiallySimilar,
  assessReadinessLevel,
  calculateAdaptiveTopicWeights,
  calculateExamScore,
  computeContentHash,
  computeSemanticSignature,
  selectFreshMockQuestions,
  verifyQuestionPipeline,
} from './examEngine';
import { ExamConfiguration, QuestionItem } from '../types/exam';

const sampleConfig: ExamConfiguration = {
  id: 'wbpsc_clerkship_2023_part1',
  examinationName: 'WBPSC Clerkship Examination (Part-I)',
  advertisementNumber: '13/2023',
  schemeVersion: '2023 Official Scheme v1.0',
  effectiveDate: '2023-12-08',
  examinationYear: 2023,
  stage: 'Part-I (Objective MCQ)',
  totalQuestions: 100,
  totalMarks: 100,
  durationSeconds: 5400,
  marksPerQuestion: 1,
  negativeMarkingPerWrong: 0.25,
  sections: [
    { subject: 'English', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
    { subject: 'General Studies', questionCount: 40, marksPerQuestion: 1, negativeMarks: 0.25 },
    { subject: 'Arithmetic', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
  ],
  officialSourceUrl: 'https://psc.wb.gov.in/',
  verificationStatus: 'OFFICIALLY_VERIFIED',
  verificationNote: 'Verified against WBPSC Advt. No. 13/2023 official scheme.',
  syllabusSummary: {
    English: ['Synonyms & Antonyms', 'Prepositions', 'Voice Change', 'Narration', 'Tense & Correct Usage'],
    'General Studies': ['Indian History', 'Geography of West Bengal & India', 'General Science', 'Indian Polity & Constitution'],
    Arithmetic: ['Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Simple & Compound Interest', 'Time & Work'],
  },
  updatedAt: '2026-10-23T00:00:00Z',
};

function makeQuestion(overrides: Partial<QuestionItem> = {}): QuestionItem {
  const questionText = overrides.questionText ?? 'If 20% of a number is 50, what is the number?';
  const options = overrides.options ?? { A: '200', B: '250', C: '300', D: '150' };
  const subject = overrides.subject ?? 'Arithmetic';
  const topic = overrides.topic ?? 'Percentage';

  return {
    id: overrides.id ?? 'q_test_1',
    questionOrigin: overrides.questionOrigin ?? 'AUTHENTIC_PYQ',
    sourceDocumentId: overrides.sourceDocumentId ?? 'src_wbpsc_2019_s1',
    examConfigurationId: 'wbpsc_clerkship_2023_part1',
    examinationYear: overrides.examinationYear ?? 2019,
    sessionShift: 'Shift 1',
    originalQuestionNumber: 45,
    subject,
    topic,
    difficulty: overrides.difficulty ?? 'easy',
    questionText,
    options,
    correctAnswer: overrides.correctAnswer ?? 'B',
    answerKeyStatus: overrides.answerKeyStatus ?? 'FINAL_VERIFIED',
    verificationStatus: overrides.verificationStatus ?? 'VERIFIED',
    contentHash: computeContentHash(questionText, options),
    semanticSignature: computeSemanticSignature(subject, topic, questionText),
    numericVerification: overrides.numericVerification ?? {
      formulaDescription: '50 / 0.20',
      expectedValue: 250,
      computedValue: 50 / 0.2,
    },
    teacherExplanation: {
      yourAnswerSummaryBn: 'তোমার নির্বাচিত উত্তর',
      yourAnswerSummaryEn: 'Your selected answer',
      correctAnswerSummaryBn: 'সঠিক উত্তর B (250)',
      correctAnswerSummaryEn: 'Correct answer B (250)',
      simpleConceptBn: 'শতকরা বা Percentage মানে প্রতি ১০০-তে কত।',
      simpleConceptEn: 'Percentage means out of 100.',
      whyWrongByOptionBn: { A: '200 এর ২০% হলো ৪০, ৫০ নয়।' },
      whyWrongByOptionEn: { A: '20% of 200 is 40, not 50.' },
      whyCorrectStepByStepBn: ['ধাপ ১: সংখ্যাটির ২০% = ৫০', 'ধাপ ২: ১% = ৫০ ÷ ২০ = ২.৫', 'ধাপ ৩: ১০০% = ২.৫ × ১০০ = ২৫০'],
      whyCorrectStepByStepEn: ['Step 1: 20% = 50', 'Step 2: 100% = (50 / 20) * 100 = 250'],
      everydayExampleBn: 'ধরো তোমার কাছে কিছু টাকা আছে যার ৫ ভাগের ১ ভাগ হলো ৫০ টাকা, তাহলে মোট টাকা ২৫০ টাকা।',
      everydayExampleEn: 'If 1/5th of your pocket money is Rs 50, total money is Rs 250.',
      memoryTrickBn: '২০% মানে ১/৫ অংশ, তাই ৫০ × ৫ = ২৫০।',
      memoryTrickEn: '20% = 1/5, so multiply by 5.',
      followUpQuestion: {
        id: 'fu_1',
        questionText: 'If 25% of a number is 40, what is the number?',
        options: { A: '120', B: '160', C: '180', D: '200' },
        correctAnswer: 'B',
        simpleHintBn: '২৫% মানে চার ভাগের এক ভাগ (১/৪)।',
        simpleHintEn: '25% is 1/4th of the whole.',
      },
      encouragementBn: 'চমৎকার চেষ্টা! এভাবে ধাপে ধাপে ভাবলেই অঙ্ক জলের মতো সহজ হয়ে যাবে।',
      encouragementEn: 'Great effort! Step-by-step thinking makes math easy.',
    },
    createdAt: '2026-10-23T00:00:00Z',
  };
}

test('calculateExamScore applies exact +1 / -0.25 WBPSC Clerkship Part-I negative marking', () => {
  const q1 = makeQuestion({ id: 'q1', subject: 'English', topic: 'Prepositions', correctAnswer: 'A', numericVerification: undefined });
  const q2 = makeQuestion({ id: 'q2', subject: 'General Studies', topic: 'Indian History', correctAnswer: 'C', numericVerification: undefined });
  const q3 = makeQuestion({ id: 'q3', subject: 'Arithmetic', topic: 'Percentage', correctAnswer: 'B' });
  const q4 = makeQuestion({ id: 'q4', subject: 'Arithmetic', topic: 'Percentage', correctAnswer: 'D', numericVerification: undefined });
  const q5 = makeQuestion({ id: 'q5', subject: 'English', topic: 'Voice Change', correctAnswer: 'B', numericVerification: undefined });

  // 3 correct (q1, q2, q3), 1 incorrect (q4), 1 unanswered (q5) -> 3 * 1 - 1 * 0.25 = 2.75
  const result = calculateExamScore(
    sampleConfig,
    [q1, q2, q3, q4, q5],
    {
      q1: { questionId: 'q1', selectedOption: 'A', markedForReview: false, timeSpentSeconds: 20 },
      q2: { questionId: 'q2', selectedOption: 'C', markedForReview: false, timeSpentSeconds: 25 },
      q3: { questionId: 'q3', selectedOption: 'B', markedForReview: true, timeSpentSeconds: 40 },
      q4: { questionId: 'q4', selectedOption: 'A', markedForReview: false, timeSpentSeconds: 30 },
    },
    115,
    2
  );

  assert.equal(result.correctCount, 3);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unansweredCount, 1);
  assert.equal(result.positiveMarks, 3);
  assert.equal(result.negativeMarksDeducted, 0.25);
  assert.equal(result.finalScore, 2.75);
  assert.equal(result.accuracyPercent, 75);
  assert.equal(result.transparentFormula, '3 × 1 − (1 × 0.25) = 2.75 / 5');
});

test('areQuestionsSubstantiallySimilar detects superficial numerical/name changes and option permutations', () => {
  const original = makeQuestion({
    id: 'q_orig',
    questionText: 'If Ram sells a book for Rs 200 and gains 20%, what is the cost price?',
    options: { A: '150', B: '166.67', C: '180', D: '175' },
    topic: 'Profit & Loss',
  });

  // Superficial name change (Ram -> Shyam) and number change (200 -> 300, 20% -> 25%)
  const superficialClone = makeQuestion({
    id: 'q_clone',
    questionText: 'If Shyam sells a book for Rs 300 and gains 25%, what is the cost price?',
    options: { A: '240', B: '250', C: '220', D: '260' },
    topic: 'Profit & Loss',
  });

  // Genuinely different Profit & Loss question
  const distinctConcept = makeQuestion({
    id: 'q_distinct',
    questionText: 'A shopkeeper marks his goods 40% above cost price and allows a discount of 15%. Find his net profit percentage.',
    options: { A: '19%', B: '21%', C: '25%', D: '17%' },
    topic: 'Profit & Loss',
  });

  assert.equal(areQuestionsSubstantiallySimilar(original, superficialClone), true);
  assert.equal(areQuestionsSubstantiallySimilar(original, distinctConcept), false);
});

test('verifyQuestionPipeline validates all 10 mandatory steps and rejects mathematically wrong or duplicate questions', () => {
  const validQ = makeQuestion({ id: 'q_valid_1' });
  const check1 = verifyQuestionPipeline(validQ, sampleConfig.syllabusSummary, []);
  assert.equal(check1.passed, true);
  assert.equal(check1.checks.length, 10);

  // Wrong math calculation should fail step 6
  const badMathQ = makeQuestion({
    id: 'q_bad_math',
    numericVerification: {
      formulaDescription: '50 / 0.20',
      expectedValue: 999, // Does not match 250
      computedValue: 250,
    },
  });
  const check2 = verifyQuestionPipeline(badMathQ, sampleConfig.syllabusSummary, []);
  assert.equal(check2.passed, false);
  assert.equal(check2.checks.find((c) => c.step === 6)?.passed, false);

  // Duplicate against existing pool should fail step 9
  const duplicateQ = makeQuestion({ id: 'q_dup_2' });
  const check3 = verifyQuestionPipeline(duplicateQ, sampleConfig.syllabusSummary, [validQ]);
  assert.equal(check3.passed, false);
  assert.equal(check3.checks.find((c) => c.step === 9)?.passed, false);
});

test('selectFreshMockQuestions strictly excludes seen question IDs in FRESH_MOCK mode and includes mistakes in MISTAKE_REVISION mode', () => {
  const q1 = makeQuestion({ id: 'q_eng_1', subject: 'English', topic: 'Prepositions', questionText: 'He died ___ cholera.', options: { A: 'of', B: 'from', C: 'by', D: 'with' }, numericVerification: undefined });
  const q2 = makeQuestion({ id: 'q_gs_1', subject: 'General Studies', topic: 'Indian History', questionText: 'Who founded the Atmiya Sabha in 1815?', options: { A: 'Raja Rammohan Roy', B: 'Vidyasagar', C: 'Debendranath Tagore', D: 'Keshab Chandra Sen' }, numericVerification: undefined });
  const q3 = makeQuestion({ id: 'q_arith_1', subject: 'Arithmetic', topic: 'Percentage', questionText: 'If 20% of a number is 50, what is the number?' });

  const pool = [q1, q2, q3];
  const seen = new Set(['q_eng_1']);

  const freshSelection = selectFreshMockQuestions(pool, seen, 3, 'FRESH_MOCK');
  assert.equal(freshSelection.selected.some((q) => q.id === 'q_eng_1'), false);
  assert.equal(freshSelection.selected.length, 2);
  assert.ok(freshSelection.limitationNotice);

  // Revision mode should allow revisiting q_eng_1 when it is in mistakeQuestionIds
  const revisionSelection = selectFreshMockQuestions(pool, seen, 1, 'MISTAKE_REVISION', new Set(['q_eng_1']));
  assert.equal(revisionSelection.selected.length, 1);
  assert.equal(revisionSelection.selected[0].id, 'q_eng_1');
});

test('assessReadinessLevel and calculateAdaptiveTopicWeights prioritize weak topics accurately', () => {
  const beginner = assessReadinessLevel(40, 30, 1);
  assert.equal(beginner.label, 'Beginner');

  const strong = assessReadinessLevel(88, 82, 5);
  assert.equal(strong.label, 'Strong Practice Performance');

  const weights = calculateAdaptiveTopicWeights([
    { subject: 'Arithmetic', topic: 'Time & Work', attempts: 10, correct: 3, incorrect: 7, accuracyPercent: 30, masteryScore: 30, lastPracticedAt: '2026-10-20', needsRevision: true },
    { subject: 'English', topic: 'Prepositions', attempts: 10, correct: 9, incorrect: 1, accuracyPercent: 90, masteryScore: 90, lastPracticedAt: '2026-10-22', needsRevision: false },
  ]);
  assert.equal(weights[0].topic, 'Time & Work');
  assert.equal(weights[0].recommendedDifficulty, 'easy');
});

test('all verified questions in INITIAL_QUESTIONS_POOL have both English and Bengali stems, why-correct explanations, and easy tricks', async () => {
  const { INITIAL_QUESTIONS_POOL } = await import('../data/wbpscQuestions');
  const verifiedQuestions = INITIAL_QUESTIONS_POOL.filter((q) => q.verificationStatus === 'VERIFIED');
  assert.ok(verifiedQuestions.length >= 100, `Expected at least 100 verified questions, found ${verifiedQuestions.length}`);

  for (const q of verifiedQuestions) {
    assert.ok(q.questionText && q.questionText.trim().length > 0, `Question ${q.id} missing English questionText`);
    assert.ok(q.questionTextBn && q.questionTextBn.trim().length > 0, `Question ${q.id} missing Bengali questionTextBn`);
    assert.ok(q.teacherExplanation.simpleConceptBn && q.teacherExplanation.simpleConceptBn.trim().length > 0, `Question ${q.id} missing simpleConceptBn`);
    assert.ok(q.teacherExplanation.memoryTrickBn && q.teacherExplanation.memoryTrickBn.trim().length > 0, `Question ${q.id} missing memoryTrickBn`);
  }
});

test('englishGameEngine evaluates combo multipliers, XP ranks, 50:50 lifelines, shield protection, and world decks', async () => {
  const {
    calculatePlayerRank,
    evaluateGameTurn,
    getComboMultiplier,
    getFiftyFiftyEliminatedOptions,
    selectQuestionsForEnglishWorld,
  } = await import('./englishGameEngine');
  const { INITIAL_QUESTIONS_POOL } = await import('../data/wbpscQuestions');

  // Combo multiplier progression
  assert.equal(getComboMultiplier(1), 1);
  assert.equal(getComboMultiplier(2), 1.5);
  assert.equal(getComboMultiplier(3), 2);
  assert.equal(getComboMultiplier(5), 3);

  // Rank progression
  const rookie = calculatePlayerRank(120);
  assert.equal(rookie.level, 1);
  assert.equal(rookie.titleEn, 'English Rookie');
  const champion = calculatePlayerRank(2500);
  assert.equal(champion.level, 5);
  assert.equal(champion.titleEn, 'WBPSC English Champion');

  // 50:50 lifeline never eliminates the correct option
  for (const correct of ['A', 'B', 'C', 'D'] as const) {
    const eliminated = getFiftyFiftyEliminatedOptions(correct);
    assert.equal(eliminated.length, 2);
    assert.equal(eliminated.includes(correct), false);
  }

  // Correct turn evaluation with combo and Boss HP damage
  const hitTurn = evaluateGameTurn({
    selectedOption: 'B',
    correctOption: 'B',
    currentCombo: 2,
    maxCombo: 2,
    currentHearts: 3,
    bossHpRemaining: 100,
    totalQuestionsInQuest: 10,
    baseXpPerCorrect: 100,
    shieldActive: false,
    difficultyMode: 'ARCADE_HEARTS',
  });
  assert.equal(hitTurn.isCorrect, true);
  assert.equal(hitTurn.newCombo, 3);
  assert.equal(hitTurn.multiplier, 2);
  assert.equal(hitTurn.xpEarned, 200);
  assert.equal(hitTurn.bossHpRemaining, 90);

  // Wrong turn with Shield active preserves hearts
  const shieldedTurn = evaluateGameTurn({
    selectedOption: 'A',
    correctOption: 'B',
    currentCombo: 3,
    maxCombo: 3,
    currentHearts: 1,
    bossHpRemaining: 90,
    totalQuestionsInQuest: 10,
    baseXpPerCorrect: 100,
    shieldActive: true,
    difficultyMode: 'ARCADE_HEARTS',
  });
  assert.equal(shieldedTurn.isCorrect, false);
  assert.equal(shieldedTurn.newHearts, 1);
  assert.equal(shieldedTurn.shieldConsumed, true);
  assert.equal(shieldedTurn.isGameOver, false);

  // Wrong turn on last heart in Arcade mode triggers game over
  const fatalTurn = evaluateGameTurn({
    selectedOption: 'A',
    correctOption: 'B',
    currentCombo: 0,
    maxCombo: 3,
    currentHearts: 1,
    bossHpRemaining: 90,
    totalQuestionsInQuest: 10,
    baseXpPerCorrect: 100,
    shieldActive: false,
    difficultyMode: 'ARCADE_HEARTS',
  });
  assert.equal(fatalTurn.newHearts, 0);
  assert.equal(fatalTurn.isGameOver, true);

  // World question deck selection returns English questions only
  const prepDeck = selectQuestionsForEnglishWorld(INITIAL_QUESTIONS_POOL, 'WORLD_1_PREPOSITION');
  assert.equal(prepDeck.length, 8);
  assert.equal(prepDeck.every((q) => q.subject === 'English'), true);
});


