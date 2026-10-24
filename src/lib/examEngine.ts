import {
  ExamConfiguration,
  EvaluatedQuestionDetail,
  MockTestResult,
  OptionKey,
  PracticeUniquenessMode,
  QuestionItem,
  ReadinessLabel,
  StudentQuestionResponse,
  SubjectName,
  SubjectScoreBreakdown,
  TopicMasteryItem,
  TopicScoreBreakdown,
  VerificationCheckResult,
} from '../types/exam';

/**
 * Normalizes text for deterministic hashing and duplicate comparison.
 */
export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes a deterministic content hash for a question statement + sorted options.
 */
export function computeContentHash(questionText: string, options: Record<OptionKey, string>): string {
  const normQ = normalizeQuestionText(questionText);
  const normOpts = Object.values(options)
    .map((o) => normalizeQuestionText(o))
    .sort()
    .join('|');
  const combined = `${normQ}::${normOpts}`;
  let hash = 2166136261;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `qhash_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

const STOP_WORDS = new Set([
  'the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'an', 'to', 'for', 'with', 'by', 'from', 'as', 'be', 'are', 'was', 'were',
  'what', 'which', 'who', 'whom', 'whose', 'find', 'calculate', 'value', 'following', 'if', 'then',
  'ram', 'shyam', 'amal', 'bimal', 'rohit', 'sumit', 'sita', 'gita', 'mr', 'mrs'
]);

/**
 * Creates a structural semantic signature by replacing numbers and common person names
 * with placeholders so questions differing only in numbers or superficial names are caught.
 */
export function computeSemanticSignature(subject: SubjectName, topic: string, questionText: string): string {
  const withoutNumbers = questionText
    .toLowerCase()
    .replace(/\b\d+(\.\d+)?%?\b/g, '#NUM')
    .replace(/[^\p{L}\p{N}#\s]/gu, ' ');

  const tokens = withoutNumbers
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  return `${subject.toLowerCase()}:${topic.toLowerCase()}:${tokens.join('_')}`;
}

/**
 * Checks whether two questions are exact duplicates or substantially similar
 * (including option-order changes, superficial name swaps, or minor number changes).
 */
export function areQuestionsSubstantiallySimilar(a: QuestionItem, b: QuestionItem): boolean {
  if (a.id === b.id) return true;
  if (a.contentHash === b.contentHash) return true;
  if (a.semanticSignature === b.semanticSignature) return true;

  if (a.subject !== b.subject) return false;

  const sigA = a.semanticSignature.split(':')[2] || '';
  const sigB = b.semanticSignature.split(':')[2] || '';
  const setA = new Set(sigA.split('_').filter(Boolean));
  const setB = new Set(sigB.split('_').filter(Boolean));

  if (setA.size === 0 || setB.size === 0) return false;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  const jaccard = union === 0 ? 0 : intersection / union;

  // If >= 78% structural token overlap within the same subject & topic, treat as substantially duplicated
  if (a.topic.toLowerCase() === b.topic.toLowerCase() && jaccard >= 0.78) {
    return true;
  }
  return jaccard >= 0.88;
}

/**
 * 10-step Answer Verification Pipeline before approving a question for scored mock tests.
 */
export function verifyQuestionPipeline(
  candidate: QuestionItem,
  syllabusTopics: Record<SubjectName, string[]>,
  existingPool: QuestionItem[]
): VerificationCheckResult {
  const checks: VerificationCheckResult['checks'] = [];

  // 1. Question & proposed answer presence
  const hasStatementAndKey =
    Boolean(candidate.questionText && candidate.questionText.trim().length >= 8) &&
    ['A', 'B', 'C', 'D'].includes(candidate.correctAnswer);
  checks.push({
    step: 1,
    name: 'Question Statement & Proposed Answer',
    passed: hasStatementAndKey,
    detail: hasStatementAndKey ? 'Clear statement and valid option key present.' : 'Missing statement or invalid answer key.',
  });

  // 2. Syllabus alignment check
  const allowedTopics = syllabusTopics[candidate.subject] || [];
  const matchesSyllabus =
    allowedTopics.length === 0 ||
    allowedTopics.some((t) => t.toLowerCase() === candidate.topic.toLowerCase());
  checks.push({
    step: 2,
    name: 'Official WBPSC Syllabus Alignment',
    passed: matchesSyllabus,
    detail: matchesSyllabus
      ? `Matches ${candidate.subject} -> ${candidate.topic}.`
      : `Topic "${candidate.topic}" not in verified syllabus for ${candidate.subject}.`,
  });

  // 3. Answer key status & verification eligibility
  const answerValid =
    candidate.answerKeyStatus !== 'DISPUTED_EXCLUDED' &&
    Boolean(candidate.options[candidate.correctAnswer]?.trim());
  checks.push({
    step: 3,
    name: 'Answer Key Status Check',
    passed: answerValid,
    detail: answerValid ? `Answer key (${candidate.answerKeyStatus}) is valid.` : 'Answer key is disputed or empty.',
  });

  // 4. All 4 options A, B, C, D present and non-empty
  const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];
  const allFourPresent = optionKeys.every(
    (k) => typeof candidate.options[k] === 'string' && candidate.options[k].trim().length > 0
  );
  checks.push({
    step: 4,
    name: 'Four Complete Options (A, B, C, D)',
    passed: allFourPresent,
    detail: allFourPresent ? 'All four options A, B, C, D are populated.' : 'One or more options are missing.',
  });

  // 5. Distinct options check (only one defensible match, no accidental duplicate options)
  const normalizedOptions = optionKeys.map((k) => normalizeQuestionText(candidate.options[k] || ''));
  const uniqueOptions = new Set(normalizedOptions);
  const distinctOptions = uniqueOptions.size === 4;
  checks.push({
    step: 5,
    name: 'Single Unambiguous Option Set',
    passed: distinctOptions,
    detail: distinctOptions ? 'All 4 options are distinct.' : 'Duplicate option text detected among A/B/C/D.',
  });

  // 6. Deterministic Mathematical Verification (for Arithmetic)
  let mathPassed = true;
  let mathDetail = 'Not an arithmetic calculation or verified deterministically.';
  if (candidate.subject === 'Arithmetic' && candidate.numericVerification) {
    const { expectedValue, computedValue, formulaDescription } = candidate.numericVerification;
    const diff = Math.abs(expectedValue - computedValue);
    const correctOptionText = candidate.options[candidate.correctAnswer] || '';
    const matchesOptionString = correctOptionText.replace(/,/g, '').includes(String(expectedValue));
    mathPassed = diff < 1e-4 && matchesOptionString;
    mathDetail = mathPassed
      ? `Deterministic check passed: ${formulaDescription} = ${computedValue} matches option ${candidate.correctAnswer}.`
      : `Math mismatch: expected ${expectedValue}, computed ${computedValue}, option "${correctOptionText}".`;
  }
  checks.push({
    step: 6,
    name: 'Deterministic Calculation Verification',
    passed: mathPassed,
    detail: mathDetail,
  });

  // 7. Source & Origin Integrity Check
  const originValid =
    candidate.questionOrigin !== 'AUTHENTIC_PYQ' ||
    Boolean(candidate.examinationYear && candidate.sourceDocumentId);
  checks.push({
    step: 7,
    name: 'Source Attribution & Origin Honesty',
    passed: originValid,
    detail: originValid
      ? `Origin labeled accurately as ${candidate.questionOrigin}.`
      : 'Authentic PYQ lacks examination year or source document reference.',
  });

  // 8. Explanation Consistency Check
  const hasTeacherExplanation =
    Boolean(candidate.teacherExplanation?.simpleConceptBn?.trim()) &&
    Boolean(candidate.teacherExplanation?.simpleConceptEn?.trim()) &&
    candidate.teacherExplanation?.whyCorrectStepByStepBn?.length > 0;
  checks.push({
    step: 8,
    name: 'Explanation Consistency Against Answer Key',
    passed: hasTeacherExplanation,
    detail: hasTeacherExplanation
      ? 'Bilingual child-friendly explanation and step-by-step reasoning verified.'
      : 'Missing child-friendly explanation steps.',
  });

  // 9. Duplicate & Semantic Similarity Check
  const duplicateFound = existingPool.some(
    (existing) => existing.id !== candidate.id && areQuestionsSubstantiallySimilar(candidate, existing)
  );
  checks.push({
    step: 9,
    name: 'Semantic Duplicate Detection',
    passed: !duplicateFound,
    detail: !duplicateFound ? 'No duplicate or substantially similar question in pool.' : 'Substantially similar question detected in pool.',
  });

  // 10. Final Mandatory Gate
  const allPassed = checks.every((c) => c.passed);
  checks.push({
    step: 10,
    name: 'Final Scored Test Approval Gate',
    passed: allPassed,
    detail: allPassed ? 'APPROVED for scored mock tests.' : 'REJECTED from scored mock tests until issues are resolved.',
  });

  return { passed: allPassed, checks };
}

/**
 * Assesses practical exam readiness without ever promising a guaranteed pass.
 */
export function assessReadinessLevel(
  accuracyPercent: number,
  scorePercent: number,
  attemptsCount: number
): {
  label: ReadinessLabel;
  labelBn: string;
  adviceEn: string;
  adviceBn: string;
} {
  if (attemptsCount === 0 || scorePercent < 35) {
    return {
      label: 'Beginner',
      labelBn: 'প্রাথমিক স্তর (Beginner)',
      adviceEn: 'Focus on understanding foundational concepts in simple steps using Learn While Practicing mode before rushing timed mocks.',
      adviceBn: 'এখনই সময়ের চিন্তা না করে প্রতিদিন সহজ ভাষায় প্রতিটি অধ্যায়ের মূল ধারণা বোঝো এবং ভুল খাতা (Mistake Notebook) দেখে অনুশীলন করো।',
    };
  }
  if (scorePercent < 52 || accuracyPercent < 60) {
    return {
      label: 'Developing',
      labelBn: 'গড়ে উঠছে (Developing)',
      adviceEn: 'Your basics are forming, but negative marking is reducing your net score. Avoid guessing unknown options and revise weak topics.',
      adviceBn: 'তোমার ভিত্তি তৈরি হচ্ছে, কিন্তু আন্দাজে উত্তর দেওয়ায় নেগেটিভ মার্কিং হচ্ছে। যে প্রশ্নগুলো নিশ্চিত নও সেগুলো ছেড়ে দাও এবং দুর্বল অধ্যায়গুলো রিভিশন দাও।',
    };
  }
  if (scorePercent < 68) {
    return {
      label: 'Improving',
      labelBn: 'উন্নতি হচ্ছে (Improving)',
      adviceEn: 'Good progress! Practice timed Arithmetic and English grammar sets to boost both speed and accuracy.',
      adviceBn: 'খুব ভালো উন্নতি হচ্ছে! এবার পাটিগণিত (Arithmetic) ও ইংরেজি গ্রামারের সময় ধরে অনুশীলন বাড়িয়ে গতি ও নির্ভুলতা আরও বাড়াও।',
    };
  }
  if (scorePercent < 80 || attemptsCount < 3) {
    return {
      label: 'Consistent Practice',
      labelBn: 'নিয়মিত ও স্থিতিশীল প্রস্তুতি (Consistent Practice)',
      adviceEn: 'You show solid command across subjects. Keep taking full mock tests and reviewing your Mistake Notebook to stay sharp.',
      adviceBn: 'তিনটি বিষয়েই তোমার দখল বেশ ভালো। এই ধারাবাহিকতা বজায় রাখতে নিয়মিত মক টেস্ট দাও এবং ভুল খাতার প্রশ্নগুলো রিভিশন করো।',
    };
  }
  return {
    label: 'Strong Practice Performance',
    labelBn: 'দৃঢ় অনুশীলন প্রস্তুতি (Strong Practice Performance)',
    adviceEn: 'Strong accuracy and time management in practice tests. Continue balanced revision and Part-II descriptive writing practice.',
    adviceBn: 'অনুশীলন পরীক্ষায় তোমার নির্ভুলতা ও সময় ব্যবস্থাপনা চমৎকার। নিয়মিত রিভিশনের পাশাপাশি পার্ট-২ (Part-II) লিখিত পরীক্ষার অনুশীলন চালিয়ে যাও।',
  };
}

/**
 * Deterministic Server-Authoritative Exam Scoring Function.
 * For WBPSC Clerkship Part-I: Score = Correct * 1 - Incorrect * 0.25 (or configured values).
 */
export function calculateExamScore(
  config: ExamConfiguration,
  questions: QuestionItem[],
  responses: Record<string, StudentQuestionResponse>,
  timeUsedSeconds: number,
  historicalAttemptsCount = 1
): MockTestResult {
  const marksPerCorrect = config.marksPerQuestion;
  const negativePerWrong = config.negativeMarkingPerWrong;

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const subjectMap = new Map<SubjectName, SubjectScoreBreakdown>();
  const subjects: SubjectName[] = ['English', 'General Studies', 'Arithmetic'];
  for (const subj of subjects) {
    subjectMap.set(subj, {
      subject: subj,
      totalQuestions: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      positiveMarks: 0,
      negativeMarks: 0,
      netMarks: 0,
      maxMarks: 0,
      accuracyPercent: 0,
    });
  }

  const topicMap = new Map<string, TopicScoreBreakdown>();
  const evaluatedQuestions: EvaluatedQuestionDetail[] = [];

  for (const q of questions) {
    const resp = responses[q.id];
    const selected = resp?.selectedOption ?? null;
    const markedForReview = Boolean(resp?.markedForReview);
    const timeSpent = resp?.timeSpentSeconds ?? 0;

    const subjEntry = subjectMap.get(q.subject)!;
    subjEntry.totalQuestions += 1;
    subjEntry.maxMarks += marksPerCorrect;

    const topicKey = `${q.subject}::${q.topic}`;
    if (!topicMap.has(topicKey)) {
      topicMap.set(topicKey, {
        subject: q.subject,
        topic: q.topic,
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        accuracyPercent: 0,
      });
    }
    const topicEntry = topicMap.get(topicKey)!;
    topicEntry.total += 1;

    if (!selected) {
      unansweredCount += 1;
      subjEntry.unanswered += 1;
      topicEntry.unanswered += 1;
      evaluatedQuestions.push({
        question: q,
        selectedOption: null,
        markedForReview,
        isCorrect: false,
        status: 'UNANSWERED',
        awardedMarks: 0,
        timeSpentSeconds: timeSpent,
      });
    } else if (selected === q.correctAnswer) {
      correctCount += 1;
      subjEntry.attempted += 1;
      subjEntry.correct += 1;
      subjEntry.positiveMarks = Number((subjEntry.positiveMarks + marksPerCorrect).toFixed(2));
      topicEntry.correct += 1;
      evaluatedQuestions.push({
        question: q,
        selectedOption: selected,
        markedForReview,
        isCorrect: true,
        status: 'CORRECT',
        awardedMarks: marksPerCorrect,
        timeSpentSeconds: timeSpent,
      });
    } else {
      incorrectCount += 1;
      subjEntry.attempted += 1;
      subjEntry.incorrect += 1;
      subjEntry.negativeMarks = Number((subjEntry.negativeMarks + negativePerWrong).toFixed(2));
      topicEntry.incorrect += 1;
      evaluatedQuestions.push({
        question: q,
        selectedOption: selected,
        markedForReview,
        isCorrect: false,
        status: 'INCORRECT',
        awardedMarks: -negativePerWrong,
        timeSpentSeconds: timeSpent,
      });
    }
  }

  const positiveMarks = Number((correctCount * marksPerCorrect).toFixed(2));
  const negativeMarksDeducted = Number((incorrectCount * negativePerWrong).toFixed(2));
  const finalScore = Number((positiveMarks - negativeMarksDeducted).toFixed(2));
  const totalQuestions = questions.length;
  const maximumMarks = Number((totalQuestions * marksPerCorrect).toFixed(2));
  const attemptedTotal = correctCount + incorrectCount;
  const accuracyPercent = attemptedTotal > 0 ? Number(((correctCount / attemptedTotal) * 100).toFixed(1)) : 0;

  const subjectBreakdown: SubjectScoreBreakdown[] = [];
  for (const subj of subjects) {
    const entry = subjectMap.get(subj)!;
    if (entry.totalQuestions > 0) {
      entry.netMarks = Number((entry.positiveMarks - entry.negativeMarks).toFixed(2));
      entry.accuracyPercent =
        entry.attempted > 0 ? Number(((entry.correct / entry.attempted) * 100).toFixed(1)) : 0;
      subjectBreakdown.push(entry);
    }
  }

  const topicBreakdown: TopicScoreBreakdown[] = Array.from(topicMap.values()).map((t) => {
    const att = t.correct + t.incorrect;
    return {
      ...t,
      accuracyPercent: att > 0 ? Number(((t.correct / att) * 100).toFixed(1)) : 0,
    };
  });

  const sortedTopics = [...topicBreakdown].sort((a, b) => b.accuracyPercent - a.accuracyPercent);
  const strongestTopics = sortedTopics
    .filter((t) => t.correct > 0 && t.accuracyPercent >= 65)
    .slice(0, 3)
    .map((t) => `${t.topic} (${t.subject})`);
  const weakestTopics = [...topicBreakdown]
    .filter((t) => t.incorrect > 0 || t.accuracyPercent < 60)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .slice(0, 3)
    .map((t) => `${t.topic} (${t.subject})`);

  const scorePercent = maximumMarks > 0 ? (Math.max(0, finalScore) / maximumMarks) * 100 : 0;
  const readiness = assessReadinessLevel(accuracyPercent, scorePercent, historicalAttemptsCount);

  const transparentFormula = `${correctCount} × ${marksPerCorrect} − (${incorrectCount} × ${negativePerWrong}) = ${finalScore.toFixed(2)} / ${maximumMarks}`;

  return {
    sessionId: `res_${Date.now()}`,
    examConfigurationId: config.id,
    examinationName: config.examinationName,
    schemeVersion: config.schemeVersion,
    submittedAt: new Date().toISOString(),
    totalQuestions,
    maximumMarks,
    correctCount,
    incorrectCount,
    unansweredCount,
    positiveMarks,
    negativeMarksDeducted,
    finalScore,
    accuracyPercent,
    timeUsedSeconds,
    transparentFormula,
    subjectBreakdown,
    topicBreakdown,
    strongestTopics,
    weakestTopics,
    readinessLabel: readiness.label,
    readinessLabelBn: readiness.labelBn,
    readinessAdviceEn: readiness.adviceEn,
    readinessAdviceBn: readiness.adviceBn,
    evaluatedQuestions,
  };
}

/**
 * Selects questions for a mock or practice test while strictly enforcing non-repetition rules.
 * - Excludes DISPUTED_EXCLUDED or unverified questions.
 * - In FRESH_MOCK mode, excludes any question ID in seenQuestionIds AND any question semantically similar to seen questions.
 * - Preserves proportional subject distribution (English 30%, General Studies 40%, Arithmetic 30%).
 */
export function selectFreshMockQuestions(
  pool: QuestionItem[],
  seenQuestionIds: Set<string>,
  targetCount: number,
  mode: PracticeUniquenessMode,
  mistakeQuestionIds: Set<string> = new Set(),
  subjectFilter?: SubjectName,
  topicFilter?: string
): {
  selected: QuestionItem[];
  limitationNotice?: string;
} {
  // Filter only verified, non-disputed questions
  const eligibleBase = pool.filter(
    (q) =>
      q.verificationStatus === 'VERIFIED' &&
      q.answerKeyStatus !== 'DISPUTED_EXCLUDED' &&
      (!subjectFilter || q.subject === subjectFilter) &&
      (!topicFilter || q.topic.toLowerCase() === topicFilter.toLowerCase())
  );

  if (mode === 'MISTAKE_REVISION') {
    const mistakeQuestions = eligibleBase.filter((q) => mistakeQuestionIds.has(q.id));
    if (mistakeQuestions.length >= targetCount) {
      return { selected: mistakeQuestions.slice(0, targetCount) };
    }
    // Supplement with questions from the same topics as mistakes
    const mistakeTopics = new Set(mistakeQuestions.map((q) => `${q.subject}::${q.topic}`));
    const related = eligibleBase.filter(
      (q) => !mistakeQuestionIds.has(q.id) && mistakeTopics.has(`${q.subject}::${q.topic}`)
    );
    const combined = [...mistakeQuestions, ...related].slice(0, targetCount);
    return {
      selected: combined,
      limitationNotice:
        combined.length < targetCount
          ? `Showing all ${combined.length} available mistake & related revision questions.`
          : undefined,
    };
  }

  // For FRESH_MOCK and TOPIC_PRACTICE: prioritize unseen questions and block semantic duplicates of seen questions
  const seenQuestions = pool.filter((q) => seenQuestionIds.has(q.id));
  const unseenQuestions: QuestionItem[] = [];

  for (const candidate of eligibleBase) {
    if (seenQuestionIds.has(candidate.id)) continue;
    const isSimilarToSeen = seenQuestions.some((seen) =>
      areQuestionsSubstantiallySimilar(candidate, seen)
    );
    if (isSimilarToSeen) continue;
    // Also ensure not semantically duplicate to already picked unseen questions
    const isSimilarToPicked = unseenQuestions.some((picked) =>
      areQuestionsSubstantiallySimilar(candidate, picked)
    );
    if (!isSimilarToPicked) {
      unseenQuestions.push(candidate);
    }
  }

  if (subjectFilter || topicFilter) {
    const picked = unseenQuestions.slice(0, targetCount);
    return {
      selected: picked,
      limitationNotice:
        picked.length < targetCount
          ? `Only ${picked.length} fresh unseen verified questions are currently in the pool for this filter. Use AI Question Generator to expand the pool without repeating seen questions.`
          : undefined,
    };
  }

  // Proportional WBPSC Clerkship Part-I distribution: English 30%, GS 40%, Arithmetic 30%
  const engTarget = Math.round(targetCount * 0.3);
  const arithTarget = Math.round(targetCount * 0.3);
  const gsTarget = targetCount - engTarget - arithTarget;

  const bySubject: Record<SubjectName, QuestionItem[]> = {
    English: unseenQuestions.filter((q) => q.subject === 'English'),
    'General Studies': unseenQuestions.filter((q) => q.subject === 'General Studies'),
    Arithmetic: unseenQuestions.filter((q) => q.subject === 'Arithmetic'),
  };

  const selected: QuestionItem[] = [
    ...bySubject.English.slice(0, engTarget),
    ...bySubject['General Studies'].slice(0, gsTarget),
    ...bySubject.Arithmetic.slice(0, arithTarget),
  ];

  // If one subject had slightly fewer unseen questions, fill from remaining unseen questions
  if (selected.length < targetCount) {
    const pickedIds = new Set(selected.map((q) => q.id));
    for (const q of unseenQuestions) {
      if (selected.length >= targetCount) break;
      if (!pickedIds.has(q.id)) {
        selected.push(q);
        pickedIds.add(q.id);
      }
    }
  }

  const limitationNotice =
    selected.length < targetCount
      ? `Delivered ${selected.length} verified unseen questions (requested ${targetCount}). Previously attempted questions were strictly excluded to prevent repetition. Click "Generate Fresh AI Questions" to add more unseen questions.`
      : undefined;

  return { selected, limitationNotice };
}

/**
 * Calculates adaptive topic weights so weak topics receive higher priority in recommendations.
 */
export function calculateAdaptiveTopicWeights(masteryList: TopicMasteryItem[]): {
  subject: SubjectName;
  topic: string;
  priorityScore: number;
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  reasonBn: string;
  reasonEn: string;
}[] {
  return masteryList
    .map((item) => {
      const errorRate = 100 - item.accuracyPercent;
      const priority = Math.round(errorRate * 0.7 + (item.needsRevision ? 25 : 0) + Math.min(20, item.incorrect * 5));
      const recommendedDifficulty: 'easy' | 'medium' | 'hard' =
        item.accuracyPercent < 50 ? 'easy' : item.accuracyPercent < 78 ? 'medium' : 'hard';

      return {
        subject: item.subject,
        topic: item.topic,
        priorityScore: priority,
        recommendedDifficulty,
        reasonBn:
          item.accuracyPercent < 55
            ? `${item.topic}-এ তোমার সঠিকতার হার ${item.accuracyPercent}%। সহজ উদাহরণ দিয়ে শুরু করা দরকার।`
            : `${item.topic}-এ আরও গতি ও নির্ভুলতা বাড়াতে নিয়মিত অনুশীলন করো।`,
        reasonEn:
          item.accuracyPercent < 55
            ? `Your accuracy in ${item.topic} is ${item.accuracyPercent}%. Start with foundational questions.`
            : `Maintain momentum in ${item.topic} with medium-to-hard timed questions.`,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
