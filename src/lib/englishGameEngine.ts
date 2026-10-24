import { OptionKey, QuestionItem } from '../types/exam';

export type GameWorldId =
  | 'WORLD_1_PREPOSITION'
  | 'WORLD_2_VOICE_NARRATION'
  | 'WORLD_3_VOCAB_POWER'
  | 'WORLD_4_GRAMMAR_TENSE'
  | 'WORLD_5_BOSS_GAUNTLET';

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
    id: 'WORLD_1_PREPOSITION',
    stageNumber: 1,
    titleEn: 'Quest 1: Preposition Kingdom',
    titleBn: 'অভিযান ১: প্রিপোজিশন রাজ্য (Fixed Prepositions)',
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
    stageNumber: 2,
    titleEn: 'Quest 2: Voice & Narration Fortress',
    titleBn: 'অভিযান ২: ভয়েস ও ন্যারেশন দুর্গ (Voice & Speech)',
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
    stageNumber: 3,
    titleEn: 'Quest 3: Vocab, Idioms & Phrasal Arena',
    titleBn: 'অভিযান ৩: ভোকাবুলারি ও ইডিয়ম অ্যারেনা',
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
    stageNumber: 4,
    titleEn: 'Quest 4: Tense, Error & Spelling Lab',
    titleBn: 'অভিযান ৪: টেন্স, এরর ও বানান ল্যাব',
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
    stageNumber: 5,
    titleEn: 'Quest 5: WBPSC 30-Mark Grand Boss Gauntlet',
    titleBn: 'অভিযান ৫: ডব্লিউবিপিএসসি ইংরেজি মেগা বস চ্যালেঞ্জ',
    bossNameEn: 'Grand Examiner of Clerkship Part-I',
    bossNameBn: 'ক্লার্কশিপ পার্ট-১ মহাপরীক্ষক বস',
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
 * Selects a curated deck of English questions for the chosen Game World.
 */
export function selectQuestionsForEnglishWorld(
  allQuestions: QuestionItem[],
  worldId: GameWorldId
): QuestionItem[] {
  const englishPool = allQuestions.filter((q) => q.subject === 'English');
  const world =
    ENGLISH_GAME_WORLDS.find((w) => w.id === worldId) || ENGLISH_GAME_WORLDS[0];

  if (world.topicKeywords.length === 0) {
    return englishPool.slice(0, world.questionCount);
  }

  const matched = englishPool.filter((q) => {
    const haystack = `${q.topic} ${q.subtopic} ${q.questionTextEn} ${q.questionTextBn}`.toLowerCase();
    return world.topicKeywords.some((kw) => haystack.includes(kw.toLowerCase()));
  });

  if (matched.length >= world.questionCount) {
    return matched.slice(0, world.questionCount);
  }

  const matchedIds = new Set(matched.map((q) => q.id));
  const filler = englishPool.filter((q) => !matchedIds.has(q.id));
  return [...matched, ...filler].slice(0, world.questionCount);
}
