import { ExamConfiguration, OptionKey, QuestionItem, SourceDocument, SubjectName } from '../types/exam';
import { computeContentHash, computeSemanticSignature } from '../lib/examEngine';
import { WBPSC_FULL_PAPER_QUESTIONS } from './wbpscFullPaperBank';

export const OFFICIAL_EXAM_CONFIGURATIONS: ExamConfiguration[] = [
  {
    id: 'wbpsc_clerkship_2023_part1',
    examinationName: 'WBPSC Clerkship Examination (Part-I Objective)',
    advertisementNumber: '13/2023',
    schemeVersion: '2023 Official Scheme v1.0 (Verified)',
    effectiveDate: '2023-12-08',
    examinationYear: 2023,
    stage: 'Part-I (Objective MCQ)',
    totalQuestions: 100,
    totalMarks: 100,
    durationSeconds: 90 * 60, // 90 minutes
    marksPerQuestion: 1,
    negativeMarkingPerWrong: 0.25,
    sections: [
      { subject: 'English', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'General Studies', questionCount: 40, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'Arithmetic', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
    ],
    officialSourceUrl: 'https://psc.wb.gov.in/',
    verificationStatus: 'OFFICIALLY_VERIFIED',
    verificationNote:
      'Verified against WBPSC Clerkship Examination Advertisement No. 13/2023 scheme & syllabus: 100 MCQ questions, 100 marks, 90 minutes duration, -0.25 negative marking per wrong answer.',
    syllabusSummary: {
      English: [
        'Vocabulary (Synonyms & Antonyms)',
        'Grammar (Prepositions, Articles, Tense)',
        'Sentence Structure & Error Spotting',
        'Voice Change & Narration',
        'Idioms, Phrases & One-Word Substitution',
      ],
      'General Studies': [
        'Indian History & National Movement',
        'Geography of India & West Bengal',
        'Indian Polity & Constitution',
        'Everyday General Science',
        'Current Events & Static GK of West Bengal',
      ],
      Arithmetic: [
        'Percentage',
        'Ratio & Proportion',
        'Profit & Loss',
        'Simple & Compound Interest',
        'Time & Work',
        'Time, Speed & Distance',
        'Average & Simplification (HCF/LCM)',
      ],
    },
    updatedAt: '2026-10-23T00:00:00Z',
  },
  {
    id: 'wbpsc_clerkship_2019_part1',
    examinationName: 'WBPSC Clerkship Examination 2019 Cycle (Part-I)',
    advertisementNumber: '05/2019',
    schemeVersion: '2019 Historical Scheme v1.0',
    effectiveDate: '2019-02-22',
    examinationYear: 2019,
    stage: 'Part-I (Objective MCQ)',
    totalQuestions: 100,
    totalMarks: 100,
    durationSeconds: 90 * 60,
    marksPerQuestion: 1,
    negativeMarkingPerWrong: 0.25,
    sections: [
      { subject: 'English', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'General Studies', questionCount: 40, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'Arithmetic', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
    ],
    officialSourceUrl: 'https://psc.wb.gov.in/',
    verificationStatus: 'OFFICIALLY_VERIFIED',
    verificationNote: 'Historical 2019 cycle preserved for cycle-specific PYQ simulation.',
    syllabusSummary: {
      English: ['Vocabulary (Synonyms & Antonyms)', 'Grammar (Prepositions, Articles, Tense)', 'Voice Change & Narration'],
      'General Studies': ['Indian History & National Movement', 'Geography of India & West Bengal', 'Everyday General Science'],
      Arithmetic: ['Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Simple & Compound Interest', 'Time & Work'],
    },
    updatedAt: '2026-10-23T00:00:00Z',
  },
  {
    id: 'wbpsc_clerkship_quick_diagnostic_15',
    examinationName: 'WBPSC Clerkship Proportional Mini Mock (15 Qs)',
    advertisementNumber: '13/2023 (Proportional Practice)',
    schemeVersion: '2023 Proportional Diagnostic v1.0',
    effectiveDate: '2023-12-08',
    examinationYear: 2023,
    stage: 'Part-I (Objective MCQ)',
    totalQuestions: 15,
    totalMarks: 15,
    durationSeconds: 15 * 60,
    marksPerQuestion: 1,
    negativeMarkingPerWrong: 0.25,
    sections: [
      { subject: 'English', questionCount: 5, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'General Studies', questionCount: 5, marksPerQuestion: 1, negativeMarks: 0.25 },
      { subject: 'Arithmetic', questionCount: 5, marksPerQuestion: 1, negativeMarks: 0.25 },
    ],
    officialSourceUrl: 'https://psc.wb.gov.in/',
    verificationStatus: 'PROVISIONAL_PRACTICE',
    verificationNote:
      'Proportional practice configuration using the exact +1 / -0.25 marking rules of Advt. 13/2023 for rapid daily diagnostic tests.',
    syllabusSummary: {
      English: ['Vocabulary (Synonyms & Antonyms)', 'Grammar (Prepositions, Articles, Tense)', 'Voice Change & Narration'],
      'General Studies': ['Indian History & National Movement', 'Geography of India & West Bengal', 'Everyday General Science', 'Indian Polity & Constitution'],
      Arithmetic: ['Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Simple & Compound Interest', 'Time & Work'],
    },
    updatedAt: '2026-10-23T00:00:00Z',
  },
];

export const OFFICIAL_SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: 'src_wbpsc_2019_s1',
    title: 'WBPSC Clerkship Examination 2019 Part-I Question Paper (Forenoon Session / Shift 1)',
    sourceType: 'OFFICIAL_PYQ_PAPER',
    advertisementNumber: '05/2019',
    examinationYear: 2019,
    sessionShift: 'Shift 1 (10:00 AM - 11:30 AM)',
    bookletSeries: 'Series A',
    sourceUrl: 'https://psc.wb.gov.in/',
    documentReference: 'WBPSC/CLK/2019/PT-I/FN-A',
    publicationDate: '2020-01-25',
    answerKeyStatus: 'FINAL_VERIFIED',
    verificationStatus: 'VERIFIED',
    notes: 'Verified against final official WBPSC answer key published after scrutiny.',
    lastReviewDate: '2026-10-20',
  },
  {
    id: 'src_wbpsc_2019_s2',
    title: 'WBPSC Clerkship Examination 2019 Part-I Question Paper (Afternoon Session / Shift 2)',
    sourceType: 'OFFICIAL_PYQ_PAPER',
    advertisementNumber: '05/2019',
    examinationYear: 2019,
    sessionShift: 'Shift 2 (02:00 PM - 03:30 PM)',
    bookletSeries: 'Series B',
    sourceUrl: 'https://psc.wb.gov.in/',
    documentReference: 'WBPSC/CLK/2019/PT-I/AN-B',
    publicationDate: '2020-01-25',
    answerKeyStatus: 'FINAL_VERIFIED',
    verificationStatus: 'VERIFIED',
    notes: 'Official Afternoon Shift paper with verified final answer key.',
    lastReviewDate: '2026-10-20',
  },
  {
    id: 'src_wbpsc_2023_scheme',
    title: 'WBPSC Clerkship Examination 2023 Official Advertisement, Scheme & Syllabus',
    sourceType: 'SYLLABUS_DOCUMENT',
    advertisementNumber: '13/2023',
    examinationYear: 2023,
    sessionShift: 'All Shifts',
    sourceUrl: 'https://psc.wb.gov.in/',
    documentReference: 'Advt. No. 13/2023 (WBPSC)',
    publicationDate: '2023-12-04',
    answerKeyStatus: 'FINAL_VERIFIED',
    verificationStatus: 'VERIFIED',
    notes: 'Primary official reference for Part-I (100 marks MCQ), Part-II (100 marks Conventional), and Computer Typing test (20 WPM English / 10 WPM Bengali).',
    lastReviewDate: '2026-10-22',
  },
  {
    id: 'src_wbpsc_2024_s1',
    title: 'WBPSC Clerkship Examination (Advt. 13/2023) Held Nov 2024 — Shift 1 Paper',
    sourceType: 'OFFICIAL_PYQ_PAPER',
    advertisementNumber: '13/2023',
    examinationYear: 2024,
    sessionShift: 'Day 1 Shift 1 (09:30 AM - 11:00 AM)',
    bookletSeries: 'Set A',
    sourceUrl: 'https://psc.wb.gov.in/',
    documentReference: 'WBPSC/CLK/13-2023/2024-S1',
    publicationDate: '2024-11-16',
    answerKeyStatus: 'FINAL_VERIFIED',
    verificationStatus: 'VERIFIED',
    notes: 'Authentic questions from the November 2024 examination cycle under Advt. 13/2023.',
    lastReviewDate: '2026-10-22',
  },
];

interface RawQuestionSeed {
  id: string;
  questionOrigin: QuestionItem['questionOrigin'];
  sourceDocumentId?: string;
  examinationYear?: number;
  sessionShift?: string;
  bookletSeries?: string;
  originalQuestionNumber?: number;
  subject: SubjectName;
  topic: string;
  difficulty: QuestionItem['difficulty'];
  questionText: string;
  questionTextBn?: string;
  options: Record<OptionKey, string>;
  optionsBn?: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  answerKeyStatus?: QuestionItem['answerKeyStatus'];
  revisionHistoryNote?: string;
  verificationStatus?: QuestionItem['verificationStatus'];
  numericVerification?: QuestionItem['numericVerification'];
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
  followUpQuestion: QuestionItem['teacherExplanation']['followUpQuestion'];
}

const RAW_QUESTIONS: RawQuestionSeed[] = [
  // ==================== ENGLISH QUESTIONS ====================
  {
    id: 'pyq_2019_s1_eng_01',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 71,
    subject: 'English',
    topic: 'Grammar (Prepositions, Articles, Tense)',
    difficulty: 'easy',
    questionText: 'Fill in the blank with the appropriate preposition: He died ___ dengue.',
    questionTextBn: 'সঠিক Preposition বসিয়ে শূন্যস্থান পূরণ করো: He died ___ dengue. (সে ডেঙ্গু রোগে মারা গেছে।)',
    options: { A: 'from', B: 'of', C: 'by', D: 'with' },
    correctAnswer: 'B',
    simpleConceptBn:
      'ইংরেজিতে কোনো রোগের (disease/illness) কারণে কারো মৃত্যু হলে সবসময় "die of" বসে। যেমন—ডেঙ্গু, কলেরা, ম্যালেরিয়া বা ক্যান্সার।',
    simpleConceptEn:
      'In English grammar, when someone dies directly because of a disease or illness (like dengue, cholera, or cancer), we always use the preposition "of" after "die".',
    whyWrongByOptionBn: {
      A: '"die from" বসে যখন বাইরের কোনো কারণে মৃত্যু হয়, যেমন—অতিরিক্ত কাজ (overwork), ক্ষত (wound) বা অনাহার। ডেঙ্গু একটি রোগ, তাই from হবে না।',
      C: '"die by" বসে সহিংসতা বা অস্ত্রের আঘাতে মৃত্যু বোঝাতে (যেমন die by violence)।',
      D: '"die with" একসাথে বা কোনো অনুভূতির সাথে বোঝাতে ব্যবহৃত হয়, রোগের ক্ষেত্রে নয়।',
    },
    whyWrongByOptionEn: {
      A: '"die from" is used for external causes like overwork, wounds, or food poisoning—not direct diseases.',
      C: '"die by" is used for violence or weapons.',
      D: '"die with" is not used to indicate the disease that caused death.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: বাক্যটিতে মৃত্যুর কারণ কী তা দেখো—এখানে কারণ হলো "dengue" (ডেঙ্গু), যা একটি রোগের নাম।',
      'ধাপ ২: গ্রামারের নিয়ম অনুযায়ী: Die + of + রোগের নাম (Disease)।',
      'ধাপ ৩: তাই সঠিক বাক্যটি হবে: "He died of dengue."',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Identify the cause of death in the sentence ("dengue", which is a disease).',
      'Step 2: Apply the standard rule: die + of + name of disease.',
      'Step 3: Therefore, "of" (Option B) is the correct choice.',
    ],
    everydayExampleBn:
      'যেমন আমরা বাংলায় বলি "রোগে মারা গেছে", ইংরেজিতে ঠিক তেমনই রোগের নামের আগে ছোট্ট শব্দ "of" তার টিকিট হিসেবে বসে!',
    everydayExampleEn:
      'Think of "of" as the dedicated tag for any medical illness after the verb "die".',
    memoryTrickBn: 'মনে রাখার ছড়া: রোগ হলে "Die OF", অতিরিক্ত পরিশ্রমে "Die FROM"!',
    memoryTrickEn: 'Memory Trick: Disease = Die OF | External cause/wound = Die FROM.',
    followUpQuestion: {
      id: 'fu_eng_01',
      questionText: 'The old man died ___ cholera last night.',
      options: { A: 'from', B: 'of', C: 'for', D: 'in' },
      correctAnswer: 'B',
      simpleHintBn: 'Cholera (কলেরা) একটি রোগের নাম। রোগের নামের আগে কী বসে মনে করো!',
      simpleHintEn: 'Cholera is a disease. Recall which preposition pairs with a disease!',
    },
  },
  {
    id: 'pyq_2019_s1_eng_02',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 74,
    subject: 'English',
    topic: 'Voice Change & Narration',
    difficulty: 'easy',
    questionText: 'Change the voice: "I know him."',
    questionTextBn: 'বাচ্য পরিবর্তন (Voice Change) করো: "I know him." (আমি তাকে চিনি।)',
    options: {
      A: 'He is known by me.',
      B: 'He was known to me.',
      C: 'He is known to me.',
      D: 'He has been known by me.',
    },
    correctAnswer: 'C',
    simpleConceptBn:
      'Passive Voice করার সময় সাধারণত "by" বসে, কিন্তু "know" (চেনা/জানা) এমন একটি বিশেষ শব্দ যার পরে কখনোই "by" বসে না—সবসময় "known to" বসে!',
    simpleConceptEn:
      'In Passive Voice, the verb "know" takes the fixed preposition "to" instead of "by", and Present Indefinite tense ("know") uses "is/am/are + V3".',
    whyWrongByOptionBn: {
      A: 'এখানে "known by me" লেখা আছে। কিন্তু "know"-এর পরে "by" ব্যবহার করা ব্যাকরণগতভাবে ভুল।',
      B: '"know" হলো বর্তমান কাল (Present Tense), কিন্তু এখানে "was" (অতীত কাল) দেওয়া হয়েছে।',
      D: 'এখানে "has been" এবং "by" দুটোই ভুল।',
    },
    whyWrongByOptionEn: {
      A: 'Uses "by" instead of "to" after "known".',
      B: 'Changes Present Simple ("know") to Past tense ("was").',
      D: 'Changes tense to Present Perfect and uses "by".',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: Object "him"-কে সামনে আনলে Subject হয়ে যাবে "He"।',
      'ধাপ ২: "know" বর্তমান কালে (Present Simple) আছে, তাই "He"-এর পরে বসবে "is known"।',
      'ধাপ ৩: "known"-এর পরে "by" না বসে সবসময় "to" বসে, আর "I" বদলে "me" হয়। তাই উত্তর: "He is known to me."',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Object "him" becomes Subject "He".',
      'Step 2: Present Simple "know" becomes "is known".',
      'Step 3: Use fixed preposition "to" + "me" -> "He is known to me."',
    ],
    everydayExampleBn:
      'যেমন চায়ের সাথে বিস্কুট মানায়, তেমনই ইংরেজিতে "known"-এর সাথে সবসময় "to" বন্ধুত্ব করে, "by" নয়!',
    everydayExampleEn:
      'Verbs of mental state like "know" and "oblige" pair with "to", not "by".',
    memoryTrickBn: 'মনে রাখার সূত্র: Known + TO (কখনোই Known BY নয়)!',
    memoryTrickEn: 'Formula: Known + TO (Never Known BY)!',
    followUpQuestion: {
      id: 'fu_eng_02',
      questionText: 'Choose the correct passive form of: "Everybody knows Gandhiji."',
      options: {
        A: 'Gandhiji is known by everybody.',
        B: 'Gandhiji is known to everybody.',
        C: 'Gandhiji was known to everybody.',
        D: 'Gandhiji has been known by everybody.',
      },
      correctAnswer: 'B',
      simpleHintBn: 'বর্তমান কাল ("knows") এবং "known"-এর পরে কোন ছোট শব্দটি বসে খেয়াল করো।',
      simpleHintEn: 'Keep it in Present tense ("is known") and use the fixed preposition for "know".',
    },
  },
  {
    id: 'pyq_2019_s2_eng_03',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s2',
    examinationYear: 2019,
    sessionShift: 'Shift 2',
    bookletSeries: 'Series B',
    originalQuestionNumber: 78,
    subject: 'English',
    topic: 'Vocabulary (Synonyms & Antonyms)',
    difficulty: 'medium',
    questionText: 'Find the word which has the same meaning (Synonym) as "Cautious":',
    questionTextBn: '"Cautious" (সতর্ক বা সাবধানী) শব্দটির সমার্থক শব্দ (Synonym) কোনটি?',
    options: { A: 'Careless', B: 'Careful', C: 'Rash', D: 'Hasty' },
    correctAnswer: 'B',
    simpleConceptBn:
      '"Cautious" শব্দের অর্থ হলো খুব সাবধানী বা সতর্ক থাকা। আর "Careful" মানেও যত্নবান বা সাবধানী। তাই দুটি শব্দের অর্থ একই।',
    simpleConceptEn:
      '"Cautious" means being alert and avoiding danger or mistakes, which directly matches "Careful".',
    whyWrongByOptionBn: {
      A: '"Careless" মানে অসতর্ক বা বেখেয়ালি—এটি বিপরীত শব্দ (Antonym)।',
      C: '"Rash" মানে হঠকারী বা না ভেবে কাজ করা।',
      D: '"Hasty" মানে তাড়াহুড়ো করা।',
    },
    whyWrongByOptionEn: {
      A: '"Careless" is the opposite (antonym) of cautious.',
      C: '"Rash" means acting without thinking carefully.',
      D: '"Hasty" means acting with excessive hurry.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: প্রশ্নে "same meaning" (সমার্থক শব্দ) চেয়েছে।',
      'ধাপ ২: Cautious = সাবধানী।',
      'ধাপ ৩: অপশনগুলোর মধ্যে একমাত্র Careful শব্দের অর্থ সাবধানী।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Look for the synonym (same meaning) of "Cautious".',
      'Step 2: Eliminate antonyms ("Careless", "Rash", "Hasty").',
      'Step 3: Select "Careful" (Option B).',
    ],
    everydayExampleBn:
      'রাস্তা পার হওয়ার সময় আমরা যেমন দুদিকে দেখে সাবধানে (Careful / Cautious হয়ে) হাঁটি, সেটাই হলো Cautious!',
    everydayExampleEn:
      'Looking both ways before crossing a busy street is being cautious and careful.',
    memoryTrickBn: 'Cautious = Caution (সতর্কতা) = Careful (সাবধানী)!',
    memoryTrickEn: 'Caution -> Cautious -> Careful!',
    followUpQuestion: {
      id: 'fu_eng_03',
      questionText: 'Which word is the OPPOSITE (Antonym) of "Cautious"?',
      options: { A: 'Vigilant', B: 'Alert', C: 'Careless', D: 'Watchful' },
      correctAnswer: 'C',
      simpleHintBn: 'এবার কিন্তু বিপরীত শব্দ (Opposite) চেয়েছে! সাবধানীর উল্টো কী?',
      simpleHintEn: 'This asks for the opposite of careful/cautious.',
    },
  },
  {
    id: 'pyq_2024_s1_eng_04',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2024_s1',
    examinationYear: 2024,
    sessionShift: 'Day 1 Shift 1',
    bookletSeries: 'Set A',
    originalQuestionNumber: 82,
    subject: 'English',
    topic: 'Idioms, Phrases & One-Word Substitution',
    difficulty: 'medium',
    questionText: 'A person who looks at the bright side of things is called an:',
    questionTextBn: 'যে মানুষ সবকিছুর ভালো বা উজ্জ্বল দিকটি দেখে (আশাবাদী), তাকে এক কথায় কী বলা হয়?',
    options: { A: 'Pessimist', B: 'Optimist', C: 'Atheist', D: 'Pacifist' },
    correctAnswer: 'B',
    simpleConceptBn:
      'যিনি সব পরিস্থিতিতে ভালো কিছুর আশা করেন তাকে ইংরেজিতে "Optimist" (আশাবাদী) বলে। আর যিনি শুধু খারাপ দিক দেখেন তাকে "Pessimist" (নিরাশাবাদী) বলে।',
    simpleConceptEn:
      'An "Optimist" is someone who remains hopeful and focuses on positive outcomes ("the bright side").',
    whyWrongByOptionBn: {
      A: '"Pessimist" মানে নিরাশাবাদী (যিনি সবকিছুর অন্ধকার দিক বা dark side দেখেন)।',
      C: '"Atheist" মানে নাস্তিক (যিনি ঈশ্বরে বিশ্বাস করেন না)।',
      D: '"Pacifist" মানে শান্তিবাদী (যিনি যুদ্ধের বিরোধী)।',
    },
    whyWrongByOptionEn: {
      A: 'A "Pessimist" looks at the dark side of things.',
      C: 'An "Atheist" is a person who does not believe in God.',
      D: 'A "Pacifist" opposes war and violence.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: প্রশ্নে আছে "looks at the bright side" অর্থাৎ ইতিবাচক বা আশাবাদী মানুষ।',
      'ধাপ ২: ইংরেজিতে আশাবাদী মানুষের এক কথায় প্রকাশ হলো "Optimist"।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Identify the key phrase "bright side of things".',
      'Step 2: Match it with "Optimist" (Option B).',
    ],
    everydayExampleBn:
      'আধ গ্লাস জল দেখে যে বলে "গ্লাসটা অর্ধেক ভর্তি আছে!", সেই হলো আসল Optimist!',
    everydayExampleEn:
      'Seeing a glass as half-full rather than half-empty is the classic example of an optimist.',
    memoryTrickBn: 'Bright side = O (সূর্যের মতো গোল ও উজ্জ্বল) = Optimist! Dark side = Pessimist!',
    memoryTrickEn: 'O for Sun/Bright = Optimist | Pessimist = Dark side.',
    followUpQuestion: {
      id: 'fu_eng_04',
      questionText: 'A person who always looks at the dark side of things is called a:',
      options: { A: 'Optimist', B: 'Pessimist', C: 'Theist', D: 'Philanthropist' },
      correctAnswer: 'B',
      simpleHintBn: 'অন্ধকার দিক (dark side) বা হতাশার দিক যে দেখে তাকে কী বলে?',
      simpleHintEn: 'Recall the opposite of Optimist.',
    },
  },
  {
    id: 'ai_orig_eng_05',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'English',
    topic: 'Sentence Structure & Error Spotting',
    difficulty: 'medium',
    questionText: 'Choose the grammatically correct sentence:',
    questionTextBn: 'ব্যাকরণগতভাবে সঠিক ইংরেজি বাক্যটি বেছে নাও:',
    options: {
      A: 'One of my friend lives in Kolkata.',
      B: 'One of my friends live in Kolkata.',
      C: 'One of my friends lives in Kolkata.',
      D: 'One of my friend live in Kolkata.',
    },
    correctAnswer: 'C',
    simpleConceptBn:
      '"One of..." দিয়ে বাক্য শুরু হলে তার পরের নামটি (Noun) সবসময় বহুবচন (Plural: friends) হয়, কিন্তু ক্রিয়াপদটি (Verb) হয় একবচন (Singular: lives)—কারণ অনেক বন্ধুর মধ্যে "একজন" কলকাতায় থাকে!',
    simpleConceptEn:
      'After "One of + plural noun", the noun must be plural ("friends") because you are choosing from a group, while the verb must be singular ("lives") to agree with "One".',
    whyWrongByOptionBn: {
      A: 'এখানে "friend" একবচন দেওয়া আছে, কিন্তু অনেকের মধ্যে একজন বোঝাতে "friends" হতে হবে।',
      B: 'এখানে "friends" ঠিক আছে, কিন্তু একজনের জন্য verb "live" না হয়ে "lives" হবে।',
      D: 'এখানে "friend" এবং "live" দুটোই ভুল।',
    },
    whyWrongByOptionEn: {
      A: 'Uses singular noun "friend" instead of plural "friends".',
      B: 'Uses plural verb "live" instead of singular verb "lives" for subject "One".',
      D: 'Both noun and verb are incorrect.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: "One of"-এর পরে অনেকগুলো বন্ধু বোঝাতে বহুবচন "my friends" বসবে।',
      'ধাপ ২: কিন্তু কাজটা করছে কজন? মাত্র "One" (একজন)!',
      'ধাপ ৩: কর্তা একজন (Third person singular) হলে verb-এর শেষে "s" যোগ হয় ("lives")। তাই সঠিক উত্তর: "One of my friends lives in Kolkata."',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Check the noun after "One of" -> must be plural ("my friends").',
      'Step 2: Check the true subject -> "One" (singular).',
      'Step 3: Use singular verb "lives" -> "One of my friends lives in Kolkata."',
    ],
    everydayExampleBn:
      'ধরো তোমার ৫টা আম আছে, তার মধ্যে ১টা আম মিষ্টি। তাহলে প্রথমে ৫টা আমের দল (friends) থাকবে, আর মিষ্টি হওয়া কাজটা শুধু ১টা আমের (lives)!',
    everydayExampleEn:
      'You pick ONE apple out of MANY apples—so the group is plural ("friends"), and the action belongs to the single one ("lives").',
    memoryTrickBn: 'সূত্র: One of + Plural Noun (s থাকবে) + Singular Verb (s থাকবে)!',
    memoryTrickEn: 'Formula: One of + Plural Noun (friends) + Singular Verb (lives).',
    followUpQuestion: {
      id: 'fu_eng_05',
      questionText: 'Fill in the blank: One of the boys ___ absent today.',
      options: { A: 'are', B: 'were', C: 'is', D: 'have' },
      correctAnswer: 'C',
      simpleHintBn: 'অনেকগুলো ছেলের (boys) মধ্যে মাত্র একজন (One) অনুপস্থিত! তাই একবচন verb কোনটি হবে?',
      simpleHintEn: 'The subject is "One" (singular) and time is "today" (present).',
    },
  },
  {
    id: 'adapted_eng_06',
    questionOrigin: 'ADAPTED_CONCEPT',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2025,
    subject: 'English',
    topic: 'Grammar (Prepositions, Articles, Tense)',
    difficulty: 'easy',
    questionText: 'Fill in the blank with the correct article: He is ___ honest officer in the Secretariat.',
    questionTextBn: 'সঠিক Article (a / an / the) বসাও: He is ___ honest officer in the Secretariat.',
    options: { A: 'a', B: 'an', C: 'the', D: 'no article' },
    correctAnswer: 'B',
    simpleConceptBn:
      '"Honest" বানানটি "H" দিয়ে শুরু হলেও এর উচ্চারণ হয় "অনেস্ট" (H এখানে উচ্চারিত হয় না বা silent থাকে)। স্বরধ্বনি (অ/আ/ই/উ) দিয়ে উচ্চারণ শুরু হলে তার আগে সবসময় "an" বসে।',
    simpleConceptEn:
      'Choice between "a" and "an" depends on the starting sound, not just the letter. In "honest", the "h" is silent and it begins with a vowel sound ("o"), requiring "an".',
    whyWrongByOptionBn: {
      A: 'শুধু অক্ষর H দেখে "a" বসালে ভুল হবে, কারণ এখানে "হ" উচ্চারণ হচ্ছে না, "অ" উচ্চারণ হচ্ছে।',
      C: 'এখানে নির্দিষ্ট কোনো একজনের কথা না বলে সাধারণ পরিচয়ে বলা হচ্ছে, তাই "the" হবে না।',
      D: 'Singular countable noun ("officer") থাকায় একটি article বসতেই হবে।',
    },
    whyWrongByOptionEn: {
      A: '"a" is used before consonant sounds, whereas "honest" begins with a vowel sound.',
      C: 'Indefinite reference requires "an", not "the".',
      D: 'Singular countable noun "officer" requires an article.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: "honest" শব্দটি মুখে উচ্চারণ করো—"অনেস্ট" (হনেস্ট নয়)।',
      'ধাপ ২: প্রথম ধ্বনিটি হলো "অ" (Vowel sound)।',
      'ধাপ ৩: Vowel sound-এর আগে সবসময় "an" বসে। তাই উত্তর: "an honest officer"।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Pronounce "honest" -> silent "h", starts with vowel sound /ɒ/.',
      'Step 2: Use "an" before vowel sounds -> "an honest officer".',
    ],
    everydayExampleBn:
      'যেমন "an hour" (আওয়ার), "an M.A." (এম-এ)—বানান যাই হোক, কানে শুনতে "অ/আ/এ" লাগলেই চোখ বন্ধ করে "an" বসাবে!',
    everydayExampleEn:
      'Just like "an hour" or "an MLA", trust your ears (sound) rather than your eyes (spelling)!',
    memoryTrickBn: 'কানে শুনতে স্বরবর্ণ (অ, আ, ই, এ) = AN বসবেই!',
    memoryTrickEn: 'Silent H (hour, honest, heir, honour) -> Always takes AN!',
    followUpQuestion: {
      id: 'fu_eng_06',
      questionText: 'The train arrived ___ hour late.',
      options: { A: 'a', B: 'an', C: 'the', D: 'none' },
      correctAnswer: 'B',
      simpleHintBn: '"hour"-এর উচ্চারণ "আওয়ার" (H উচ্চারিত হয় না)।',
      simpleHintEn: '"hour" has a silent H and starts with a vowel sound.',
    },
  },

  // ==================== GENERAL STUDIES QUESTIONS ====================
  {
    id: 'pyq_2019_s1_gs_01',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 12,
    subject: 'General Studies',
    topic: 'Indian Polity & Constitution',
    difficulty: 'easy',
    questionText: 'Who was the Chairman of the Drafting Committee of the Constituent Assembly of India?',
    questionTextBn: 'ভারতের গণপরিষদের খসড়া কমিটির (Drafting Committee) চেয়ারম্যান কে ছিলেন?',
    options: {
      A: 'Dr. Rajendra Prasad',
      B: 'Jawaharlal Nehru',
      C: 'Dr. B. R. Ambedkar',
      D: 'Sardar Vallabhbhai Patel',
    },
    correctAnswer: 'C',
    simpleConceptBn:
      'ভারতের সংবিধান লিখে তৈরি করার জন্য যে মূল কমিটি ("Drafting Committee" বা খসড়া কমিটি) গঠন করা হয়েছিল, তার সভাপতি বা চেয়ারম্যান ছিলেন ডঃ বি. আর. আম্বেদকর।',
    simpleConceptEn:
      'Dr. B. R. Ambedkar chaired the 7-member Drafting Committee set up on 29 August 1947 to prepare the draft of the Indian Constitution.',
    whyWrongByOptionBn: {
      A: 'ডঃ রাজেন্দ্র প্রসাদ ছিলেন পুরো গণপরিষদের (Constituent Assembly) স্থায়ী সভাপতি, খসড়া কমিটির চেয়ারম্যান নন।',
      B: 'জওহরলাল নেহরু ছিলেন ইউনিয়ন পাওয়ারস কমিটি ও ইউনিয়ন কনস্টিটিউশন কমিটির প্রধান।',
      D: 'সর্দার বল্লভভাই প্যাটেল ছিলেন প্রাদেশিক সংবিধান ও মৌলিক অধিকার সংক্রান্ত কমিটির প্রধান।',
    },
    whyWrongByOptionEn: {
      A: 'Dr. Rajendra Prasad was the Permanent President of the Constituent Assembly as a whole.',
      B: 'Jawaharlal Nehru chaired the Union Constitution Committee.',
      D: 'Sardar Patel chaired the Provincial Constitution Committee.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: প্রশ্নে পুরো গণপরিষদ নয়, নির্দিষ্টভাবে "Drafting Committee" (খসড়া কমিটি)-এর কথা জানতে চেয়েছে।',
      'ধাপ ২: ১৯৪৭ সালের ২৯ আগস্ট গঠিত এই খসড়া কমিটির চেয়ারম্যান ছিলেন ডঃ বি. আর. আম্বেদকর।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Distinguish between the Constituent Assembly President (Rajendra Prasad) and the Drafting Committee Chairman.',
      'Step 2: Select Dr. B. R. Ambedkar (Option C).',
    ],
    everydayExampleBn:
      'স্কুলে যেমন প্রধান শিক্ষক পুরো স্কুলের প্রধান (ডঃ রাজেন্দ্র প্রসাদ), কিন্তু বার্ষিক পত্রিকা লেখার কমিটির প্রধান থাকেন নির্দিষ্ট একজন শিক্ষক (ডঃ আম্বেদকর)!',
    everydayExampleEn:
      'Just as a school has a Principal (Rajendra Prasad) and a head of the Editorial Board who writes the rulebook (Dr. Ambedkar).',
    memoryTrickBn: 'Drafting (সংবিধানের খসড়া লেখা) = সংবিধানের জনক ডঃ বি. আর. আম্বেদকর!',
    memoryTrickEn: 'Drafting Committee = Father of Indian Constitution = Dr. B. R. Ambedkar.',
    followUpQuestion: {
      id: 'fu_gs_01',
      questionText: 'Who was the Permanent President of the Constituent Assembly of India?',
      options: {
        A: 'Dr. Sachchidananda Sinha',
        B: 'Dr. Rajendra Prasad',
        C: 'Dr. B. R. Ambedkar',
        D: 'B. N. Rau',
      },
      correctAnswer: 'B',
      simpleHintBn: 'এবার পুরো গণপরিষদের স্থায়ী সভাপতি (Permanent President) কে ছিলেন তা জানতে চেয়েছে!',
      simpleHintEn: 'Recall who presided over the entire Constituent Assembly permanently.',
    },
  },
  {
    id: 'pyq_2019_s1_gs_02',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 21,
    subject: 'General Studies',
    topic: 'Indian History & National Movement',
    difficulty: 'easy',
    questionText: 'In which year did the Jallianwala Bagh massacre take place?',
    questionTextBn: 'কত খ্রিস্টাব্দে জালিয়ানওয়ালাবাগের হত্যাকাণ্ড ঘটেছিল?',
    options: { A: '1917', B: '1918', C: '1919', D: '1920' },
    correctAnswer: 'C',
    simpleConceptBn:
      '১৯১৯ সালের ১৩ই এপ্রিল পাঞ্জাবের অমৃতসরে বৈশাখী উৎসবের দিন জালিয়ানওয়ালাবাগের মর্মান্তিক হত্যাকাণ্ড ঘটেছিল। এর প্রতিবাদে রবীন্দ্রনাথ ঠাকুর "নাইটহুড" উপাধি ত্যাগ করেছিলেন।',
    simpleConceptEn:
      'The Jallianwala Bagh massacre took place on 13 April 1919 in Amritsar, Punjab, following protests against the Rowlatt Act.',
    whyWrongByOptionBn: {
      A: '১৯১৭ সালে চম্পারণ সত্যাগ্রহ হয়েছিল, জালিয়ানওয়ালাবাগ নয়।',
      B: '১৯১৮ সালে খেদা ও আহমেদাবাদ আন্দোলন হয়েছিল।',
      D: '১৯২০ সালে অসহযোগ আন্দোলন (Non-Cooperation Movement) শুরু হয়েছিল।',
    },
    whyWrongByOptionEn: {
      A: '1917 is the year of the Champaran Satyagraha.',
      B: '1918 is associated with the Kheda Satyagraha and Ahmedabad Mill Strike.',
      D: '1920 marks the launch of the Non-Cooperation Movement.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: রাওলাট আইন (Rowlatt Act) পাস হয়েছিল ১৯১৯ সালে।',
      'ধাপ ২: সেই আইনের প্রতিবাদে ১৯১৯ সালের ১৩ই এপ্রিল অমৃতসরের জালিয়ানওয়ালাবাগে মানুষ সমবেত হয়েছিলেন।',
      'ধাপ ৩: তাই সঠিক উত্তর ১৯১৯ (Option C)।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Recall the Rowlatt Act & Montague-Chelmsford Reforms year (1919).',
      'Step 2: Match Jallianwala Bagh massacre to 13 April 1919 (Option C).',
    ],
    everydayExampleBn:
      '১৯১৭ (চম্পারণ) -> ১৯১৮ (খেদা) -> ১৯১৯ (জালিয়ানওয়ালাবাগ) -> ১৯২০ (অসহযোগ)—যেন সিঁড়ির পরপর চারটি ধাপ!',
    everydayExampleEn:
      'Remember the chronological ladder: 1917 (Champaran) -> 1918 (Kheda) -> 1919 (Jallianwala Bagh) -> 1920 (Non-Cooperation).',
    memoryTrickBn: '১৩ই এপ্রিল ১৯১৯ = জালিয়ানওয়ালাবাগ + রাওলাট আইন!',
    memoryTrickEn: '13 April 1919 = Rowlatt Act + Jallianwala Bagh.',
    followUpQuestion: {
      id: 'fu_gs_02',
      questionText: 'Who renounced his Knighthood in protest against the Jallianwala Bagh massacre in 1919?',
      options: {
        A: 'Mahatma Gandhi',
        B: 'Rabindranath Tagore',
        C: 'Subhas Chandra Bose',
        D: 'Chittaranjan Das',
      },
      correctAnswer: 'B',
      simpleHintBn: 'উপরে ব্যাখ্যার মধ্যেই এই মহান বাঙালি কবির নাম বলা হয়েছে!',
      simpleHintEn: 'He composed India’s national anthem and returned the British Knighthood title in May 1919.',
    },
  },
  {
    id: 'pyq_2019_s2_gs_03',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s2',
    examinationYear: 2019,
    sessionShift: 'Shift 2',
    bookletSeries: 'Series B',
    originalQuestionNumber: 28,
    subject: 'General Studies',
    topic: 'Geography of India & West Bengal',
    difficulty: 'easy',
    questionText: 'Which river is historically known as the "Sorrow of Bengal"?',
    questionTextBn: 'কোন নদীকে ঐতিহাসিকভাবে "বাংলার দুঃখ" (Sorrow of Bengal) বলা হতো?',
    options: { A: 'Hooghly', B: 'Teesta', C: 'Damodar', D: 'Ajay' },
    correctAnswer: 'C',
    simpleConceptBn:
      'দামোদর নদে আগে প্রতি বছর বর্ষাকালে ভয়াবহ বন্যা হতো এবং প্রচুর ফসল ও ঘরবাড়ির ক্ষতি হতো। তাই দামোদর নদকে "বাংলার দুঃখ" বলা হতো। পরে দামোদর ভ্যালি কর্পোরেশন (DVC) বাঁধ তৈরি করে এই বন্যা নিয়ন্ত্রণ করে।',
    simpleConceptEn:
      'The Damodar River was known as the "Sorrow of Bengal" because of its devastating annual floods across the plains of West Bengal before the Damodar Valley Corporation (DVC) dams were built.',
    whyWrongByOptionBn: {
      A: 'হুগলি নদী বাংলার প্রধান নৌ-বাণিজ্য পথ, একে বাংলার দুঃখ বলা হয় না।',
      B: 'তিস্তা উত্তরবঙ্গের খরস্রোতা নদী ("ত্রাসের নদী" বলা হয়), কিন্তু ঐতিহাসিকভাবে "বাংলার দুঃখ" দামোদর।',
      D: 'অজয় নদ রাঢ় অঞ্চলের নদী, তবে "বাংলার দুঃখ" উপাধি দামোদরের।',
    },
    whyWrongByOptionEn: {
      A: 'Hooghly is the lifeline river of southern West Bengal.',
      B: 'Teesta is the major river of North Bengal.',
      D: 'Ajay flows through Birbhum and Bardhaman but is not titled Sorrow of Bengal.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: ছোটনাগপুর মালভূমি থেকে উৎপন্ন হয়ে বর্ধমান ও হুগলির ওপর দিয়ে বয়ে যাওয়া নদীটি হলো দামোদর।',
      'ধাপ ২: ভয়াবহ বন্যার জন্য একেই "বাংলার দুঃখ" (Sorrow of Bengal) বলা হতো।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Recall the river controlled by India’s first multipurpose river valley project (DVC, 1948).',
      'Step 2: Select Damodar (Option C).',
    ],
    everydayExampleBn:
      'যেমন কোশী নদীকে "বিহারের দুঃখ" বলা হয়, তেমনই আমাদের পশ্চিমবঙ্গের ক্ষেত্রে নামটি হলো "দামোদর"!',
    everydayExampleEn:
      'Just as Kosi is the "Sorrow of Bihar", Damodar is the "Sorrow of Bengal".',
    memoryTrickBn: 'দামোদর = দ-য়ে দামোদর, দ-য়ে দুঃখ (বাংলার দুঃখ)!',
    memoryTrickEn: 'D for Damodar = D for Disaster/Sorrow of Bengal (tamed by DVC)!',
    followUpQuestion: {
      id: 'fu_gs_03',
      questionText: 'Which river is known as the "Sorrow of Bihar"?',
      options: { A: 'Damodar', B: 'Kosi', C: 'Mahanadi', D: 'Gomti' },
      correctAnswer: 'B',
      simpleHintBn: 'উপরে উদাহরণের মধ্যেই আমরা বিহারের নদীটির নাম পড়েছি!',
      simpleHintEn: 'We just mentioned this river in the comparison above!',
    },
  },
  {
    id: 'pyq_2024_s1_gs_04',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2024_s1',
    examinationYear: 2024,
    sessionShift: 'Day 1 Shift 1',
    bookletSeries: 'Set A',
    originalQuestionNumber: 19,
    subject: 'General Studies',
    topic: 'Everyday General Science',
    difficulty: 'easy',
    questionText: 'Deficiency of Vitamin C in the human diet causes which disease?',
    questionTextBn: 'খাদ্যে ভিটামিন C (Vitamin C)-এর অভাবে মানুষের কোন রোগটি হয়?',
    options: { A: 'Rickets', B: 'Beriberi', C: 'Scurvy', D: 'Night Blindness' },
    correctAnswer: 'C',
    simpleConceptBn:
      'ভিটামিন C (যাকে অ্যাসকরবিক অ্যাসিড বলা হয় এবং যা পাতিলেবু, আমলকী, পেয়ারায় প্রচুর থাকে)-এর অভাব হলে দাঁতের মাড়ি ফুলে রক্ত পড়ে। এই রোগটিকে "স্কার্ভি" (Scurvy) বলে।',
    simpleConceptEn:
      'Deficiency of Vitamin C (Ascorbic Acid) causes Scurvy, characterized by bleeding gums and slow wound healing.',
    whyWrongByOptionBn: {
      A: 'রিকেট (Rickets) হয় ভিটামিন D-এর অভাবে (হাড় বেঁকে যায়)।',
      B: 'বেরিবেরি (Beriberi) হয় ভিটামিন B1 (থায়ামিন)-এর অভাবে।',
      D: 'রাতকানা (Night Blindness) হয় ভিটামিন A-এর অভাবে।',
    },
    whyWrongByOptionEn: {
      A: 'Rickets is caused by Vitamin D deficiency.',
      B: 'Beriberi is caused by Vitamin B1 deficiency.',
      D: 'Night Blindness is caused by Vitamin A deficiency.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: ভিটামিন A -> রাতকানা, ভিটামিন B1 -> বেরিবেরি, ভিটামিন C -> স্কার্ভি, ভিটামিন D -> রিকেট।',
      'ধাপ ২: তাই ভিটামিন C-এর অভাবে হয় Scurvy (Option C)।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Match Vitamin A (Night Blindness), B1 (Beriberi), C (Scurvy), D (Rickets).',
      'Step 2: Select Scurvy (Option C).',
    ],
    everydayExampleBn:
      'দাঁতের মাড়ি সুস্থ রাখতে ডাক্তারবাবুরা যেমন লেবু বা আমলকী (Vitamin C) খেতে বলেন, তা না খেলেই মাড়ির রোগ স্কার্ভি হয়!',
    everydayExampleEn:
      'Sailors on long voyages used to carry citrus fruits (lemons/limes) specifically to prevent Scurvy.',
    memoryTrickBn: 'Vitamin C = Citrus (লেবু) = স্কার্ভি (Scurvy) দূর করে!',
    memoryTrickEn: 'C for Citrus -> C for Vitamin C -> Scurvy!',
    followUpQuestion: {
      id: 'fu_gs_04',
      questionText: 'Night Blindness is caused by the deficiency of which vitamin?',
      options: { A: 'Vitamin A', B: 'Vitamin B1', C: 'Vitamin C', D: 'Vitamin D' },
      correctAnswer: 'A',
      simpleHintBn: 'চোখের দৃষ্টি ভালো রাখতে গাজর ও শাকসবজির কোন ভিটামিনটি সবচেয়ে জরুরি?',
      simpleHintEn: 'Which vitamin found in carrots is essential for eyesight?',
    },
  },
  {
    id: 'ai_orig_gs_05',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'General Studies',
    topic: 'Geography of India & West Bengal',
    difficulty: 'medium',
    questionText: 'With which country does West Bengal share its longest international boundary?',
    questionTextBn: 'পশ্চিমবঙ্গের সাথে কোন প্রতিবেশী দেশের আন্তর্জাতিক সীমান্ত সবচেয়ে দীর্ঘ?',
    options: { A: 'Nepal', B: 'Bhutan', C: 'Bangladesh', D: 'Myanmar' },
    correctAnswer: 'C',
    simpleConceptBn:
      'পশ্চিমবঙ্গের তিনটি প্রতিবেশী দেশ রয়েছে—বাংলাদেশ, নেপাল এবং ভুটান। এর মধ্যে বাংলাদেশের সাথে পশ্চিমবঙ্গের সীমান্ত সবচেয়ে দীর্ঘ (প্রায় ২,২১৭ কিলোমিটার)।',
    simpleConceptEn:
      'West Bengal shares international borders with three countries (Bangladesh, Nepal, and Bhutan). The border with Bangladesh is by far the longest at approximately 2,217 km.',
    whyWrongByOptionBn: {
      A: 'নেপালের সাথে কেবল দার্জিলিং ও কালিম্পং অঞ্চলে ছোট সীমান্ত রয়েছে।',
      B: 'ভুটানের সাথে ডুয়ার্স অঞ্চলে সীমান্ত থাকলেও তা বাংলাদেশের তুলনায় অনেক ছোট।',
      D: 'মায়ানমারের সাথে পশ্চিমবঙ্গের কোনো সীমান্ত নেই।',
    },
    whyWrongByOptionEn: {
      A: 'Nepal shares a short border along Darjeeling.',
      B: 'Bhutan shares a much shorter northern border.',
      D: 'Myanmar does not border West Bengal.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: পশ্চিমবঙ্গের মানচিত্রের পূর্ব দিক জুড়ে উত্তর থেকে দক্ষিণ পর্যন্ত কোন দেশ রয়েছে? বাংলাদেশ।',
      'ধাপ ২: ভারতের রাজ্যগুলোর মধ্যেও পশ্চিমবঙ্গই বাংলাদেশের সাথে সবচেয়ে দীর্ঘ সীমান্ত ভাগ করে।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Observe the entire eastern flank of West Bengal from Cooch Behar down to South 24 Parganas.',
      'Step 2: That entire 2,217 km boundary is with Bangladesh (Option C).',
    ],
    everydayExampleBn:
      'পশ্চিমবঙ্গের মানচিত্র দেখলে দেখা যায় উত্তর ২৪ পরগনা, নদীয়া, মুর্শিদাবাদ, মালদা থেকে কোচবিহার—পুরো পূর্ব পাশটাই বাংলাদেশের পাশেই!',
    everydayExampleEn:
      '10 districts of West Bengal touch the Bangladesh border.',
    memoryTrickBn: 'দুই বাংলা পাশাপাশি = সবচেয়ে লম্বা সীমান্ত (২,২১৭ কিমি)!',
    memoryTrickEn: 'Bengal + Bangladesh = Longest border (2,217 km).',
    followUpQuestion: {
      id: 'fu_gs_05',
      questionText: 'How many foreign countries share an international border with the state of West Bengal?',
      options: { A: 'Two', B: 'Three', C: 'Four', D: 'Five' },
      correctAnswer: 'B',
      simpleHintBn: 'বাংলাদেশ ছাড়া উত্তরের পাহাড়ে আর কোন দুটি দেশ পশ্চিমবঙ্গকে ছুঁয়ে আছে?',
      simpleHintEn: 'Count: Bangladesh, Nepal, and Bhutan.',
    },
  },
  {
    id: 'ai_orig_gs_06',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'General Studies',
    topic: 'Indian History & National Movement',
    difficulty: 'medium',
    questionText: 'Who founded the "Atmiya Sabha" in Kolkata in 1815?',
    questionTextBn: '১৮১৫ সালে কলকাতায় "আত্মীয় সভা" কে প্রতিষ্ঠা করেছিলেন?',
    options: {
      A: 'Ishwar Chandra Vidyasagar',
      B: 'Raja Rammohan Roy',
      C: 'Swami Vivekananda',
      D: 'Henry Louis Vivian Derozio',
    },
    correctAnswer: 'B',
    simpleConceptBn:
      'ভারতের নবজাগরণের পথিকৃৎ রাজা রামমোহন রায় ১৮১৫ সালে কলকাতায় একেশ্বরবাদ ও সমাজ সংস্কারের আলোচনার জন্য "আত্মীয় সভা" প্রতিষ্ঠা করেছিলেন। পরে ১৮২৮ সালে তিনি ব্রাহ্মসমাজ প্রতিষ্ঠা করেন।',
    simpleConceptEn:
      'Raja Rammohan Roy established the Atmiya Sabha in 1815 in Kolkata to promote philosophical discussion and social reform, prior to founding the Brahmo Samaj in 1828.',
    whyWrongByOptionBn: {
      A: 'ঈশ্বরচন্দ্র বিদ্যাসাগর বিধবা বিবাহ আইন (১৮৫৬) ও নারী শিক্ষার প্রসারের জন্য বিখ্যাত।',
      C: 'স্বামী বিবেকানন্দ ১৮৯৭ সালে রামকৃষ্ণ মিশন প্রতিষ্ঠা করেন।',
      D: 'ডিরোজিও "নব্যবঙ্গ" (Young Bengal) ও Academic Association প্রতিষ্ঠা করেছিলেন।',
    },
    whyWrongByOptionEn: {
      A: 'Vidyasagar championed Widow Remarriage (1856) and Sanskrit education.',
      C: 'Swami Vivekananda founded the Ramakrishna Mission in 1897.',
      D: 'Derozio founded the Academic Association and led the Young Bengal movement.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: সালটি হলো ১৮১৫—ঊনবিংশ শতাব্দীর একেবারে শুরুতে সমাজ সংস্কারের সূচনা করেছিলেন রাজা রামমোহন রায়।',
      'ধাপ ২: ১৮১৫ -> আত্মীয় সভা এবং ১৮২৮ -> ব্রাহ্মসমাজ—দুটোই রাজা রামমোহন রায়ের সৃষ্টি।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Connect 1815 (Atmiya Sabha) and 1828 (Brahmo Samaj) to Raja Rammohan Roy.',
      'Step 2: Select Option B.',
    ],
    everydayExampleBn:
      'বড় কোনো প্রতিষ্ঠান (ব্রাহ্মসমাজ, ১৮২৮) গড়ার আগে যেমন বন্ধুবান্ধব ও আত্মীয়দের নিয়ে ছোট বৈঠক ("আত্মীয় সভা", ১৮১৫) শুরু হয়!',
    everydayExampleEn:
      'Atmiya Sabha (1815) was the intimate forerunner to the larger Brahmo Samaj (1828).',
    memoryTrickBn: '১৮১৫ আত্মীয় সভা -> ১৮২৮ ব্রাহ্মসমাজ = রাজা রামমোহন রায়!',
    memoryTrickEn: '1815 Atmiya Sabha -> 1828 Brahmo Samaj = Raja Rammohan Roy.',
    followUpQuestion: {
      id: 'fu_gs_06',
      questionText: 'In which year did Raja Rammohan Roy establish the Brahmo Sabha (Brahmo Samaj)?',
      options: { A: '1815', B: '1828', C: '1856', D: '1875' },
      correctAnswer: 'B',
      simpleHintBn: 'আত্মীয় সভার (১৮১৫) ঠিক ১৩ বছর পরে ব্রাহ্মসমাজ প্রতিষ্ঠিত হয়েছিল!',
      simpleHintEn: 'Recall the year mentioned right next to Atmiya Sabha in the explanation.',
    },
  },

  // ==================== ARITHMETIC QUESTIONS ====================
  {
    id: 'pyq_2019_s1_arith_01',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 42,
    subject: 'Arithmetic',
    topic: 'Percentage',
    difficulty: 'easy',
    questionText: 'If 30% of a number is 120, then what is 60% of that number?',
    questionTextBn: 'কোনো একটি সংখ্যার ৩০% যদি ১২০ হয়, তবে ওই সংখ্যাটির ৬০% কত হবে?',
    options: { A: '180', B: '240', C: '300', D: '400' },
    correctAnswer: 'B',
    numericVerification: {
      formulaDescription: '(120 / 30) * 60',
      expectedValue: 240,
      computedValue: (120 / 30) * 60,
    },
    simpleConceptBn:
      'এখানে মূল সংখ্যাটি বের করারও দরকার নেই! ৩০%-এর ঠিক দ্বিগুণ (২ গুণ) হলো ৬০%। তাই উত্তরও হবে ১২০-এর ঠিক দ্বিগুণ অর্থাৎ ২৪০!',
    simpleConceptEn:
      'Since 60% is exactly double of 30%, 60% of the number is simply double of 120, which is 240.',
    whyWrongByOptionBn: {
      A: '১৮০ হলো সংখ্যাটির ৪৫%, ৬০% নয়।',
      C: '৩০০ হলো সংখ্যাটির ৭৫%।',
      D: '৪০০ হলো পুরো সংখ্যাটি (১০০%), কিন্তু প্রশ্নে ৬০% চেয়েছে!',
    },
    whyWrongByOptionEn: {
      A: '180 is 45% of the number.',
      C: '300 is 75% of the number.',
      D: '400 is 100% (the whole number itself), whereas the question asks for 60%.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: দেওয়া আছে, সংখ্যাটির ৩০% = ১২০।',
      'ধাপ ২: আমাদের বের করতে হবে ৬০%। লক্ষ্য করো, ৩০% × ২ = ৬০%।',
      'ধাপ ৩: তাই ১২০ × ২ = ২৪০! (অথবা পুরো সংখ্যাটি = ১২০ × ১০০ ÷ ৩০ = ৪০০, তার ৬০% = ২৪০)।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Given 30% of N = 120.',
      'Step 2: Notice that 60% = 2 × 30%.',
      'Step 3: Multiply 120 by 2 = 240.',
    ],
    everydayExampleBn:
      'ধরো ৩০টা লজেন্সের দাম ১২০ টাকা। তাহলে ৬০টা লজেন্স (ঠিক ডবল লজেন্স)-এর দাম কত হবে? ১২০ টাকার ডবল = ২৪০ টাকা!',
    everydayExampleEn:
      'If 30 apples cost Rs 120, then 60 apples (double the quantity) will cost double the price: Rs 240!',
    memoryTrickBn: '৩০% থেকে ৬০% মানে ডবল (× ২), তাই ১২০ × ২ = ২৪০ (২ সেকেন্ডে উত্তর)!',
    memoryTrickEn: 'Shortcut: 60% is 2 × 30%, so 2 × 120 = 240 in 2 seconds!',
    followUpQuestion: {
      id: 'fu_arith_01',
      questionText: 'If 25% of a number is 75, what is 50% of that number?',
      options: { A: '125', B: '150', C: '200', D: '300' },
      correctAnswer: 'B',
      simpleHintBn: '২৫%-এর ঠিক ডবল হলো ৫০%! তাহলে ৭৫-এর ডবল কত হবে?',
      simpleHintEn: '50% is double of 25%, so just double 75!',
    },
  },
  {
    id: 'pyq_2019_s1_arith_02',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s1',
    examinationYear: 2019,
    sessionShift: 'Shift 1',
    bookletSeries: 'Series A',
    originalQuestionNumber: 48,
    subject: 'Arithmetic',
    topic: 'Profit & Loss',
    difficulty: 'easy',
    questionText: 'A bicycle is bought for Rs. 1,500 and sold for Rs. 1,800. What is the profit percentage?',
    questionTextBn: 'একটি সাইকেল ১,৫০০ টাকায় কিনে ১,৮০০ টাকায় বিক্রি করা হলে শতকরা কত লাভ (Profit %) হবে?',
    options: { A: '15%', B: '20%', C: '25%', D: '30%' },
    correctAnswer: 'B',
    numericVerification: {
      formulaDescription: '((1800 - 1500) / 1500) * 100',
      expectedValue: 20,
      computedValue: ((1800 - 1500) / 1500) * 100,
    },
    simpleConceptBn:
      'শতকরা লাভ (Profit %) সবসময় কেনা দামের (Cost Price) ওপর হিসাব করতে হয়। এখানে ১,৫০০ টাকায় লাভ হয়েছে ৩০০ টাকা, অর্থাৎ ৫ ভাগের ১ ভাগ = ২০% লাভ!',
    simpleConceptEn:
      'Profit percentage is always calculated on the Cost Price (CP): Profit % = (Profit / CP) × 100.',
    whyWrongByOptionBn: {
      A: '১৫% লাভ হলে লাভের পরিমাণ হতো ২২৫ টাকা, ৩০০ টাকা নয়।',
      C: '২৫% মানে চার ভাগের এক ভাগ (৩৭৫ টাকা লাভ)।',
      D: 'ভুল করে ৩০০ দেখা মাত্র ৩০% ভেবে ফেললে এই ভুলটি হয়, কিন্তু কেনা দাম ১,০০০ টাকা নয়, ১,৫০০ টাকা!',
    },
    whyWrongByOptionEn: {
      A: '15% of 1500 is 225, not 300.',
      C: '25% of 1500 is 375.',
      D: 'Mistaking Rs 300 profit directly for 30% ignores that the base CP is 1500, not 1000.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: কেনা দাম (CP) = ১,৫০০ টাকা এবং বিক্রয়মূল্য (SP) = ১,৮০০ টাকা।',
      'ধাপ ২: মোট লাভ = ১,৮০০ − ১,৫০০ = ৩০০ টাকা।',
      'ধাপ ৩: শতকরা লাভ = (মোট লাভ ÷ কেনা দাম) × ১০০ = (৩০০ ÷ ১,৫০০) × ১০০ = (১ ÷ ৫) × ১০০ = ২০%।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Profit = SP − CP = 1800 − 1500 = Rs 300.',
      'Step 2: Profit % = (300 / 1500) × 100 = (1 / 5) × 100 = 20%.',
    ],
    everydayExampleBn:
      'ধরো তুমি পকেট থেকে ১,৫০০ টাকা দিয়ে সাইকেলটা কিনলে, আর বিক্রি করে ৩০০ টাকা বেশি পেলে। ১৫০০ টাকার মধ্যে ৩০০ টাকা মানে প্রতি ৫ টাকায় ১ টাকা লাভ, অর্থাৎ ১০০ টাকায় ২০ টাকা (২০%)!',
    everydayExampleEn:
      'Earning Rs 300 on Rs 1,500 is 1 rupee gained for every 5 rupees spent = 20%.',
    memoryTrickBn: 'সূত্র: শতকরা লাভ = (লাভ ÷ কেনা দাম) × ১০০। নিচে সবসময় কেনা দাম বসবে!',
    memoryTrickEn: 'Always put Cost Price (CP) in the denominator: (Profit / CP) × 100.',
    followUpQuestion: {
      id: 'fu_arith_02',
      questionText: 'A bag is bought for Rs. 400 and sold for Rs. 500. What is the profit percentage?',
      options: { A: '20%', B: '25%', C: '10%', D: '30%' },
      correctAnswer: 'B',
      simpleHintBn: 'লাভ = ৫০০ − ৪০০ = ১০০ টাকা। এবার (১০০ ÷ ৪০০) × ১০০ হিসাব করো!',
      simpleHintEn: 'Profit is Rs 100 on a Cost Price of Rs 400. Calculate (100 / 400) × 100.',
    },
  },
  {
    id: 'pyq_2019_s2_arith_03',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2019_s2',
    examinationYear: 2019,
    sessionShift: 'Shift 2',
    bookletSeries: 'Series B',
    originalQuestionNumber: 53,
    subject: 'Arithmetic',
    topic: 'Simple & Compound Interest',
    difficulty: 'easy',
    questionText: 'Find the simple interest on Rs. 2,000 for 3 years at 5% per annum.',
    questionTextBn: 'বার্ষিক ৫% সরল সুদের হারে ২,০০০ টাকার ৩ বছরের সরল সুদ (Simple Interest) কত হবে?',
    options: { A: 'Rs. 250', B: 'Rs. 300', C: 'Rs. 350', D: 'Rs. 400' },
    correctAnswer: 'B',
    numericVerification: {
      formulaDescription: '(2000 * 3 * 5) / 100',
      expectedValue: 300,
      computedValue: (2000 * 3 * 5) / 100,
    },
    simpleConceptBn:
      '৫% সুদের হার মানে ১০০ টাকায় ১ বছরে সুদ ৫ টাকা। তাহলে ২,০০০ টাকায় ১ বছরের সুদ হবে ১০০ টাকা, আর ৩ বছরের সুদ হবে ১০০ × ৩ = ৩০০ টাকা!',
    simpleConceptEn:
      'Using SI = (P × R × T) / 100: (2000 × 5 × 3) / 100 = Rs. 300.',
    whyWrongByOptionBn: {
      A: '২৫০ টাকা হলো ২.৫ বছরের সুদ, ৩ বছরের নয়।',
      C: '৩৫০ টাকা গুণফলের ভুল হিসাব।',
      D: '৪০০ টাকা হলো ৪ বছরের সুদ (১০০ × ৪)।',
    },
    whyWrongByOptionEn: {
      A: 'Rs 250 corresponds to 2.5 years.',
      C: 'Arithmetic miscalculation.',
      D: 'Rs 400 corresponds to 4 years, not 3 years.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: আসল (P) = ২,০০০ টাকা, সময় (T) = ৩ বছর, সুদের হার (R) = ৫%।',
      'ধাপ ২: সরল সুদ (SI) = (P × R × T) ÷ ১০০ = (২,০০০ × ৫ × ৩) ÷ ১০০।',
      'ধাপ ৩: ২,০০০-কে ১০০ দিয়ে ভাগ করলে হয় ২০। এবার ২০ × ৫ × ৩ = ৩০০ টাকা।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Identify P = 2000, R = 5%, T = 3 years.',
      'Step 2: Apply SI = (2000 × 5 × 3) / 100 = 20 × 15 = Rs. 300.',
    ],
    everydayExampleBn:
      'ব্যাংকে ১০০ টাকা রাখলে বছরে দেয় ৫ টাকা। তাহলে ২,০০০ টাকা (২০টি ১০০ টাকার নোট) রাখলে বছরে পাবে ২০ × ৫ = ১০০ টাকা। ৩ বছরে পাবে ৩০০ টাকা!',
    everydayExampleEn:
      '20 notes of Rs 100 each earn Rs 5 per year = Rs 100/year. Over 3 years, that is Rs 300.',
    memoryTrickBn: 'সরল সুদের ম্যাজিক সূত্র: SI = (আসল × বছর × হার) ÷ ১০০!',
    memoryTrickEn: 'Classic Formula: SI = (P × R × T) / 100.',
    followUpQuestion: {
      id: 'fu_arith_03',
      questionText: 'What is the simple interest on Rs. 1,000 for 2 years at 10% per annum?',
      options: { A: 'Rs. 100', B: 'Rs. 200', C: 'Rs. 250', D: 'Rs. 300' },
      correctAnswer: 'B',
      simpleHintBn: '১,০০০ টাকার ১০% মানে ১ বছরে ১০০ টাকা। তাহলে ২ বছরে কত হবে?',
      simpleHintEn: '(1000 × 2 × 10) / 100 = ?',
    },
  },
  {
    id: 'pyq_2024_s1_arith_04',
    questionOrigin: 'AUTHENTIC_PYQ',
    sourceDocumentId: 'src_wbpsc_2024_s1',
    examinationYear: 2024,
    sessionShift: 'Day 1 Shift 1',
    bookletSeries: 'Set A',
    originalQuestionNumber: 61,
    subject: 'Arithmetic',
    topic: 'Time & Work',
    difficulty: 'medium',
    questionText: 'A can complete a piece of work in 10 days and B can complete the same work in 15 days. Working together, in how many days will they finish the work?',
    questionTextBn: 'A একটি কাজ ১০ দিনে এবং B সেই কাজটি ১৫ দিনে করতে পারে। তারা দুজনে একসাথে কাজ করলে কত দিনে কাজটি শেষ হবে?',
    options: { A: '5 days', B: '6 days', C: '8 days', D: '12 days' },
    correctAnswer: 'B',
    numericVerification: {
      formulaDescription: '(10 * 15) / (10 + 15)',
      expectedValue: 6,
      computedValue: (10 * 15) / (10 + 15),
    },
    simpleConceptBn:
      'মনে করো মোট কাজ হলো ৩০টি রসগোল্লা তৈরি করা (১০ আর ১৫-র ল.সা.গু হলো ৩০)। A ১০ দিনে ৩০টি বানায়, মানে রোজ ৩টি। B ১৫ দিনে ৩০টি বানায়, মানে রোজ ২টি। দুজনে মিলে রোজ (৩ + ২) = ৫টি বানায়। তাহলে ৩০টি বানাতে সময় লাগবে ৩০ ÷ ৫ = ৬ দিন!',
    simpleConceptEn:
      'Take total work as LCM(10, 15) = 30 units. A does 3 units/day and B does 2 units/day. Together they do 5 units/day, finishing 30 units in 30 / 5 = 6 days.',
    whyWrongByOptionBn: {
      A: '৫ দিন হতো যদি দুজনেই ১০ দিনে কাজটি করতে পারত।',
      C: '৮ দিন অনুমানভিত্তিক ভুল উত্তর।',
      D: '১২ দিন তো ১০ দিনের চেয়েও বেশি! দুজনে মিলে কাজ করলে সময় একার চেয়ে কম লাগবে, বেশি নয়!',
    },
    whyWrongByOptionEn: {
      A: '5 days would require both working at A’s speed.',
      C: 'Incorrect average guess.',
      D: 'Working together cannot take longer than A working alone (10 days)!',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: ১০ ও ১৫-এর ল.সা.গু (LCM) নাও = ৩০ (মনে করো মোট ৩০ ইউনিট কাজ)।',
      'ধাপ ২: A ১ দিনে করে = ৩০ ÷ ১০ = ৩ ইউনিট। B ১ দিনে করে = ৩০ ÷ ১৫ = ২ ইউনিট।',
      'ধাপ ৩: দুজনে একসাথে ১ দিনে করে = ৩ + ২ = ৫ ইউনিট।',
      'ধাপ ৪: মোট সময় = ৩০ ÷ ৫ = ৬ দিন!',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Use shortcut formula: (A × B) / (A + B) = (10 × 15) / (10 + 15).',
      'Step 2: 150 / 25 = 6 days.',
    ],
    everydayExampleBn:
      'রসগোল্লা বা ইটের হিসাব ধরলে ভগ্নাংশের (১/১০ + ১/১৫) জটিলতা ছাড়াই মুখে মুখে অঙ্ক হয়ে যায়!',
    everydayExampleEn:
      'The LCM "total chocolates/bricks" method avoids fractions completely.',
    memoryTrickBn: 'দুজনে একসাথে কাজের শর্টকাট সূত্র: (দিন১ × দিন২) ÷ (দিন১ + দিন২) = (১০ × ১৫) ÷ ২৫ = ৬ দিন!',
    memoryTrickEn: 'Shortcut Formula: (X × Y) / (X + Y) = (10 × 15) / 25 = 6 days!',
    followUpQuestion: {
      id: 'fu_arith_04',
      questionText: 'P can do a work in 6 days and Q can do it in 12 days. In how many days will they finish it together?',
      options: { A: '3 days', B: '4 days', C: '5 days', D: '9 days' },
      correctAnswer: 'B',
      simpleHintBn: 'শর্টকাট সূত্র ব্যবহার করো: (৬ × ১২) ÷ (৬ + ১২) = ৭২ ÷ ১৮ = কত?',
      simpleHintEn: 'Use (6 × 12) / (6 + 12) = 72 / 18.',
    },
  },
  {
    id: 'ai_orig_arith_05',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'Arithmetic',
    topic: 'Ratio & Proportion',
    difficulty: 'easy',
    questionText: 'Divide Rs. 720 between Amal and Bimal in the ratio 4 : 5. What is Bimal’s share?',
    questionTextBn: '৭২০ টাকা অমল ও বিমলের মধ্যে ৪ : ৫ অনুপাতে ভাগ করে দিলে বিমল কত টাকা পাবে?',
    options: { A: 'Rs. 320', B: 'Rs. 360', C: 'Rs. 400', D: 'Rs. 450' },
    correctAnswer: 'C',
    numericVerification: {
      formulaDescription: '(720 / (4 + 5)) * 5',
      expectedValue: 400,
      computedValue: (720 / 9) * 5,
    },
    simpleConceptBn:
      '৪ : ৫ অনুপাত মানে মোট টাকাকে (৪ + ৫) = ৯টি সমান ভাগে ভাগ করে অমলকে ৪ ভাগ আর বিমলকে ৫ ভাগ দেওয়া। ৭২০ টাকাকে ৯ ভাগ করলে প্রতি ভাগে পড়ে ৮০ টাকা। তাই বিমলের ৫ ভাগ = ৫ × ৮০ = ৪০০ টাকা!',
    simpleConceptEn:
      'Total ratio parts = 4 + 5 = 9 parts. Each part = 720 / 9 = Rs 80. Bimal gets 5 parts = 5 × 80 = Rs 400.',
    whyWrongByOptionBn: {
      A: '৩২০ টাকা হলো অমলের ভাগ (৪ × ৮০ = ৩২০), কিন্তু প্রশ্নে বিমলের ভাগ চেয়েছে!',
      B: '৩৬০ টাকা হলো সমান ভাগে অর্ধেক করলে, কিন্তু এখানে অনুপাত ৪ : ৫।',
      D: '৪৫০ টাকা ভুল হিসাব।',
    },
    whyWrongByOptionEn: {
      A: 'Rs 320 is Amal’s share (4 parts), whereas the question asks for Bimal’s share (5 parts).',
      B: 'Rs 360 is an equal 1:1 split.',
      D: 'Incorrect multiplication.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: অনুপাতের যোগফল = ৪ + ৫ = ৯ ভাগ।',
      'ধাপ ২: ১ ভাগের মান = ৭২০ ÷ ৯ = ৮০ টাকা।',
      'ধাপ ৩: বিমল পাবে ৫ ভাগ = ৫ × ৮০ = ৪০০ টাকা।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Sum of ratio terms = 4 + 5 = 9.',
      'Step 2: Value of 1 part = 720 / 9 = 80.',
      'Step 3: Bimal’s share = 5 × 80 = Rs 400.',
    ],
    everydayExampleBn:
      'বাড়িতে ৯ টুকরো কেকের মধ্যে ভাই ৪ টুকরো আর বোন ৫ টুকরো পেলে যেমন মোট ৯ টুকরো দিয়ে ভাগ করতে হয়, অনুপাতও ঠিক তাই!',
    everydayExampleEn:
      'Think of 4:5 as 9 equal packets where Amal gets 4 packets and Bimal gets 5 packets.',
    memoryTrickBn: 'যার ভাগ চাই তার সংখ্যাটি উপরে, আর অনুপাতের যোগফল নিচে: (৫ ÷ ৯) × ৭২০ = ৪০০!',
    memoryTrickEn: 'Share = (Own Ratio / Total Ratio) × Total Amount.',
    followUpQuestion: {
      id: 'fu_arith_05',
      questionText: 'If Rs. 500 is divided between X and Y in the ratio 2 : 3, what is X’s share?',
      options: { A: 'Rs. 150', B: 'Rs. 200', C: 'Rs. 250', D: 'Rs. 300' },
      correctAnswer: 'B',
      simpleHintBn: 'মোট ভাগ = ২ + ৩ = ৫ ভাগ। ১ ভাগ = ৫০০ ÷ ৫ = ১০০ টাকা। X পাবে ২ ভাগ!',
      simpleHintEn: 'Total parts = 5, so 1 part = Rs 100. X gets 2 parts.',
    },
  },
  {
    id: 'adapted_arith_06',
    questionOrigin: 'ADAPTED_CONCEPT',
    sourceDocumentId: 'src_wbpsc_2024_s1',
    examinationYear: 2025,
    subject: 'Arithmetic',
    topic: 'Time, Speed & Distance',
    difficulty: 'medium',
    questionText: 'A train is running at a speed of 72 km/hr. What is its speed in metres per second (m/s)?',
    questionTextBn: 'একটি ট্রেন ঘণ্টায় ৭২ কিমি (72 km/hr) বেগে চলছে। মিটার প্রতি সেকেন্ডে (m/s) ট্রেনটির গতিবেগ কত?',
    options: { A: '15 m/s', B: '18 m/s', C: '20 m/s', D: '25 m/s' },
    correctAnswer: 'C',
    numericVerification: {
      formulaDescription: '72 * (5 / 18)',
      expectedValue: 20,
      computedValue: 72 * (5 / 18),
    },
    simpleConceptBn:
      'কিমি/ঘণ্টা (km/hr) থেকে মিটার/সেকেন্ড (m/s)-এ নেওয়ার জন্য সবসময় ৫/১৮ দিয়ে গুণ করতে হয়। ৭২-কে ১৮ দিয়ে ভাগ করলে হয় ৪, আর ৪ × ৫ = ২০ মিটার/সেকেন্ড!',
    simpleConceptEn:
      'To convert speed from km/hr to m/s, multiply by 5/18 (since 1000 m / 3600 s = 5/18). Thus, 72 × (5/18) = 4 × 5 = 20 m/s.',
    whyWrongByOptionBn: {
      A: '১৫ m/s হলো ৫৪ km/hr-এর মান।',
      B: '১৮ দিয়ে ভাগ করার সময় ভুল করলে ১৮ m/s মনে হতে পারে।',
      D: '২৫ m/s হলো ৯০ km/hr-এর মান।',
    },
    whyWrongByOptionEn: {
      A: '15 m/s corresponds to 54 km/hr.',
      B: '18 m/s corresponds to 64.8 km/hr.',
      D: '25 m/s corresponds to 90 km/hr.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: ১ কিমি = ১,০০০ মিটার এবং ১ ঘণ্টা = ৩,৬০০ সেকেন্ড। কাটাকুটি করলে ১০০০ ÷ ৩৬০০ = ৫/১৮।',
      'ধাপ ২: তাই ৭২ km/hr = ৭২ × (৫ ÷ ১৮) m/s।',
      'ধাপ ৩: ৭২ ÷ ১৮ = ৪, এবং ৪ × ৫ = ২০ m/s!',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Multiply 72 by 5/18.',
      'Step 2: (72 / 18) × 5 = 4 × 5 = 20 m/s.',
    ],
    everydayExampleBn:
      'কিমি (বড় একক) থেকে মিটারে (ছোট এককে) যাচ্ছি, তাই উপরে ছোট সংখ্যা ৫ আর নিচে বড় সংখ্যা ১৮ (৫/১৮) দিয়ে গুণ করব!',
    everydayExampleEn:
      'Going from a larger unit (km) to a smaller unit (m)? Put the smaller number (5) on top: multiply by 5/18!',
    memoryTrickBn: 'বড় (km/hr) থেকে ছোট (m/s) = ছোটটা উপরে (৫/১৮ দিয়ে গুণ)!',
    memoryTrickEn: 'Big (km/hr) to Small (m/s) -> Smaller number on top (× 5/18)!',
    followUpQuestion: {
      id: 'fu_arith_06',
      questionText: 'Convert a speed of 54 km/hr into metres per second (m/s):',
      options: { A: '10 m/s', B: '12 m/s', C: '15 m/s', D: '20 m/s' },
      correctAnswer: 'C',
      simpleHintBn: '৫৪-কে ৫/১৮ দিয়ে গুণ করো: (৫৪ ÷ ১৮) × ৫ = কত?',
      simpleHintEn: 'Calculate (54 / 18) × 5.',
    },
  },
  // Additional questions so all 15-question proportional mocks and topic filters have plenty of unseen items
  {
    id: 'ai_orig_eng_07',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'English',
    topic: 'Vocabulary (Synonyms & Antonyms)',
    difficulty: 'easy',
    questionText: 'Choose the correct spelling from the options below:',
    questionTextBn: 'নিচের অপশনগুলোর মধ্যে কোন ইংরেজি বানানটি সঠিক?',
    options: {
      A: 'Accomodation',
      B: 'Accommodation',
      C: 'Acommodation',
      D: 'Acomodation',
    },
    correctAnswer: 'B',
    simpleConceptBn:
      'WBPSC পরীক্ষায় খুব ঘনঘন আসা একটি বানান হলো "Accommodation" (থাকার জায়গা বা আবাসন)। এতে দুটি "c" (cc) এবং দুটি "m" (mm) থাকে!',
    simpleConceptEn:
      '"Accommodation" is one of the most frequently tested spellings in WBPSC Clerkship exams. It has double "c" and double "m" (CC + MM).',
    whyWrongByOptionBn: {
      A: 'এখানে একটি "m" কম আছে।',
      C: 'এখানে একটি "c" কম আছে।',
      D: 'এখানে একটি "c" এবং একটি "m" দুটোই কম আছে।',
    },
    whyWrongByOptionEn: {
      A: 'Missing the second "m".',
      C: 'Missing the second "c".',
      D: 'Single "c" and single "m" are both incorrect.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: শব্দটিকে মনে মনে ভাগ করো: Ac + com + mo + da + tion।',
      'ধাপ ২: খেয়াল করো: ২টি C এবং ২টি M আছে কি না।',
      'ধাপ ৩: অপশন B-তে "Accommodation" বানানে দুটি C এবং দুটি M আছে, তাই এটিই সঠিক।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Check for twin double letters: Double C and Double M.',
      'Step 2: Match "Accommodation" (Option B).',
    ],
    everydayExampleBn:
      'বড় হোটেলে থাকার জায়গা (Accommodation) চাইলে দুটি ঘর লাগে—একটি ঘরে দুটি C (CC), আরেকটি ঘরে দুটি M (MM)!',
    everydayExampleEn:
      'Accommodation is big enough to house TWO Cs and TWO Ms!',
    memoryTrickBn: 'Accommodation = ২টি C (CC) + ২টি M (MM)!',
    memoryTrickEn: 'Remember: 2 Cs + 2 Ms in aCCoMModation.',
    followUpQuestion: {
      id: 'fu_eng_07',
      questionText: 'Choose the correctly spelt word:',
      options: { A: 'Comittee', B: 'Committee', C: 'Commitee', D: 'Comitee' },
      correctAnswer: 'B',
      simpleHintBn: 'Committee বানানে ২টি m, ২টি t এবং ২টি e থাকে!',
      simpleHintEn: 'Committee has double M, double T, and double E.',
    },
  },
  {
    id: 'ai_orig_gs_07',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'General Studies',
    topic: 'Current Events & Static GK of West Bengal',
    difficulty: 'easy',
    questionText: 'Where is the headquarters of the Sundarbans Biosphere Reserve located in West Bengal?',
    questionTextBn: 'পশ্চিমবঙ্গে সুন্দরবন জীবমণ্ডল সংরক্ষণ (Sundarbans Biosphere Reserve) অঞ্চলের প্রধান কার্যালয় বা সদর দপ্তর কোথায় অবস্থিত?',
    options: { A: 'Canning', B: 'Gosaba', C: 'Kolkata (Salt Lake)', D: 'Diamond Harbour' },
    correctAnswer: 'C',
    simpleConceptBn:
      'সুন্দরবন দক্ষিণ ও উত্তর ২৪ পরগনা জেলায় অবস্থিত হলেও সুন্দরবন বায়োস্ফিয়ার রিজার্ভের প্রশাসনিক সদর দপ্তর (Directorate Office) কলকাতার সল্টলেকে (বিকাশ ভবন/অরণ্য ভবন সংলগ্ন) অবস্থিত, এবং সুন্দরবন ব্যাঘ্র প্রকল্পের ফিল্ড অফিস ক্যানিংয়ে অবস্থিত।',
    simpleConceptEn:
      'The administrative Directorate of the Sundarbans Biosphere Reserve under the West Bengal Forest Department is headquartered at Salt Lake (Bikash Bhavan / Aranya Bhavan), Kolkata.',
    whyWrongByOptionBn: {
      A: 'ক্যানিং হলো সুন্দরবনের প্রবেশদ্বার ও ফিল্ড অফিস, কিন্তু বায়োস্ফিয়ার রিজার্ভ ডিরেক্টরেটের সদর দপ্তর সল্টলেকে।',
      B: 'গোসাবা সুন্দরবনের একটি ব্লক ও দ্বীপ অঞ্চল।',
      D: 'ডায়মন্ড হারবার হুগলি নদীর তীরে অবস্থিত মহকুমা শহর।',
    },
    whyWrongByOptionEn: {
      A: 'Canning serves as the field headquarters for Sundarban Tiger Reserve.',
      B: 'Gosaba is an island block in the Sundarbans.',
      D: 'Diamond Harbour is a subdivision headquarters in South 24 Parganas.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: পশ্চিমবঙ্গ বন দপ্তরের প্রধান কার্যালয় (অরণ্য ভবন) সল্টলেক, কলকাতায় অবস্থিত।',
      'ধাপ ২: সুন্দরবন ১৯৮৭ সালে UNESCO World Heritage Site এবং ১৯৮৯ সালে Biosphere Reserve ঘোষিত হয়।',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Recall that the Directorate of Sundarbans Biosphere Reserve operates from Salt Lake, Kolkata.',
      'Step 2: Select Option C.',
    ],
    everydayExampleBn:
      'যেমন জেলার কাজ গ্রামে হলেও মূল দপ্তর কলকাতার সল্টলেকে থাকে, তেমনই বায়োস্ফিয়ার রিজার্ভের ডিরেক্টরেট সল্টলেকে।',
    everydayExampleEn:
      'State forest directorates in West Bengal are centralized in Salt Lake, Kolkata.',
    memoryTrickBn: '১৯৮৭ সালে UNESCO World Heritage = সুন্দরবন (রয়্যাল বেঙ্গল টাইগার ও ম্যানগ্রোভ অরণ্য)!',
    memoryTrickEn: '1987 = UNESCO World Heritage Site for Sundarbans.',
    followUpQuestion: {
      id: 'fu_gs_07',
      questionText: 'In which year was the Sundarbans National Park declared a UNESCO World Heritage Site?',
      options: { A: '1973', B: '1984', C: '1987', D: '1999' },
      correctAnswer: 'C',
      simpleHintBn: 'উপরে মনে রাখার কৌশলের মধ্যেই সালটি লেখা আছে!',
      simpleHintEn: 'Check the memory trick right above!',
    },
  },
  {
    id: 'ai_orig_arith_07',
    questionOrigin: 'AI_GENERATED',
    examinationYear: 2026,
    subject: 'Arithmetic',
    topic: 'Average & Simplification (HCF/LCM)',
    difficulty: 'easy',
    questionText: 'The average of 5 consecutive numbers is 18. What is the largest of these numbers?',
    questionTextBn: 'পরপর ৫টি ক্রমিক সংখ্যার গড় (Average) হলো ১৮। সংখ্যাগুলির মধ্যে সবচেয়ে বড় সংখ্যাটি কত?',
    options: { A: '19', B: '20', C: '21', D: '22' },
    correctAnswer: 'B',
    numericVerification: {
      formulaDescription: '18 + 2',
      expectedValue: 20,
      computedValue: 18 + 2,
    },
    simpleConceptBn:
      'পরপর (consecutive) বিজোড় সংখ্যক সংখ্যার গড় সবসময় একদম মাঝখানের সংখ্যাটি হয়! ৫টি সংখ্যার মাঝখানের (৩ নম্বর) সংখ্যাটি যদি ১৮ হয়, তবে পরের দুটি সংখ্যা হবে ১৯ এবং ২০। তাই সবচেয়ে বড় সংখ্যাটি ২০!',
    simpleConceptEn:
      'For an odd count of consecutive numbers, the average is always the middle number. With middle number = 18, the 5 numbers are 16, 17, 18, 19, 20. The largest is 20.',
    whyWrongByOptionBn: {
      A: '১৯ হলো ৪ নম্বর সংখ্যা, সবচেয়ে বড় (৫ নম্বর) সংখ্যা নয়।',
      C: '২১ হতে গেলে মাঝখানের সংখ্যা ১৯ হতে হতো।',
      D: '২২ অনেক বেশি।',
    },
    whyWrongByOptionEn: {
      A: '19 is the fourth number, not the fifth.',
      C: '21 is one step too far.',
      D: '22 is incorrect.',
    },
    whyCorrectStepByStepBn: [
      'ধাপ ১: ৫টি সংখ্যার গড় ১৮ মানে মাঝখানের সংখ্যাটি ১৮।',
      'ধাপ ২: ১৮-এর আগের দুটি সংখ্যা হলো ১৬ ও ১৭, এবং পরের দুটি সংখ্যা হলো ১৯ ও ২০।',
      'ধাপ ৩: সংখ্যা পাঁচটি হলো: ১৬, ১৭, ১৮, ১৯, ২০। তাই সবচেয়ে বড় সংখ্যাটি হলো ২০!',
    ],
    whyCorrectStepByStepEn: [
      'Step 1: Middle (3rd) number = Average = 18.',
      'Step 2: 4th number = 19, 5th (largest) number = 20.',
    ],
    everydayExampleBn:
      'পাঁচ আঙুলের মাঝখানের আঙুলটা যদি ১৮ নম্বর হয়, তবে তার ডানদিকের পরের দুটি আঙুল হবে ১৯ আর ২০!',
    everydayExampleEn:
      'Place 18 on your middle finger: the two fingers to the right are 19 and 20!',
    memoryTrickBn: 'ক্রমিক সংখ্যার গড় = মাঝখানের সংখ্যা! ৫টি সংখ্যা হলে সবচেয়ে বড় = গড় + ২ = ১৮ + ২ = ২০!',
    memoryTrickEn: 'For 5 consecutive numbers: Largest = Average + 2 | Smallest = Average − 2.',
    followUpQuestion: {
      id: 'fu_arith_07',
      questionText: 'The average of 5 consecutive numbers is 18. What is the SMALLEST of these numbers?',
      options: { A: '14', B: '15', C: '16', D: '17' },
      correctAnswer: 'C',
      simpleHintBn: 'মাঝখানের সংখ্যা ১৮ হলে তার বাঁদিকের দুটি ঘর আগে কোন সংখ্যা আছে? (১৮ − ২)',
      simpleHintEn: 'Smallest = Average − 2 = 18 − 2.',
    },
  },
  // One disputed/unverified imported question to demonstrate Admin Quality Monitoring & Disputed Exclusion
  {
    id: 'imp_disputed_gs_99',
    questionOrigin: 'IMPORTED_UNVERIFIED',
    sourceDocumentId: 'src_wbpsc_2019_s2',
    examinationYear: 2019,
    sessionShift: 'Shift 2',
    originalQuestionNumber: 99,
    subject: 'General Studies',
    topic: 'Indian History & National Movement',
    difficulty: 'hard',
    questionText: '[Flagged OCR Import — Disputed Option Key] Which session of INC had ambiguous dual printing in the scanned booklet?',
    questionTextBn: '[অস্পষ্ট স্ক্যান ও বিতর্কিত উত্তরপত্র] স্ক্যান করা প্রশ্নপত্রে অপশন অস্পষ্ট থাকায় এই প্রশ্নটি যাচাইয়ের জন্য সংরক্ষিত।',
    options: { A: '1905 Banaras', B: '1906 Calcutta', C: '1907 Surat', D: '1911 Calcutta' },
    correctAnswer: 'B',
    answerKeyStatus: 'DISPUTED_EXCLUDED',
    revisionHistoryNote: 'Excluded from scored mock tests automatically due to DISPUTED_EXCLUDED status until admin review.',
    verificationStatus: 'FLAGGED_AMBIGUOUS',
    simpleConceptBn: 'এই প্রশ্নটি স্ক্যান করা কাগজ থেকে আমদানি করা হয়েছে এবং উত্তরপত্র চূড়ান্ত না হওয়ায় সাধারণ মক টেস্ট থেকে বাদ রাখা হয়েছে।',
    simpleConceptEn: 'This question is flagged as disputed/OCR-uncertain and automatically excluded from scored mock examinations.',
    whyWrongByOptionBn: { A: 'যাচাই চলছে।' },
    whyWrongByOptionEn: { A: 'Under verification.' },
    whyCorrectStepByStepBn: ['ধাপ ১: প্রশাসকের পর্যালোচনার পর এটি অনুমোদিত হবে।'],
    whyCorrectStepByStepEn: ['Step 1: Pending administrator verification.'],
    everydayExampleBn: 'সঠিক ও নিশ্চিত প্রশ্ন ছাড়া কোনো ছাত্রের নম্বর কাটা উচিত নয়।',
    everydayExampleEn: 'Ambiguous questions are never used to penalize students.',
    memoryTrickBn: 'নিশ্চিত তথ্য ছাড়া অনুমান নয়।',
    memoryTrickEn: 'Verify before scoring.',
    followUpQuestion: {
      id: 'fu_gs_99',
      questionText: 'In which session did the Surat Split of the Indian National Congress occur?',
      options: { A: '1905', B: '1906', C: '1907', D: '1909' },
      correctAnswer: 'C',
      simpleHintBn: 'সুরাট অধিবেশন ১৯০৭ সালে হয়েছিল।',
      simpleHintEn: 'The Surat Split occurred in 1907.',
    },
  },
];

export const INITIAL_QUESTIONS_POOL: QuestionItem[] = RAW_QUESTIONS.map((seed) => ({
  id: seed.id,
  questionOrigin: seed.questionOrigin,
  sourceDocumentId: seed.sourceDocumentId,
  examConfigurationId: 'wbpsc_clerkship_2023_part1',
  examinationYear: seed.examinationYear,
  sessionShift: seed.sessionShift,
  bookletSeries: seed.bookletSeries,
  originalQuestionNumber: seed.originalQuestionNumber,
  subject: seed.subject,
  topic: seed.topic,
  difficulty: seed.difficulty,
  questionText: seed.questionText,
  questionTextBn: seed.questionTextBn,
  options: seed.options,
  optionsBn: seed.optionsBn,
  correctAnswer: seed.correctAnswer,
  answerKeyStatus: seed.answerKeyStatus ?? 'FINAL_VERIFIED',
  revisionHistoryNote: seed.revisionHistoryNote,
  verificationStatus: seed.verificationStatus ?? 'VERIFIED',
  contentHash: computeContentHash(seed.questionText, seed.options),
  semanticSignature: computeSemanticSignature(seed.subject, seed.topic, seed.questionText),
  numericVerification: seed.numericVerification,
  teacherExplanation: {
    yourAnswerSummaryBn: 'তোমার নির্বাচিত উত্তর',
    yourAnswerSummaryEn: 'Your selected option',
    correctAnswerSummaryBn: `সঠিক উত্তর: অপশন ${seed.correctAnswer} (${seed.options[seed.correctAnswer]})`,
    correctAnswerSummaryEn: `Correct Answer: Option ${seed.correctAnswer} (${seed.options[seed.correctAnswer]})`,
    simpleConceptBn: seed.simpleConceptBn,
    simpleConceptEn: seed.simpleConceptEn,
    whyWrongByOptionBn: seed.whyWrongByOptionBn,
    whyWrongByOptionEn: seed.whyWrongByOptionEn,
    whyCorrectStepByStepBn: seed.whyCorrectStepByStepBn,
    whyCorrectStepByStepEn: seed.whyCorrectStepByStepEn,
    everydayExampleBn: seed.everydayExampleBn,
    everydayExampleEn: seed.everydayExampleEn,
    memoryTrickBn: seed.memoryTrickBn,
    memoryTrickEn: seed.memoryTrickEn,
    followUpQuestion: seed.followUpQuestion,
    encouragementBn: 'হাল ছেড়ো না! ভুল থেকেই তো আসল শেখা শুরু হয়—তুমি নিশ্চয়ই পারবে!',
    encouragementEn: 'Keep going! Every mistake you understand today becomes a guaranteed mark in the exam!',
  },
  createdAt: '2026-10-23T00:00:00Z',
})).concat(WBPSC_FULL_PAPER_QUESTIONS);

export interface Part2PracticeTask {
  id: string;
  group: 'Group-A (English)' | 'Group-B (Bengali)';
  taskType: 'Report Drafting' | 'Précis / Summary Writing' | 'Translation';
  title: string;
  marks: number;
  promptText: string;
  guidelinesBn: string[];
  guidelinesEn: string[];
  modelAnswer: string;
}

export const PART2_CONVENTIONAL_TASKS: Part2PracticeTask[] = [
  {
    id: 'p2_eng_report_01',
    group: 'Group-A (English)',
    taskType: 'Report Drafting',
    title: 'Draft a newspaper report on a Safe Drive, Save Life awareness campaign in your district',
    marks: 15,
    promptText:
      'Write a report within 150 words on a "Safe Drive, Save Life" road safety awareness programme organized in Kolkata. Include: Date & place, participants (police, school students), key messages on helmet usage and speed control, and public response.',
    guidelinesBn: [
      '১. সবার উপরে একটি সুন্দর ও ছোট শিরোনাম (Headline) দাও।',
      '২. ডানদিক বা বাঁদিকে "By a Staff Reporter", জায়গার নাম ও তারিখ লেখো।',
      '৩. সহজ ও স্পষ্ট অতীত কালে (Past Tense / Passive Voice) ঘটনাটি ৩টি ছোট অনুচ্ছেদে সাজিয়ে লেখো।',
    ],
    guidelinesEn: [
      '1. Start with a crisp, capitalised Headline.',
      '2. Include a byline ("By a Staff Reporter") and dateline (Place, Date).',
      '3. Use formal Past/Passive voice across 2–3 concise paragraphs covering What, When, Where, and Impact.',
    ],
    modelAnswer: `SAFE DRIVE, SAVE LIFE CAMPAIGN HELD IN KOLKATA
By a Staff Reporter
Kolkata, October 23: A day-long road safety awareness programme titled 'Safe Drive, Save Life' was organized yesterday at Shyambazar Five-Point Crossing by the Kolkata Traffic Police in collaboration with local higher secondary schools.

Over three hundred students and senior traffic officials participated in the rally. Informative leaflets were distributed among motorists and two-wheeler riders emphasizing the mandatory use of BIS-certified helmets, seatbelts, and strict adherence to traffic signals. Senior officers demonstrated how overspeeding and mobile phone usage while driving lead to fatal accidents.

Commuters welcomed the initiative and pledged to follow traffic norms strictly to reduce road mishaps across the city.`,
  },
  {
    id: 'p2_bn_trans_01',
    group: 'Group-B (Bengali)',
    taskType: 'Translation',
    title: 'ইংরেজি থেকে বাংলায় বঙ্গানুবাদ (English to Bengali Translation)',
    marks: 15,
    promptText:
      'Translate into simple, natural Bengali:\n"Honesty is a great virtue. If you do not deceive others, if you do not tell a lie, if you are strictly just and fair in your dealings with others, you are an honest man. Honesty is the best policy. An honest man is respected by all."',
    guidelinesBn: [
      '১. আক্ষরিক বা শব্দ ধরে ধরে অনুবাদ না করে ভাব বজায় রেখে সহজ ও প্রাঞ্জল বাংলায় লেখো।',
      '২. বাক্যগুলো ছোট ও স্পষ্ট রাখো।',
    ],
    guidelinesEn: [
      '1. Translate the sense naturally into idiomatic Bengali rather than word-for-word literal translation.',
      '2. Maintain clarity and proper punctuation.',
    ],
    modelAnswer:
      'সততা একটি মহৎ গুণ। তুমি যদি অন্যকে প্রতারিত না করো, যদি মিথ্যা কথা না বলো, এবং অপরের সঙ্গে আচার-আচরণে কঠোরভাবে ন্যায়পরায়ণ ও নিরপেক্ষ থাকো, তবেই তুমি একজন সৎ মানুষ। সততাই সর্বোৎকৃষ্ট পন্থা। একজন সৎ মানুষ সকলের কাছেই শ্রদ্ধার পাত্র।',
  },
  {
    id: 'p2_bn_report_01',
    group: 'Group-B (Bengali)',
    taskType: 'Report Drafting',
    title: 'প্লাস্টিক বর্জন ও পরিবেশ সচেতনতা শিবির নিয়ে সংবাদপত্রে প্রতিবেদন রচনা',
    marks: 15,
    promptText:
      'তোমার এলাকায় আয়োজিত "প্লাস্টিক বর্জন ও পরিবেশ রক্ষা" শীর্ষক একটি সচেতনতা শিবির সম্পর্কে ১৫০ শব্দের মধ্যে একটি সংবাদপত্রের প্রতিবেদন রচনা করো।',
    guidelinesBn: [
      '১. একটি আকর্ষণীয় শিরোনাম দাও।',
      '২. নিজস্ব সংবাদদাতা, স্থান ও তারিখ উল্লেখ করো।',
      '৩. প্লাস্টিক দূষণের ক্ষতি ও কাপড় বা পাটের ব্যাগ ব্যবহারের বার্তাটি সহজ ভাষায় লেখো।',
    ],
    guidelinesEn: [
      '1. Provide a clear Bengali headline, dateline, and reporter attribution.',
      '2. Highlight the hazards of single-use plastic and the adoption of jute/cloth bags.',
    ],
    modelAnswer: `প্লাস্টিক বর্জন ও পরিবেশ রক্ষায় সচেতনতা শিবির
নিজস্ব সংবাদদাতা
কলকাতা, ২৩ অক্টোবর: একবার ব্যবহারযোগ্য প্লাস্টিকের ক্ষতিকর প্রভাব সম্পর্কে সাধারণ মানুষকে সচেতন করতে গতকাল স্থানীয় পুরসভার উদ্যোগে একটি বিশেষ পরিবেশ সচেতনতা শিবির আয়োজিত হয়।

এই শিবিরে এলাকার বিশিষ্ট চিকিৎসক, শিক্ষক ও ছাত্রছাত্রীরা অংশগ্রহণ করেন। বক্তারা জানান কীভাবে পলিথিন ও প্লাস্টিক নিকাশি নালা বন্ধ করে দিচ্ছে এবং মাটি ও জলের মারাত্মক দূষণ ঘটাচ্ছে। শিবির থেকে সাধারণ ক্রেতা ও বিক্রেতাদের মধ্যে বিনামূল্যে পাট ও কাপড়ের তৈরি ব্যাগ বিতরণ করা হয়।

এলাকাবাসী এই উদ্যোগকে সাধুবাদ জানিয়েছেন এবং দৈনন্দিন জীবনে প্লাস্টিকের বদলে পরিবেশবান্ধব পাটের ব্যাগ ব্যবহারের অঙ্গীকার করেছেন।`,
  },
];

export interface TypingPassage {
  id: string;
  language: 'en' | 'bn';
  title: string;
  targetWpm: number;
  passageText: string;
}

export const TYPING_PRACTICE_PASSAGES: TypingPassage[] = [
  {
    id: 'type_en_01',
    language: 'en',
    title: 'Official Secretariat Correspondence Practice (Target: 20 WPM)',
    targetWpm: 20,
    passageText:
      'Public administration plays a vital role in implementing welfare schemes for citizens across West Bengal. Every clerk in the Secretariat must maintain accurate records, draft clear official notes, and serve the public with patience, punctuality, and integrity.',
  },
  {
    id: 'type_bn_01',
    language: 'bn',
    title: 'সরকারি দপ্তরের বাংলা টাইপিং অনুশীলন (লক্ষ্যমাত্রা: ১০ WPM)',
    targetWpm: 10,
    passageText:
      'পশ্চিমবঙ্গের সরকারি দপ্তরে সাধারণ মানুষের পরিষেবা দ্রুত ও নির্ভুলভাবে পৌঁছে দেওয়াই কর্মীদের প্রধান দায়িত্ব। নিয়মিত অনুশীলন করলে বাংলা ও ইংরেজি উভয় ভাষাতেই টাইপিংয়ের গতি এবং নির্ভুলতা বৃদ্ধি পায়।',
  },
];
