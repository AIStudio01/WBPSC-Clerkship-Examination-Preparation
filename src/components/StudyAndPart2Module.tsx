import React, { useState } from 'react';
import {
  ChildFriendlyExplanation,
  LanguageCode,
  QuestionItem,
  SubjectName,
  TopicMasteryItem,
} from '../types/exam';
import {
  PART2_CONVENTIONAL_TASKS,
  TYPING_PRACTICE_PASSAGES,
} from '../data/wbpscQuestions';
import { calculateAdaptiveTopicWeights } from '../lib/examEngine';
import { ChildFriendlyTeacherCard } from './ChildFriendlyTeacherCard';
import {
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  FileText,
  Keyboard,
  MessageSquareHeart,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';

interface StudyAndPart2ModuleProps {
  activeSubTab: 'AI_TEACHER' | 'STUDY_PLAN' | 'PART2_WRITING' | 'TYPING_SKILL';
  language: LanguageCode;
  questions: QuestionItem[];
  topicMastery: TopicMasteryItem[];
  onStartTopicPractice: (subject: SubjectName, topic: string) => void;
}

export const StudyAndPart2Module: React.FC<StudyAndPart2ModuleProps> = ({
  activeSubTab,
  language,
  questions,
  topicMastery,
  onStartTopicPractice,
}) => {
  const isBn = language === 'bn';

  // AI Teacher Studio state
  const [teacherSubject, setTeacherSubject] = useState<SubjectName>('Arithmetic');
  const [teacherTopic, setTeacherTopic] = useState<string>('Percentage');
  const [studentQuestionInput, setStudentQuestionInput] = useState<string>('');
  const [teacherLoading, setTeacherLoading] = useState<boolean>(false);
  const [customTeacherExplanation, setCustomTeacherExplanation] =
    useState<ChildFriendlyExplanation | null>(null);

  // Study Plan state
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-12-20');
  const [aiStudyPlan, setAiStudyPlan] = useState<any | null>(null);
  const [aiPlanLoading, setAiPlanLoading] = useState<boolean>(false);

  // Part-II Conventional state
  const [part2TasksList, setPart2TasksList] = useState(PART2_CONVENTIONAL_TASKS);
  const [selectedPart2TaskId, setSelectedPart2TaskId] = useState<string>(
    PART2_CONVENTIONAL_TASKS[0].id
  );
  const [part2Draft, setPart2Draft] = useState<string>('');
  const [part2Evaluation, setPart2Evaluation] = useState<any | null>(null);
  const [part2Loading, setPart2Loading] = useState<boolean>(false);
  const [aiPromptLoading, setAiPromptLoading] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  // Typing Practice state
  const [selectedPassageId, setSelectedPassageId] = useState<string>(
    TYPING_PRACTICE_PASSAGES[0].id
  );
  const [typedText, setTypedText] = useState<string>('');
  const [typingStartedAt, setTypingStartedAt] = useState<number | null>(null);

  const handleAskPersonalTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentQuestionInput.trim()) return;
    setTeacherLoading(true);
    try {
      const response = await fetch('/api/ai/teacher-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: teacherSubject,
          topic: teacherTopic,
          language,
          customDoubt: studentQuestionInput.trim(),
        }),
      });
      const data = await response.json();
      if (data.explanation) {
        setCustomTeacherExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Error asking AI teacher:', err);
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleEvaluatePart2 = async () => {
    const task =
      part2TasksList.find((t) => t.id === selectedPart2TaskId) ||
      part2TasksList[0];
    setPart2Loading(true);
    setPart2Evaluation(null);
    try {
      const response = await fetch('/api/ai/evaluate-part2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskType: task.taskType,
          studentResponse: part2Draft,
          modelAnswer: task.modelAnswer,
          maxMarks: task.marks,
        }),
      });
      const data = await response.json();
      setPart2Evaluation(data);
    } finally {
      setPart2Loading(false);
    }
  };

  const handleGenerateAiStudyPlan = async () => {
    setAiPlanLoading(true);
    try {
      const weakList = topicMastery
        .filter((t) => t.accuracyPercent < 70)
        .map((t) => `${t.topic} (${t.subject})`);
      const response = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyHours,
          targetExamDate,
          weakTopics: weakList,
        }),
      });
      const data = await response.json();
      setAiStudyPlan(data);
    } catch (e) {
      console.error('Failed to generate AI study plan:', e);
    } finally {
      setAiPlanLoading(false);
    }
  };

  const handleGenerateNewPart2Prompt = async (
    group: 'Group-A (English)' | 'Group-B (Bengali)',
    taskType: 'Report Writing' | 'Précis Writing' | 'Translation'
  ) => {
    setAiPromptLoading(true);
    try {
      const response = await fetch('/api/ai/generate-part2-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, taskType }),
      });
      const data = await response.json();
      if (data.task) {
        setPart2TasksList((prev) => [data.task, ...prev]);
        setSelectedPart2TaskId(data.task.id);
        setPart2Draft('');
        setPart2Evaluation(null);
        setShowModelAnswer(false);
      }
    } catch (e) {
      console.error('Failed to generate AI Part-II prompt:', e);
    } finally {
      setAiPromptLoading(false);
    }
  };

  // ==================== 1. DEDICATED AI TEACHER STUDIO ====================
  if (activeSubTab === 'AI_TEACHER') {
    const sampleQuestion: QuestionItem = {
      ...questions[0],
      id: 'custom_tutor_session',
      subject: teacherSubject,
      topic: teacherTopic,
      questionText: studentQuestionInput || questions[0].questionText,
      teacherExplanation: customTeacherExplanation || questions[0].teacherExplanation,
    };

    return (
      <div className="space-y-6" data-testid="ai-teacher-studio-view">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="text-xs font-medium text-sky-700">
              Child-Friendly Personal WBPSC Clerkship Teacher (বাংলা ও English)
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
              {isBn
                ? 'তোমার ব্যক্তিগত AI শিক্ষক — যেকোনো প্রশ্ন বা নিয়ম একদম সহজ বাংলায় শেখো'
                : 'Your Personal AI Teacher — Understand Any Syllabus Concept Simply'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-bengali">
              {isBn
                ? 'কোনো অঙ্কের সূত্র, ইংরেজি গ্রামার বা সাধারণ জ্ঞানের প্রশ্ন বুঝতে অসুবিধা হলে নিচে লেখো। শিক্ষক তোমাকে প্রতিদিনের জীবনের উদাহরণ দিয়ে ধাপে ধাপে বুঝিয়ে দেবেন!'
                : 'Type any WBPSC Clerkship question, grammar rule, or arithmetic problem below. Your teacher will break it down using everyday examples and a follow-up check.'}
            </p>
          </div>

          <form onSubmit={handleAskPersonalTeacher} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="tutor-subject" className="block text-xs font-medium text-slate-600 mb-1">
                  {isBn ? 'বিষয় নির্বাচন করো (Subject)' : 'Select Subject'}
                </label>
                <select
                  id="tutor-subject"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value as SubjectName)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Arithmetic">Arithmetic (পাটিগণিত)</option>
                  <option value="English">English (ইংরেজি গ্রামার ও ভোকাবুলারি)</option>
                  <option value="General Studies">General Studies (সাধারণ জ্ঞান)</option>
                </select>
              </div>
              <div>
                <label htmlFor="tutor-topic" className="block text-xs font-medium text-slate-600 mb-1">
                  {isBn ? 'অধ্যায়ের নাম (Topic)' : 'Topic'}
                </label>
                <input
                  id="tutor-topic"
                  type="text"
                  value={teacherTopic}
                  onChange={(e) => setTeacherTopic(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tutor-doubt-input" className="block text-xs font-medium text-slate-600 mb-1">
                {isBn ? 'তোমার প্রশ্ন বা যে অংশটি বুঝতে চাইছ তা লেখো:' : 'Enter your question or concept doubt:'}
              </label>
              <textarea
                id="tutor-doubt-input"
                rows={3}
                value={studentQuestionInput}
                onChange={(e) => setStudentQuestionInput(e.target.value)}
                placeholder={
                  isBn
                    ? 'উদাহরণ: স্যার, শতকরা (Percentage) ও লাভ-ক্ষতির অঙ্ক খুব সহজে কীভাবে করব? অথবা "die of" আর "die from"-এর পার্থক্য কী?'
                    : 'Example: How do I quickly solve Time & Work problems using LCM? Or explain when to use "known to" vs "known by".'
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none font-bengali"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  'শতকরা (Percentage) ও লাভ-ক্ষতির সহজ নিয়ম কী?',
                  'Die of এবং Die from এর পার্থক্য কী?',
                  'সময় ও কার্য (Time & Work) ল.সা.গু পদ্ধতিতে কীভাবে করব?',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStudentQuestionInput(preset)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 font-bengali"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={teacherLoading || !studentQuestionInput.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>
                  {teacherLoading
                    ? isBn
                      ? 'শিক্ষক সহজ বাংলায় উত্তর লিখছেন...'
                      : 'Preparing Teacher Explanation...'
                    : isBn
                      ? 'সহজ বাংলায় বুঝিয়ে দিন (Ask AI Teacher)'
                      : 'Explain Like a Patient Teacher'}
                </span>
              </button>
            </div>
          </form>

          <ChildFriendlyTeacherCard
            question={sampleQuestion}
            selectedOption={null}
            language={language}
          />
        </div>
      </div>
    );
  }

  // ==================== 2. PERSONALIZED STUDY PLAN ====================
  if (activeSubTab === 'STUDY_PLAN') {
    const adaptivePriorities = calculateAdaptiveTopicWeights(topicMastery);

    return (
      <div className="space-y-6" data-testid="study-plan-view">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-sky-700">
                Adaptive Daily & Weekly Preparation Schedule
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'তোমার ব্যক্তিগতকৃত দৈনিক ও সাপ্তাহিক স্টাডি প্ল্যান'
                  : 'Personalized WBPSC Clerkship Study Plan'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-bengali">
                {isBn
                  ? 'তোমার মক টেস্টের পারফরম্যান্স, দুর্বল অধ্যায় এবং প্রতিদিনের পড়ার সময়ের ওপর ভিত্তি করে তৈরি রুটিন।'
                  : 'Dynamically tailored to your weak topics, historical syllabus weightage, and available daily study hours.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="daily-hours" className="block text-[11px] font-medium text-slate-500">
                  {isBn ? 'দৈনিক পড়ার সময় (ঘণ্টা)' : 'Daily Study Hours'}
                </label>
                <select
                  id="daily-hours"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  <option value={2}>2 Hours / Day</option>
                  <option value={3}>3 Hours / Day</option>
                  <option value={4}>4 Hours / Day</option>
                  <option value={6}>6 Hours / Day</option>
                </select>
              </div>
              <div>
                <label htmlFor="target-date" className="block text-[11px] font-medium text-slate-500">
                  {isBn ? 'লক্ষ্য পরীক্ষার তারিখ' : 'Target Exam Date'}
                </label>
                <input
                  id="target-date"
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono-tabular text-slate-900"
                />
              </div>
              <button
                type="button"
                disabled={aiPlanLoading}
                onClick={handleGenerateAiStudyPlan}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 font-bengali mt-3 sm:mt-0"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {aiPlanLoading
                    ? isBn
                      ? 'AI নোটস তৈরি হচ্ছে...'
                      : 'Generating AI Notes...'
                    : isBn
                      ? 'AI দিয়ে শর্ট নোটস ও রুটিন তৈরি করো'
                      : 'Generate AI Cheat-Sheet & Plan'}
                </span>
              </button>
            </div>
          </div>

          {aiStudyPlan && (
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-sky-900 font-bengali flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>
                    {isBn
                      ? 'Gemini AI দ্বারা তৈরি তোমার বিশেষ গোল্ডেন রুলস ও শর্ট নোটস:'
                      : 'Gemini AI Personalized Golden Rules & Revision Cheat-Sheet:'}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-bengali">
                {isBn ? aiStudyPlan.coachSummaryBn : aiStudyPlan.coachSummaryEn}
              </p>
              {Array.isArray(aiStudyPlan.quickCheatSheet) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiStudyPlan.quickCheatSheet.map((item: any, idx: number) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3.5">
                      <div className="text-xs font-bold text-sky-900">{item.topic}</div>
                      <p className="mt-1 text-xs text-slate-700 font-bengali leading-relaxed">
                        {isBn ? item.goldenRuleBn : item.goldenRuleEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-medium text-emerald-950 font-bengali">
                {isBn ? aiStudyPlan.weeklyMilestoneBn : aiStudyPlan.weeklyMilestoneEn}
              </div>
            </div>
          )}

          {/* Daily Time Split Blueprint */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
            {[
              {
                slotBn: `স্লট ১ (${Math.round(dailyHours * 20)} মিনিট)`,
                slotEn: `Slot 1 (${Math.round(dailyHours * 20)} mins)`,
                titleBn: 'পাটিগণিত (Arithmetic) ধারণা ও অনুশীলন',
                titleEn: 'Arithmetic Concept & Step-by-Step Practice',
                detailBn: 'শতকরা, অনুপাত, লাভ-ক্ষতি ও সময়-কার্যের ১০টি নতুন অঙ্ক।',
              },
              {
                slotBn: `স্লট ২ (${Math.round(dailyHours * 15)} মিনিট)`,
                slotEn: `Slot 2 (${Math.round(dailyHours * 15)} mins)`,
                titleBn: 'ইংরেজি গ্রামার ও ভোকাবুলারি',
                titleEn: 'English Grammar & Vocabulary Drill',
                detailBn: 'Preposition, Voice Change, Synonym-Antonym ও বানান অনুশীলন।',
              },
              {
                slotBn: `স্লট ৩ (${Math.round(dailyHours * 15)} মিনিট)`,
                slotEn: `Slot 3 (${Math.round(dailyHours * 15)} mins)`,
                titleBn: 'সাধারণ জ্ঞান (General Studies)',
                titleEn: 'General Studies (History, Geography, Polity, Science)',
                detailBn: 'পশ্চিমবঙ্গের ভূগোল, ভারতের সংবিধান ও দৈনন্দিন বিজ্ঞান।',
              },
              {
                slotBn: `স্লট ৪ (${Math.round(dailyHours * 10)} মিনিট)`,
                slotEn: `Slot 4 (${Math.round(dailyHours * 10)} mins)`,
                titleBn: 'ভুল খাতা (Mistake Notebook) ও পার্ট-২ লেখা',
                titleEn: 'Mistake Notebook Revision & Part-II Writing',
                detailBn: 'আগের ভুল প্রশ্নগুলো পুনরায় সমাধান ও ১টি বাংলা/ইংরেজি অনুবাদ।',
              },
            ].map((slot, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-mono-tabular font-semibold text-sky-700">
                  {isBn ? slot.slotBn : slot.slotEn}
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                  {isBn ? slot.titleBn : slot.titleEn}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 font-bengali leading-relaxed">
                  {slot.detailBn}
                </p>
              </div>
            ))}
          </div>

          {/* Priority Weak Topics Queue */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 font-bengali mb-3">
              {isBn
                ? 'AI দ্বারা চিহ্নিত তোমার অগ্রাধিকার অধ্যায় (Adaptive Weak-Topic Queue)'
                : 'Adaptive Priority Topics Based on Your Accuracy'}
            </h3>
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
              {adaptivePriorities.map((item) => (
                <div
                  key={`${item.subject}-${item.topic}`}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{item.subject}</span>
                      {' · '}
                      <span>Recommended Level: {item.recommendedDifficulty}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{item.topic}</div>
                    <p className="text-xs text-slate-600 font-bengali mt-0.5">
                      {isBn ? item.reasonBn : item.reasonEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartTopicPractice(item.subject, item.topic)}
                    className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    {isBn ? 'এই অধ্যায় অনুশীলন করো' : 'Practice This Topic'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. PART-II CONVENTIONAL WRITING PREPARATION ====================
  if (activeSubTab === 'PART2_WRITING') {
    const activeTask =
      part2TasksList.find((t) => t.id === selectedPart2TaskId) ||
      part2TasksList[0];
    const wordCount = part2Draft.trim() ? part2Draft.trim().split(/\s+/).length : 0;

    return (
      <div className="space-y-6" data-testid="part2-writing-view">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-medium text-sky-700">
                WBPSC Clerkship Part-II (Conventional Written) · Group-A (English 50 Marks) & Group-B (Bengali 50 Marks) · Duration: 60 Mins
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
                {isBn
                  ? 'পার্ট-২ ডেসক্রিপটিভ রাইটিং প্রস্তুতি (Report, Précis ও বঙ্গানুবাদ)'
                  : 'Part-II Conventional Type Examination Preparation'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-bengali">
                {isBn
                  ? 'পার্ট-২ লিখিত পরীক্ষায় কোনো MCQ নেগেটিভ মার্কিং প্রযোজ্য নয়। এখানে প্রতিবেদন (Report), সারাংশ (Précis) ও অনুবাদ (Translation) অনুশীলন করে AI শিক্ষকের গঠনমূলক মতামত ও আদর্শ উত্তর দেখে নাও।'
                  : 'Practice Report Drafting, Précis Writing, and Translation. Part-I MCQ negative marking rules do not apply to Part-II written responses.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={aiPromptLoading}
                onClick={() => handleGenerateNewPart2Prompt('Group-A (English)', 'Report Writing')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 font-bengali"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {aiPromptLoading
                    ? isBn
                      ? 'তৈরি হচ্ছে...'
                      : 'Generating...'
                    : isBn
                      ? 'নতুন English Report (AI)'
                      : 'New AI English Report'}
                </span>
              </button>
              <button
                type="button"
                disabled={aiPromptLoading}
                onClick={() => handleGenerateNewPart2Prompt('Group-B (Bengali)', 'Report Writing')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50 font-bengali"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>
                  {isBn ? 'নতুন বাংলা প্রতিবেদন (AI)' : 'New AI Bengali Report'}
                </span>
              </button>
            </div>
          </div>

          {/* Task Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {part2TasksList.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  setSelectedPart2TaskId(task.id);
                  setPart2Evaluation(null);
                  setShowModelAnswer(false);
                }}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  task.id === selectedPart2TaskId
                    ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs text-slate-500">
                  {task.group} · {task.taskType} · {task.marks} Marks
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900 font-bengali">
                  {task.title}
                </div>
              </button>
            ))}
          </div>

          {/* Active Prompt & Guidelines */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">
              {activeTask.group} · {activeTask.taskType} ({activeTask.marks} Marks)
            </div>
            <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-900 whitespace-pre-line font-bengali">
              {activeTask.promptText}
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600 font-bengali">
              {(isBn ? activeTask.guidelinesBn : activeTask.guidelinesEn).map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Writing Area */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="part2-editor" className="text-xs font-semibold text-slate-700 font-bengali">
                {isBn ? 'তোমার উত্তর এখানে লেখো:' : 'Write Your Response Below:'}
              </label>
              <span className="text-xs font-mono-tabular text-slate-500">
                Word Count: {wordCount} words
              </span>
            </div>
            <textarea
              id="part2-editor"
              rows={7}
              value={part2Draft}
              onChange={(e) => setPart2Draft(e.target.value)}
              placeholder={
                isBn
                  ? 'এখানে তোমার প্রতিবেদন বা অনুবাদটি লেখো...'
                  : 'Draft your report, précis, or translation here...'
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-sky-600 focus:outline-none font-bengali leading-relaxed"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowModelAnswer((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4" />
              <span>
                {showModelAnswer
                  ? isBn
                    ? 'আদর্শ উত্তর লুকিয়ে রাখো'
                    : 'Hide Model Answer'
                  : isBn
                    ? 'আদর্শ উত্তর দেখো (View Model Answer)'
                    : 'View Editable Model Answer'}
              </span>
            </button>

            <button
              type="button"
              disabled={part2Loading || wordCount < 5}
              onClick={handleEvaluatePart2}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {part2Loading
                  ? isBn
                    ? 'মূল্যায়ন করা হচ্ছে...'
                    : 'Evaluating Draft...'
                  : isBn
                    ? 'AI শিক্ষকের ফিডব্যাক নাও (Get AI Feedback)'
                    : 'Get AI Teacher Feedback'}
              </span>
            </button>
          </div>

          {part2Evaluation && (
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/40 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-sky-950 font-bengali">
                  {isBn
                    ? 'শিক্ষকের মূল্যায়ন ও উন্নতির পরামর্শ (AI Teacher Evaluation)'
                    : 'AI Teacher Descriptive Feedback'}
                </h4>
                <span className="text-xs font-mono-tabular font-semibold text-sky-800">
                  {part2Evaluation.estimatedBand}
                </span>
              </div>
              <p className="text-sm text-slate-800 font-bengali leading-relaxed">
                {isBn ? part2Evaluation.feedbackBn : part2Evaluation.feedbackEn}
              </p>
              {Array.isArray(part2Evaluation.improvementsBn) && (
                <ul className="text-xs text-slate-700 space-y-1 font-bengali list-disc pl-5">
                  {part2Evaluation.improvementsBn.map((imp: string, idx: number) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showModelAnswer && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
              <div className="text-xs font-semibold text-emerald-800 font-bengali">
                {isBn ? 'আদর্শ উত্তর (Reference Model Answer):' : 'Reference Model Answer:'}
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-900 font-bengali leading-relaxed">
                {activeTask.modelAnswer}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== 4. COMPUTER & TYPING SKILL PRACTICE ====================
  const activePassage =
    TYPING_PRACTICE_PASSAGES.find((p) => p.id === selectedPassageId) ||
    TYPING_PRACTICE_PASSAGES[0];

  const elapsedMinutes = typingStartedAt
    ? Math.max(0.05, (Date.now() - typingStartedAt) / 60000)
    : 0;
  const typedWords = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;
  const currentWpm = typingStartedAt ? Math.round(typedWords / elapsedMinutes) : 0;

  let matchingChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === activePassage.passageText[i]) {
      matchingChars++;
    }
  }
  const typingAccuracy =
    typedText.length > 0 ? Math.round((matchingChars / typedText.length) * 100) : 100;

  return (
    <div className="space-y-6" data-testid="typing-practice-view">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-medium text-sky-700">
              Elementary Computer Knowledge & Typing Skill Practice (Practice Activity — Separate from Part-I Scoring)
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 font-bengali">
              {isBn
                ? 'কম্পিউটার টাইপিং দক্ষতা অনুশীলন (English 20 WPM / বাংলা 10 WPM)'
                : 'Computer Typing Skill Test Simulator (20 WPM English / 10 WPM Bengali)'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-bengali">
              {isBn
                ? 'পার্ট-১ ও পার্ট-২ উত্তীর্ণ হওয়ার পর কম্পিউটার টাইপিং টেস্টে ইংরেজিতে মিনিটে ২০টি শব্দ (20 WPM) অথবা বাংলায় মিনিটে ১০টি শব্দ (10 WPM) নির্ভুলভাবে টাইপ করতে হয়।'
                : 'Practice typing official passages accurately to build readiness for the subsequent qualifying skill test.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {TYPING_PRACTICE_PASSAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPassageId(p.id);
                  setTypedText('');
                  setTypingStartedAt(null);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedPassageId === p.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.language === 'en' ? 'English (20 WPM)' : 'বাংলা (10 WPM)'}
              </button>
            ))}
          </div>
        </div>

        {/* Live WPM & Accuracy Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <div className="text-xs text-slate-500">Current Speed (WPM)</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
              {currentWpm} <span className="text-xs font-normal text-slate-500">/ Target {activePassage.targetWpm} WPM</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <div className="text-xs text-slate-500">Character Accuracy</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono-tabular">
              {typingAccuracy}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Words Typed</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-tabular">
                {typedWords}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTypedText('');
                setTypingStartedAt(null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Reference Passage */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-500 mb-1.5">{activePassage.title}</div>
          <p className="text-base text-slate-900 font-bengali leading-relaxed select-none">
            {activePassage.passageText}
          </p>
        </div>

        {/* Typing Input Box */}
        <div className="mt-4">
          <label htmlFor="typing-box" className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isBn ? 'উপরের অনুচ্ছেদটি দেখে এখানে টাইপ শুরু করো:' : 'Start typing the passage above:'}
          </label>
          <textarea
            id="typing-box"
            rows={4}
            value={typedText}
            onChange={(e) => {
              if (!typingStartedAt) setTypingStartedAt(Date.now());
              setTypedText(e.target.value);
            }}
            placeholder={activePassage.passageText.slice(0, 45) + '...'}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-900 focus:border-sky-600 focus:outline-none font-bengali"
          />
        </div>
      </div>
    </div>
  );
};
