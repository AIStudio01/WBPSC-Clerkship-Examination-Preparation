export type LanguageCode = 'bn' | 'en';

export type SubjectName = 'English' | 'General Studies' | 'Arithmetic';

export type QuestionOrigin =
  | 'AUTHENTIC_PYQ'
  | 'AI_GENERATED'
  | 'ADAPTED_CONCEPT'
  | 'IMPORTED_UNVERIFIED';

export type AnswerKeyStatus =
  | 'PROVISIONAL'
  | 'REVISED'
  | 'FINAL_VERIFIED'
  | 'DISPUTED_EXCLUDED';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PENDING_REVIEW'
  | 'FLAGGED_AMBIGUOUS'
  | 'REJECTED';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface ExamSectionConfig {
  subject: SubjectName;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
}

export interface ExamConfiguration {
  id: string;
  examinationName: string;
  advertisementNumber: string;
  schemeVersion: string;
  effectiveDate: string;
  examinationYear: number;
  stage: 'Part-I (Objective MCQ)' | 'Part-II (Conventional Written)';
  totalQuestions: number;
  totalMarks: number;
  durationSeconds: number;
  marksPerQuestion: number;
  negativeMarkingPerWrong: number;
  sections: ExamSectionConfig[];
  officialSourceUrl: string;
  verificationStatus: 'OFFICIALLY_VERIFIED' | 'PROVISIONAL_PRACTICE';
  verificationNote: string;
  syllabusSummary: Record<SubjectName, string[]>;
  updatedAt: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  sourceType: 'OFFICIAL_NOTIFICATION' | 'OFFICIAL_PYQ_PAPER' | 'OFFICIAL_ANSWER_KEY' | 'SYLLABUS_DOCUMENT';
  advertisementNumber: string;
  examinationYear: number;
  sessionShift: string;
  bookletSeries?: string;
  sourceUrl: string;
  documentReference: string;
  publicationDate: string;
  answerKeyStatus: AnswerKeyStatus;
  verificationStatus: 'VERIFIED' | 'AWAITING_REVIEW';
  notes: string;
  lastReviewDate: string;
}

export interface FollowUpPracticeQuestion {
  id: string;
  questionText: string;
  questionTextBn?: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  simpleHintBn: string;
  simpleHintEn: string;
}

export interface ChildFriendlyExplanation {
  yourAnswerSummaryBn: string;
  yourAnswerSummaryEn: string;
  correctAnswerSummaryBn: string;
  correctAnswerSummaryEn: string;
  simpleConceptBn: string;
  simpleConceptEn: string;
  whyWrongByOptionBn: Partial<Record<OptionKey, string>>;
  whyWrongByOptionEn: Partial<Record<OptionKey, string>>;
  whyCorrectStepByStepBn: string[];
  whyCorrectStepByStepEn: string[];
  everydayExampleBn: string;
  everydayExampleEn: string;
  memoryTrickBn: string;
  memoryTrickEn: string;
  followUpQuestion: FollowUpPracticeQuestion;
  encouragementBn: string;
  encouragementEn: string;
}

export interface QuestionItem {
  id: string;
  questionOrigin: QuestionOrigin;
  sourceDocumentId?: string;
  examConfigurationId: string;
  examinationYear?: number;
  sessionShift?: string;
  bookletSeries?: string;
  originalQuestionNumber?: number;
  subject: SubjectName;
  topic: string;
  subtopic?: string;
  difficulty: DifficultyLevel;
  questionText: string;
  questionTextBn?: string;
  options: Record<OptionKey, string>;
  optionsBn?: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  answerKeyStatus: AnswerKeyStatus;
  revisionHistoryNote?: string;
  verificationStatus: VerificationStatus;
  contentHash: string;
  semanticSignature: string;
  numericVerification?: {
    formulaDescription: string;
    expectedValue: number;
    computedValue: number;
  };
  teacherExplanation: ChildFriendlyExplanation;
  createdAt: string;
}

/**
 * Sanitized question sent to the browser during a live REAL_EXAM simulation
 * so the correct answer is never exposed in client state or network payloads.
 */
export interface PublicExamQuestion {
  id: string;
  displayOrder: number;
  questionOrigin: QuestionOrigin;
  examinationYear?: number;
  sessionShift?: string;
  subject: SubjectName;
  topic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  questionTextBn?: string;
  options: Record<OptionKey, string>;
  optionsBn?: Record<OptionKey, string>;
  marks: number;
  negativeMarks: number;
}

export type QuestionResponseState = 'UNVISITED' | 'UNANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface StudentQuestionResponse {
  questionId: string;
  selectedOption: OptionKey | null;
  markedForReview: boolean;
  timeSpentSeconds: number;
  answeredAt?: string;
}

export type PracticeUniquenessMode = 'FRESH_MOCK' | 'TOPIC_PRACTICE' | 'MISTAKE_REVISION';

export type LearningExperienceMode = 'REAL_EXAM_SIMULATION' | 'LEARN_WHILE_PRACTICING';

export interface MockTestSession {
  id: string;
  userId: string;
  examConfigurationId: string;
  title: string;
  uniquenessMode: PracticeUniquenessMode;
  experienceMode: LearningExperienceMode;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED_SUBMITTED';
  totalQuestions: number;
  durationSeconds: number;
  marksPerQuestion: number;
  negativeMarkingPerWrong: number;
  questions: PublicExamQuestion[];
  responses: Record<string, StudentQuestionResponse>;
  poolLimitationNotice?: string;
}

export interface SubjectScoreBreakdown {
  subject: SubjectName;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  positiveMarks: number;
  negativeMarks: number;
  netMarks: number;
  maxMarks: number;
  accuracyPercent: number;
}

export interface TopicScoreBreakdown {
  subject: SubjectName;
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracyPercent: number;
}

export type ReadinessLabel =
  | 'Beginner'
  | 'Developing'
  | 'Improving'
  | 'Consistent Practice'
  | 'Strong Practice Performance';

export interface EvaluatedQuestionDetail {
  question: QuestionItem;
  selectedOption: OptionKey | null;
  markedForReview: boolean;
  isCorrect: boolean;
  status: 'CORRECT' | 'INCORRECT' | 'UNANSWERED';
  awardedMarks: number;
  timeSpentSeconds: number;
}

export interface MockTestResult {
  sessionId: string;
  examConfigurationId: string;
  examinationName: string;
  schemeVersion: string;
  submittedAt: string;
  totalQuestions: number;
  maximumMarks: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  positiveMarks: number;
  negativeMarksDeducted: number;
  finalScore: number;
  accuracyPercent: number;
  timeUsedSeconds: number;
  transparentFormula: string;
  subjectBreakdown: SubjectScoreBreakdown[];
  topicBreakdown: TopicScoreBreakdown[];
  strongestTopics: string[];
  weakestTopics: string[];
  readinessLabel: ReadinessLabel;
  readinessLabelBn: string;
  readinessAdviceEn: string;
  readinessAdviceBn: string;
  evaluatedQuestions: EvaluatedQuestionDetail[];
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  question: QuestionItem;
  selectedOption: OptionKey;
  correctOption: OptionKey;
  subject: SubjectName;
  topic: string;
  attemptDate: string;
  misconceptionSummaryBn: string;
  misconceptionSummaryEn: string;
  explanationReviewed: boolean;
  revisionStatus: 'NEEDS_REVIEW' | 'REVIEWED' | 'MASTERED';
  nextReviewDate: string;
  mistakeCount: number;
}

export interface TopicMasteryItem {
  subject: SubjectName;
  topic: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracyPercent: number;
  masteryScore: number;
  lastPracticedAt: string;
  needsRevision: boolean;
}

export interface VerificationCheckResult {
  passed: boolean;
  checks: {
    step: number;
    name: string;
    passed: boolean;
    detail: string;
  }[];
}
