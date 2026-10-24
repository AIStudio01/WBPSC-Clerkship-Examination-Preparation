import React, { useEffect, useMemo, useState } from 'react';
import { LanguageCode, OptionKey, QuestionItem } from '../types/exam';
import {
  calculatePlayerRank,
  ENGLISH_GAME_WORLDS,
  EnglishGameState,
  evaluateGameTurn,
  GameDifficultyMode,
  GameWorldId,
  getFiftyFiftyEliminatedOptions,
  selectQuestionsForEnglishWorld,
} from '../lib/englishGameEngine';
import { ChildFriendlyTeacherCard } from './ChildFriendlyTeacherCard';
import {
  Award,
  CheckCircle2,
  Flame,
  Gamepad2,
  Heart,
  Lightbulb,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
  ArrowRight,
  Map,
} from 'lucide-react';

interface EnglishGameArenaProps {
  questions: QuestionItem[];
  language: LanguageCode;
  onRecordPracticeAttempt: (
    question: QuestionItem,
    selectedOption: OptionKey,
    isCorrect: boolean
  ) => void;
  autoStartWorld?: GameWorldId;
}

// Gentle synthesized Web Audio API sound effects (no external audio files needed)
function playGameSound(
  type: 'hit' | 'miss' | 'powerup' | 'victory',
  soundEnabled: boolean
) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'victory') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Ignore audio context restriction errors
  }
}

export const EnglishGameArena: React.FC<EnglishGameArenaProps> = ({
  questions,
  language,
  onRecordPracticeAttempt,
  autoStartWorld,
}) => {
  const isBn = language === 'bn';

  // Persistent Player XP & Completed Worlds
  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wbpsc_english_game_xp');
      return saved ? parseInt(saved, 10) || 150 : 150;
    } catch {
      return 150;
    }
  });

  const [clearedWorlds, setClearedWorlds] = useState<GameWorldId[]>(() => {
    try {
      const saved = localStorage.getItem('wbpsc_english_game_cleared');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wbpsc_english_game_xp', String(totalXp));
      localStorage.setItem('wbpsc_english_game_cleared', JSON.stringify(clearedWorlds));
    } catch {
      // Ignore storage errors
    }
  }, [totalXp, clearedWorlds]);

  // Game Session State Machine
  const [gameState, setGameState] = useState<EnglishGameState>(
    autoStartWorld ? 'PLAYING' : 'TITLE_MENU'
  );
  const [selectedWorldId, setSelectedWorldId] = useState<GameWorldId>(
    autoStartWorld || 'WORLD_12_ALL_SUBJECT_MEGA_BOSS'
  );
  const [worldSubjectFilter, setWorldSubjectFilter] = useState<
    'ALL_QUESTS' | 'ALL' | 'General Studies' | 'Arithmetic' | 'English'
  >('ALL_QUESTS');
  const [difficultyMode, setDifficultyMode] = useState<GameDifficultyMode>('CHILL_LEARN');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Quest Round State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [hearts, setHearts] = useState<number>(3);
  const [bossHp, setBossHp] = useState<number>(100);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [questXpEarned, setQuestXpEarned] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [lastTurnXp, setLastTurnXp] = useState<number>(0);
  const [lastTurnMultiplier, setLastTurnMultiplier] = useState<number>(1);
  const [shieldSavedHeart, setShieldSavedHeart] = useState<boolean>(false);

  // 3 Lifelines / Power-Ups per Quest
  const [fiftyFiftyCharges, setFiftyFiftyCharges] = useState<number>(2);
  const [trickScrollCharges, setTrickScrollCharges] = useState<number>(2);
  const [shieldCharges, setShieldCharges] = useState<number>(1);

  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([]);
  const [trickClueRevealed, setTrickClueRevealed] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  const activeWorld = useMemo(
    () =>
      ENGLISH_GAME_WORLDS.find((w) => w.id === selectedWorldId) ||
      ENGLISH_GAME_WORLDS[0],
    [selectedWorldId]
  );

  const visibleWorlds = useMemo(() => {
    if (worldSubjectFilter === 'ALL_QUESTS') return ENGLISH_GAME_WORLDS;
    return ENGLISH_GAME_WORLDS.filter((w) => w.subjectCategory === worldSubjectFilter);
  }, [worldSubjectFilter]);

  const questDeck = useMemo(
    () => selectQuestionsForEnglishWorld(questions, selectedWorldId),
    [questions, selectedWorldId]
  );

  const currentQuestion = questDeck[currentIndex] || questDeck[0];
  const playerRank = useMemo(() => calculatePlayerRank(totalXp), [totalXp]);

  const startQuest = (worldId: GameWorldId) => {
    setSelectedWorldId(worldId);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHearts(3);
    setBossHp(100);
    setCombo(0);
    setMaxCombo(0);
    setQuestXpEarned(0);
    setCorrectCount(0);
    setLastTurnXp(0);
    setLastTurnMultiplier(1);
    setShieldSavedHeart(false);
    setFiftyFiftyCharges(2);
    setTrickScrollCharges(2);
    setShieldCharges(1);
    setEliminatedOptions([]);
    setTrickClueRevealed(false);
    setShieldActive(false);
    setGameState('PLAYING');
    playGameSound('powerup', soundEnabled);
  };

  const handleSelectAnswer = (opt: OptionKey) => {
    if (gameState !== 'PLAYING' || !currentQuestion) return;
    if (eliminatedOptions.includes(opt)) return;

    const evalResult = evaluateGameTurn({
      selectedOption: opt,
      correctOption: currentQuestion.correctAnswer,
      currentCombo: combo,
      maxCombo,
      currentHearts: hearts,
      bossHpRemaining: bossHp,
      totalQuestionsInQuest: questDeck.length,
      baseXpPerCorrect: activeWorld.baseXpPerCorrect,
      shieldActive,
      difficultyMode,
    });

    setSelectedOption(opt);
    setCombo(evalResult.newCombo);
    setMaxCombo(evalResult.newMaxCombo);
    setHearts(evalResult.newHearts);
    setBossHp(evalResult.bossHpRemaining);
    setLastTurnXp(evalResult.xpEarned);
    setLastTurnMultiplier(evalResult.multiplier);
    setShieldSavedHeart(evalResult.shieldConsumed);
    if (evalResult.shieldConsumed) {
      setShieldActive(false);
    }

    setQuestXpEarned((prev) => prev + evalResult.xpEarned);
    setTotalXp((prev) => prev + evalResult.xpEarned);
    if (evalResult.isCorrect) {
      setCorrectCount((prev) => prev + 1);
      playGameSound('hit', soundEnabled);
    } else {
      playGameSound('miss', soundEnabled);
    }

    onRecordPracticeAttempt(currentQuestion, opt, evalResult.isCorrect);
    setGameState('ANSWER_REVEALED');
  };

  const handleNextCard = () => {
    if (difficultyMode === 'ARCADE_HEARTS' && hearts <= 0) {
      setGameState('GAME_OVER');
      return;
    }

    if (currentIndex + 1 >= questDeck.length) {
      // Quest Victory!
      setBossHp(0);
      const bonus = activeWorld.clearBonusXp;
      setQuestXpEarned((prev) => prev + bonus);
      setTotalXp((prev) => prev + bonus);
      if (!clearedWorlds.includes(activeWorld.id)) {
        setClearedWorlds((prev) => [...prev, activeWorld.id]);
      }
      playGameSound('victory', soundEnabled);
      setGameState('VICTORY');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setTrickClueRevealed(false);
    setShieldSavedHeart(false);
    setGameState('PLAYING');
  };

  const handleUseFiftyFifty = () => {
    if (
      gameState !== 'PLAYING' ||
      fiftyFiftyCharges <= 0 ||
      eliminatedOptions.length > 0 ||
      !currentQuestion
    ) {
      return;
    }
    const toEliminate = getFiftyFiftyEliminatedOptions(currentQuestion.correctAnswer);
    setEliminatedOptions(toEliminate);
    setFiftyFiftyCharges((prev) => prev - 1);
    playGameSound('powerup', soundEnabled);
  };

  const handleUseTrickScroll = () => {
    if (gameState !== 'PLAYING' || trickScrollCharges <= 0 || trickClueRevealed) {
      return;
    }
    setTrickClueRevealed(true);
    setTrickScrollCharges((prev) => prev - 1);
    playGameSound('powerup', soundEnabled);
  };

  const handleUseShield = () => {
    if (gameState !== 'PLAYING' || shieldCharges <= 0 || shieldActive) {
      return;
    }
    setShieldActive(true);
    setShieldCharges((prev) => prev - 1);
    playGameSound('powerup', soundEnabled);
  };

  return (
    <div className="space-y-6" data-testid="english-game-arena">
      {/* Persistent Top Game HUD Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Player Rank & XP Progress */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex flex-col items-center justify-center font-mono-tabular shrink-0">
              <span className="text-[10px] uppercase tracking-wider opacity-85">LVL</span>
              <span className="text-lg font-extrabold leading-none">{playerRank.level}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  WBPSC All-Subject Game Arena (GS · Math · English)
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 font-mono-tabular">
                  {totalXp} XP
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                {isBn ? playerRank.titleBn : playerRank.titleEn}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-36 sm:w-48 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${playerRank.progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono-tabular text-slate-500">
                  Next Lv: {playerRank.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right HUD Controls: Mode Switcher, Sound & World Map Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200"
              role="group"
              aria-label="Game Mode Difficulty"
            >
              <button
                type="button"
                data-testid="mode-chill-btn"
                onClick={() => setDifficultyMode('CHILL_LEARN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  difficultyMode === 'CHILL_LEARN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isBn ? '∞ শেখার মোড (Chill Learn)' : '∞ Chill Learn Mode'}
              </button>
              <button
                type="button"
                data-testid="mode-arcade-btn"
                onClick={() => setDifficultyMode('ARCADE_HEARTS')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  difficultyMode === 'ARCADE_HEARTS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isBn ? '♥ ৩-হার্ট আর্কেড (3-Hearts)' : '♥ 3-Hearts Arcade'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label="Toggle Game Sound Effects"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{soundEnabled ? 'SFX On' : 'Muted'}</span>
            </button>

            {gameState !== 'TITLE_MENU' && (
              <button
                type="button"
                data-testid="back-to-world-map-btn"
                onClick={() => setGameState('TITLE_MENU')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
              >
                <Map className="w-4 h-4 text-sky-700" />
                <span>{isBn ? 'লেভেল ম্যাপ (Quest Map)' : 'Quest Map'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== STATE 1: TITLE MENU / QUEST WORLD MAP ==================== */}
      {gameState === 'TITLE_MENU' && (
        <div className="space-y-6" data-testid="english-game-world-map">
          {/* Hero Game Banner */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800">
                  <Gamepad2 className="w-4 h-4" />
                  <span>All WBPSC Clerkship Part-I Subjects (100 Marks: GS 40 · Math 30 · English 30)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-bengali">
                  {isBn
                    ? 'খেলার ছলে ডব্লিউবিপিএসসি ক্লার্কশিপের সব বিষয় জয় করো — All-Subject Quest Arena!'
                    : 'Play, Level Up & Master All WBPSC Clerkship Subjects Like a Game!'}
                </h2>
                <p className="text-sm text-slate-700 font-bengali leading-relaxed">
                  {isBn
                    ? 'শুধু ইংরেজি নয়—এখন সাধারণ জ্ঞান (General Studies: ইতিহাস, সংবিধান, ভূগোল, বিজ্ঞান — ৪০ নম্বর), পাটিগণিত (Arithmetic: শতকরা, লাভ-ক্ষতি, সুদকষা, সময়-কার্য — ৩০ নম্বর) এবং ইংরেজি (English — ৩০ নম্বর) সব বিষয় খেলার ছলে জয় করো!'
                    : 'Master every WBPSC Clerkship subject! Play quests across General Studies (History, Polity, WB Geography, Science — 40 Marks), Arithmetic (Percentage, Profit-Loss, SI, Time-Work — 30 Marks), and English (30 Marks).'}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  data-testid="start-quest-1-cta"
                  onClick={() => startQuest(selectedWorldId)}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-sky-700 px-6 py-4 text-sm sm:text-base font-bold text-white hover:bg-sky-800 transition-colors shadow-sm font-bengali whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {isBn
                      ? 'এখনই সব বিষয়ের গেম শুরু করো (Play Selected Quest)'
                      : 'Play Selected Quest Now'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Game Rules / Power-Up Preview Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-sky-200/70">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 font-bengali">
                    {isBn ? '১. সব বিষয় (GS 40 + Math 30 + Eng 30)' : '1. All 3 Official WBPSC Subjects'}
                  </div>
                  <p className="text-xs text-slate-600 font-bengali mt-0.5">
                    {isBn
                      ? 'ইতিহাস, সংবিধান, ভূগোল, বিজ্ঞান, পাটিগণিত ও ইংরেজি—১২টি লেভেলে সম্পূর্ণ সিলেবাস!'
                      : '12 quests covering History, Polity, WB Geography, Science, Arithmetic & English.'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 font-bengali">
                    {isBn ? '২. ৩টি গেম পাওয়ার-আপ (3 Lifelines)' : '2. Interactive Power-Ups'}
                  </div>
                  <p className="text-xs text-slate-600 font-bengali mt-0.5">
                    {isBn
                      ? '50:50 অপশন কাট, শর্টকাট ট্রিক ক্লু (উত্তর দেওয়ার আগেই নিয়ম দেখো) এবং হার্ট শিল্ড!'
                      : 'Use 50:50, Shortcut Trick Scrolls before answering, and Heart Shields.'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 font-bengali">
                    {isBn ? '৩. বাংলা + ইংরেজি ও ৩-সেকেন্ডের ট্রিক' : '3. Bilingual + Instant Trick'}
                  </div>
                  <p className="text-xs text-slate-600 font-bengali mt-0.5">
                    {isBn
                      ? 'ভুল করলেও চিন্তা নেই—সাথে সাথে সঠিক উত্তর, কেন হবে এবং মনে রাখার সহজ ট্রিক ফুটে উঠবে!'
                      : 'Every card teaches the exact rule and 3-second exam trick in simple Bengali & English.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Filter Bar for Game World Map */}
          <div
            className="rounded-xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3"
            data-testid="game-world-subject-filter"
          >
            <div className="text-xs font-bold text-slate-800 font-bengali">
              {isBn
                ? 'বিষয় অনুযায়ী গেম লেভেল বেছে নাও (Filter Quests by WBPSC Subject):'
                : 'Filter Game Quests by WBPSC Clerkship Subject:'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  {
                    id: 'ALL_QUESTS',
                    labelBn: 'সব ১২টি অভিযান (All 12 Quests)',
                    labelEn: 'All 12 Quests',
                  },
                  {
                    id: 'General Studies',
                    labelBn: 'Part B: সাধারণ জ্ঞান / GS (40 নম্বর · ৪টি লেভেল)',
                    labelEn: 'Part B: General Studies (40M · 4 Quests)',
                  },
                  {
                    id: 'Arithmetic',
                    labelBn: 'Part C: পাটিগণিত / Math (30 নম্বর · ২টি লেভেল)',
                    labelEn: 'Part C: Arithmetic (30M · 2 Quests)',
                  },
                  {
                    id: 'English',
                    labelBn: 'Part A: ইংরেজি / English (30 নম্বর · ৫টি লেভেল)',
                    labelEn: 'Part A: English (30M · 5 Quests)',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`game-subject-tab-${tab.id}`}
                  onClick={() => setWorldSubjectFilter(tab.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors font-bengali ${
                    worldSubjectFilter === tab.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isBn ? tab.labelBn : tab.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* 12 Quest World Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleWorlds.map((world) => {
              const isCleared = clearedWorlds.includes(world.id);
              const isSelected = selectedWorldId === world.id;
              return (
                <div
                  key={world.id}
                  data-testid={`quest-card-${world.id}`}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40'
                      : 'border-slate-200 bg-white hover:border-sky-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-mono-tabular">
                        STAGE {world.stageNumber} · {world.subjectCategory === 'ALL' ? 'ALL 3 SUBJECTS' : world.subjectCategory.toUpperCase()} · {world.questionCount} CARDS
                      </span>
                      {isCleared ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isBn ? 'বিজয়ী (Cleared)' : 'Cleared'}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono-tabular text-amber-800 font-semibold">
                          +{world.clearBonusXp} Bonus XP
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900 font-bengali">
                      {isBn ? world.titleBn : world.titleEn}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700 font-bengali">
                      <Swords className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Boss: {isBn ? world.bossNameBn : world.bossNameEn}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 font-bengali leading-relaxed">
                      {isBn ? world.subtitleBn : world.subtitleEn}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono-tabular text-slate-500">
                      {world.baseXpPerCorrect} XP / Card
                    </span>
                    <button
                      type="button"
                      data-testid={`play-world-${world.stageNumber}-btn`}
                      onClick={() => startQuest(world.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors font-bengali whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isBn ? 'লেভেল খেলো (Play Quest)' : 'Play Quest'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== STATE 2 & 3: ACTIVE PLAYING & ANSWER REVEALED ==================== */}
      {(gameState === 'PLAYING' || gameState === 'ANSWER_REVEALED') && currentQuestion && (
        <div className="space-y-5" data-testid="english-game-battle-stage">
          {/* Battle Arena Top Status Bar: Boss HP + Hearts + Combo + Lifelines */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left: Boss HP Bar */}
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-rose-700 font-bengali">
                    <Swords className="w-4 h-4 shrink-0" />
                    <span>
                      {isBn ? activeWorld.bossNameBn : activeWorld.bossNameEn}
                    </span>
                  </span>
                  <span className="font-mono-tabular text-slate-700">
                    BOSS HP: {bossHp}/100 · CARD {currentIndex + 1}/{questDeck.length}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>

              {/* Center: Hearts & Combo Streak */}
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5"
                  data-testid="player-hearts-display"
                >
                  {difficultyMode === 'ARCADE_HEARTS' ? (
                    <>
                      {[1, 2, 3].map((h) => (
                        <Heart
                          key={h}
                          className={`w-4 h-4 ${
                            h <= hearts
                              ? 'text-rose-600 fill-rose-600'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold font-mono-tabular text-rose-900">
                        {hearts}/3 HP
                      </span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900 font-bengali">
                        {isBn ? '∞ আনলিমিটেড হার্ট (Chill Mode)' : '∞ Unlimited Hearts'}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono-tabular text-xs font-bold ${
                    combo >= 2
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                  data-testid="player-combo-display"
                >
                  <Flame className={`w-4 h-4 ${combo >= 2 ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                  <span>
                    COMBO: {combo}x {combo >= 2 ? `(${lastTurnMultiplier}x XP!)` : ''}
                  </span>
                </div>

                <div className="rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-1.5 font-mono-tabular text-xs font-bold text-sky-900">
                  +{questXpEarned} Quest XP
                </div>
              </div>
            </div>

            {/* 3 Interactive Power-Ups (Lifelines) Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600 font-bengali">
                {isBn
                  ? 'গেম পাওয়ার-আপ ও লাইফলাইন (Power-Ups — উত্তর দেওয়ার আগে ব্যবহার করো):'
                  : 'Power-Ups & Lifelines (Use before answering):'}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="powerup-fifty-fifty"
                  disabled={
                    gameState !== 'PLAYING' ||
                    fiftyFiftyCharges <= 0 ||
                    eliminatedOptions.length > 0
                  }
                  onClick={handleUseFiftyFifty}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-950 hover:bg-indigo-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors font-bengali whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-700" />
                  <span>
                    {isBn
                      ? `৫০:৫০ দুটি ভুল অপশন কাটো (${fiftyFiftyCharges})`
                      : `50:50 Cut 2 Options (${fiftyFiftyCharges})`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="powerup-trick-scroll"
                  disabled={
                    gameState !== 'PLAYING' ||
                    trickScrollCharges <= 0 ||
                    trickClueRevealed
                  }
                  onClick={handleUseTrickScroll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors font-bengali whitespace-nowrap"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {isBn
                      ? `শর্টকাট ট্রিক ক্লু দেখো (${trickScrollCharges})`
                      : `Shortcut Trick Clue (${trickScrollCharges})`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="powerup-heart-shield"
                  disabled={
                    gameState !== 'PLAYING' ||
                    shieldCharges <= 0 ||
                    shieldActive
                  }
                  onClick={handleUseShield}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors font-bengali whitespace-nowrap ${
                    shieldActive
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950'
                      : 'border-emerald-200 bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100 disabled:opacity-45 disabled:cursor-not-allowed'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {shieldActive
                      ? isBn
                        ? 'শিল্ড চালু আছে! (Shield Active)'
                        : 'Shield Active!'
                      : isBn
                      ? `হার্ট শিল্ড কবচ (${shieldCharges})`
                      : `Heart Shield (${shieldCharges})`}
                  </span>
                </button>
              </div>
            </div>

            {/* If Shortcut Trick Scroll Power-Up was activated BEFORE answering */}
            {trickClueRevealed && gameState === 'PLAYING' && (
              <div
                className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs sm:text-sm text-amber-950 font-bengali"
                data-testid="active-trick-clue-banner"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {isBn
                      ? 'পাওয়ার-আপ ক্লু: ৩-সেকেন্ডে সঠিক উত্তর চেনার শর্টকাট ট্রিক!'
                      : 'Power-Up Clue Unlocked: 3-Second Exam Shortcut Trick!'}
                  </span>
                </div>
                <p className="mt-1 font-medium">
                  {isBn
                    ? currentQuestion.teacherExplanation.memoryTrickBn
                    : currentQuestion.teacherExplanation.memoryTrickEn}
                </p>
              </div>
            )}
          </div>

          {/* Main Bilingual Question Battle Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  CARD #{currentIndex + 1} · {currentQuestion.subject}
                </span>
                <span>·</span>
                <span className="text-sky-700 font-semibold">
                  {currentQuestion.topic}
                </span>
              </div>
              <span className="font-mono-tabular">
                Base Value: +{activeWorld.baseXpPerCorrect} XP
              </span>
            </div>

            {/* Bilingual Stem (English + Bengali Side-by-Side / Stacked) */}
            <div className="space-y-3" data-testid="game-bilingual-stem">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  English Version ({currentQuestion.subject})
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </div>
              </div>

              {currentQuestion.questionTextBn && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
                  <div className="text-[11px] font-bold text-sky-800 mb-1 font-bengali">
                    বাংলায় প্রশ্নের অর্থ (Bengali Meaning for Easy Understanding):
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 font-bengali leading-relaxed">
                    {currentQuestion.questionTextBn}
                  </div>
                </div>
              )}
            </div>

            {/* 4 Interactive Game Option Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                const isEliminated = eliminatedOptions.includes(key);
                const isRevealed = gameState === 'ANSWER_REVEALED';
                const isThisSelected = selectedOption === key;
                const isThisCorrect = currentQuestion.correctAnswer === key;

                let tileStyle =
                  'border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50/30 text-slate-900';
                if (isEliminated && !isRevealed) {
                  tileStyle =
                    'border-slate-200 bg-slate-100 text-slate-400 opacity-45 line-through cursor-not-allowed';
                } else if (isRevealed) {
                  if (isThisCorrect) {
                    tileStyle =
                      'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold';
                  } else if (isThisSelected && !isThisCorrect) {
                    tileStyle =
                      'border-rose-600 bg-rose-50/90 text-rose-950 font-semibold';
                  } else {
                    tileStyle = 'border-slate-200 bg-slate-50 text-slate-500 opacity-75';
                  }
                }

                return (
                  <button
                    key={key}
                    type="button"
                    data-testid={`game-option-${key}`}
                    disabled={isRevealed || isEliminated}
                    onClick={() => handleSelectAnswer(key)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm sm:text-base transition-all min-h-[56px] ${tileStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-tabular text-xs font-extrabold border shrink-0 ${
                          isRevealed && isThisCorrect
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : isRevealed && isThisSelected && !isThisCorrect
                            ? 'bg-rose-700 text-white border-rose-700'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {key}
                      </span>
                      <span className="font-bengali">{currentQuestion.options[key]}</span>
                    </div>

                    {isRevealed && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    )}
                    {isRevealed && isThisSelected && !isThisCorrect && (
                      <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Post-Turn Action Bar & Explanation */}
            {gameState === 'ANSWER_REVEALED' && selectedOption && (
              <div className="space-y-4 pt-3 border-t border-slate-200" data-testid="game-turn-feedback">
                {/* Turn Outcome Banner + Next Card Button */}
                <div
                  className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 ${
                    selectedOption === currentQuestion.correctAnswer
                      ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950'
                      : 'border-rose-300 bg-rose-50/80 text-rose-950'
                  }`}
                >
                  <div className="space-y-1 font-bengali">
                    {selectedOption === currentQuestion.correctAnswer ? (
                      <>
                        <div className="text-base font-extrabold flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                          <span>
                            {isBn
                              ? `দারুণ শট! একদম সঠিক উত্তর (+${lastTurnXp} XP · ${combo}x কম্বো স্ট্রিক!)`
                              : `Awesome Hit! Correct Answer (+${lastTurnXp} XP · ${combo}x Combo Streak!)`}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm">
                          <span className="font-bold">
                            {isBn ? 'মনে রাখার ট্রিক: ' : 'Shortcut Trick: '}
                          </span>
                          {isBn
                            ? currentQuestion.teacherExplanation.memoryTrickBn
                            : currentQuestion.teacherExplanation.memoryTrickEn}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-base font-extrabold flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-rose-700 shrink-0" />
                          <span>
                            {isBn
                              ? `ওহো! অপশন (${selectedOption}) সঠিক নয়—কিন্তু এখনই ট্রিকটা শিখে নিলে পরীক্ষায় আর ভুল হবে না! (+${lastTurnXp} Learning XP)`
                              : `Missed! Option (${selectedOption}) wasn't right—master the 3-second trick below & earn +${lastTurnXp} Learning XP!`}
                          </span>
                        </div>
                        {shieldSavedHeart && (
                          <div className="text-xs font-bold text-emerald-800">
                            {isBn
                              ? '🛡️ তোমার হার্ট শিল্ড কবচ এই টার্নে হার্ট রক্ষা করেছে!'
                              : '🛡️ Your Heart Shield protected your HP on this turn!'}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    data-testid="next-quest-card-btn"
                    onClick={handleNextCard}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-colors font-bengali whitespace-nowrap shrink-0"
                  >
                    <span>
                      {difficultyMode === 'ARCADE_HEARTS' && hearts <= 0
                        ? isBn
                          ? 'গেম ওভার সামারি দেখো'
                          : 'See Round Summary'
                        : currentIndex + 1 >= questDeck.length
                        ? isBn
                          ? 'বিজয় ট্রফি সংগ্রহ করো! (Claim Victory)'
                          : 'Claim Quest Victory!'
                        : isBn
                        ? 'পরের প্রশ্ন কার্ডে যাও (Next Quest Card)'
                        : 'Next Quest Card'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Detailed Child-Friendly Teacher Breakdown (Always shown on Wrong Answer, and available on Correct Answer) */}
                <ChildFriendlyTeacherCard
                  question={currentQuestion}
                  selectedOption={selectedOption}
                  language={language}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== STATE 4: QUEST VICTORY SCREEN ==================== */}
      {gameState === 'VICTORY' && (
        <div
          className="rounded-xl border border-emerald-300 bg-white p-6 sm:p-8 text-center space-y-6"
          data-testid="english-game-victory-screen"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              STAGE {activeWorld.stageNumber} BOSS DEFEATED!
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-bengali">
              {isBn
                ? `অভিনন্দন! তুমি "${activeWorld.titleBn}" জয় করেছ!`
                : `Victory! You conquered "${activeWorld.titleEn}"!`}
            </h2>
            <p className="text-sm text-slate-600 font-bengali">
              {isBn
                ? `তুমি "${activeWorld.bossNameBn}"-কে পরাজিত করে +${activeWorld.clearBonusXp} বোনাস XP অর্জন করেছ!`
                : `You defeated ${activeWorld.bossNameEn} and earned +${activeWorld.clearBonusXp} Stage Clear Bonus XP!`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">Total Quest XP</div>
              <div className="text-xl font-extrabold text-sky-700 font-mono-tabular mt-0.5">
                +{questXpEarned} XP
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">Accuracy</div>
              <div className="text-xl font-extrabold text-emerald-700 font-mono-tabular mt-0.5">
                {Math.round((correctCount / Math.max(1, questDeck.length)) * 100)}%
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">Max Combo</div>
              <div className="text-xl font-extrabold text-amber-700 font-mono-tabular mt-0.5">
                {maxCombo}x Streak
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">Player Level</div>
              <div className="text-xl font-extrabold text-slate-900 font-mono-tabular mt-0.5">
                LVL {playerRank.level}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startQuest(activeWorld.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 font-bengali whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isBn ? 'আবার এই লেভেল খেলো (Replay Quest)' : 'Replay Quest'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState('TITLE_MENU')}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-800 font-bengali whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>{isBn ? 'পরবর্তী অভিযানে যাও (Choose Next Quest)' : 'Choose Next Quest World'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== STATE 5: GAME OVER (ARCADE HEARTS DEPLETED) ==================== */}
      {gameState === 'GAME_OVER' && (
        <div
          className="rounded-xl border border-rose-300 bg-white p-6 sm:p-8 text-center space-y-5"
          data-testid="english-game-over-screen"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 font-bengali">
              {isBn
                ? 'এই রাউন্ডে ৩টি হার্ট শেষ হয়েছে — কিন্তু তুমি নতুন ট্রিক শিখেছ!'
                : 'Out of Hearts — But You Leveled Up Your Grammar Tricks!'}
            </h2>
            <p className="text-sm text-slate-600 font-bengali">
              {isBn
                ? `তুমি এই প্রচেষ্টায় +${questXpEarned} XP অর্জন করেছ। আবার চেষ্টা করো অথবা চাপমুক্ত অনুশীলনের জন্য "∞ শেখার মোড (Chill Learn)" বেছে নাও!`
                : `You still kept +${questXpEarned} XP from this run. Try again or switch to "∞ Chill Learn Mode" for unlimited hearts!`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startQuest(activeWorld.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-800 font-bengali whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isBn ? 'আবার চেষ্টা করো (Play Again)' : 'Play Again (3 Hearts)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDifficultyMode('CHILL_LEARN');
                startQuest(activeWorld.id);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 font-bengali whitespace-nowrap"
            >
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>
                {isBn
                  ? '∞ আনলিমিটেড হার্ট মোডে খেলো (Play Chill Mode)'
                  : 'Play with ∞ Unlimited Hearts'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
