import React, { useEffect, useState } from 'react';
import {
  LanguageCode,
  MistakeRecord,
  OptionKey,
  QuestionItem,
  QuestionOrigin,
  SourceDocument,
  SubjectName,
} from '../types/exam';
import { ChildFriendlyTeacherCard } from './ChildFriendlyTeacherCard';
import {
  BookCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Sparkles,
  Timer,
  XCircle,
} from 'lucide-react';

interface GuidedPracticeModuleProps {
  mode: 'PYQ' | 'SUBJECT_PRACTICE' | 'TOPIC_PRACTICE' | 'MISTAKE_NOTEBOOK' | 'REVISION' | 'SPEED_DRILL';
  questions: QuestionItem[];
  sourceDocuments: SourceDocument[];
  mistakes: MistakeRecord[];
  language: LanguageCode;
  initialSubject?: SubjectName | 'ALL';
  initialTopic?: string;
  onRecordPracticeAttempt: (question: QuestionItem, selected: OptionKey, isCorrect: boolean) => void;
  onUpdateMistakeStatus: (questionId: string, status: 'NEEDS_REVIEW' | 'REVIEWED' | 'MASTERED') => void;
  onGenerateMoreQuestions: (subject: SubjectName, topic: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
}

export const GuidedPracticeModule: React.FC<GuidedPracticeModuleProps> = ({
  mode,
  questions,
  sourceDocuments,
  mistakes,
  language,
  initialSubject = 'ALL',
  initialTopic = 'ALL',
  onRecordPracticeAttempt,
  onUpdateMistakeStatus,
  onGenerateMoreQuestions,
}) => {
  const isBn = language === 'bn';

  const [selectedSubject, setSelectedSubject] = useState<SubjectName | 'ALL'>(initialSubject);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedOrigin, setSelectedOrigin] = useState<QuestionOrigin | 'ALL'>(
    mode === 'PYQ' ? 'AUTHENTIC_PYQ' : 'ALL'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'easy' | 'medium' | 'hard'>('ALL');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionKey>>({});
  const [generatingAi, setGeneratingAi] = useState(false);

  // Speed drill state
  const [speedActive, setSpeedActive] = useState(false);
  const [speedSecondsLeft, setSpeedSecondsLeft] = useState(180);

  useEffect(() => {
    if (mode === 'PYQ') {
      setSelectedOrigin('AUTHENTIC_PYQ');
    } else {
      setSelectedOrigin('ALL');
    }
  }, [mode]);

  useEffect(() => {
    if (!speedActive) return;
    const timer = setInterval(() => {
      setSpeedSecondsLeft((prev) => {
        if (prev <= 1) {
          setSpeedActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [speedActive]);

  const availableTopics = Array.from(
    new Set(
      questions
        .filter((q) => selectedSubject === 'ALL' || q.subject === selectedSubject)
        .map((q) => q.topic)
    )
  );

  // Filter questions according to mode and selected filters
  const filteredQuestions = questions.filter((q) => {
    if (q.verificationStatus !== 'VERIFIED' || q.answerKeyStatus === 'DISPUTED_EXCLUDED') {
      return false;
    }
    if (mode === 'REVISION') {
      const inMistakes = mistakes.some((m) => m.questionId === q.id);
      const weakTopics = new Set(mistakes.map((m) => `${m.subject}::${m.topic}`));
      if (!inMistakes && !weakTopics.has(`${q.subject}::${q.topic}`) && mistakes.length > 0) {
        return false;
      }
    }
    if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) return false;
    if (selectedTopic !== 'ALL' && q.topic !== selectedTopic) return false;
    if (selectedYear !== 'ALL' && String(q.examinationYear) !== selectedYear) return false;
    if (selectedOrigin !== 'ALL' && q.questionOrigin !== selectedOrigin) return false;
    if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleSelectOption = (q: QuestionItem, opt: OptionKey) => {
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
    const isCorrect = opt === q.correctAnswer;
    onRecordPracticeAttempt(q, opt, isCorrect);
  };

  const handleTriggerAiGeneration = async () => {
    setGeneratingAi(true);
    try {
      const subj: SubjectName = selectedSubject === 'ALL' ? 'Arithmetic' : selectedSubject;
      const top =
        selectedTopic === 'ALL'
          ? subj === 'Arithmetic'
            ? 'Simple & Compound Interest'
            : subj === 'English'
              ? 'Grammar (Prepositions, Articles, Tense)'
              : 'Indian Polity & Constitution'
          : selectedTopic;
      const diff = selectedDifficulty === 'ALL' ? 'medium' : selectedDifficulty;
      await onGenerateMoreQuestions(subj, top, diff);
    } finally {
      setGeneratingAi(false);
    }
  };

  const getOriginLabel = (origin: QuestionOrigin) => {
    switch (origin) {
      case 'AUTHENTIC_PYQ':
        return isBn
          ? '১. আসল বিগত বছরের প্রশ্ন (Authentic PYQ)'
          : '1. Authentic Previous-Year Question';
      case 'AI_GENERATED':
        return isBn
          ? '২. AI-নির্মিত মৌলিক অনুশীলন প্রশ্ন (AI-Generated Original)'
          : '2. AI-Generated Original Practice Question';
      case 'ADAPTED_CONCEPT':
        return isBn
          ? '৩. বিগত বছরের ধারণায় তৈরি অনুশীলন প্রশ্ন (Adapted PYQ Concept)'
          : '3. Adapted Practice Question Based on PYQ Concept';
      default:
        return '4. Imported Question Awaiting Verification';
    }
  };

  // ==================== MISTAKE NOTEBOOK VIEW ====================
  if (mode === 'MISTAKE_NOTEBOOK') {
    const filteredMistakes = mistakes.filter(
      (m) => selectedSubject === 'ALL' || m.subject === selectedSubject
    );

    return (
      <div className="space-y-6" data-testid="mistake-notebook-view">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-rose-700">
                Spaced Repetition & Error Correction Log
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'আমার ভুল খাতা (Mistake Notebook — প্রতিটি ভুল থেকে শেখো)'
                  : 'Personal Mistake Notebook & Misconception Tracker'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-bengali">
                {isBn
                  ? 'মক টেস্ট বা অনুশীলনে যে প্রশ্নগুলো তোমার ভুল হয়েছে, সেগুলো এখানে সহজ বাংলা ব্যাখ্যাসহ জমা থাকে যাতে পরীক্ষায় একই ভুল আর না হয়।'
                  : 'Every question you answered incorrectly is stored here with its personal teacher explanation so you never repeat the same mistake.'}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['ALL', 'English', 'General Studies', 'Arithmetic'] as const).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedSubject === subj
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {subj === 'ALL' ? (isBn ? 'সব বিষয়' : 'All Subjects') : subj}
                </button>
              ))}
            </div>
          </div>

          {filteredMistakes.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="mt-3 text-base font-semibold text-slate-900 font-bengali">
                {isBn
                  ? 'এই মুহূর্তে তোমার ভুল খাতায় কোনো অমীমাংসিত প্রশ্ন নেই!'
                  : 'No mistakes recorded in this filter yet!'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-bengali">
                {isBn
                  ? 'নতুন মক টেস্ট বা অধ্যায়ভিত্তিক অনুশীলন করলে যেকোনো ভুল উত্তর স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।'
                  : 'Whenever you select an incorrect answer in a Mock Test or Topic Practice, it will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 mt-4">
              {filteredMistakes.map((item) => (
                <div key={item.id} className="py-6 first:pt-2 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-900">{item.subject}</span>
                      {' · '}
                      <span>{item.topic}</span>
                      {' · '}
                      <span>
                        {isBn ? 'চেষ্টার তারিখ: ' : 'Attempted: '}
                        {item.attemptDate.slice(0, 10)}
                      </span>
                      {' · '}
                      <span>
                        {isBn ? 'পরবর্তী রিভিশন: ' : 'Next Review: '}
                        {item.nextReviewDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(['NEEDS_REVIEW', 'REVIEWED', 'MASTERED'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onUpdateMistakeStatus(item.questionId, st)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            item.revisionStatus === st
                              ? st === 'MASTERED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'NEEDS_REVIEW'
                            ? isBn
                              ? 'রিভিশন বাকি'
                              : 'Needs Review'
                            : st === 'REVIEWED'
                              ? isBn
                                ? 'পড়া হয়েছে'
                                : 'Reviewed'
                              : isBn
                                ? '✓ আয়ত্তে এসেছে'
                                : '✓ Mastered'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                        English Version (ইংরেজি প্রশ্ন)
                      </div>
                      <h4 className="text-base font-semibold text-slate-900">
                        {item.question.questionText}
                      </h4>
                    </div>
                    <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3">
                      <div className="text-[11px] font-semibold text-sky-900 font-bengali mb-0.5">
                        বাংলা সংস্করণ (Bengali Version):
                      </div>
                      <p className="text-base font-medium text-slate-900 font-bengali">
                        {item.question.questionTextBn || item.question.questionText}
                      </p>
                    </div>
                  </div>

                  <ChildFriendlyTeacherCard
                    question={item.question}
                    selectedOption={item.selectedOption}
                    language={language}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== GUIDED PRACTICE / PYQ / REVISION / SPEED DRILL VIEW ====================
  return (
    <div className="space-y-6" data-testid="guided-practice-view">
      {/* Header & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-medium text-sky-700">
              Mode B: Learn While Practicing (Immediate Child-Friendly AI Teacher Feedback)
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
              {mode === 'PYQ'
                ? isBn
                  ? 'বিগত বছরের আসল প্রশ্নপত্র (Verified WBPSC Clerkship PYQ Bank)'
                  : 'Authentic Previous-Year Questions (PYQ) Database'
                : mode === 'REVISION'
                  ? isBn
                    ? 'স্পেসড রিপিটিশন ও রিভিশন মোড (Revision Mode)'
                    : 'Spaced-Repetition Revision Mode (Clearly Labelled Revision Set)'
                  : mode === 'SPEED_DRILL'
                    ? isBn
                      ? 'সময় ধরে দ্রুত অনুশীলনের চ্যালেঞ্জ (Timed Speed Practice)'
                      : 'Timed Speed & Accuracy Drill'
                    : isBn
                      ? 'বিষয় ও অধ্যায়ভিত্তিক অনুশীলন (Learn While Practicing)'
                      : 'Subject & Topic Guided Practice with Instant AI Teacher'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-bengali">
              {isBn
                ? 'যেকোনো প্রশ্নের উত্তর নির্বাচন করলেই সাথে সাথে জানতে পারবে উত্তরটি ঠিক না ভুল। ভুল হলেই নিচে আমাদের সহজ বাংলা শিক্ষক ধাপে ধাপে বুঝিয়ে দেবেন!'
                : 'Select any option to receive immediate verification. If your choice is wrong, the Child-Friendly AI Teacher opens automatically right below.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {mode === 'SPEED_DRILL' && (
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-900 px-3.5 py-2 text-sm font-mono-tabular font-bold text-sky-300 flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  <span>
                    {Math.floor(speedSecondsLeft / 60)}:
                    {String(speedSecondsLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSpeedSecondsLeft(180);
                    setSpeedActive((prev) => !prev);
                  }}
                  className="rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 whitespace-nowrap shrink-0"
                >
                  {speedActive
                    ? isBn
                      ? 'বিরতি (Pause)'
                      : 'Pause Timer'
                    : isBn
                      ? '৩ মিনিটের টাইমার চালাও'
                      : 'Start 3-Min Drill'}
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={generatingAi}
              onClick={handleTriggerAiGeneration}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>
                {generatingAi
                  ? isBn
                    ? 'নতুন প্রশ্ন তৈরি ও যাচাই হচ্ছে...'
                    : 'Generating & Verifying...'
                  : isBn
                    ? '+ নতুন AI অনুশীলন প্রশ্ন তৈরি করো'
                    : '+ Generate Fresh Verified Questions'}
              </span>
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div>
            <label htmlFor="filter-subject" className="block text-xs font-medium text-slate-600 mb-1">
              {isBn ? 'বিষয় (Subject)' : 'Subject'}
            </label>
            <select
              id="filter-subject"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as SubjectName | 'ALL');
                setSelectedTopic('ALL');
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
            >
              <option value="ALL">{isBn ? 'সব বিষয় (All Subjects)' : 'All Subjects'}</option>
              <option value="English">English (30 Marks)</option>
              <option value="General Studies">General Studies (40 Marks)</option>
              <option value="Arithmetic">Arithmetic (30 Marks)</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-topic" className="block text-xs font-medium text-slate-600 mb-1">
              {isBn ? 'অধ্যায় (Topic)' : 'Syllabus Topic'}
            </label>
            <select
              id="filter-topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
            >
              <option value="ALL">{isBn ? 'সব অধ্যায় (All Topics)' : 'All Topics'}</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-origin" className="block text-xs font-medium text-slate-600 mb-1">
              {isBn ? 'প্রশ্নের উৎস (Question Origin)' : 'Question Origin Label'}
            </label>
            <select
              id="filter-origin"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value as QuestionOrigin | 'ALL')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
            >
              <option value="ALL">{isBn ? 'সব ধরনের যাচাইকৃত প্রশ্ন' : 'All Verified Questions'}</option>
              <option value="AUTHENTIC_PYQ">1. Authentic Previous-Year Question</option>
              <option value="AI_GENERATED">2. AI-Generated Original Practice Question</option>
              <option value="ADAPTED_CONCEPT">3. Adapted Practice Question (PYQ Concept)</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-year" className="block text-xs font-medium text-slate-600 mb-1">
              {isBn ? 'পরীক্ষার বছর / কঠিনতার স্তর' : 'Exam Year / Difficulty'}
            </label>
            <div className="flex gap-2">
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              >
                <option value="ALL">{isBn ? 'সব বছর' : 'All Years'}</option>
                <option value="2024">2024 (Advt 13/2023)</option>
                <option value="2019">2019 (Advt 05/2019)</option>
                <option value="2026">2026 (AI Practice)</option>
              </select>
              <select
                aria-label="Filter Difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              >
                <option value="ALL">{isBn ? 'সব স্তর' : 'All Levels'}</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, index) => {
          const chosen = selectedAnswers[q.id] || null;
          const isAnswered = chosen !== null;
          const isCorrect = chosen === q.correctAnswer;
          const sourceDoc = sourceDocuments.find((s) => s.id === q.sourceDocumentId);

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
              data-testid={`practice-question-card-${index}`}
            >
              {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono-tabular font-bold text-slate-900">#{index + 1}</span>
                  {' · '}
                  <span className="font-semibold text-slate-800">{q.subject}</span>
                  {' · '}
                  <span>{q.topic}</span>
                  {' · '}
                  <span className="text-sky-800 font-medium">{getOriginLabel(q.questionOrigin)}</span>
                </div>
                <div className="font-mono-tabular text-slate-500">
                  {q.examinationYear && <span>Year: {q.examinationYear}</span>}
                  {q.sessionShift && <span> · {q.sessionShift}</span>}
                  {q.originalQuestionNumber && <span> · Paper Q#{q.originalQuestionNumber}</span>}
                  {' · '}
                  <span>Key: {q.answerKeyStatus}</span>
                </div>
              </div>

              {/* Question Stem (Both English & Bengali displayed side-by-side/stacked for every question) */}
              <div className="mt-4 space-y-2.5">
                <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    English Version (ইংরেজি প্রশ্ন)
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                    {q.questionText}
                  </h3>
                </div>
                <div className="rounded-lg border border-sky-200/90 bg-sky-50/50 p-3.5">
                  <div className="text-[11px] font-semibold text-sky-900 font-bengali mb-1">
                    বাংলা সংস্করণ (Bengali Version — বাংলায় প্রশ্ন):
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-slate-900 font-bengali leading-relaxed">
                    {q.questionTextBn || q.questionText}
                  </p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optKey) => {
                  const isThisSelected = chosen === optKey;
                  const isThisCorrect = optKey === q.correctAnswer;

                  let cardStyle =
                    'border-slate-200 bg-white text-slate-800 hover:border-sky-400 hover:bg-slate-50/70';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      cardStyle = 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold';
                    } else if (isThisSelected && !isThisCorrect) {
                      cardStyle = 'border-rose-500 bg-rose-50/70 text-rose-950 font-medium';
                    } else {
                      cardStyle = 'border-slate-200 bg-slate-50/50 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(q, optKey)}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors ${cardStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded font-mono-tabular text-xs font-bold flex items-center justify-center bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                          {optKey}
                        </span>
                        <span>{q.options[optKey]}</span>
                      </div>
                      {isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Source Attribution Footer */}
              {sourceDoc && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Source: {sourceDoc.title} ({sourceDoc.documentReference})
                    </span>
                  </div>
                  {q.numericVerification && (
                    <span className="font-mono-tabular text-emerald-700">
                      ✓ Math Verified: {q.numericVerification.formulaDescription} ={' '}
                      {q.numericVerification.computedValue}
                    </span>
                  )}
                </div>
              )}

              {/* Immediate Feedback & Child-Friendly AI Teacher (Mode B) */}
              {isAnswered && (
                <div className="mt-4">
                  <div
                    className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 font-bengali ${
                      isCorrect
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border border-rose-200 text-rose-950'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>
                      {isCorrect
                        ? isBn
                          ? `চমৎকার! তোমার উত্তর (${chosen}) একদম সঠিক! নিচে সম্পূর্ণ ব্যাখ্যা ও অনুশীলন প্রশ্নটি দেখে নাও।`
                          : `Spot on! Option ${chosen} is correct! Review the step-by-step concept note below.`
                        : isBn
                          ? `তোমার নির্বাচিত উত্তর (${chosen}) সঠিক নয়। মন খারাপ করো না—চলো নিচে আমাদের শিক্ষকের কাছ থেকে একদম সহজ বাংলায় শিখে নিই!`
                          : `Option ${chosen} is incorrect. No worries—your personal AI Teacher has opened a simple step-by-step explanation below!`}
                    </span>
                  </div>

                  <ChildFriendlyTeacherCard
                    question={q}
                    selectedOption={chosen}
                    language={language}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
