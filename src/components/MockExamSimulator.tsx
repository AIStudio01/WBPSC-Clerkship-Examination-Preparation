import React, { useEffect, useState } from 'react';
import {
  ExamConfiguration,
  LanguageCode,
  MockTestResult,
  MockTestSession,
  OptionKey,
  PracticeUniquenessMode,
  StudentQuestionResponse,
  WBPSCQuestion,
} from '../types/exam';
import { ChildFriendlyTeacherCard } from './ChildFriendlyTeacherCard';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eraser,
  Flag,
  Flame,
  Gamepad2,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  Scissors,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';

interface GameQuestionOutcome {
  questionId: string;
  selectedOption: OptionKey;
  isCorrect: boolean;
  correctAnswer: OptionKey;
  marksDelta: number;
  xpDelta: number;
  shieldUsed: boolean;
  fullQuestion: WBPSCQuestion;
}

interface MockExamSimulatorProps {
  examConfigurations: ExamConfiguration[];
  language: LanguageCode;
  seenQuestionIds: string[];
  mistakeQuestionIds: string[];
  onTestCompleted: (result: MockTestResult, newlySeenIds: string[], wrongQuestionIds: { questionId: string; selected: OptionKey }[]) => void;
  autoStartNow?: boolean;
}

const ACTIVE_SESSION_STORAGE_KEY = 'wbpsc_active_mock_session_id';

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  examConfigurations,
  language,
  seenQuestionIds,
  mistakeQuestionIds,
  onTestCompleted,
  autoStartNow = false,
}) => {
  const isBn = language === 'bn';

  const [selectedConfigId, setSelectedConfigId] = useState<string>(
    examConfigurations[0]?.id || 'wbpsc_clerkship_2023_part1'
  );
  const [uniquenessMode, setUniquenessMode] = useState<PracticeUniquenessMode>('FRESH_MOCK');
  const [customCount, setCustomCount] = useState<number>(100);
  const [activeSession, setActiveSession] = useState<MockTestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [paletteSectionFilter, setPaletteSectionFilter] = useState<'ALL' | 'English' | 'General Studies' | 'Arithmetic'>('ALL');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<MockTestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'INCORRECT' | 'UNANSWERED' | 'CORRECT'>('ALL');
  const [useAiFreshGeneration, setUseAiFreshGeneration] = useState<boolean>(true);
  const [aiGeneratedCountInSession, setAiGeneratedCountInSession] = useState<number>(0);
  const [aiCoachReport, setAiCoachReport] = useState<any | null>(null);
  const [aiCoachLoading, setAiCoachLoading] = useState<boolean>(false);

  // Interactive Game Mode states (Default: true as requested by user)
  const [isGameMode, setIsGameMode] = useState<boolean>(true);
  const [autoLockOnSelect, setAutoLockOnSelect] = useState<boolean>(true);
  const [gameXp, setGameXp] = useState<number>(100);
  const [gameStreak, setGameStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [fiftyFiftyLeft, setFiftyFiftyLeft] = useState<number>(3);
  const [aiHintLeft, setAiHintLeft] = useState<number>(3);
  const [shieldLeft, setShieldLeft] = useState<number>(2);
  const [eliminatedByQuestion, setEliminatedByQuestion] = useState<Record<string, OptionKey[]>>({});
  const [hintsByQuestion, setHintsByQuestion] = useState<Record<string, { hintBn: string; hintEn: string }>>({});
  const [shieldActiveByQuestion, setShieldActiveByQuestion] = useState<Record<string, boolean>>({});
  const [lockedOutcomes, setLockedOutcomes] = useState<Record<string, GameQuestionOutcome>>({});
  const [expandedExplanationByQ, setExpandedExplanationByQ] = useState<Record<string, boolean>>({});
  const [gameActionBusy, setGameActionBusy] = useState<boolean>(false);

  const selectedConfig =
    examConfigurations.find((c) => c.id === selectedConfigId) || examConfigurations[0];

  const getOfficerRankInfo = (xp: number) => {
    if (xp >= 900) {
      return {
        level: 4,
        titleBn: 'লেভেল ৪: WBPSC ক্লার্কশিপ চ্যাম্পিয়ন',
        titleEn: 'Level 4: WBPSC Clerkship Champion',
        nextLevelXp: 1500,
      };
    }
    if (xp >= 500) {
      return {
        level: 3,
        titleBn: 'লেভেল ৩: রাইটার্স বিল্ডিংস অফিসার',
        titleEn: "Level 3: Writers' Buildings Officer",
        nextLevelXp: 900,
      };
    }
    if (xp >= 250) {
      return {
        level: 2,
        titleBn: 'লেভেল ২: সচিবালয় যোদ্ধা (Contender)',
        titleEn: 'Level 2: Secretariat Contender',
        nextLevelXp: 500,
      };
    }
    return {
      level: 1,
      titleBn: 'লেভেল ১: জুনিয়র ক্লার্কশিপ যোদ্ধা',
      titleEn: 'Level 1: Junior Clerkship Challenger',
      nextLevelXp: 250,
    };
  };

  // Restore active server-persisted session on mount so refreshing does not reset the timer
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (savedSessionId) {
      fetch(`/api/mock-tests/${savedSessionId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.session && data.session.status === 'IN_PROGRESS') {
            setActiveSession(data.session);
            const deadlineMs = new Date(data.session.deadlineAt).getTime();
            const serverNowMs = new Date(data.serverNow || Date.now()).getTime();
            const rem = Math.max(0, Math.floor((deadlineMs - serverNowMs) / 1000));
            setRemainingSeconds(rem);
          } else if (data?.result) {
            setSubmittedResult(data.result);
            sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
          }
        })
        .catch(() => {
          sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        });
    } else if (autoStartNow) {
      handleStartMockTest();
    }
  }, []);

  // Countdown timer synced to server deadlineAt
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'IN_PROGRESS' || submittedResult) return;

    const interval = setInterval(() => {
      const deadlineMs = new Date(activeSession.deadlineAt).getTime();
      const rem = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setRemainingSeconds(rem);
      if (rem <= 0) {
        clearInterval(interval);
        handleConfirmSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, submittedResult]);

  const handleStartMockTest = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSubmittedResult(null);
    setShowSubmitConfirm(false);
    // Reset game arena state for the fresh game session
    setGameXp(100);
    setGameStreak(0);
    setBestStreak(0);
    setFiftyFiftyLeft(3);
    setAiHintLeft(3);
    setShieldLeft(2);
    setEliminatedByQuestion({});
    setHintsByQuestion({});
    setShieldActiveByQuestion({});
    setLockedOutcomes({});
    setExpandedExplanationByQ({});

    try {
      const response = await fetch('/api/mock-tests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student_default',
          examConfigurationId: selectedConfigId,
          uniquenessMode,
          experienceMode: isGameMode ? 'GAMIFIED_CHALLENGE' : 'REAL_EXAM_SIMULATION',
          customQuestionCount: customCount,
          mistakeQuestionIds,
          clientSeenIds: seenQuestionIds,
          useAiFreshGeneration,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.session) {
        throw new Error(data.error || 'Could not start mock test');
      }
      setActiveSession(data.session);
      setAiGeneratedCountInSession(Number(data.aiGeneratedInSessionCount || 0));
      setCurrentIndex(0);
      sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, data.session.id);

      const deadlineMs = new Date(data.session.deadlineAt).getTime();
      const serverNowMs = new Date(data.serverNow || Date.now()).getTime();
      setRemainingSeconds(Math.max(1, Math.floor((deadlineMs - serverNowMs) / 1000)));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start mock test.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiCoachAnalysis = async (result: MockTestResult) => {
    setAiCoachLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-mock-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examinationName: result.examinationName,
          finalScore: result.finalScore,
          maximumMarks: result.maximumMarks,
          correctCount: result.correctCount,
          incorrectCount: result.incorrectCount,
          unansweredCount: result.unansweredCount,
          negativeMarksDeducted: result.negativeMarksDeducted,
          subjectBreakdown: result.subjectBreakdown,
          weakestTopics: result.weakestTopics,
        }),
      });
      const data = await response.json();
      setAiCoachReport(data);
    } catch (e) {
      console.warn('Could not fetch AI coach report:', e);
    } finally {
      setAiCoachLoading(false);
    }
  };

  const syncResponseToServer = async (
    questionId: string,
    patch: Partial<StudentQuestionResponse>
  ) => {
    if (!activeSession) return;
    const prev = activeSession.responses[questionId] || {
      questionId,
      selectedOption: null,
      markedForReview: false,
      timeSpentSeconds: 0,
    };
    const updated: StudentQuestionResponse = {
      ...prev,
      ...patch,
      timeSpentSeconds: (prev.timeSpentSeconds || 0) + 2,
    };

    setActiveSession({
      ...activeSession,
      responses: {
        ...activeSession.responses,
        [questionId]: updated,
      },
    });

    try {
      await fetch(`/api/mock-tests/${activeSession.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Will retry syncing response on final submit:', e);
    }
  };

  // ==================== GAME MODE INTERACTIVE HANDLERS ====================
  const handleUseFiftyFifty = async (questionId: string) => {
    if (!activeSession || fiftyFiftyLeft <= 0 || eliminatedByQuestion[questionId] || lockedOutcomes[questionId]) {
      return;
    }
    setGameActionBusy(true);
    try {
      const res = await fetch(`/api/mock-tests/${activeSession.id}/game-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, action: 'FIFTY_FIFTY' }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.eliminatedOptions)) {
        setEliminatedByQuestion((prev) => ({ ...prev, [questionId]: data.eliminatedOptions }));
        setFiftyFiftyLeft((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.warn('50:50 lifeline error:', e);
    } finally {
      setGameActionBusy(false);
    }
  };

  const handleUseAiHint = async (questionId: string) => {
    if (!activeSession || aiHintLeft <= 0 || hintsByQuestion[questionId]) {
      return;
    }
    setGameActionBusy(true);
    try {
      const res = await fetch(`/api/mock-tests/${activeSession.id}/game-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, action: 'AI_HINT' }),
      });
      const data = await res.json();
      if (res.ok && (data.hintBn || data.hintEn)) {
        setHintsByQuestion((prev) => ({
          ...prev,
          [questionId]: { hintBn: data.hintBn, hintEn: data.hintEn },
        }));
        setAiHintLeft((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.warn('AI Hint lifeline error:', e);
    } finally {
      setGameActionBusy(false);
    }
  };

  const handleActivateShield = (questionId: string) => {
    if (shieldLeft <= 0 || shieldActiveByQuestion[questionId] || lockedOutcomes[questionId]) {
      return;
    }
    setShieldActiveByQuestion((prev) => ({ ...prev, [questionId]: true }));
    setShieldLeft((prev) => Math.max(0, prev - 1));
  };

  const handleLockGameAnswer = async (questionId: string, explicitOption?: OptionKey) => {
    if (!activeSession || lockedOutcomes[questionId]) return;
    const chosen = explicitOption || activeSession.responses[questionId]?.selectedOption || null;
    if (!chosen) return;

    setGameActionBusy(true);
    try {
      const isShieldOn = Boolean(shieldActiveByQuestion[questionId]);
      const res = await fetch(`/api/mock-tests/${activeSession.id}/game-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          action: 'CHECK_ANSWER',
          selectedOption: chosen,
          shieldActive: isShieldOn,
        }),
      });
      const data = await res.json();
      if (res.ok && data.fullQuestion) {
        const isCorrect = Boolean(data.isCorrect);
        const newStreak = isCorrect ? gameStreak + 1 : 0;
        const streakBonusXp = isCorrect ? Math.min(100, (newStreak - 1) * 25) : 0;
        const totalXpDelta = (Number(data.xpDelta) || 0) + streakBonusXp;

        setGameStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        setGameXp((prev) => Math.max(0, prev + totalXpDelta));

        const outcome: GameQuestionOutcome = {
          questionId,
          selectedOption: chosen,
          isCorrect,
          correctAnswer: data.correctAnswer,
          marksDelta: Number(data.marksDelta) || 0,
          xpDelta: totalXpDelta,
          shieldUsed: Boolean(data.shieldUsed),
          fullQuestion: data.fullQuestion,
        };
        setLockedOutcomes((prev) => ({ ...prev, [questionId]: outcome }));
        // Automatically open teacher explanation if wrong so student learns immediately
        if (!isCorrect) {
          setExpandedExplanationByQ((prev) => ({ ...prev, [questionId]: true }));
        }
      }
    } catch (e) {
      console.warn('Lock answer error:', e);
    } finally {
      setGameActionBusy(false);
    }
  };

  const handleConfirmSubmit = async (autoExpired = false) => {
    if (!activeSession) return;
    setLoading(true);
    setShowSubmitConfirm(false);
    try {
      const response = await fetch(`/api/mock-tests/${activeSession.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoExpired,
          responses: activeSession.responses,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setSubmittedResult(data.result);
        setActiveSession(data.session);
        sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);

        const newlySeen = data.result.evaluatedQuestions.map((eq: any) => eq.question.id);
        const wrongItems = data.result.evaluatedQuestions
          .filter((eq: any) => eq.status === 'INCORRECT' && eq.selectedOption)
          .map((eq: any) => ({
            questionId: eq.question.id,
            selected: eq.selectedOption as OptionKey,
          }));
        onTestCompleted(data.result, newlySeen, wrongItems);
        fetchAiCoachAnalysis(data.result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remS = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
  };

  // ==================== VIEW 1: RESULTS & PERFORMANCE ANALYTICS ====================
  if (submittedResult) {
    const filteredEvaluated = submittedResult.evaluatedQuestions.filter((eq) => {
      if (reviewFilter === 'ALL') return true;
      return eq.status === reviewFilter;
    });

    return (
      <div className="space-y-6" data-testid="mock-test-results-view">
        {/* Top Result Summary Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {submittedResult.examinationName} · {submittedResult.schemeVersion}
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'মক টেস্টের ফলাফল ও বিস্তারিত বিশ্লেষণ'
                  : 'Mock Examination Result & Performance Analysis'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-bengali">
                {isBn ? submittedResult.readinessAdviceBn : submittedResult.readinessAdviceEn}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedResult(null);
                  setActiveSession(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isBn ? 'নতুন মক টেস্ট শুরু করো' : 'Take Another Fresh Mock Test'}</span>
              </button>
            </div>
          </div>

          {/* Transparent Score Formula & 4 Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-bengali">
                {isBn ? 'চূড়ান্ত স্কোর (Final Score)' : 'Final Score (Net)'}
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
                {submittedResult.finalScore.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-500">
                  / {submittedResult.maximumMarks}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-600 font-mono-tabular">
                {submittedResult.transparentFormula}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-bengali">
                {isBn ? 'সঠিক / ভুল / অনুত্তরিত' : 'Correct / Wrong / Skipped'}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 font-bengali">
                <span className="text-emerald-700">{submittedResult.correctCount} সঠিক</span>
                {' · '}
                <span className="text-rose-700">{submittedResult.incorrectCount} ভুল</span>
                {' · '}
                <span className="text-slate-600">{submittedResult.unansweredCount} বাকি</span>
              </div>
              <div className="mt-1 text-xs text-rose-700 font-bengali">
                {isBn
                  ? `নেগেটিভ মার্কিং কাটা গেছে: -${submittedResult.negativeMarksDeducted.toFixed(2)}`
                  : `Negative marks deducted: -${submittedResult.negativeMarksDeducted.toFixed(2)}`}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 font-bengali">
                {isBn ? 'নির্ভুলতার হার (Accuracy)' : 'Accuracy & Time Used'}
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
                {submittedResult.accuracyPercent}%
              </div>
              <div className="mt-1 text-xs text-slate-600 font-bengali">
                {isBn ? 'ব্যবহৃত সময়: ' : 'Time used: '}
                <span className="font-mono-tabular">
                  {Math.floor(submittedResult.timeUsedSeconds / 60)}m{' '}
                  {submittedResult.timeUsedSeconds % 60}s
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4">
              <div className="text-xs text-sky-800 font-bengali">
                {isBn ? 'প্রস্তুতির স্তর (Readiness Level)' : 'Practical Readiness Assessment'}
              </div>
              <div className="mt-1 text-base font-bold text-sky-950 font-bengali flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-700 shrink-0" />
                <span>{isBn ? submittedResult.readinessLabelBn : submittedResult.readinessLabel}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600 font-bengali">
                {isBn
                  ? 'এটি অনুশীলনের মূল্যায়ন, সরকারি র‍্যাঙ্ক নয়।'
                  : 'Practice readiness metric (not an official WBPSC rank).'}
              </div>
            </div>
          </div>

          {/* Subject-Wise Breakdown Table */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 font-bengali mb-3">
              {isBn
                ? 'বিষয়ভিত্তিক ফলাফল (Subject-Wise Breakdown: English · General Studies · Arithmetic)'
                : 'Subject-Wise Score & Accuracy Breakdown'}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">{isBn ? 'বিষয় (Subject)' : 'Subject'}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{isBn ? 'মোট প্রশ্ন' : 'Total Qs'}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{isBn ? 'সঠিক (+1)' : 'Correct (+1)'}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{isBn ? 'ভুল (-0.25)' : 'Wrong (-0.25)'}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{isBn ? 'নেট নম্বর' : 'Net Marks'}</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{isBn ? 'নির্ভুলতা' : 'Accuracy'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {submittedResult.subjectBreakdown.map((sb) => (
                    <tr key={sb.subject} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{sb.subject}</td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular">{sb.totalQuestions}</td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular text-emerald-700 font-medium">
                        {sb.correct}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular text-rose-700 font-medium">
                        {sb.incorrect} (-{sb.negativeMarks.toFixed(2)})
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                        {sb.netMarks.toFixed(2)} / {sb.maxMarks}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular">{sb.accuracyPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Post-Exam Personal Performance Coach & Diagnostic Report */}
        <div
          className="rounded-xl border border-sky-200 bg-sky-50/40 p-6"
          data-testid="ai-post-exam-coach-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sky-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-sky-800">
                  Gemini AI Personal Exam Coach · WBPSC Clerkship Diagnostic
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-bengali">
                  {isBn
                    ? 'AI শিক্ষকের সামগ্রিক ফলাফল বিশ্লেষণ ও পাস করার কৌশল'
                    : 'AI Teacher’s Personalized Post-Exam Strategy & Action Plan'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              disabled={aiCoachLoading}
              onClick={() => fetchAiCoachAnalysis(submittedResult)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 font-bengali"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {aiCoachLoading
                  ? isBn
                    ? 'AI বিশ্লেষণ তৈরি হচ্ছে...'
                    : 'Analyzing...'
                  : isBn
                    ? 'নতুন AI পরামর্শ নাও (Refresh AI Coach)'
                    : 'Refresh AI Coaching Report'}
              </span>
            </button>
          </div>

          {aiCoachReport ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-sky-200 bg-white p-4">
                  <div className="text-xs font-bold text-sky-900 font-bengali">
                    {isBn ? 'সামগ্রিক মূল্যায়ন (Overall AI Assessment):' : 'Overall AI Assessment:'}
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-800 font-bengali leading-relaxed">
                    {isBn ? aiCoachReport.overallVerdictBn : aiCoachReport.overallVerdictEn}
                  </p>
                </div>

                <div className="rounded-lg border border-rose-200 bg-white p-4">
                  <div className="text-xs font-bold text-rose-900 font-bengali">
                    {isBn
                      ? 'নেগেটিভ মার্কিং (-0.25) নিয়ন্ত্রণের কৌশল:'
                      : 'Negative Marking (-0.25) Control Strategy:'}
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-800 font-bengali leading-relaxed">
                    {isBn
                      ? aiCoachReport.negativeMarkingStrategyBn
                      : aiCoachReport.negativeMarkingStrategyEn}
                  </p>
                </div>
              </div>

              {Array.isArray(aiCoachReport.sectionActionPlan) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiCoachReport.sectionActionPlan.map((sec: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3.5">
                      <div className="text-xs font-bold text-slate-900">{sec.subject}</div>
                      <p className="mt-1 text-xs text-slate-700 font-bengali leading-relaxed">
                        {isBn ? sec.actionStepBn : sec.actionStepEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs sm:text-sm font-bengali">
                <span className="text-emerald-950 font-medium">
                  {isBn ? aiCoachReport.encouragementBn : aiCoachReport.encouragementEn}
                </span>
                {aiCoachReport.nextMockTargetScore && (
                  <span className="font-mono-tabular font-bold text-emerald-900 bg-white border border-emerald-300 rounded px-2.5 py-1">
                    {isBn ? 'পরবর্তী টার্গেট স্কোর: ' : 'Next Target Score: '}
                    {aiCoachReport.nextMockTargetScore} / {submittedResult.maximumMarks}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs sm:text-sm text-slate-600 font-bengali">
              {isBn
                ? 'AI শিক্ষক তোমার উত্তরপত্র বিশ্লেষণ করছেন...'
                : 'AI Teacher is analyzing your answer sheet...'}
            </div>
          )}
        </div>

        {/* Question-by-Question Review with Child-Friendly AI Teacher */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'প্রতিটি প্রশ্নের উত্তর ও শিক্ষকের সহজ বাংলা ব্যাখ্যা'
                  : 'Detailed Question Review & Personal Teacher Explanations'}
              </h3>
              <p className="text-xs text-slate-500 font-bengali">
                {isBn
                  ? 'যে প্রশ্নগুলো ভুল হয়েছে সেগুলো স্বয়ংক্রিয়ভাবে তোমার ভুল খাতায় (Mistake Notebook) সংরক্ষিত হয়েছে।'
                  : 'All incorrect answers have been automatically saved to your Mistake Notebook for revision.'}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['ALL', 'INCORRECT', 'UNANSWERED', 'CORRECT'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReviewFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    reviewFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL'
                    ? isBn
                      ? `সব (${submittedResult.totalQuestions})`
                      : `All (${submittedResult.totalQuestions})`
                    : tab === 'INCORRECT'
                      ? isBn
                        ? `ভুল (${submittedResult.incorrectCount})`
                        : `Wrong (${submittedResult.incorrectCount})`
                      : tab === 'UNANSWERED'
                        ? isBn
                          ? `বাকি (${submittedResult.unansweredCount})`
                          : `Skipped (${submittedResult.unansweredCount})`
                        : isBn
                          ? `সঠিক (${submittedResult.correctCount})`
                          : `Correct (${submittedResult.correctCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200 mt-4">
            {filteredEvaluated.map((eq, idx) => (
              <div key={eq.question.id} className="py-6 first:pt-2 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div>
                    <span className="font-mono-tabular font-semibold text-slate-800">
                      Q{idx + 1}
                    </span>
                    {' · '}
                    <span>{eq.question.subject}</span>
                    {' · '}
                    <span>{eq.question.topic}</span>
                    {' · '}
                    <span>
                      {eq.question.questionOrigin === 'AUTHENTIC_PYQ'
                        ? `Authentic WBPSC PYQ (${eq.question.examinationYear || 2019})`
                        : eq.question.questionOrigin === 'ADAPTED_CONCEPT'
                          ? 'Adapted PYQ Concept'
                          : 'AI-Generated Original Practice'}
                    </span>
                  </div>
                  <div className="font-mono-tabular font-semibold">
                    {eq.status === 'CORRECT' && (
                      <span className="text-emerald-700">CORRECT (+1.00)</span>
                    )}
                    {eq.status === 'INCORRECT' && (
                      <span className="text-rose-700">INCORRECT (-0.25)</span>
                    )}
                    {eq.status === 'UNANSWERED' && (
                      <span className="text-slate-500">UNANSWERED (0.00)</span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 space-y-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      English Version
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">
                      {eq.question.questionText}
                    </h4>
                  </div>
                  {eq.question.questionTextBn && (
                    <div className="rounded-lg border border-sky-200/80 bg-sky-50/40 p-3">
                      <div className="text-[11px] font-semibold text-sky-800 font-bengali mb-0.5">
                        বাংলা সংস্করণ (Bengali Version):
                      </div>
                      <p className="text-base font-medium text-slate-900 font-bengali">
                        {eq.question.questionTextBn}
                      </p>
                    </div>
                  )}
                </div>

                <ChildFriendlyTeacherCard
                  question={eq.question}
                  selectedOption={eq.selectedOption}
                  language={language}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== VIEW 2: LIVE REAL EXAM / GAME ARENA SCREEN ====================
  if (activeSession && activeSession.questions.length > 0) {
    const currentQ = activeSession.questions[currentIndex] || activeSession.questions[0];
    const currentResp = activeSession.responses[currentQ.id] || {
      questionId: currentQ.id,
      selectedOption: null,
      markedForReview: false,
      timeSpentSeconds: 0,
    };

    const currentEliminated = eliminatedByQuestion[currentQ.id] || [];
    const currentHint = hintsByQuestion[currentQ.id];
    const isShieldActiveOnCurrent = Boolean(shieldActiveByQuestion[currentQ.id]);
    const currentOutcome = lockedOutcomes[currentQ.id];
    const isExplanationOpen = Boolean(expandedExplanationByQ[currentQ.id]);

    const allOutcomes = Object.values(lockedOutcomes);
    const liveGameNetMarks = allOutcomes.reduce((acc, o) => acc + o.marksDelta, 0);
    const liveCorrectLocked = allOutcomes.filter((o) => o.isCorrect).length;
    const liveWrongLocked = allOutcomes.filter((o) => !o.isCorrect).length;
    const rankInfo = getOfficerRankInfo(gameXp);

    const allResponses = Object.values(activeSession.responses);
    const answeredCount = allResponses.filter((r) => r.selectedOption !== null).length;
    const markedCount = allResponses.filter((r) => r.markedForReview).length;
    const unansweredCount = activeSession.totalQuestions - answeredCount;

    const sectionStats = (['English', 'General Studies', 'Arithmetic'] as const).map((subj) => {
      const qs = activeSession.questions
        .map((q, idx) => ({ q, idx }))
        .filter((item) => item.q.subject === subj);
      const ansInSubj = qs.filter((item) => Boolean(activeSession.responses[item.q.id]?.selectedOption)).length;
      const firstIndex = qs[0]?.idx ?? 0;
      const lastOrder = qs[qs.length - 1]?.q.displayOrder ?? 0;
      const firstOrder = qs[0]?.q.displayOrder ?? 0;
      return {
        subject: subj,
        total: qs.length,
        answered: ansInSubj,
        firstIndex,
        rangeText: qs.length > 0 ? `Q${firstOrder}–Q${lastOrder}` : '',
      };
    });

    const paletteQuestions = activeSession.questions
      .map((q, idx) => ({ q, idx }))
      .filter((item) => paletteSectionFilter === 'ALL' || item.q.subject === paletteSectionFilter);

    return (
      <div className="space-y-4" data-testid="live-exam-simulator">
        {/* Top Official WBPSC Question Booklet & Timer Bar + Game Mode Switcher */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-sky-300 font-mono-tabular">
              TEST BOOKLET SERIES: A · Advt. No. 13/2023 · {activeSession.title}
            </div>
            <div className="text-sm font-semibold mt-0.5 font-bengali">
              {isBn
                ? `পূর্ণমান: ${activeSession.totalQuestions} · সময়: ${Math.round(activeSession.durationSeconds / 60)} মিনিট · সঠিক উত্তরে +${activeSession.marksPerQuestion} · ভুল উত্তরে -${activeSession.negativeMarkingPerWrong}`
                : `Full Marks: ${activeSession.totalQuestions} · Time: ${Math.round(activeSession.durationSeconds / 60)} Mins · Correct: +${activeSession.marksPerQuestion} · Negative: -${activeSession.negativeMarkingPerWrong}`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Mode Switcher: Game Arena vs Strict OMR Hall */}
            <div
              className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700"
              data-testid="live-mode-switcher"
            >
              <button
                type="button"
                onClick={() => setIsGameMode(true)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors font-bengali ${
                  isGameMode
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'গেম মোড (Game Arena)' : 'Game Mode'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGameMode(false)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors font-bengali ${
                  !isGameMode
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{isBn ? 'আসল হল মোড (Strict OMR)' : 'Strict OMR Hall'}</span>
              </button>
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono-tabular text-base font-bold ${
                remainingSeconds < 300
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-sky-300 border border-slate-700'
              }`}
              aria-label="Exam Countdown Timer"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{isBn ? 'চূড়ান্ত স্কোর ও ফলাফল দেখো (Finish)' : 'Finish & Submit'}</span>
            </button>
          </div>
        </div>

        {/* GAME ARENA HUD: Officer Rank, XP Progress Bar, Combo Streak, & Live Locked Net Score */}
        {isGameMode && (
          <div
            className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            data-testid="game-mode-hud"
          >
            {/* Officer Level & XP Bar (5 cols) */}
            <div className="md:col-span-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-700 text-white flex flex-col items-center justify-center shrink-0 font-mono-tabular">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-bold">LVL {rankInfo.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-bengali truncate">
                    {isBn ? rankInfo.titleBn : rankInfo.titleEn}
                  </span>
                  <span className="text-xs font-mono-tabular font-bold text-sky-800 shrink-0">
                    {gameXp} XP / {rankInfo.nextLevelXp} XP
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-sky-200/80 overflow-hidden">
                  <div
                    className="h-full bg-sky-700 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((gameXp / rankInfo.nextLevelXp) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Combo Streak & Live Locked Score (4 cols) */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-amber-200 bg-white px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold font-bengali">
                    {isBn ? 'টানা সঠিক (Streak)' : 'Combo Streak'}
                  </span>
                </div>
                <span className="font-mono-tabular text-sm font-extrabold text-amber-900">
                  x{gameStreak}
                </span>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 font-bengali">
                  {isBn ? 'লাইভ নেট স্কোর:' : 'Live Score:'}
                </span>
                <span
                  className="font-mono-tabular text-sm font-extrabold text-emerald-800"
                  data-testid="game-live-score"
                >
                  {liveGameNetMarks >= 0 ? `+${liveGameNetMarks.toFixed(2)}` : liveGameNetMarks.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Locked Wins / Misses Summary (3 cols) */}
            <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 text-xs font-bengali">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">{liveCorrectLocked}</span>
                  <span>{isBn ? 'সঠিক' : 'Won'}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="font-mono-tabular">{liveWrongLocked}</span>
                  <span>{isBn ? 'ভুল' : 'Missed'}</span>
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Official WBPSC 3-Part Section Navigation Bar (English 30 / General Studies 40 / Arithmetic 30) */}
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {sectionStats.map((sec, sIdx) => {
              const isCurrentSection = currentQ.subject === sec.subject;
              const labelPart = sIdx === 0 ? 'Part A' : sIdx === 1 ? 'Part B' : 'Part C';
              return (
                <button
                  key={sec.subject}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(sec.firstIndex);
                    setPaletteSectionFilter('ALL');
                  }}
                  className={`rounded-lg border px-3.5 py-2 text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isCurrentSection
                      ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>
                    {labelPart}: {sec.subject} ({sec.rangeText})
                  </span>
                  <span
                    className={`font-mono-tabular px-1.5 py-0.5 rounded text-[11px] ${
                      isCurrentSection ? 'bg-slate-700 text-sky-300' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {sec.answered}/{sec.total}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-600 font-bengali px-2">
            {isGameMode
              ? isBn
                ? 'গেম নিয়ম: অপশন বেছে "উত্তর লক করো" চাপলে সাথে সাথে +100 XP, সঠিক উত্তর ও AI শিক্ষকের ভয়েস ব্যাখ্যা পাবে!'
                : 'Game Arena: Lock your answer to win +100 XP, build combo streaks, and unlock AI Teacher explanations!'
              : isBn
                ? 'নির্দেশ: আসল WBPSC পরীক্ষার মতোই কোনো প্রশ্নের উত্তর জমা দেওয়ার আগে দেখানো হবে না।'
                : 'Official Exam Mode: Answers & explanations are locked until final submission.'}
          </div>
        </div>

        {activeSession.poolLimitationNotice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            {activeSession.poolLimitationNotice}
          </div>
        )}

        {/* Main 2-Column Exam Workspace: Left Question Booklet + Right OMR Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Question Booklet Page (8 cols) */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 text-xs text-slate-500">
              <div>
                <span className="font-mono-tabular font-bold text-slate-900 text-sm">
                  {isBn
                    ? `প্রশ্ন নম্বর (Q. No.): ${currentQ.displayOrder} / ${activeSession.totalQuestions}`
                    : `Question ${currentQ.displayOrder} of ${activeSession.totalQuestions}`}
                </span>
                {' · '}
                <span className="font-semibold text-slate-800">{currentQ.subject}</span>
                {' · '}
                <span>{currentQ.topic}</span>
              </div>
              <div className="font-mono-tabular">
                <span className="text-emerald-700 font-semibold">+{currentQ.marks}.00 Mark</span>
                {' · '}
                <span className="text-rose-700 font-semibold">
                  {isShieldActiveOnCurrent ? '0.00 (Shield Protected)' : `-${currentQ.negativeMarks} Negative`}
                </span>
              </div>
            </div>

            {/* GAME MODE LIFELINES BAR: 50:50 Eliminator, AI Hint, & Negative Marking Shield */}
            {isGameMode && (
              <div
                className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-2"
                data-testid="game-lifelines-bar"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="lifeline-5050"
                    disabled={
                      fiftyFiftyLeft <= 0 ||
                      currentEliminated.length > 0 ||
                      Boolean(currentOutcome) ||
                      gameActionBusy
                    }
                    onClick={() => handleUseFiftyFifty(currentQ.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-50 disabled:opacity-40 transition-colors font-bengali"
                  >
                    <Scissors className="w-3.5 h-3.5 text-sky-700" />
                    <span>
                      {isBn
                        ? `50:50 এলিমিনেটর (${fiftyFiftyLeft})`
                        : `50:50 Lifeline (${fiftyFiftyLeft})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="lifeline-ai-hint"
                    disabled={
                      aiHintLeft <= 0 ||
                      Boolean(currentHint) ||
                      Boolean(currentOutcome) ||
                      gameActionBusy
                    }
                    onClick={() => handleUseAiHint(currentQ.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-40 transition-colors font-bengali"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {isBn
                        ? `AI টিচার হিন্ট (${aiHintLeft})`
                        : `AI Teacher Hint (${aiHintLeft})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="lifeline-shield"
                    disabled={
                      shieldLeft <= 0 ||
                      isShieldActiveOnCurrent ||
                      Boolean(currentOutcome) ||
                      gameActionBusy
                    }
                    onClick={() => handleActivateShield(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors font-bengali ${
                      isShieldActiveOnCurrent
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 disabled:opacity-40'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>
                      {isShieldActiveOnCurrent
                        ? isBn
                          ? 'নেগেটিভ শিল্ড চালু আছে (-0.25 মাফ)'
                          : 'Shield Active (No -0.25)'
                        : isBn
                          ? `নেগেটিভ শিল্ড (${shieldLeft})`
                          : `Negative Shield (${shieldLeft})`}
                    </span>
                  </button>
                </div>

                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer font-bengali">
                  <input
                    type="checkbox"
                    checked={autoLockOnSelect}
                    onChange={(e) => setAutoLockOnSelect(e.target.checked)}
                    className="rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                  />
                  <span>
                    {isBn ? 'অপশনে ক্লিক করলেই লক (Instant Check)' : 'Instant Check on Click'}
                  </span>
                </label>
              </div>
            )}

            {/* AI Teacher Hint Banner when AI Hint Lifeline is used */}
            {isGameMode && currentHint && (
              <div
                className="mt-3 rounded-lg border border-amber-300 bg-amber-50/80 p-3 text-xs sm:text-sm text-amber-950 font-bengali flex items-start gap-2.5"
                data-testid="game-hint-banner"
              >
                <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {isBn ? 'AI শিক্ষকের গোপন ক্লু (Lifeline Hint): ' : 'AI Teacher Clue: '}
                  </span>
                  <span>{isBn ? currentHint.hintBn : currentHint.hintEn}</span>
                </div>
              </div>
            )}

            {/* Question Stem: Dual-Language (Both English & Bengali for ALL Questions as requested) */}
            <div className="mt-5 space-y-3" data-testid="bilingual-question-stem">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  English Version (ইংরেজি প্রশ্ন)
                </div>
                <p
                  className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed"
                  data-testid="question-stem-en"
                >
                  {currentQ.displayOrder}. {currentQ.questionText}
                </p>
              </div>

              <div className="rounded-lg bg-sky-50/60 border border-sky-200/90 p-3.5">
                <div className="text-[11px] font-semibold text-sky-900 font-bengali mb-1">
                  বাংলা সংস্করণ (Bengali Version — বাংলায় সম্পূর্ণ প্রশ্ন):
                </div>
                <p
                  className="text-base sm:text-lg font-semibold text-slate-900 font-bengali leading-relaxed"
                  data-testid="question-stem-bn"
                >
                  {currentQ.displayOrder}. {currentQ.questionTextBn || currentQ.questionText}
                </p>
              </div>
            </div>

            {/* OMR / Game Arena Options A, B, C, D */}
            <div className="mt-6 space-y-3">
              {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optKey) => {
                const isSelected = currentResp.selectedOption === optKey;
                const isEliminated = isGameMode && currentEliminated.includes(optKey);
                const isLocked = isGameMode && Boolean(currentOutcome);
                const isCorrectOptionInGame =
                  isLocked && currentOutcome?.correctAnswer === optKey;
                const isWrongChosenInGame =
                  isLocked &&
                  currentOutcome?.selectedOption === optKey &&
                  !currentOutcome?.isCorrect;

                let optionCardStyle =
                  'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60';
                if (isEliminated) {
                  optionCardStyle =
                    'border-slate-200 bg-slate-100 text-slate-400 line-through opacity-55 cursor-not-allowed';
                } else if (isCorrectOptionInGame) {
                  optionCardStyle =
                    'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-600';
                } else if (isWrongChosenInGame) {
                  optionCardStyle =
                    'border-rose-600 bg-rose-50/90 text-rose-950 font-semibold ring-1 ring-rose-600';
                } else if (isSelected) {
                  optionCardStyle =
                    'border-sky-700 bg-sky-50/90 text-slate-900 font-semibold';
                }

                return (
                  <button
                    key={optKey}
                    type="button"
                    data-testid={`exam-option-${optKey}`}
                    disabled={isEliminated || isLocked}
                    onClick={() => {
                      syncResponseToServer(currentQ.id, { selectedOption: optKey });
                      if (isGameMode && autoLockOnSelect) {
                        handleLockGameAnswer(currentQ.id, optKey);
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${optionCardStyle}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-full font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isCorrectOptionInGame
                            ? 'bg-emerald-600 text-white'
                            : isWrongChosenInGame
                              ? 'bg-rose-600 text-white'
                              : isSelected
                                ? 'bg-slate-900 text-white ring-2 ring-sky-600 ring-offset-1'
                                : 'bg-white text-slate-700 border-2 border-slate-300'
                        }`}
                      >
                        {optKey}
                      </span>
                      <span className="text-sm sm:text-base font-bengali">{currentQ.options[optKey]}</span>
                    </div>
                    {isEliminated ? (
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0 font-bengali">
                        {isBn ? '50:50 দ্বারা বাদ' : '50:50 Eliminated'}
                      </span>
                    ) : isCorrectOptionInGame ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 whitespace-nowrap shrink-0 font-bengali">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{isBn ? 'সঠিক উত্তর (+1.00)' : 'Correct (+1.00)'}</span>
                      </span>
                    ) : isWrongChosenInGame ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 whitespace-nowrap shrink-0 font-bengali">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>
                          {currentOutcome?.shieldUsed
                            ? isBn
                              ? 'ভুল (শিল্ড বচিয়েছে 0.00)'
                              : 'Wrong (Shield Saved 0.00)'
                            : isBn
                              ? 'ভুল উত্তর (-0.25)'
                              : 'Wrong (-0.25)'}
                        </span>
                      </span>
                    ) : (
                      isSelected && (
                        <span className="text-xs font-semibold text-sky-900 whitespace-nowrap shrink-0 font-bengali">
                          {isGameMode
                            ? isBn
                              ? '● নির্বাচিত (নিচে লক করো)'
                              : '● Selected (Lock below)'
                            : isBn
                              ? '● OMR বৃত্ত পূরণ করা হয়েছে'
                              : '● OMR Bubbled'}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* GAME MODE: Instant Lock & Check Button OR Locked Outcome & Inline AI Teacher Card */}
            {isGameMode && (
              <div className="mt-5">
                {!currentOutcome ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3.5">
                    <div className="text-xs text-slate-700 font-bengali">
                      {currentResp.selectedOption ? (
                        <span>
                          {isBn
                            ? `তুমি Option (${currentResp.selectedOption}) বেছে নিয়েছ। পয়েন্ট ও XP জিততে এখনই উত্তর লক করো!`
                            : `Option (${currentResp.selectedOption}) selected. Lock your answer now to check & win XP!`}
                        </span>
                      ) : (
                        <span>
                          {isBn
                            ? 'উপরের যেকোনো একটি অপশন (A/B/C/D) বেছে নিয়ে উত্তর লক করো।'
                            : 'Select an option (A/B/C/D) above to lock your answer and win XP.'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      data-testid="game-lock-answer-btn"
                      disabled={!currentResp.selectedOption || gameActionBusy}
                      onClick={() => handleLockGameAnswer(currentQ.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-40 transition-colors font-bengali shrink-0"
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {gameActionBusy
                          ? isBn
                            ? 'যাচাই হচ্ছে...'
                            : 'Checking...'
                          : isBn
                            ? 'উত্তর লক করে পয়েন্ট জেতো (Lock & Check +100 XP)'
                            : 'Lock Answer & Check (+100 XP)'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="game-outcome-banner">
                    <div
                      className={`rounded-xl border p-4 space-y-3 ${
                        currentOutcome.isCorrect
                          ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950'
                          : 'border-rose-300 bg-rose-50/80 text-rose-950'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${
                              currentOutcome.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {currentOutcome.isCorrect ? (
                              <Zap className="w-5 h-5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="font-bengali">
                            <div className="text-sm sm:text-base font-bold">
                              {currentOutcome.isCorrect
                                ? isBn
                                  ? `দুর্দান্ত! সঠিক উত্তর: অপশন (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (+1.00 নম্বর ও +${currentOutcome.xpDelta} XP)`
                                  : `Awesome! Correct Answer: Option (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (+1.00 Mark & +${currentOutcome.xpDelta} XP)`
                                : currentOutcome.shieldUsed
                                  ? isBn
                                    ? `তোমার উত্তর (${currentOutcome.selectedOption}) ভুল ছিল! সঠিক উত্তর হলো: অপশন (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (নেগেটিভ শিল্ড -0.25 বাঁচিয়েছে)`
                                    : `Your choice (${currentOutcome.selectedOption}) was wrong! Correct Answer: Option (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (Shield Saved -0.25)`
                                  : isBn
                                    ? `ভুল উত্তর! সঠিক উত্তর হবে: অপশন (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (নেগেটিভ মার্কিং: -0.25)`
                                    : `Wrong Answer! Correct Answer is: Option (${currentOutcome.correctAnswer}) — ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]} (Penalty: -0.25)`}
                            </div>
                            <div className="text-xs opacity-90 mt-0.5">
                              {isBn
                                ? 'নিচে সঠিক উত্তর কেন হবে এবং ৫ সেকেন্ডে সঠিক উত্তর খোঁজার সহজ ট্রিক (Shortcut Trick) দেখে নাও:'
                                : 'See why this answer is correct and the shortcut trick to find it easily below:'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid="toggle-game-teacher-btn"
                          onClick={() =>
                            setExpandedExplanationByQ((prev) => ({
                              ...prev,
                              [currentQ.id]: !prev[currentQ.id],
                            }))
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 font-bengali shrink-0"
                        >
                          {isExplanationOpen
                            ? isBn
                              ? 'বিস্তারিত ব্যাখ্যা সংক্ষিপ্ত করো'
                              : 'Collapse Full Teacher Note'
                            : isBn
                              ? 'সম্পূর্ণ ধাপে ধাপে ব্যাখ্যা ও ভয়েস খোলো'
                              : 'Open Full Teacher & Voice Note'}
                        </button>
                      </div>

                      {/* Instant 3-Part Quick Card inside the outcome banner so user ALWAYS sees:
                          1. সঠিক উত্তর কোনটি
                          2. ওটা কেনই বা হবে
                          3. সঠিক আনসারটা খোঁজার সহজ উপায় বা Trick */}
                      <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/70 font-bengali"
                        data-testid="instant-wrong-answer-summary"
                      >
                        <div className="rounded-lg border border-emerald-300 bg-white p-3">
                          <div className="text-[11px] font-bold text-emerald-800">
                            {isBn ? '১. সঠিক উত্তর কোনটি?' : '1. Correct Answer:'}
                          </div>
                          <div className="mt-1 text-xs sm:text-sm font-bold text-slate-900">
                            {isBn
                              ? `অপশন (${currentOutcome.correctAnswer}): ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]}`
                              : `Option (${currentOutcome.correctAnswer}): ${currentOutcome.fullQuestion.options[currentOutcome.correctAnswer]}`}
                          </div>
                        </div>

                        <div className="rounded-lg border border-sky-200 bg-white p-3">
                          <div className="text-[11px] font-bold text-sky-900">
                            {isBn ? '২. ওটা কেনই বা সঠিক হবে?' : '2. Why Is It Correct?'}
                          </div>
                          <div className="mt-1 text-xs text-slate-800 leading-relaxed">
                            {isBn
                              ? currentOutcome.fullQuestion.teacherExplanation.simpleConceptBn
                              : currentOutcome.fullQuestion.teacherExplanation.simpleConceptEn}
                          </div>
                        </div>

                        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/90 p-3">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-950">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>
                              {isBn
                                ? '৩. সঠিক উত্তর খোঁজার সহজ উপায় / Trick:'
                                : '3. Easy Trick to Find Answer:'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                            {isBn
                              ? currentOutcome.fullQuestion.teacherExplanation.memoryTrickBn
                              : currentOutcome.fullQuestion.teacherExplanation.memoryTrickEn}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExplanationOpen && (
                      <ChildFriendlyTeacherCard
                        question={currentOutcome.fullQuestion}
                        selectedOption={currentOutcome.selectedOption}
                        language={language}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation & Response Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    syncResponseToServer(currentQ.id, {
                      markedForReview: !currentResp.markedForReview,
                    })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    currentResp.markedForReview
                      ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>
                    {currentResp.markedForReview
                      ? isBn
                        ? 'পর্যালোচনার জন্য চিহ্নিত (Marked)'
                        : 'Marked for Review'
                      : isBn
                        ? 'পর্যালোচনার জন্য রাখো (Mark for Review)'
                        : 'Mark for Review'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!currentResp.selectedOption || Boolean(currentOutcome)}
                  onClick={() =>
                    syncResponseToServer(currentQ.id, { selectedOption: null })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{isBn ? 'উত্তর মুছে ফেলো (Clear Response)' : 'Clear Response'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isBn ? 'পূর্ববর্তী (Previous)' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentIndex < activeSession.questions.length - 1) {
                      setCurrentIndex((prev) => prev + 1);
                    } else {
                      setShowSubmitConfirm(true);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <span>
                    {currentIndex < activeSession.questions.length - 1
                      ? isBn
                        ? 'পরবর্তী প্রশ্ন (Next Question)'
                        : 'Save & Next'
                      : isBn
                        ? 'পরীক্ষা জমা দাও (Finish)'
                        : 'Review & Submit'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: OMR Response Sheet & Question Palette (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-bengali">
                {isGameMode
                  ? isBn
                    ? 'গেম লেভেল ম্যাপ ও OMR প্যালেট'
                    : 'Game Quest Map & OMR Palette'
                  : isBn
                    ? 'প্রশ্ন প্যালেট ও OMR শিট (Question Palette)'
                    : 'OMR Question Palette'}
              </h3>
              <span className="text-xs font-mono-tabular text-slate-500">
                {answeredCount}/{activeSession.totalQuestions} Answered
              </span>
            </div>

            {/* Status Counters */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2">
                <div className="font-mono-tabular text-base font-bold text-emerald-800">
                  {answeredCount}
                </div>
                <div className="text-[11px] font-medium text-emerald-900 font-bengali">
                  {isBn ? 'উত্তরিত' : 'Answered'}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="font-mono-tabular text-base font-bold text-slate-800">
                  {unansweredCount}
                </div>
                <div className="text-[11px] font-medium text-slate-600 font-bengali">
                  {isBn ? 'অনুত্তরিত' : 'Unanswered'}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2">
                <div className="font-mono-tabular text-base font-bold text-amber-800">
                  {markedCount}
                </div>
                <div className="text-[11px] font-medium text-amber-900 font-bengali">
                  {isBn ? 'বিবেচনাধীন' : 'Marked'}
                </div>
              </div>
            </div>

            {/* Palette Section Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 mt-3 p-1 bg-slate-100 rounded-lg text-[11px] font-medium">
              {(
                [
                  { id: 'ALL', label: `All (${activeSession.totalQuestions})` },
                  { id: 'English', label: 'Eng' },
                  { id: 'General Studies', label: 'GS' },
                  { id: 'Arithmetic', label: 'Arith' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaletteSectionFilter(tab.id)}
                  className={`py-1 rounded text-center transition-colors ${
                    paletteSectionFilter === tab.id
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Grid of Question Numbers (Supports all 100 Questions smoothly) */}
            <div className="grid grid-cols-5 gap-2 mt-3 max-h-[340px] overflow-y-auto pr-1">
              {paletteQuestions.map(({ q, idx }) => {
                const r = activeSession.responses[q.id];
                const outcome = lockedOutcomes[q.id];
                const isCurrent = idx === currentIndex;
                const isAns = Boolean(r?.selectedOption);
                const isMarked = Boolean(r?.markedForReview);

                let style = 'border-slate-200 bg-slate-50 text-slate-700';
                if (isGameMode && outcome) {
                  style = outcome.isCorrect
                    ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                    : 'border-rose-600 bg-rose-600 text-white font-bold';
                } else if (isAns && isMarked) {
                  style = 'border-amber-500 bg-emerald-600 text-white font-bold';
                } else if (isMarked) {
                  style = 'border-amber-400 bg-amber-100 text-amber-950 font-semibold';
                } else if (isAns) {
                  style = 'border-sky-600 bg-sky-600 text-white font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Question ${q.displayOrder}`}
                    className={`h-9 rounded-lg border font-mono-tabular text-xs flex items-center justify-center gap-0.5 transition-all ${style} ${
                      isCurrent ? 'ring-2 ring-sky-600 ring-offset-1' : ''
                    }`}
                  >
                    <span>{q.displayOrder}</span>
                    {isGameMode && outcome ? (
                      outcome.isCorrect ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 shrink-0" />
                      )
                    ) : (
                      r?.selectedOption && (
                        <span className="text-[10px] opacity-90">({r.selectedOption})</span>
                      )
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition-colors font-bengali"
            >
              {isBn ? 'চূড়ান্তভাবে পরীক্ষা জমা দাও (Submit Final OMR)' : 'Submit Final Attempt'}
            </button>
          </div>
        </div>

        {/* Pre-Submission Confirmation Dialog */}
        {showSubmitConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-confirm-title"
          >
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 id="submit-confirm-title" className="text-lg font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'পরীক্ষা জমা দেওয়ার আগে নিশ্চিত করো'
                  : 'Confirm Test Submission'}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-bengali">
                {isBn
                  ? 'একবার পরীক্ষা জমা দিলে এই প্রচেষ্টার উত্তর আর পরিবর্তন করা যাবে না। নিচে তোমার উত্তরের সারাংশ দেখে নাও:'
                  : 'Once submitted, your scored attempt is locked on the server. Review your response summary below:'}
              </p>

              <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm font-bengali">
                <div className="flex justify-between">
                  <span>{isBn ? 'মোট প্রশ্ন (Total Questions):' : 'Total Questions:'}</span>
                  <strong className="font-mono-tabular">{activeSession.totalQuestions}</strong>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>{isBn ? 'উত্তর দেওয়া হয়েছে (Answered):' : 'Answered:'}</span>
                  <strong className="font-mono-tabular">{answeredCount}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isBn ? 'উত্তর দেওয়া হয়নি (Unanswered):' : 'Unanswered:'}</span>
                  <strong className="font-mono-tabular">{unansweredCount}</strong>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>{isBn ? 'পর্যালোচনার জন্য চিহ্নিত (Marked for Review):' : 'Marked for Review:'}</span>
                  <strong className="font-mono-tabular">{markedCount}</strong>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 font-bengali"
                >
                  {isBn ? 'ফিরে যাও (Return to Exam)' : 'Return to Exam'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleConfirmSubmit(false)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 font-bengali"
                >
                  {loading
                    ? isBn
                      ? 'স্কোর হিসাব হচ্ছে...'
                      : 'Scoring...'
                    : isBn
                      ? 'হ্যাঁ, পরীক্ষা জমা দাও (Confirm Submit)'
                      : 'Confirm & View Results'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== VIEW 3: OFFICIAL WBPSC CLERKSHIP BOOKLET COVER & GAME START SCREEN ====================
  return (
    <div className="space-y-6" data-testid="mock-test-setup-view">
      {/* Official WBPSC Clerkship Question Booklet Cover Card */}
      <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-slate-700 font-mono-tabular">
              WEST BENGAL PUBLIC SERVICE COMMISSION (WBPSC) · INTERACTIVE GAME & MOCK HALL
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
              {isBn
                ? 'WBPSC ক্লার্কশিপ (Part-I) গেম মোড ও আসল ফরম্যাটে মক টেস্ট'
                : 'WBPSC Clerkship Examination (Part-I) — Interactive Game Arena & Mock Test'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border-2 border-slate-900 px-3.5 py-1.5 text-center font-mono-tabular">
              <div className="text-[10px] font-bold uppercase text-slate-500">BOOKLET SERIES</div>
              <div className="text-lg font-extrabold text-slate-900">A</div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleStartMockTest}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800 transition-colors font-bengali shadow-xs"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>
                {loading
                  ? isBn
                    ? 'গেম প্রস্তুত হচ্ছে...'
                    : 'Preparing Game...'
                  : isGameMode
                    ? isBn
                      ? `এখনই ${customCount} নম্বরের ক্লার্কশিপ গেম শুরু করো (Start Game)`
                      : `Start ${customCount}-Mark Exam Game Now`
                    : isBn
                      ? `এখনই ${customCount} নম্বরের মক টেস্ট শুরু করো`
                      : `Start ${customCount}-Mark Mock Test Now`}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Game Mode vs Strict Exam Hall Selector */}
        <div
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
          data-testid="exam-experience-mode-selector"
        >
          <button
            type="button"
            onClick={() => setIsGameMode(true)}
            className={`rounded-xl border p-4 text-left transition-all flex items-start gap-3.5 ${
              isGameMode
                ? 'border-sky-700 bg-sky-50/80 ring-1 ring-sky-700'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isGameMode ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'WBPSC ক্লার্কশিপ গেম মোড (Interactive Quiz Game Arena — Recommended)'
                  : 'WBPSC Clerkship Game Arena Mode (Interactive Quiz Game — Recommended)'}
              </div>
              <p className="mt-1 text-xs text-slate-600 font-bengali leading-relaxed">
                {isBn
                  ? 'আসল ১০০ নম্বরের পরীক্ষাকে খেলার মতো উপভোগ করো! প্রতিটি সঠিক উত্তরে +100 XP, কম্বো স্ট্রিক (🔥 Streak), ৩টি গেম লাইফলাইন (50:50 এলিমিনেটর, AI টিচার হিন্ট, নেগেটিভ শিল্ড) এবং সাথে সাথে AI ভয়েস ব্যাখ্যা।'
                  : 'Play the authentic 100-mark WBPSC exam like a game! Earn +100 XP, build Combo Streaks, use 3 Lifelines (50:50, AI Hint, Negative Shield), and unlock instant AI Teacher explanations.'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsGameMode(false)}
            className={`rounded-xl border p-4 text-left transition-all flex items-start gap-3.5 ${
              !isGameMode
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                !isGameMode ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`text-sm font-bold font-bengali ${
                  !isGameMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {isBn
                  ? 'আসল পরীক্ষার হল মোড (Strict OMR Hall Simulation)'
                  : 'Strict OMR Examination Hall Mode'}
              </div>
              <p
                className={`mt-1 text-xs font-bengali leading-relaxed ${
                  !isGameMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {isBn
                  ? 'কোনো লাইফলাইন বা হিন্ট ছাড়া একদম আসল পরীক্ষার হলের মতো নীরব OMR পরীক্ষা। চূড়ান্ত জমা দেওয়ার পর সব উত্তর ও ব্যাখ্যা একসাথে দেখা যাবে।'
                  : 'Silent official OMR simulation without lifelines or instant answer checks. All answers and explanations unlock after final submission.'}
              </p>
            </div>
          </button>
        </div>

        {/* Official Time & Marks Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 border-b border-slate-200 text-xs sm:text-sm font-bengali">
          <div>
            <span className="text-slate-500">বিজ্ঞপ্তি নং (Advt. No.): </span>
            <strong className="font-mono-tabular text-slate-900">13/2023</strong>
          </div>
          <div>
            <span className="text-slate-500">পূর্ণমান (Full Marks): </span>
            <strong className="font-mono-tabular text-slate-900">100 (100 MCQs)</strong>
          </div>
          <div>
            <span className="text-slate-500">নির্ধারিত সময় (Time Allowed): </span>
            <strong className="font-mono-tabular text-slate-900">90 Minutes (1 Hr 30 Mins)</strong>
          </div>
          <div>
            <span className="text-slate-500">নেগেটিভ মার্কিং: </span>
            <strong className="font-mono-tabular text-rose-700">-0.25 (প্রতি ভুল উত্তরে ১/৪ কাটা)</strong>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Official WBPSC Clerkship Part-I 3-Section Structure Table & Candidate Instructions */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Official WBPSC Instructions to Candidates (পরীক্ষার্থীদের প্রতি নির্দেশাবলী) */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-bengali">
              {isBn
                ? 'পরীক্ষার্থীদের প্রতি সরকারি নিয়ম ও নির্দেশাবলী (Official WBPSC Clerkship Instructions):'
                : 'Official WBPSC Clerkship Examination Rules & Candidate Instructions:'}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-bengali leading-relaxed list-disc pl-5">
              <li>
                {isBn
                  ? 'আসল WBPSC Clerkship Part-I পরীক্ষার মতোই এই প্রশ্নপত্রে মোট ১০০টি বহুবিকল্পভিত্তিক (MCQ) প্রশ্ন থাকে এবং পূর্ণমান ১০০, সময় ১ ঘণ্টা ৩০ মিনিট (৯০ মিনিট)।'
                  : 'Just like the official WBPSC Clerkship Part-I paper, the full test consists of 100 MCQs carrying 100 marks with a strict 90-minute timer.'}
              </li>
              <li>
                {isBn
                  ? 'প্রশ্নপত্রটি তিনটি বিভাগে বিভক্ত: Part A: English (প্রশ্ন ১–৩০, ৩০ নম্বর), Part B: General Studies (প্রশ্ন ৩১–৭০, ৪০ নম্বর), এবং Part C: Arithmetic (প্রশ্ন ৭১–১০০, ৩০ নম্বর)।'
                  : 'The paper is divided into three sections: Part A: English (Q1–30, 30 Marks), Part B: General Studies (Q31–70, 40 Marks), and Part C: Arithmetic (Q71–100, 30 Marks).'}
              </li>
              <li>
                {isBn
                  ? 'প্রতিটি সঠিক উত্তরের জন্য +১ নম্বর পাওয়া যাবে এবং প্রতিটি ভুল উত্তরের জন্য -০.২৫ নম্বর (১/৪ অংশ) কাটা যাবে। কোনো প্রশ্নের উত্তর না দিলে নম্বর কাটা যাবে না।'
                  : 'Every correct answer awards +1.00 mark, and every wrong answer deducts -0.25 mark. Unanswered questions have zero penalty.'}
              </li>
              <li>
                {isBn
                  ? 'আসল পরীক্ষার প্রশ্নপত্রের মতোই English বিভাগের প্রশ্ন কেবল ইংরেজিতে এবং General Studies ও Arithmetic বিভাগের প্রশ্ন ইংরেজি ও বাংলা উভয় ভাষাতেই থাকবে। পরীক্ষা জমা দেওয়ার পর প্রতিটি প্রশ্নের সহজ বাংলা ব্যাখ্যা দেখা যাবে।'
                  : 'Following the authentic WBPSC question booklet format, English questions appear in English while General Studies and Arithmetic questions appear bilingually in English and Bengali.'}
              </li>
            </ul>
          </div>

          {/* Right 5 Cols: Official Section & Marks Distribution Table */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold text-slate-900 font-bengali mb-2.5">
              {isBn
                ? 'প্রশ্নপত্রের বিভাগ ও নম্বর বিভাজন (WBPSC Part-I Scheme):'
                : 'Official Section & Marks Distribution:'}
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1.5 font-semibold">{isBn ? 'বিভাগ (Subject)' : 'Section'}</th>
                  <th className="py-1.5 font-semibold">{isBn ? 'প্রশ্ন ক্রমিক' : 'Q. Range'}</th>
                  <th className="py-1.5 font-semibold text-right">{isBn ? 'নম্বর' : 'Marks'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 font-mono-tabular">
                <tr>
                  <td className="py-2 font-semibold text-slate-900">Part A: English</td>
                  <td className="py-2 text-slate-600">Q. 1 – Q. 30</td>
                  <td className="py-2 text-right font-bold text-slate-900">30</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-900">Part B: General Studies</td>
                  <td className="py-2 text-slate-600">Q. 31 – Q. 70</td>
                  <td className="py-2 text-right font-bold text-slate-900">40</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-900">Part C: Arithmetic</td>
                  <td className="py-2 text-slate-600">Q. 71 – Q. 100</td>
                  <td className="py-2 text-right font-bold text-slate-900">30</td>
                </tr>
                <tr className="bg-slate-200/50 font-bold text-slate-900">
                  <td className="py-2 pl-1">Total (মোট)</td>
                  <td className="py-2">100 MCQs</td>
                  <td className="py-2 text-right pr-1">100 Marks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 2: Select Uniqueness Mode & Question Count (Default: 100 MCQs Full WBPSC Exam) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 font-bengali mb-2">
              {isBn
                ? 'মক টেস্টের প্রশ্নপত্রের দৈর্ঘ্য (ডিফল্ট: আসল ১০০ নম্বরের পূর্ণাঙ্গ পরীক্ষা)'
                : 'Select Mock Paper Length (Default: Full 100-Mark Official WBPSC Format)'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  count: 100,
                  labelBn: '১০০টি প্রশ্ন · ৯০ মিনিট (আসল WBPSC পূর্ণাঙ্গ পরীক্ষা)',
                  labelEn: '100 Qs · 90 Mins (Full WBPSC Exam)',
                },
                {
                  count: 30,
                  labelBn: '৩০টি প্রশ্ন · ২৭ মিনিট (অর্ধ-পূর্ণ অনুশীলন)',
                  labelEn: '30 Qs · 27 Mins (Sectional Set)',
                },
                {
                  count: 15,
                  labelBn: '১৫টি প্রশ্ন · ১৫ মিনিট (দ্রুত মিনি মক)',
                  labelEn: '15 Qs · 15 Mins (Mini Mock)',
                },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setCustomCount(opt.count)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    customCount === opt.count
                      ? 'border-sky-700 bg-sky-50 text-sky-950 font-semibold ring-1 ring-sky-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-mono-tabular text-sm font-bold">{opt.count} MCQs</div>
                  <div className="text-[11px] text-slate-600 font-bengali mt-0.5">
                    {isBn ? opt.labelBn : opt.labelEn}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 font-bengali mb-2">
              {isBn
                ? 'প্রশ্ন চয়নের নিয়ম (Non-Repetition & Uniqueness Mode)'
                : 'Question Uniqueness & Non-Repetition Mode'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  {
                    id: 'FRESH_MOCK',
                    titleBn: 'নতুন মক টেস্ট',
                    titleEn: 'Fresh Mock Test',
                    descBn: 'আগে দেখা প্রশ্ন বাদ',
                  },
                  {
                    id: 'TOPIC_PRACTICE',
                    titleBn: 'অধ্যায়ভিত্তিক',
                    titleEn: 'Topic Focused',
                    descBn: 'নির্বাচিত অধ্যায়',
                  },
                  {
                    id: 'MISTAKE_REVISION',
                    titleBn: 'ভুল সংশোধন',
                    titleEn: 'Mistake Revision',
                    descBn: 'ভুল খাতার প্রশ্ন',
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setUniquenessMode(m.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    uniquenessMode === m.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold font-bengali">
                    {isBn ? m.titleBn : m.titleEn}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 font-bengali ${
                      uniquenessMode === m.id ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {m.descBn}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Start Exam Action Bar */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1 font-bengali">
              <div className="font-semibold text-slate-900">
                {isBn
                  ? `হুবহু WBPSC ক্লার্কশিপ পরীক্ষার নিয়মাবলী (${selectedConfig.examinationName} — Advt. ${selectedConfig.advertisementNumber}):`
                  : `Verified Official WBPSC Rules (${selectedConfig.examinationName}):`}
              </div>
              <div>
                English: 30 Marks (Q1–Q30) · General Studies: 40 Marks (Q31–Q70) · Arithmetic: 30 Marks (Q71–Q100) · সঠিক উত্তরে +1 · ভুল উত্তরে -0.25 নেগেটিভ মার্কিং।
              </div>
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer text-sky-900 font-semibold">
                <input
                  type="checkbox"
                  checked={useAiFreshGeneration}
                  onChange={(e) => setUseAiFreshGeneration(e.target.checked)}
                  className="rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                />
                <Sparkles className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>
                  {isBn
                    ? 'AI দ্বারা তাৎক্ষণিক নতুন প্রশ্ন তৈরি করে প্রশ্নপত্রে যুক্ত করো (Live Gemini AI Question Generator)'
                    : 'Generate fresh AI questions dynamically for this mock test (Live Gemini AI)'}
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleStartMockTest}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-3.5 text-sm font-bold text-white hover:bg-sky-800 transition-colors font-bengali shadow-xs"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>
              {loading
                ? isBn
                  ? 'নতুন প্রশ্নপত্র তৈরি হচ্ছে...'
                  : 'Preparing Fresh Paper...'
                : isBn
                  ? `এখনই নতুন মক টেস্ট শুরু করো (Start ${customCount}-Q Mock Test)`
                  : `Start Fresh ${customCount}-Q Mock Examination`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
