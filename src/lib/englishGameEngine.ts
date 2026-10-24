import { OptionKey, QuestionItem } from '../types/exam';

export type GameWorldId =
  | 'WORLD_1_PREPOSITION'
  | 'WORLD_2_VOICE_NARRATION'
  | 'WORLD_3_VOCAB_POWER'
  | 'WORLD_4_GRAMMAR_TENSE'
  | 'WORLD_5_BOSS_GAUNTLET'
  | 'WORLD_6_GS_HISTORY'
  | 'WORLD_7_GS_POLITY'
  | 'WORLD_8_GS_GEOGRAPHY_WB'
  | 'WORLD_9_GS_SCIENCE_GK'
  | 'WORLD_10_ARITH_PERCENT_PROFIT'
  | 'WORLD_11_ARITH_RATIO_WORK_SPEED'
  | 'WORLD_12_ALL_SUBJECT_MEGA_BOSS';

export type EnglishGameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'ANSWER_REVEALED'
  | 'VICTORY'
  | 'GAME_OVER';

export type GameDifficultyMode = 'ARCADE_HEARTS' | 'CHILL_LEARN';

export interface GameWorldConfig {
  id: GameWorldId;
  stageNumber: number;
  subjectCategory: 'ALL' | 'English' | 'General Studies' | 'Arithmetic';
  titleEn: string;
  titleBn: string;
  bossNameEn: string;
  bossNameBn: string;
  subtitleEn: string;
  subtitleBn: string;
  topicKeywords: string[];
  questionCount: number;
  baseXpPerCorrect: number;
  clearBonusXp: number;
}

export interface PlayerRankInfo {
  level: number;
  titleEn: string;
  titleBn: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface TurnEvaluationResult {
  isCorrect: boolean;
  xpEarned: number;
  newCombo: number;
  newMaxCombo: number;
  multiplier: number;
  newHearts: number;
  bossHpRemaining: number;
  shieldConsumed: boolean;
  isGameOver: boolean;
}

export const ENGLISH_GAME_WORLDS: GameWorldConfig[] = [
  {
    id: 'WORLD_12_ALL_SUBJECT_MEGA_BOSS',
    stageNumber: 1,
    subjectCategory: 'ALL',
    titleEn: 'Mega Quest: All-Subject WBPSC Clerkship Arena (GS + Math + English)',
    titleBn: 'মেগা অভিযান: ডব্লিউবিপিএসসি সব বিষয়ের সম্মিলিত গেম (GS + অঙ্ক + ইংরেজি)',
    bossNameEn: 'Writers’ Buildings Grand Examiner',
    bossNameBn: 'রাইটার্স বিল্ডিংস মহাপরীক্ষক বস',
    subtitleEn: 'Play General Studies (40M), Arithmetic (30M) & English (30M) interleaved together!',
    subtitleBn: 'সাধারণ জ্ঞান (৪০), পাটিগণিত (৩০) ও ইংরেজি (৩০)—সব বিষয়ের প্রশ্ন একসাথে খেলার ছলে জয় করো!',
    topicKeywords: [],
    questionCount: 15,
    baseXpPerCorrect: 140,
    clearBonusXp: 500,
  },
  {
    id: 'WORLD_6_GS_HISTORY',
    stageNumber: 2,
    subjectCategory: 'General Studies',
    titleEn: 'GS Quest 1: Indian History & Freedom Struggle',
    titleBn: 'সাধারণ জ্ঞান অভিযান ১: ভারতের ইতিহাস ও স্বাধীনতা আন্দোলন',
    bossNameEn: 'Chronicle Guardian of Bengal & India',
    bossNameBn: 'ইতিহাস ও স্বাধীনতা সংগ্রাম প্রহরী',
    subtitleEn: 'Master Indus Valley, Mughals, 1857 Revolt, Bengal Renaissance & National Movement',
    subtitleBn: 'সিধু-কানহু, রাজা রামমোহন, ১৮৫৭ মহাবিদ্রোহ, সুভাষচন্দ্র ও ভারতের স্বাধীনতা আন্দোলন',
    topicKeywords: ['History', 'Freedom', 'Movement', 'National'],
    questionCount: 10,
    baseXpPerCorrect: 120,
    clearBonusXp: 350,
  },
  {
    id: 'WORLD_7_GS_POLITY',
    stageNumber: 3,
    subjectCategory: 'General Studies',
    titleEn: 'GS Quest 2: Indian Constitution & Polity Fortress',
    titleBn: 'সাধারণ জ্ঞান অভিযান ২: ভারতের সংবিধান ও রাষ্ট্রব্যবস্থা',
    bossNameEn: 'Supreme Constitutional Sentinel',
    bossNameBn: 'সংবিধান ও মৌলিক অধিকার প্রহরী বস',
    subtitleEn: 'Conquer Fundamental Rights, Articles, Amendments, Parliament, President & Panchayati Raj',
    subtitleBn: 'মৌলিক অধিকার, ধারা ৩২, ৪২তম সংশোধনী, রাষ্ট্রপতি, সংসদ ও পঞ্চায়েত ব্যবস্থা',
    topicKeywords: ['Polity', 'Constitution', 'Economy'],
    questionCount: 10,
    baseXpPerCorrect: 120,
    clearBonusXp: 350,
  },
  {
    id: 'WORLD_8_GS_GEOGRAPHY_WB',
    stageNumber: 4,
    subjectCategory: 'General Studies',
    titleEn: 'GS Quest 3: Geography of West Bengal & India',
    titleBn: 'সাধারণ জ্ঞান অভিযান ৩: পশ্চিমবঙ্গ ও ভারতের ভূগোল',
    bossNameEn: 'Himalayan & Sundarban Atlas Titan',
    bossNameBn: 'পশ্চিমবঙ্গ ও ভারতের ভূগোল টাইটান',
    subtitleEn: 'Master WB Rivers, Districts, National Parks, Soils, Himalayas & Census 2011 facts',
    subtitleBn: 'পশ্চিমবঙ্গের নদী, জেলা, সুন্দরবন, জাতীয় উদ্যান, ভারতের নদনদী ও জনগণনা ২০১১',
    topicKeywords: ['Geography', 'West Bengal', 'Rivers', 'India'],
    questionCount: 10,
    baseXpPerCorrect: 120,
    clearBonusXp: 350,
  },
  {
    id: 'WORLD_9_GS_SCIENCE_GK',
    stageNumber: 5,
    subjectCategory: 'General Studies',
    titleEn: 'GS Quest 4: Everyday Science, Current Affairs & Static GK',
    titleBn: 'সাধারণ জ্ঞান অভিযান ৪: দৈনন্দিন বিজ্ঞান, কারেন্ট অ্যাফেয়ার্স ও জিকে',
    bossNameEn: 'Quantum & Nobel Quizmaster',
    bossNameBn: 'দৈনন্দিন বিজ্ঞান ও কারেন্ট অ্যাফেয়ার্স বস',
    subtitleEn: 'Vitamins, Physics/Chemistry in daily life, Awards, Books, Sports & WB Schemes',
    subtitleBn: 'ভিটামিন, আলো ও শব্দের বিজ্ঞান, নোবেল পুরস্কার, খেলাধুলা ও সরকারি প্রকল্প',
    topicKeywords: ['Science', 'Current Affairs', 'GK', 'Static', 'Culture'],
    questionCount: 10,
    baseXpPerCorrect: 125,
    clearBonusXp: 380,
  },
  {
    id: 'WORLD_10_ARITH_PERCENT_PROFIT',
    stageNumber: 6,
    subjectCategory: 'Arithmetic',
    titleEn: 'Math Quest 1: Percentage, Profit-Loss & Simple Interest',
    titleBn: 'পাটিগণিত অভিযান ১: শতকরা, লাভ-ক্ষতি ও সরল-চক্রবৃদ্ধি সুদ',
    bossNameEn: 'Treasury Calculator Boss',
    bossNameBn: 'শতকরা ও সুদকষা সম্রাট বস',
    subtitleEn: 'Solve Madhyamik-level Percentage, Profit & Loss, Discount & Interest with 5-sec tricks',
    subtitleBn: 'শতকরা (Percentage), লাভ ও ক্ষতি এবং সরল সুদের অঙ্ক ৫ সেকেন্ডের শর্টকাট ট্রিকে সমাধান করো',
    topicKeywords: ['Percentage', 'Profit', 'Loss', 'Interest'],
    questionCount: 10,
    baseXpPerCorrect: 130,
    clearBonusXp: 400,
  },
  {
    id: 'WORLD_11_ARITH_RATIO_WORK_SPEED',
    stageNumber: 7,
    subjectCategory: 'Arithmetic',
    titleEn: 'Math Quest 2: Ratio, Time-Work, Speed-Distance & LCM-HCF',
    titleBn: 'পাটিগণিত অভিযান ২: অনুপাত, সময়-কার্য, গতিবেগ ও ল.সা.গু-গ.সা.গু',
    bossNameEn: 'Chronos & Ratio Architect',
    bossNameBn: 'সময়-কার্য ও অনুপাত সেনাপতি বস',
    subtitleEn: 'Master LCM Time & Work shortcuts, Train speed, Ratio-Proportion, Average & Simplification',
    subtitleBn: 'ল.সা.গু ট্রিকে সময় ও কার্য, ট্রেনের গতিবেগ, অনুপাত-সমানুপাত, গড় ও সরলীকরণ জয় করো',
    topicKeywords: ['Ratio', 'Time', 'Work', 'Distance', 'Speed', 'Average', 'LCM', 'HCF', 'Simplification'],
    questionCount: 10,
    baseXpPerCorrect: 130,
    clearBonusXp: 400,
  },
  {
    id: 'WORLD_1_PREPOSITION',
    stageNumber: 8,
    subjectCategory: 'English',
    titleEn: 'English Quest 1: Preposition & Articles Kingdom',
    titleBn: 'ইংরেজি অভিযান ১: প্রিপোজিশন ও আর্টিকেল রাজ্য (Fixed Prepositions)',
    bossNameEn: 'Lord Preposition Guardian',
    bossNameBn: 'প্রিপোজিশন গার্ডিয়ান বস',
    subtitleEn: 'Master died of, known to, prefer to, abide by, senior to & fixed rules',
    subtitleBn: 'died of, known to, prefer to, abide by, senior to — সব ফিক্সড প্রিপোজিশন জয় করো',
    topicKeywords: ['Preposition', 'Articles'],
    questionCount: 8,
    baseXpPerCorrect: 100,
    clearBonusXp: 250,
  },
  {
    id: 'WORLD_2_VOICE_NARRATION',
    stageNumber: 9,
    subjectCategory: 'English',
    titleEn: 'English Quest 2: Voice & Narration Fortress',
    titleBn: 'ইংরেজি অভিযান ২: ভয়েস ও ন্যারেশন দুর্গ (Voice & Speech)',
    bossNameEn: 'Captain Passive & Indirect',
    bossNameBn: 'ভয়েস ও ন্যারেশন সেনাপতি',
    subtitleEn: 'Conquer Active/Passive transforms, By whom, Let-imperatives & Narration shifts',
    subtitleBn: 'Active থেকে Passive ও Direct থেকে Indirect Speech-এর ৩-সেকেন্ডের ট্রিক শেখো',
    topicKeywords: ['Voice', 'Narration'],
    questionCount: 8,
    baseXpPerCorrect: 120,
    clearBonusXp: 300,
  },
  {
    id: 'WORLD_3_VOCAB_POWER',
    stageNumber: 10,
    subjectCategory: 'English',
    titleEn: 'English Quest 3: Vocab, Idioms & Phrasal Arena',
    titleBn: 'ইংরেজি অভিযান ৩: ভোকাবুলারি ও ইডিয়ম অ্যারেনা',
    bossNameEn: 'Lexicon Titan',
    bossNameBn: 'শব্দভাণ্ডার টাইটান বস',
    subtitleEn: 'Defeat Synonyms, Antonyms, Idioms, Phrasal Verbs & One-Word Substitutions',
    subtitleBn: 'Synonyms, Antonyms, Idioms ও Phrasal Verb খেলার ছলে মনে রাখো',
    topicKeywords: ['Vocabulary', 'Synonyms', 'Antonyms', 'Idioms', 'Phrasal', 'One-Word'],
    questionCount: 8,
    baseXpPerCorrect: 120,
    clearBonusXp: 350,
  },
  {
    id: 'WORLD_4_GRAMMAR_TENSE',
    stageNumber: 11,
    subjectCategory: 'English',
    titleEn: 'English Quest 4: Tense, Error & Spelling Lab',
    titleBn: 'ইংরেজি অভিযান ৪: টেন্স, এরর ও বানান ল্যাব',
    bossNameEn: 'Syntax Sentinel',
    bossNameBn: 'গ্রামার ও বানান প্রহরী',
    subtitleEn: 'Spot hidden grammar errors, Subject-Verb rules, Conditionals & tricky Spellings',
    subtitleBn: 'Sentence Correction, Tense ও সঠিক ইংরেজি বানান (Spelling) চিনে নাও',
    topicKeywords: ['Sentence Correction', 'Spelling', 'Tense', 'Grammar'],
    questionCount: 8,
    baseXpPerCorrect: 130,
    clearBonusXp: 400,
  },
  {
    id: 'WORLD_5_BOSS_GAUNTLET',
    stageNumber: 12,
    subjectCategory: 'English',
    titleEn: 'English Quest 5: WBPSC 30-Mark English Boss Gauntlet',
    titleBn: 'ইংরেজি অভিযান ৫: ডব্লিউবিপিএসসি ইংরেজি মেগা বস চ্যালেঞ্জ',
    bossNameEn: 'Grand Examiner of Clerkship English',
    bossNameBn: 'ক্লার্কশিপ ইংরেজি মহাপরীক্ষক বস',
    subtitleEn: '15 rapid-fire mixed WBPSC Clerkship English questions for ultimate mastery',
    subtitleBn: 'সব অধ্যায় মিলিয়ে ১৫টি বাছাই করা ক্লার্কশিপ ইংরেজি প্রশ্নের চূড়ান্ত লড়াই',
    topicKeywords: [],
    questionCount: 15,
    baseXpPerCorrect: 150,
    clearBonusXp: 600,
  },
];

/**
 * Pure function to calculate combo multiplier from current streak count.
 */
export function getComboMultiplier(comboStreak: number): number {
  if (comboStreak >= 5) return 3;
  if (comboStreak >= 3) return 2;
  if (comboStreak >= 2) return 1.5;
  return 1;
}

/**
 * Pure function to calculate player level and rank title from total XP.
 */
export function calculatePlayerRank(totalXp: number): PlayerRankInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const tiers = [
    { minXp: 0, maxXp: 300, level: 1, titleEn: 'English Rookie', titleBn: 'ইংরেজি শিক্ষানবিশ (Rookie)' },
    { minXp: 300, maxXp: 750, level: 2, titleEn: 'Grammar Explorer', titleBn: 'গ্রামার অভিযাত্রী (Explorer)' },
    { minXp: 750, maxXp: 1400, level: 3, titleEn: 'Preposition Knight', titleBn: 'প্রিপোজিশন নাইট (Knight)' },
    { minXp: 1400, maxXp: 2200, level: 4, titleEn: 'Voice & Vocab Master', titleBn: 'ভয়েস ও ভোকাব মাস্টার (Master)' },
    { minXp: 2200, maxXp: 5000, level: 5, titleEn: 'WBPSC English Champion', titleBn: 'ক্লার্কশিপ ইংলিশ চ্যাম্পিয়ন (Champion)' },
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    const tier = tiers[i];
    if (safeXp >= tier.minXp) {
      const span = tier.maxXp - tier.minXp;
      const progress = Math.min(100, Math.round(((safeXp - tier.minXp) / span) * 100));
      return {
        level: tier.level,
        titleEn: tier.titleEn,
        titleBn: tier.titleBn,
        currentXp: safeXp,
        nextLevelXp: tier.maxXp,
        progressPercent: progress,
      };
    }
  }

  return {
    level: 1,
    titleEn: 'English Rookie',
    titleBn: 'ইংরেজি শিক্ষানবিশ (Rookie)',
    currentXp: safeXp,
    nextLevelXp: 300,
    progressPercent: 0,
  };
}

/**
 * Pure function to evaluate a single question turn in the English Game Arena.
 */
export function evaluateGameTurn(params: {
  selectedOption: OptionKey;
  correctOption: OptionKey;
  currentCombo: number;
  maxCombo: number;
  currentHearts: number;
  bossHpRemaining: number;
  totalQuestionsInQuest: number;
  baseXpPerCorrect: number;
  shieldActive: boolean;
  difficultyMode: GameDifficultyMode;
}): TurnEvaluationResult {
  const isCorrect = params.selectedOption === params.correctOption;

  if (isCorrect) {
    const newCombo = params.currentCombo + 1;
    const newMaxCombo = Math.max(params.maxCombo, newCombo);
    const multiplier = getComboMultiplier(newCombo);
    const xpEarned = Math.round(params.baseXpPerCorrect * multiplier);
    const damagePerHit = Math.ceil(100 / Math.max(1, params.totalQuestionsInQuest));
    const bossHpRemaining = Math.max(0, params.bossHpRemaining - damagePerHit);

    return {
      isCorrect: true,
      xpEarned,
      newCombo,
      newMaxCombo,
      multiplier,
      newHearts: params.currentHearts,
      bossHpRemaining,
      shieldConsumed: false,
      isGameOver: false,
    };
  }

  // Wrong answer handling
  const shieldConsumed = params.shieldActive;
  const heartLoss =
    params.difficultyMode === 'CHILL_LEARN' || shieldConsumed ? 0 : 1;
  const newHearts = Math.max(0, params.currentHearts - heartLoss);
  const isGameOver =
    params.difficultyMode === 'ARCADE_HEARTS' && newHearts === 0;

  return {
    isCorrect: false,
    xpEarned: 15, // Consolation learning XP for reviewing the explanation
    newCombo: 0,
    newMaxCombo: params.maxCombo,
    multiplier: 1,
    newHearts,
    bossHpRemaining: params.bossHpRemaining,
    shieldConsumed,
    isGameOver,
  };
}

/**
 * Pure function for the 50:50 Power-Up: returns deterministic two wrong OptionKeys to eliminate.
 */
export function getFiftyFiftyEliminatedOptions(correctOption: OptionKey): OptionKey[] {
  const allOptions: OptionKey[] = ['A', 'B', 'C', 'D'];
  const wrongOptions = allOptions.filter((k) => k !== correctOption);
  return [wrongOptions[0], wrongOptions[2]];
}

/**
 * Selects a curated deck of questions for the chosen Game World across All Subjects, General Studies, Arithmetic, or English.
 */
export function selectQuestionsForEnglishWorld(
  allQuestions: QuestionItem[],
  worldId: GameWorldId
): QuestionItem[] {
  const world =
    ENGLISH_GAME_WORLDS.find((w) => w.id === worldId) || ENGLISH_GAME_WORLDS[0];

  if (world.subjectCategory === 'ALL') {
    const gsPool = allQuestions.filter((q) => q.subject === 'General Studies');
    const arithPool = allQuestions.filter((q) => q.subject === 'Arithmetic');
    const engPool = allQuestions.filter((q) => q.subject === 'English');

    const interleaved: QuestionItem[] = [];
    const maxLen = Math.max(gsPool.length, arithPool.length, engPool.length);
    for (let i = 0; i < maxLen && interleaved.length < world.questionCount; i++) {
      if (i < gsPool.length && interleaved.length < world.questionCount) {
        interleaved.push(gsPool[i]);
      }
      if (i < arithPool.length && interleaved.length < world.questionCount) {
        interleaved.push(arithPool[i]);
      }
      if (i < engPool.length && interleaved.length < world.questionCount) {
        interleaved.push(engPool[i]);
      }
    }
    return interleaved.slice(0, world.questionCount);
  }

  const subjectPool = allQuestions.filter((q) => q.subject === world.subjectCategory);

  if (world.topicKeywords.length === 0) {
    return subjectPool.slice(0, world.questionCount);
  }

  const matched = subjectPool.filter((q) => {
    const haystack = `${q.topic} ${q.subtopic || ''} ${q.questionTextEn || q.questionText} ${q.questionTextBn || ''}`.toLowerCase();
    return world.topicKeywords.some((kw) => haystack.includes(kw.toLowerCase()));
  });

  if (matched.length >= world.questionCount) {
    return matched.slice(0, world.questionCount);
  }

  const matchedIds = new Set(matched.map((q) => q.id));
  const filler = subjectPool.filter((q) => !matchedIds.has(q.id));
  return [...matched, ...filler].slice(0, world.questionCount);
}
