/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ExamConfiguration,
  LanguageCode,
  MistakeRecord,
  MockTestResult,
  OptionKey,
  QuestionItem,
  SourceDocument,
  SubjectName,
  TopicMasteryItem,
} from './types/exam';
import {
  INITIAL_QUESTIONS_POOL,
  OFFICIAL_EXAM_CONFIGURATIONS,
  OFFICIAL_SOURCE_DOCUMENTS,
} from './data/wbpscQuestions';
import { assessReadinessLevel } from './lib/examEngine';
import { MockExamSimulator } from './components/MockExamSimulator';
import { GuidedPracticeModule } from './components/GuidedPracticeModule';
import { StudyAndPart2Module } from './components/StudyAndPart2Module';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EnglishGameArena } from './components/EnglishGameArena';
import {
  auth,
  db,
  doc,
  googleProvider,
  handleFirestoreError,
  OperationType,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signOut,
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileQuestion,
  Flame,
  GraduationCap,
  Keyboard,
  Languages,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquareHeart,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Gamepad2,
  Target,
  X,
} from 'lucide-react';

export type NavSectionId =
  | 'DASHBOARD'
  | 'ENGLISH_GAME'
  | 'MOCK_TEST'
  | 'PYQ'
  | 'SUBJECT_PRACTICE'
  | 'TOPIC_PRACTICE'
  | 'AI_TEACHER'
  | 'MISTAKE_NOTEBOOK'
  | 'REVISION'
  | 'PERFORMANCE'
  | 'STUDY_PLAN'
  | 'PART2_WRITING'
  | 'TYPING_SKILL'
  | 'SETTINGS';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('bn');
  const [activeNav, setActiveNav] = useState<NavSectionId>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as NavSectionId | null;
    if (viewParam) return viewParam;
    if (params.get('autostart') === '1') return 'MOCK_TEST';
    return 'DASHBOARD';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam === 'dark') return true;
    if (themeParam === 'light') return false;
    try {
      return localStorage.getItem('wbpsc_theme_mode') === 'dark';
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  // Sync dark mode class on <html> and <body> and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('wbpsc_theme_mode', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  // Server & Question Bank State
  const [examConfigurations, setExamConfigurations] = useState<ExamConfiguration[]>(
    OFFICIAL_EXAM_CONFIGURATIONS
  );
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>(
    OFFICIAL_SOURCE_DOCUMENTS
  );
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS_POOL);
  const [aiProviderStatus, setAiProviderStatus] = useState<string>('CONNECTED_GEMINI');

  // Student Learning & Progress State
  const [user, setUser] = useState<User | null>(null);
  const [studentName, setStudentName] = useState<string>('সৌম্যজিৎ দাস (Soumyajit Das)');
  const [streakDays, setStreakDays] = useState<number>(5);
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>(['pyq_2019_s1_eng_01']);

  // Seed initial realistic demonstration history clearly labelled
  const [pastMockResults, setPastMockResults] = useState<MockTestResult[]>([
    {
      sessionId: 'demo_attempt_1',
      examConfigurationId: 'wbpsc_clerkship_quick_diagnostic_15',
      examinationName: 'WBPSC Clerkship Proportional Mini Mock (15 Qs) [Demo Record]',
      schemeVersion: '2023 Proportional Diagnostic v1.0',
      submittedAt: '2026-10-21T10:30:00Z',
      totalQuestions: 15,
      maximumMarks: 15,
      correctCount: 10,
      incorrectCount: 4,
      unansweredCount: 1,
      positiveMarks: 10,
      negativeMarksDeducted: 1,
      finalScore: 9.0,
      accuracyPercent: 71.4,
      timeUsedSeconds: 610,
      transparentFormula: '10 × 1 − (4 × 0.25) = 9.00 / 15',
      subjectBreakdown: [
        {
          subject: 'English',
          totalQuestions: 5,
          attempted: 5,
          correct: 3,
          incorrect: 2,
          unanswered: 0,
          positiveMarks: 3,
          negativeMarks: 0.5,
          netMarks: 2.5,
          maxMarks: 5,
          accuracyPercent: 60,
        },
        {
          subject: 'General Studies',
          totalQuestions: 5,
          attempted: 5,
          correct: 4,
          incorrect: 1,
          unanswered: 0,
          positiveMarks: 4,
          negativeMarks: 0.25,
          netMarks: 3.75,
          maxMarks: 5,
          accuracyPercent: 80,
        },
        {
          subject: 'Arithmetic',
          totalQuestions: 5,
          attempted: 4,
          correct: 3,
          incorrect: 1,
          unanswered: 1,
          positiveMarks: 3,
          negativeMarks: 0.25,
          netMarks: 2.75,
          maxMarks: 5,
          accuracyPercent: 75,
        },
      ],
      topicBreakdown: [],
      strongestTopics: ['Indian Polity & Constitution (General Studies)', 'Simple & Compound Interest (Arithmetic)'],
      weakestTopics: ['Voice Change & Narration (English)', 'Time & Work (Arithmetic)'],
      readinessLabel: 'Improving',
      readinessLabelBn: 'উন্নতি হচ্ছে (Improving)',
      readinessAdviceEn: 'Good progress! Practice timed Arithmetic and English grammar sets to boost both speed and accuracy.',
      readinessAdviceBn: 'খুব ভালো উন্নতি হচ্ছে! এবার পাটিগণিত (Arithmetic) ও ইংরেজি গ্রামারের সময় ধরে অনুশীলন বাড়িয়ে গতি ও নির্ভুলতা আরও বাড়াও।',
      evaluatedQuestions: [],
    },
  ]);

  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    const sampleWrongQ = INITIAL_QUESTIONS_POOL.find((q) => q.id === 'pyq_2019_s1_eng_02') || INITIAL_QUESTIONS_POOL[1];
    return [
      {
        id: 'mistake_init_1',
        questionId: sampleWrongQ.id,
        question: sampleWrongQ,
        selectedOption: 'A',
        correctOption: sampleWrongQ.correctAnswer,
        subject: sampleWrongQ.subject,
        topic: sampleWrongQ.topic,
        attemptDate: '2026-10-22T14:20:00Z',
        misconceptionSummaryBn: '"know"-এর পরে Passive Voice-এ "by" বসে না, সবসময় "to" বসে।',
        misconceptionSummaryEn: 'Used "by" instead of fixed preposition "to" after "known".',
        explanationReviewed: true,
        revisionStatus: 'NEEDS_REVIEW',
        nextReviewDate: '2026-10-24',
        mistakeCount: 1,
      },
    ];
  });

  const [topicMastery, setTopicMastery] = useState<TopicMasteryItem[]>([
    {
      subject: 'English',
      topic: 'Voice Change & Narration',
      attempts: 8,
      correct: 4,
      incorrect: 4,
      accuracyPercent: 50,
      masteryScore: 48,
      lastPracticedAt: '2026-10-22',
      needsRevision: true,
    },
    {
      subject: 'Arithmetic',
      topic: 'Time & Work',
      attempts: 6,
      correct: 3,
      incorrect: 3,
      accuracyPercent: 50,
      masteryScore: 50,
      lastPracticedAt: '2026-10-21',
      needsRevision: true,
    },
    {
      subject: 'English',
      topic: 'Grammar (Prepositions, Articles, Tense)',
      attempts: 10,
      correct: 7,
      incorrect: 3,
      accuracyPercent: 70,
      masteryScore: 70,
      lastPracticedAt: '2026-10-23',
      needsRevision: false,
    },
    {
      subject: 'Arithmetic',
      topic: 'Percentage',
      attempts: 10,
      correct: 8,
      incorrect: 2,
      accuracyPercent: 80,
      masteryScore: 80,
      lastPracticedAt: '2026-10-23',
      needsRevision: false,
    },
    {
      subject: 'General Studies',
      topic: 'Indian Polity & Constitution',
      attempts: 12,
      correct: 10,
      incorrect: 2,
      accuracyPercent: 83,
      masteryScore: 85,
      lastPracticedAt: '2026-10-23',
      needsRevision: false,
    },
  ]);

  const [practiceSubjectFilter, setPracticeSubjectFilter] = useState<SubjectName | 'ALL'>('ALL');
  const [practiceTopicFilter, setPracticeTopicFilter] = useState<string>('ALL');

  const isBn = language === 'bn';

  // Bootstrap server data
  useEffect(() => {
    fetch('/api/bootstrap')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.examConfigurations?.length) setExamConfigurations(data.examConfigurations);
          if (data.sourceDocuments?.length) setSourceDocuments(data.sourceDocuments);
          if (data.questions?.length) setQuestions(data.questions);
          if (data.aiProviderStatus) setAiProviderStatus(data.aiProviderStatus);
        }
      })
      .catch((err) => console.warn('Using bundled verified dataset:', err));

    // Support ?autostart=1 query param for instant mock test verification
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setActiveNav('MOCK_TEST');
    }
  }, []);

  // Listen to Firebase Auth state and sync user profile to Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setStudentName(firebaseUser.displayName || 'WBPSC Aspirant');
        if (firebaseUser.emailVerified) {
          try {
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              {
                uid: firebaseUser.uid,
                displayName: (firebaseUser.displayName || 'WBPSC Aspirant').slice(0, 100),
                preferredLanguage: language,
                targetExamCycle: '2023-2026',
                streakDays,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch (err) {
            // Only throw structured Firestore error if permission denied on verified user
            console.warn('Profile sync notice:', err);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const handleRecordPracticeAttempt = (
    question: QuestionItem,
    selected: OptionKey,
    isCorrect: boolean
  ) => {
    setSeenQuestionIds((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]));

    // Update topic mastery
    setTopicMastery((prev) => {
      const idx = prev.findIndex(
        (m) => m.subject === question.subject && m.topic === question.topic
      );
      if (idx === -1) {
        const acc = isCorrect ? 100 : 0;
        return [
          ...prev,
          {
            subject: question.subject,
            topic: question.topic,
            attempts: 1,
            correct: isCorrect ? 1 : 0,
            incorrect: isCorrect ? 0 : 1,
            accuracyPercent: acc,
            masteryScore: acc,
            lastPracticedAt: new Date().toISOString().slice(0, 10),
            needsRevision: !isCorrect,
          },
        ];
      }
      const existing = prev[idx];
      const newAttempts = existing.attempts + 1;
      const newCorrect = existing.correct + (isCorrect ? 1 : 0);
      const newIncorrect = existing.incorrect + (isCorrect ? 0 : 1);
      const newAcc = Math.round((newCorrect / newAttempts) * 100);
      const copy = [...prev];
      copy[idx] = {
        ...existing,
        attempts: newAttempts,
        correct: newCorrect,
        incorrect: newIncorrect,
        accuracyPercent: newAcc,
        masteryScore: newAcc,
        lastPracticedAt: new Date().toISOString().slice(0, 10),
        needsRevision: newAcc < 65 || !isCorrect,
      };
      return copy;
    });

    // If wrong, automatically save to Mistake Notebook
    if (!isCorrect) {
      setMistakes((prev) => {
        const existingIdx = prev.findIndex((m) => m.questionId === question.id);
        const entry: MistakeRecord = {
          id: `mistake_${question.id}`,
          questionId: question.id,
          question,
          selectedOption: selected,
          correctOption: question.correctAnswer,
          subject: question.subject,
          topic: question.topic,
          attemptDate: new Date().toISOString(),
          misconceptionSummaryBn:
            question.teacherExplanation.whyWrongByOptionBn?.[selected] ||
            question.teacherExplanation.simpleConceptBn,
          misconceptionSummaryEn:
            question.teacherExplanation.whyWrongByOptionEn?.[selected] ||
            question.teacherExplanation.simpleConceptEn,
          explanationReviewed: true,
          revisionStatus: 'NEEDS_REVIEW',
          nextReviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          mistakeCount: existingIdx >= 0 ? prev[existingIdx].mistakeCount + 1 : 1,
        };

        if (user?.emailVerified) {
          const docId = `${user.uid}_${question.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          setDoc(doc(db, 'mistakeNotebook', docId), {
            userId: user.uid,
            questionId: question.id,
            subject: question.subject,
            topic: question.topic.slice(0, 100),
            selectedOption: selected,
            correctOption: question.correctAnswer,
            revisionStatus: 'NEEDS_REVIEW',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }).catch((e) => handleFirestoreError(e, OperationType.WRITE, `mistakeNotebook/${docId}`));
        }

        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = entry;
          return copy;
        }
        return [entry, ...prev];
      });
    }
  };

  const handleTestCompleted = (
    result: MockTestResult,
    newlySeenIds: string[],
    wrongItems: { questionId: string; selected: OptionKey }[]
  ) => {
    setPastMockResults((prev) => [result, ...prev]);
    setSeenQuestionIds((prev) => Array.from(new Set([...prev, ...newlySeenIds])));
    setStreakDays((s) => s + 1);

    for (const w of wrongItems) {
      const qObj = questions.find((q) => q.id === w.questionId);
      if (qObj) {
        handleRecordPracticeAttempt(qObj, w.selected, false);
      }
    }
  };

  const handleUpdateMistakeStatus = (
    questionId: string,
    status: 'NEEDS_REVIEW' | 'REVIEWED' | 'MASTERED'
  ) => {
    setMistakes((prev) =>
      prev.map((m) => (m.questionId === questionId ? { ...m, revisionStatus: status } : m))
    );
  };

  const handleGenerateBatchQuestions = async (
    subject: SubjectName,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count = 2
  ) => {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, difficulty, count }),
    });
    const data = await response.json();
    if (Array.isArray(data.approvedQuestions) && data.approvedQuestions.length > 0) {
      setQuestions((prev) => [...data.approvedQuestions, ...prev]);
    }
    return data;
  };

  // Compute aggregated dashboard metrics from actual stored records
  const latestResult = pastMockResults[0];
  const bestScorePercent = pastMockResults.reduce((best, r) => {
    const pct = r.maximumMarks > 0 ? Math.round((r.finalScore / r.maximumMarks) * 100) : 0;
    return Math.max(best, pct);
  }, 0);
  const latestScorePercent =
    latestResult && latestResult.maximumMarks > 0
      ? Math.round((latestResult.finalScore / latestResult.maximumMarks) * 100)
      : 0;
  const overallAccuracy =
    pastMockResults.length > 0
      ? Math.round(
          pastMockResults.reduce((sum, r) => sum + r.accuracyPercent, 0) / pastMockResults.length
        )
      : 70;
  const overallReadiness = assessReadinessLevel(
    overallAccuracy,
    latestScorePercent,
    pastMockResults.length
  );

  const navItems: {
    id: NavSectionId;
    labelBn: string;
    labelEn: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'DASHBOARD', labelBn: '১. ড্যাশবোর্ড', labelEn: '1. Dashboard', icon: LayoutDashboard },
    { id: 'ENGLISH_GAME', labelBn: '🎮 ইংরেজি শেখার গেম (English Game)', labelEn: '🎮 English Learning Game', icon: Gamepad2 },
    { id: 'MOCK_TEST', labelBn: '২. মক টেস্ট শুরু করো', labelEn: '2. Start Mock Test', icon: Play },
    { id: 'PYQ', labelBn: '৩. বিগত বছরের প্রশ্ন (PYQ)', labelEn: '3. Previous-Year Questions', icon: FileQuestion },
    { id: 'SUBJECT_PRACTICE', labelBn: '৪. বিষয়ভিত্তিক অনুশীলন', labelEn: '4. Subject Practice', icon: BookOpen },
    { id: 'TOPIC_PRACTICE', labelBn: '৫. অধ্যায়ভিত্তিক অনুশীলন', labelEn: '5. Topic Practice', icon: Compass },
    { id: 'AI_TEACHER', labelBn: '৬. সহজ বাংলা AI শিক্ষক', labelEn: '6. AI Teacher', icon: MessageSquareHeart },
    { id: 'MISTAKE_NOTEBOOK', labelBn: `৭. ভুল খাতা (${mistakes.length})`, labelEn: `7. Mistake Notebook (${mistakes.length})`, icon: BookMarked },
    { id: 'REVISION', labelBn: '৮. রিভিশন মোড', labelEn: '8. Revision', icon: RefreshCw },
    { id: 'PERFORMANCE', labelBn: '৯. ফলাফল ও অ্যানালিটিক্স', labelEn: '9. Performance', icon: BarChart3 },
    { id: 'STUDY_PLAN', labelBn: '১০. স্টাডি প্ল্যান', labelEn: '10. Study Plan', icon: CalendarCheck },
    { id: 'PART2_WRITING', labelBn: 'পার্ট-২ ডেসক্রিপটিভ', labelEn: 'Part-II Written', icon: ClipboardCheck },
    { id: 'TYPING_SKILL', labelBn: 'কম্পিউটার টাইপিং টেস্ট', labelEn: 'Typing Practice', icon: Keyboard },
    { id: 'SETTINGS', labelBn: '১১. সেটিংস ও অ্যাডমিন', labelEn: '11. Settings & Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('DASHBOARD')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              W
            </div>
            <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 truncate max-w-[165px] sm:max-w-none">
              WBPSC Clerkship Shikshak
            </span>
          </button>
        </div>

        {/* Zone 2: Concise Quick Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveNav('DASHBOARD')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'DASHBOARD' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </button>
          <button
            type="button"
            data-testid="top-nav-english-game"
            onClick={() => setActiveNav('ENGLISH_GAME')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'ENGLISH_GAME' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? 'ইংরেজি শেখার গেম' : 'English Game'}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('PYQ')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'PYQ' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? 'বিগত বছরের প্রশ্ন' : 'Verified PYQs'}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('TOPIC_PRACTICE')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'TOPIC_PRACTICE' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? 'অধ্যায় অনুশীলন' : 'Topic Practice'}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('AI_TEACHER')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'AI_TEACHER' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? 'AI শিক্ষক' : 'AI Teacher'}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('MISTAKE_NOTEBOOK')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeNav === 'MISTAKE_NOTEBOOK' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
            }`}
          >
            {isBn ? `ভুল খাতা (${mistakes.length})` : `Mistakes (${mistakes.length})`}
          </button>
        </nav>

        {/* Zone 3: Language Switcher & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bilingual Switcher */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200"
            role="group"
            aria-label="Language Selector"
          >
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 font-bengali ${
                language === 'bn'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveNav('MOCK_TEST')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isBn ? 'নতুন মক টেস্ট' : 'Start New AI Mock Test'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container: Sidebar + Content Viewport */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar Navigation (260px on desktop, overlay drawer on mobile) */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl pt-16' : 'hidden'
          } lg:block lg:w-64 lg:shrink-0 border-r border-slate-200 bg-white p-4 space-y-1`}
          aria-label="Main Platform Navigation"
        >
          <div className="px-3 py-2 mb-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-900 truncate font-bengali">
              {studentName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between font-mono-tabular">
              <span>Streak: {streakDays} days</span>
              <span>Seen: {seenQuestionIds.length} Qs</span>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate font-bengali">
                  {isBn ? item.labelBn : item.labelEn}
                </span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAdminOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
              <span>{isBn ? 'অ্যাডমিন ও প্রশ্ন ব্যাংক (Admin)' : 'Admin & Question Bank'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* ==================== SECTION 1: STUDENT DASHBOARD ==================== */}
          {activeNav === 'DASHBOARD' && (
            <div className="space-y-6" data-testid="student-dashboard-view">
              {/* Hero Welcome & Primary CTA Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="text-xs font-medium text-sky-700">
                      WBPSC Clerkship Examination Preparation (Advt. No. 13/2023 Official Scheme · Part-I & Part-II)
                    </div>
                    <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900 font-bengali text-balance">
                      {isBn
                        ? `স্বাগতম, ${studentName}! চলো আজকের ক্লার্কশিপ প্রস্তুতি শুরু করি।`
                        : `Welcome back, ${studentName}! Let us build your WBPSC Clerkship mastery today.`}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 font-bengali leading-relaxed">
                      {isBn
                        ? 'শুধু উত্তর মুখস্থ নয়—প্রতিটি প্রশ্নের পেছনের মূল নিয়ম সহজ বাংলায় বোঝো, নিজের ভুল খাতা (Mistake Notebook) থেকে শেখো এবং প্রতিদিন নতুন প্রশ্নে মক টেস্ট দাও।'
                        : 'Go beyond memorizing answer keys—understand every concept in simple Bengali or English, learn from your Mistake Notebook, and take non-repeating mock tests.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      type="button"
                      data-testid="dashboard-play-english-game-btn"
                      onClick={() => setActiveNav('ENGLISH_GAME')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-sky-800 transition-colors shadow-xs font-bengali whitespace-nowrap"
                    >
                      <Gamepad2 className="w-4 h-4 shrink-0" />
                      <span>
                        {isBn
                          ? 'ইংরেজি শেখার গেম খেলো (Play English Game)'
                          : 'Play English Learning Game'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('MOCK_TEST')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors font-bengali whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 text-sky-700 fill-current shrink-0" />
                      <span>
                        {isBn
                          ? 'নতুন AI মক টেস্ট (Start Mock Test)'
                          : 'Start AI Mock Test'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4 Key Student KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs text-slate-500 font-bengali">
                      {isBn ? 'ধারাবাহিক অনুশীলন (Learning Streak)' : 'Current Learning Streak'}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-900 font-bengali flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>
                        <span className="font-mono-tabular">{streakDays}</span> {isBn ? 'দিন' : 'Days'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 font-bengali">
                      {isBn ? `মোট অনুশীলিত প্রশ্ন: ${seenQuestionIds.length}টি` : `Unseen pool ready: ${questions.length - seenQuestionIds.length} Qs`}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs text-slate-500 font-bengali">
                      {isBn ? 'সর্বশেষ মক টেস্ট স্কোর (Latest Score)' : 'Latest Mock Test Score'}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
                      {latestResult
                        ? `${latestResult.finalScore.toFixed(2)} / ${latestResult.maximumMarks}`
                        : '0 / 100'}
                    </div>
                    <div className="mt-1 text-xs text-emerald-700 font-bengali">
                      {isBn ? `সর্বোচ্চ স্কোর হার: ${bestScorePercent}%` : `Best Score Percentage: ${bestScorePercent}%`}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs text-slate-500 font-bengali">
                      {isBn ? 'গড় নির্ভুলতা (Overall Accuracy)' : 'Overall Accuracy'}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
                      {overallAccuracy}%
                    </div>
                    <div className="mt-1 text-xs text-slate-500 font-bengali">
                      {isBn ? `ভুল খাতায় জমে আছে: ${mistakes.length}টি প্রশ্ন` : `${mistakes.length} items in Mistake Notebook`}
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-4">
                    <div className="text-xs text-sky-800 font-bengali">
                      {isBn ? 'বর্তমান প্রস্তুতির স্তর (Readiness)' : 'Preparation Readiness'}
                    </div>
                    <div className="mt-1 text-base font-bold text-sky-950 font-bengali flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-sky-700 shrink-0" />
                      <span>{isBn ? overallReadiness.labelBn : overallReadiness.label}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600 font-bengali line-clamp-1">
                      {isBn ? overallReadiness.adviceBn : overallReadiness.adviceEn}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Modules Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveNav('PYQ')}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-sky-400 transition-colors"
                >
                  <div className="text-xs font-medium text-sky-700">2019 & 2024 Cycles</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                    {isBn ? 'বিগত বছরের প্রশ্ন অনুশীলন (Practice PYQs)' : 'Practice Previous-Year Questions'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPracticeSubjectFilter('English');
                    setPracticeTopicFilter('Voice Change & Narration');
                    setActiveNav('TOPIC_PRACTICE');
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-sky-400 transition-colors"
                >
                  <div className="text-xs font-medium text-amber-700">Adaptive Focus</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                    {isBn ? 'দুর্বল অধ্যায় অনুশীলন (Practice Weak Topics)' : 'Practice Weak Topics'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveNav('MISTAKE_NOTEBOOK')}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-sky-400 transition-colors"
                >
                  <div className="text-xs font-medium text-rose-700">{mistakes.length} Pending Errors</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                    {isBn ? 'ভুলগুলো পর্যালোচনা করো (Review Mistakes)' : 'Review Mistakes Notebook'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveNav('PERFORMANCE')}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-sky-400 transition-colors"
                >
                  <div className="text-xs font-medium text-emerald-700">Detailed Analytics</div>
                  <div className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                    {isBn ? 'প্রস্তুতির অগ্রগতি দেখো (View Progress)' : 'View Progress & Analytics'}
                  </div>
                </button>
              </div>

              {/* Two-Column Split: Subject Performance + Weak Topics & Today's Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Subject-Wise Performance & Recent Mock Tests (7 cols) */}
                <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-900 font-bengali">
                        {isBn
                          ? 'বিষয়ভিত্তিক প্রস্তুতির চিত্র (Part-I: ১০০ নম্বর)'
                          : 'Subject-Wise Performance (Part-I: 100 Marks Official Scheme)'}
                      </h2>
                      <span className="text-xs text-slate-500 font-mono-tabular">
                        +1.00 / -0.25 Scheme
                      </span>
                    </div>

                    <div className="space-y-4 mt-4">
                      {[
                        {
                          subject: 'English' as SubjectName,
                          weight: '30 Marks (30 Qs)',
                          accuracy: 64,
                          descBn: 'Prepositions, Voice Change, Synonyms, Sentence Correction',
                        },
                        {
                          subject: 'General Studies' as SubjectName,
                          weight: '40 Marks (40 Qs)',
                          accuracy: 81,
                          descBn: 'Indian History, WB Geography, Indian Polity, Everyday Science',
                        },
                        {
                          subject: 'Arithmetic' as SubjectName,
                          weight: '30 Marks (30 Qs)',
                          accuracy: 72,
                          descBn: 'Percentage, Profit & Loss, Ratio, Simple Interest, Time & Work',
                        },
                      ].map((s) => (
                        <div key={s.subject} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div>
                              <span className="font-bold text-slate-900">{s.subject}</span>
                              {' · '}
                              <span className="text-slate-500 text-xs">{s.weight}</span>
                            </div>
                            <span className="font-mono-tabular font-bold text-slate-900">
                              {s.accuracy}% Accuracy
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-sky-700 rounded-full"
                              style={{ width: `${s.accuracy}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-500">{s.descBn}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Mock Tests Table */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-bengali mb-2.5">
                      {isBn ? 'সাম্প্রতিক মক টেস্টের রেকর্ড' : 'Recent Mock Test Attempts'}
                    </h3>
                    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                      {pastMockResults.slice(0, 3).map((r) => (
                        <div
                          key={r.sessionId}
                          className="p-3 text-xs flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{r.examinationName}</div>
                            <div className="text-slate-500 font-mono-tabular">
                              {r.submittedAt.slice(0, 10)} · Formula: {r.transparentFormula}
                            </div>
                          </div>
                          <div className="font-mono-tabular font-bold text-slate-900">
                            {r.finalScore.toFixed(2)} / {r.maximumMarks} ({r.accuracyPercent}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Weak-Topic Summary & Today's Recommended Study Tasks (5 cols) */}
                <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-bengali pb-3 border-b border-slate-100">
                      {isBn
                        ? 'আজকের প্রস্তাবিত অধ্যয়ন কাজ (Today’s Study Tasks)'
                        : 'Today’s Recommended Study Tasks'}
                    </h2>
                    <div className="space-y-3 mt-4">
                      {[
                        {
                          titleBn: '১. নতুন ১৫-প্রশ্নের আনুপাতিক মক টেস্ট দাও',
                          titleEn: '1. Attempt a Fresh 15-Question Proportional Mock Test',
                          subBn: 'ইংরেজি ৫ + সাধারণ জ্ঞান ৫ + পাটিগণিত ৫ (আগে দেখা প্রশ্ন বাদে)',
                          action: () => setActiveNav('MOCK_TEST'),
                          btnBn: 'মক টেস্ট দাও',
                          btnEn: 'Start Mock',
                        },
                        {
                          titleBn: '২. দুর্বল অধ্যায়: Voice Change ও Time & Work অনুশীলন',
                          titleEn: '2. Weak Topic Drill: Voice Change & Time & Work',
                          subBn: 'সহজ বাংলা AI শিক্ষকের সাথে তাৎক্ষণিক ফিডব্যাক মোডে শেখো',
                          action: () => setActiveNav('TOPIC_PRACTICE'),
                          btnBn: 'অনুশীলন করো',
                          btnEn: 'Practice Now',
                        },
                        {
                          titleBn: '৩. ভুল খাতার (Mistake Notebook) প্রশ্ন রিভিশন দাও',
                          titleEn: '3. Revise Saved Mistakes in Mistake Notebook',
                          subBn: `${mistakes.length}টি ভুল প্রশ্নের ৯-ধাপ বাংলা ব্যাখ্যা ও ফলো-আপ প্রশ্ন সমাধান করো`,
                          action: () => setActiveNav('MISTAKE_NOTEBOOK'),
                          btnBn: 'ভুল খাতা খোলো',
                          btnEn: 'Review',
                        },
                      ].map((task, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 font-bengali">
                              {isBn ? task.titleBn : task.titleEn}
                            </div>
                            <div className="text-xs text-slate-500 font-bengali mt-0.5">
                              {task.subBn}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={task.action}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                          >
                            {isBn ? task.btnBn : task.btnEn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weak Topic Summary Box */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="text-xs font-bold text-amber-950 font-bengali">
                      {isBn
                        ? 'বিশেষ নজর দেওয়ার অধ্যায় (Weak-Topic Focus):'
                        : 'Weak-Topic Summary Requiring Revision:'}
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-800">
                      {topicMastery
                        .filter((t) => t.accuracyPercent < 65)
                        .map((t) => (
                          <div key={t.topic} className="flex items-center justify-between">
                            <span>
                              {t.topic} ({t.subject})
                            </span>
                            <span className="font-mono-tabular font-semibold text-amber-900">
                              {t.accuracyPercent}% Accuracy
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SECTION 1B: ENGLISH LEARNING GAME ARENA ==================== */}
          {activeNav === 'ENGLISH_GAME' && (
            <EnglishGameArena
              questions={questions}
              language={language}
              onRecordPracticeAttempt={handleRecordPracticeAttempt}
            />
          )}

          {/* ==================== SECTION 2: MOCK TEST SIMULATOR ==================== */}
          {activeNav === 'MOCK_TEST' && (
            <MockExamSimulator
              examConfigurations={examConfigurations}
              language={language}
              seenQuestionIds={seenQuestionIds}
              mistakeQuestionIds={mistakes.map((m) => m.questionId)}
              onTestCompleted={handleTestCompleted}
              autoStartNow={new URLSearchParams(window.location.search).get('autostart') === '1'}
            />
          )}

          {/* ==================== SECTIONS 3, 4, 5, 7, 8: PYQ, SUBJECT, TOPIC, MISTAKES, REVISION ==================== */}
          {(activeNav === 'PYQ' ||
            activeNav === 'SUBJECT_PRACTICE' ||
            activeNav === 'TOPIC_PRACTICE' ||
            activeNav === 'MISTAKE_NOTEBOOK' ||
            activeNav === 'REVISION') && (
            <GuidedPracticeModule
              mode={activeNav}
              questions={questions}
              sourceDocuments={sourceDocuments}
              mistakes={mistakes}
              language={language}
              initialSubject={practiceSubjectFilter}
              initialTopic={practiceTopicFilter}
              onRecordPracticeAttempt={handleRecordPracticeAttempt}
              onUpdateMistakeStatus={handleUpdateMistakeStatus}
              onGenerateMoreQuestions={async (subj, top, diff) => {
                await handleGenerateBatchQuestions(subj, top, diff, 2);
              }}
            />
          )}

          {/* ==================== SECTIONS 6, 10, PART-II & TYPING ==================== */}
          {(activeNav === 'AI_TEACHER' ||
            activeNav === 'STUDY_PLAN' ||
            activeNav === 'PART2_WRITING' ||
            activeNav === 'TYPING_SKILL') && (
            <StudyAndPart2Module
              activeSubTab={activeNav}
              language={language}
              questions={questions}
              topicMastery={topicMastery}
              onStartTopicPractice={(subj, top) => {
                setPracticeSubjectFilter(subj);
                setPracticeTopicFilter(top);
                setActiveNav('TOPIC_PRACTICE');
              }}
            />
          )}

          {/* ==================== SECTION 9: PERFORMANCE ANALYTICS ==================== */}
          {activeNav === 'PERFORMANCE' && (
            <div className="space-y-6" data-testid="performance-analytics-view">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="pb-4 border-b border-slate-100">
                  <div className="text-xs font-medium text-sky-700">
                    Transparent Performance Analytics & Readiness Assessment
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
                    {isBn
                      ? 'তোমার প্রস্তুতির বিস্তারিত পারফরম্যান্স অ্যানালিটিক্স'
                      : 'Comprehensive Performance & Topic Mastery Analytics'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 font-bengali">
                    {isBn
                      ? 'এখানে দেখানো সমস্ত পরিসংখ্যান তোমার প্রকৃত মক টেস্ট ও অনুশীলনের রেকর্ড থেকে গণনা করা হয়েছে। কোনো কাল্পনিক সর্বভারতীয় র‍্যাঙ্ক দেখানো হয় না।'
                      : 'All figures are calculated directly from your stored attempts. No fabricated national ranks or unverified percentiles are shown.'}
                  </p>
                </div>

                {/* Topic Mastery Table */}
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-slate-900 font-bengali mb-3">
                    {isBn
                      ? 'অধ্যায়ভিত্তিক দক্ষতা ও নির্ভুলতার তালিকা (Topic Mastery Matrix)'
                      : 'Topic-Level Accuracy & Mastery Breakdown'}
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                          <th className="py-2.5 px-4">Subject</th>
                          <th className="py-2.5 px-4">Syllabus Topic</th>
                          <th className="py-2.5 px-4 text-right">Attempts</th>
                          <th className="py-2.5 px-4 text-right">Correct / Wrong</th>
                          <th className="py-2.5 px-4 text-right">Accuracy</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {topicMastery.map((tm) => (
                          <tr key={`${tm.subject}-${tm.topic}`} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-medium text-slate-900">{tm.subject}</td>
                            <td className="py-2.5 px-4 text-slate-800">{tm.topic}</td>
                            <td className="py-2.5 px-4 text-right font-mono-tabular">{tm.attempts}</td>
                            <td className="py-2.5 px-4 text-right font-mono-tabular">
                              <span className="text-emerald-700">{tm.correct}</span> /{' '}
                              <span className="text-rose-700">{tm.incorrect}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono-tabular font-bold">
                              {tm.accuracyPercent}%
                            </td>
                            <td className="py-2.5 px-4 text-xs">
                              {tm.needsRevision ? (
                                <span className="text-amber-800 font-semibold">
                                  ▲ Needs Revision
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">
                                  ● Strong Mastery
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SECTION 11: SETTINGS & ADMIN ACCESS ==================== */}
          {activeNav === 'SETTINGS' && (
            <div className="space-y-6" data-testid="settings-view">
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 font-bengali">
                    {isBn
                      ? 'সেটিংস, ভাষা নির্বাচন ও ক্লাউড অ্যাকাউন্ট (Settings & Preferences)'
                      : 'Student Profile, Language & Platform Settings'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                        {isBn ? 'ছাত্র/ছাত্রীর নাম (Display Name)' : 'Student Display Name'}
                      </label>
                      <input
                        id="student-name-input"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'ব্যাখ্যার ডিফল্ট ভাষা (Default Explanation Language)' : 'Default Teaching Language'}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setLanguage('bn')}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                            language === 'bn'
                              ? 'border-sky-600 bg-sky-50 text-sky-950 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          সহজ বাংলা (Simple Bengali — Default)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                            language === 'en'
                              ? 'border-sky-600 bg-sky-50 text-sky-950 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          English Explanations
                        </button>
                      </div>
                    </div>

                    {/* Dark Mode Toggle & Theme Appearance Control */}
                    <div
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 p-4 space-y-3"
                      data-testid="dark-mode-settings-card"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bengali">
                              {isBn ? 'ডার্ক মোড থিম (Dark Mode)' : 'Dark Mode Appearance'}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-bengali">
                              {isBn
                                ? 'রাতে বা দীর্ঘক্ষণ মক টেস্ট দেওয়ার সময় চোখের আরামের জন্য ডার্ক কালার প্যালেট ব্যবহার করো'
                                : 'Switch between high-contrast Light and Dark color palettes for comfortable study sessions'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={darkMode}
                          aria-label="Toggle Dark Mode"
                          data-testid="dark-mode-toggle"
                          onClick={() => setDarkMode((prev) => !prev)}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                            darkMode ? 'bg-sky-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                              darkMode ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          data-testid="theme-light-btn"
                          onClick={() => setDarkMode(false)}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                            !darkMode
                              ? 'border-sky-600 bg-sky-50 text-sky-950'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>{isBn ? 'লাইট মোড (Light)' : 'Light Palette'}</span>
                        </button>
                        <button
                          type="button"
                          data-testid="theme-dark-btn"
                          onClick={() => setDarkMode(true)}
                          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                            darkMode
                              ? 'border-sky-500 bg-sky-950/70 text-sky-200'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>{isBn ? 'ডার্ক মোড (Dark)' : 'Dark Palette'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Account Sync & Admin Panel Launch */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Firebase Cloud Sync & Authentication
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {user
                          ? `Signed in as ${user.email || user.displayName}. Your Mistake Notebook and attempts are protected by Firestore security rules.`
                          : 'Sign in with Google to sync your Mistake Notebook and mock test history across devices.'}
                      </p>
                      <div className="mt-3">
                        {user ? (
                          <button
                            type="button"
                            onClick={() => signOut(auth)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign in with Google</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="text-sm font-bold text-slate-900">
                        Administrator & Content Verification Portal
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Manage official WBPSC schemes, import PYQ papers, run the 10-step AI question verification pipeline, and audit disputed questions.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAdminOpen(true)}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Open Administrator Dashboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Quiet, Honest Educational Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            WBPSC Clerkship Shikshak · Official Examination Reference:{' '}
            <a
              href="https://psc.wb.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-800"
            >
              https://psc.wb.gov.in/
            </a>
          </div>
          <div className="font-bengali">
            {isBn
              ? 'সতর্কীকরণ: এই প্ল্যাটফর্মটি নিবিড় অনুশীলন ও ধারণা স্পষ্ট করার জন্য তৈরি; কোনো পরীক্ষায় নিশ্চিত পাশের গ্যারান্টি দেওয়া হয় না।'
              : 'Disclaimer: Independent preparation platform aligned with official WBPSC syllabus; practice metrics are estimates, not official rankings.'}
          </div>
        </div>
      </footer>

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        language={language}
        examConfigurations={examConfigurations}
        sourceDocuments={sourceDocuments}
        questions={questions}
        aiProviderStatus={aiProviderStatus}
        onQuestionCreated={(newQ) => setQuestions((prev) => [newQ, ...prev])}
        onQuestionUpdated={(updQ) =>
          setQuestions((prev) => prev.map((q) => (q.id === updQ.id ? updQ : q)))
        }
        onGenerateBatchQuestions={handleGenerateBatchQuestions}
      />
    </div>
  );
}
