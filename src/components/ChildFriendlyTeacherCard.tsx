import React, { useEffect, useRef, useState } from 'react';
import {
  ChildFriendlyExplanation,
  LanguageCode,
  OptionKey,
  QuestionItem,
} from '../types/exam';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';

interface ChildFriendlyTeacherCardProps {
  question: QuestionItem;
  selectedOption: OptionKey | null;
  language: LanguageCode;
}

export const ChildFriendlyTeacherCard: React.FC<ChildFriendlyTeacherCardProps> = ({
  question,
  selectedOption,
  language,
}) => {
  const [followUpSelected, setFollowUpSelected] = useState<OptionKey | null>(null);
  const [showFollowUpHint, setShowFollowUpHint] = useState(false);
  const [customDoubt, setCustomDoubt] = useState('');
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ChildFriendlyExplanation>(
    question.teacherExplanation
  );
  const [explanationSource, setExplanationSource] = useState<'VERIFIED' | 'LIVE_AI'>('VERIFIED');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setActiveExplanation(question.teacherExplanation);
    setExplanationSource('VERIFIED');
    setFollowUpSelected(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, [question.id, question.teacherExplanation]);

  const isBn = language === 'bn';
  const fu = activeExplanation.followUpQuestion;
  const isWrongSelection = Boolean(selectedOption && selectedOption !== question.correctAnswer);

  const specificWrongReasonBn =
    (selectedOption && activeExplanation.whyWrongByOptionBn?.[selectedOption]) ||
    `তুমি অপশন ${selectedOption || '-'} বেছে নিয়েছিলে, কিন্তু এটি প্রশ্নের সঠিক শর্ত বা তথ্যের সাথে মেলে না।`;

  const specificWrongReasonEn =
    (selectedOption && activeExplanation.whyWrongByOptionEn?.[selectedOption]) ||
    `Option ${selectedOption || '-'} does not satisfy the verified rule or calculation for this question.`;

  const handleAskCustomDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDoubt.trim()) return;
    setLoadingCustom(true);
    try {
      const response = await fetch('/api/ai/teacher-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          questionText: question.questionText,
          options: question.options,
          selectedOption: selectedOption || 'A',
          correctAnswer: question.correctAnswer,
          subject: question.subject,
          topic: question.topic,
          language,
          customDoubt: customDoubt.trim(),
        }),
      });
      const data = await response.json();
      if (data.explanation) {
        setActiveExplanation(data.explanation);
        setExplanationSource('LIVE_AI');
        setFollowUpSelected(null);
      }
    } catch (err) {
      console.error('Failed to fetch custom teacher explanation:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleOneClickAiExplain = async () => {
    setLoadingCustom(true);
    try {
      const response = await fetch('/api/ai/teacher-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          questionText: question.questionText,
          options: question.options,
          selectedOption: selectedOption || 'A',
          correctAnswer: question.correctAnswer,
          subject: question.subject,
          topic: question.topic,
          language,
        }),
      });
      const data = await response.json();
      if (data.explanation) {
        setActiveExplanation(data.explanation);
        setExplanationSource('LIVE_AI');
        setFollowUpSelected(null);
      }
    } catch (err) {
      console.error('Failed to generate live AI explanation:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleListenToTeacher = async () => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    const speechText = isBn
      ? `${activeExplanation.simpleConceptBn}। মনে রাখার কৌশল: ${activeExplanation.memoryTrickBn}`
      : `${activeExplanation.simpleConceptEn}. Memory Trick: ${activeExplanation.memoryTrickEn}`;

    setTtsLoading(true);
    try {
      const response = await fetch('/api/ai/teacher-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, language }),
      });
      const data = await response.json();
      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = isBn ? 'bn-IN' : 'en-IN';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('TTS playback error:', err);
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div
      className="mt-5 rounded-xl border border-sky-200 bg-white p-5 sm:p-6 shadow-xs"
      data-testid="child-friendly-teacher-card"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900 font-bengali">
              {isBn
                ? 'সহজ ভাষায় শিক্ষকের ব্যাখ্যা (Child-Friendly Personal Teacher)'
                : 'Step-by-Step Personal Teacher Explanation'}
            </h4>
            <p className="text-xs text-slate-500 font-bengali">
              {isBn
                ? 'কোনও অসুবিধা নেই! চলো, একদম সহজ করে ধাপে ধাপে বিষয়টি বুঝে নিই।'
                : 'No problem at all! Let us understand this concept from the very basics.'}
              {' · '}
              <span className="font-semibold text-sky-800">
                {explanationSource === 'LIVE_AI'
                  ? isBn
                    ? '✨ লাইভ Gemini AI শিক্ষক'
                    : '✨ Live Gemini AI Tutor'
                  : isBn
                    ? 'যাচাইকৃত শিক্ষক নোট'
                    : 'Verified Teacher Note'}
              </span>
            </p>
          </div>
        </div>

        {/* AI Voice Teacher & One-Click Live AI Re-Explain Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={ttsLoading}
            onClick={handleListenToTeacher}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors font-bengali ${
              isSpeaking
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            )}
            <span>
              {ttsLoading
                ? isBn
                  ? 'কণ্ঠ তৈরি হচ্ছে...'
                  : 'Loading Voice...'
                : isSpeaking
                  ? isBn
                    ? 'কণ্ঠ থামাও (Stop Voice)'
                    : 'Stop Voice'
                  : isBn
                    ? 'শিক্ষকের কণ্ঠে শোনো (AI Voice)'
                    : 'Listen to AI Teacher'}
            </span>
          </button>

          <button
            type="button"
            disabled={loadingCustom}
            onClick={handleOneClickAiExplain}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition-colors font-bengali"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>
              {loadingCustom
                ? isBn
                  ? 'AI ব্যাখ্যা তৈরি হচ্ছে...'
                  : 'AI Thinking...'
                : isBn
                  ? 'AI দিয়ে নতুন উদাহরণসহ বোঝো'
                  : 'Generate Live AI Explanation'}
            </span>
          </button>
        </div>
      </div>

      {/* TOP 3-PART HIGHLIGHT: (1) সঠিক উত্তর কোনটি, (2) কেন এটিই সঠিক হবে, (3) সঠিক উত্তর খোঁজার সহজ উপায় বা Trick */}
      <div
        className={`mt-4 rounded-xl border p-4 space-y-3 ${
          isWrongSelection
            ? 'border-rose-200 bg-rose-50/40'
            : 'border-emerald-200 bg-emerald-50/30'
        }`}
        data-testid="wrong-answer-3part-breakdown"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
          <div className="flex items-center gap-2 font-bengali">
            {isWrongSelection ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {isWrongSelection
                ? isBn
                  ? 'ভুল উত্তরের সম্পূর্ণ সমাধান: সঠিক উত্তর, কেন হবে এবং খোঁজার সহজ ট্রিক'
                  : 'Wrong Answer Breakdown: Correct Answer, Why It Works & Easy Trick'
                : isBn
                  ? 'সঠিক উত্তরের সারাংশ, কারণ ও মনে রাখার সহজ ট্রিক'
                  : 'Correct Answer Summary, Core Rule & Easy Trick'}
            </span>
          </div>
        </div>

        {/* Part 1: Your Answer vs What is the Correct Answer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="text-xs font-semibold text-slate-500 font-bengali">
              {isBn ? '১. তোমার দেওয়া উত্তর (Your Answer)' : '1. Your Selected Answer'}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 font-bengali">
              {selectedOption ? (
                <>
                  {selectedOption === question.correctAnswer ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {isBn ? `অপশন (${selectedOption}): ` : `Option (${selectedOption}): `}
                    {question.options[selectedOption]}
                  </span>
                </>
              ) : (
                <span className="text-slate-500">
                  {isBn ? 'উত্তর দেওয়া হয়নি (Unanswered)' : 'Not answered'}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50/90 p-3.5">
            <div className="text-xs font-bold text-emerald-900 font-bengali">
              {isBn ? '২. সঠিক উত্তর কী হবে? (Verified Correct Answer)' : '2. What Is the Correct Answer?'}
            </div>
            <div
              className="mt-1 flex items-center gap-2 text-sm sm:text-base font-bold text-emerald-950 font-bengali"
              data-testid="teacher-correct-answer-text"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isBn ? `অপশন (${question.correctAnswer}): ` : `Option (${question.correctAnswer}): `}
                {question.options[question.correctAnswer]}
              </span>
            </div>
          </div>
        </div>

        {/* Part 2: Why is it the correct answer & why your option was wrong */}
        <div className="rounded-lg border border-sky-200 bg-white p-3.5 space-y-2">
          <h5 className="text-xs sm:text-sm font-bold text-sky-950 font-bengali">
            {isBn
              ? `৩. কেন অপশন (${question.correctAnswer}) সঠিক উত্তর হবে? (ওটা কেনই বা হবে)`
              : `3. Why Is Option (${question.correctAnswer}) the Correct Answer?`}
          </h5>
          <p
            className="text-sm text-slate-800 leading-relaxed font-bengali"
            data-testid="teacher-why-correct-text"
          >
            {isBn ? activeExplanation.simpleConceptBn : activeExplanation.simpleConceptEn}
          </p>
          {isWrongSelection && (
            <div className="pt-2 border-t border-rose-100 text-xs sm:text-sm text-rose-900 font-bengali">
              <span className="font-bold">
                {isBn
                  ? `কেন তোমার দেওয়া অপশন (${selectedOption}) ভুল ছিল: `
                  : `Why your chosen Option (${selectedOption}) was wrong: `}
              </span>
              <span>{isBn ? specificWrongReasonBn : specificWrongReasonEn}</span>
            </div>
          )}
        </div>

        {/* Part 3: Easy Way / Shortcut Trick to Find the Correct Answer */}
        <div
          className="rounded-lg border-2 border-amber-300 bg-amber-50/90 p-3.5"
          data-testid="teacher-easy-trick-box"
        >
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950 font-bengali">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isBn
                ? '৪. সঠিক উত্তর খোঁজার সহজ উপায় বা শর্টকাট Trick (Easy Trick to Spot the Answer):'
                : '4. Easy Way / Shortcut Trick to Find the Correct Answer:'}
            </span>
          </div>
          <p className="mt-1 text-sm sm:text-base font-bold text-amber-950 leading-relaxed font-bengali">
            {isBn ? activeExplanation.memoryTrickBn : activeExplanation.memoryTrickEn}
          </p>
        </div>
      </div>

      {/* Section 5: Step-by-Step Solution */}
      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
        <h5 className="text-sm font-semibold text-slate-900 font-bengali">
          {isBn ? '৫. ধাপে ধাপে সম্পূর্ণ সমাধান (Step-by-Step Solution)' : '5. Step-by-Step Detailed Solution'}
        </h5>
        <ol className="mt-2 space-y-1.5 text-sm text-slate-700 font-bengali list-none">
          {(isBn
            ? activeExplanation.whyCorrectStepByStepBn
            : activeExplanation.whyCorrectStepByStepEn
          ).map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-mono-tabular text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Section 6: Everyday Example */}
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 font-bengali">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{isBn ? '৬. বাস্তব জীবনের সহজ উদাহরণ (Everyday Example)' : '6. Everyday Life Example'}</span>
        </div>
        <p className="mt-1.5 text-sm text-slate-800 leading-relaxed font-bengali">
          {isBn ? activeExplanation.everydayExampleBn : activeExplanation.everydayExampleEn}
        </p>
      </div>

      {/* Section 8: Interactive Follow-Up Question ("এবার তুমি চেষ্টা করো") — Answer hidden until student responds */}
      {fu && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-sm font-semibold text-slate-900 font-bengali">
              {isBn
                ? '৮. এবার তুমি চেষ্টা করো (Check Your Understanding)'
                : '8. Now You Try (Verify Your Understanding)'}
            </h5>
            <button
              type="button"
              onClick={() => setShowFollowUpHint((prev) => !prev)}
              className="text-xs font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isBn ? 'ছোট্ট হিন্ট দেখো' : 'Show Hint'}</span>
            </button>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-900 font-bengali">{fu.questionText}</p>

          {showFollowUpHint && (
            <p className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 font-bengali">
              {isBn ? `হিন্ট: ${fu.simpleHintBn}` : `Hint: ${fu.simpleHintEn}`}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optKey) => {
              const isChosen = followUpSelected === optKey;
              const isCorrectFollowUp = optKey === fu.correctAnswer;
              let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-sky-300';
              if (followUpSelected) {
                if (isCorrectFollowUp) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                } else if (isChosen) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                }
              }
              return (
                <button
                  key={optKey}
                  type="button"
                  onClick={() => setFollowUpSelected(optKey)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-xs sm:text-sm transition-colors ${btnStyle}`}
                >
                  <span>
                    <strong className="font-mono-tabular mr-1.5">{optKey}.</strong>
                    {fu.options[optKey]}
                  </span>
                  {followUpSelected && isCorrectFollowUp && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {followUpSelected && isChosen && !isCorrectFollowUp && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {followUpSelected && (
            <div
              className={`mt-2.5 text-xs font-medium rounded-lg px-3 py-2 font-bengali ${
                followUpSelected === fu.correctAnswer
                  ? 'bg-emerald-100/80 text-emerald-950'
                  : 'bg-amber-100/80 text-amber-950'
              }`}
            >
              {followUpSelected === fu.correctAnswer
                ? isBn
                  ? `সাবাশ! একদম সঠিক উত্তর (${fu.correctAnswer})! তুমি মূল নিয়মটি দারুণভাবে ধরে ফেলেছ!`
                  : `Bravo! Option ${fu.correctAnswer} is spot on! You have mastered this concept.`
                : isBn
                  ? `চেষ্টা করার জন্য ধন্যবাদ! সঠিক উত্তরটি হবে অপশন ${fu.correctAnswer} (${fu.options[fu.correctAnswer]})। হিন্ট: ${fu.simpleHintBn}`
                  : `Good try! The correct answer is Option ${fu.correctAnswer} (${fu.options[fu.correctAnswer]}). Hint: ${fu.simpleHintEn}`}
            </div>
          )}
        </div>
      )}

      {/* Section 9: Teacher's Encouragement + Ask Follow-up Doubt */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-medium text-emerald-800 font-bengali">
          <span className="font-semibold">{isBn ? '৯. শিক্ষকের উৎসাহ: ' : '9. Teacher’s Note: '}</span>
          {isBn ? activeExplanation.encouragementBn : activeExplanation.encouragementEn}
        </div>
      </div>

      <form onSubmit={handleAskCustomDoubt} className="mt-3 flex flex-col sm:flex-row gap-2">
        <label htmlFor={`doubt-${question.id}`} className="sr-only">
          {isBn ? 'শিক্ষককে প্রশ্ন করো' : 'Ask teacher a doubt'}
        </label>
        <input
          id={`doubt-${question.id}`}
          type="text"
          value={customDoubt}
          onChange={(e) => setCustomDoubt(e.target.value)}
          placeholder={
            isBn
              ? 'কোনো জায়গা বুঝতে অসুবিধা হলে এখানে লেখো (যেমন: ৫/১৮ কেন গুণ হলো?)...'
              : 'Still have a doubt on this question? Ask your AI Teacher...'
          }
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none font-bengali"
        />
        <button
          type="submit"
          disabled={loadingCustom || !customDoubt.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <MessageCircleQuestion className="w-3.5 h-3.5" />
          <span>
            {loadingCustom
              ? isBn
                ? 'বোঝানো হচ্ছে...'
                : 'Explaining...'
              : isBn
                ? 'আরেকটু সহজ করে বোঝান'
                : 'Explain Further'}
          </span>
        </button>
      </form>
    </div>
  );
};
