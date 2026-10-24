import React, { useState } from 'react';
import {
  AnswerKeyStatus,
  ExamConfiguration,
  LanguageCode,
  OptionKey,
  QuestionItem,
  SourceDocument,
  SubjectName,
  VerificationStatus,
} from '../types/exam';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  examConfigurations: ExamConfiguration[];
  sourceDocuments: SourceDocument[];
  questions: QuestionItem[];
  aiProviderStatus: string;
  onQuestionCreated: (q: QuestionItem) => void;
  onQuestionUpdated: (q: QuestionItem) => void;
  onGenerateBatchQuestions: (
    subject: SubjectName,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number
  ) => Promise<any>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  language,
  examConfigurations,
  sourceDocuments,
  questions,
  aiProviderStatus,
  onQuestionCreated,
  onQuestionUpdated,
  onGenerateBatchQuestions,
}) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'QUESTION_BANK' | 'SOURCES_CONFIG' | 'PATTERN_ANALYSIS'>('GENERATOR');

  // AI Generator state
  const [genSubject, setGenSubject] = useState<SubjectName>('Arithmetic');
  const [genTopic, setGenTopic] = useState<string>('Percentage');
  const [genDiff, setGenDiff] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [genCount, setGenCount] = useState<number>(2);
  const [genLoading, setGenLoading] = useState<boolean>(false);
  const [lastVerificationReports, setLastVerificationReports] = useState<any[]>([]);

  // Manual Import state
  const [newQText, setNewQText] = useState('');
  const [newQTextBn, setNewQTextBn] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectName>('General Studies');
  const [newTopic, setNewTopic] = useState('Indian History & National Movement');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<OptionKey>('B');
  const [conceptBn, setConceptBn] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const handleRunGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await onGenerateBatchQuestions(genSubject, genTopic, genDiff, genCount);
      if (res?.verificationReports) {
        setLastVerificationReports(res.verificationReports);
      }
    } finally {
      setGenLoading(false);
    }
  };

  const handleManualImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setImportFeedback('All question text and 4 options (A, B, C, D) are required.');
      return;
    }
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionOrigin: 'AUTHENTIC_PYQ',
          examinationYear: 2024,
          sessionShift: 'Shift 1',
          subject: newSubject,
          topic: newTopic,
          difficulty: 'medium',
          questionText: newQText.trim(),
          questionTextBn: newQTextBn.trim(),
          options: { A: optA.trim(), B: optB.trim(), C: optC.trim(), D: optD.trim() },
          correctAnswer: correctOpt,
          simpleConceptBn: conceptBn.trim() || 'সরকারি উত্তরপত্র অনুযায়ী যাচাইকৃত।',
        }),
      });
      const data = await response.json();
      if (data.question) {
        onQuestionCreated(data.question);
        setImportFeedback(
          data.verification?.passed
            ? '✓ Question passed all 10 verification checks and was added to the verified pool!'
            : '⚠ Question added with FLAGGED_AMBIGUOUS status (failed duplicate or syllabus check).'
        );
        setNewQText('');
        setNewQTextBn('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
      }
    } catch (err: any) {
      setImportFeedback(err.message || 'Import failed');
    }
  };

  const handleToggleStatus = async (qId: string, verificationStatus: VerificationStatus, answerKeyStatus: AnswerKeyStatus) => {
    const response = await fetch(`/api/admin/questions/${qId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus, answerKeyStatus }),
    });
    const data = await response.json();
    if (data.question) {
      onQuestionUpdated(data.question);
    }
  };

  // Topic frequency calculation for Pattern Analysis
  const topicCounts = questions.reduce<Record<string, { subject: string; count: number; pyqCount: number }>>(
    (acc, q) => {
      const key = `${q.subject} — ${q.topic}`;
      if (!acc[key]) acc[key] = { subject: q.subject, count: 0, pyqCount: 0 };
      acc[key].count += 1;
      if (q.questionOrigin === 'AUTHENTIC_PYQ') acc[key].pyqCount += 1;
      return acc;
    },
    {}
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Admin Content, Verification & Source Traceability Center · AI Engine: {aiProviderStatus}
            </div>
            <h2 id="admin-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 font-bengali">
              {isBn
                ? 'প্রশাসক ড্যাশবোর্ড ও ১০-ধাপ প্রশ্ন যাচাইকরণ কেন্দ্র (Admin & Quality Control)'
                : 'Administrator Dashboard, Question Verification & PYQ Source Control'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Admin Dashboard"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Sub-Navigation */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg mt-4">
          {(
            [
              { id: 'GENERATOR', label: '1. AI Generator & 10-Step Verification' },
              { id: 'QUESTION_BANK', label: `2. Question Bank & Quality (${questions.length})` },
              { id: 'SOURCES_CONFIG', label: '3. Official WBPSC Schemes & Sources' },
              { id: 'PATTERN_ANALYSIS', label: '4. PYQ Topic Frequency Blueprint' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: AI GENERATOR + 10-STEP PIPELINE */}
        {activeTab === 'GENERATOR' && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleRunGenerator} className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-700" />
                <span>Dynamic AI Question Generation Engine</span>
              </h3>
              <p className="text-xs text-slate-600">
                Every generated question is validated against the 10-step deterministic verification pipeline (syllabus match, 4 distinct options, math verification, semantic duplicate check) before approval.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value as SubjectName)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <option value="Arithmetic">Arithmetic</option>
                    <option value="English">English</option>
                    <option value="General Studies">General Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={genDiff}
                    onChange={(e) => setGenDiff(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Syllabus Topic</label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Batch Count</label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <option value={1}>1 Question</option>
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={genLoading}
                className="w-full rounded-lg bg-sky-700 py-2.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
              >
                {genLoading ? 'Generating & Running 10-Step Verification...' : 'Generate & Validate New Questions'}
              </button>

              {lastVerificationReports.length > 0 && (
                <div className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-900">
                    Latest 10-Step Pipeline Verification Report:
                  </div>
                  {lastVerificationReports.map((rep) => (
                    <div key={rep.questionId} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <div className="font-semibold text-slate-900">{rep.questionText}</div>
                      <div className="mt-1.5 grid grid-cols-2 gap-1 text-[11px]">
                        {rep.checks.map((c: any) => (
                          <div key={c.step} className={c.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {c.passed ? '✓' : '✗'} Step {c.step}: {c.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* Manual PYQ / CSV Question Import Form */}
            <form onSubmit={handleManualImport} className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Import Authentic PYQ / Verified Question</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="General Studies">General Studies</option>
                  <option value="English">English</option>
                  <option value="Arithmetic">Arithmetic</option>
                </select>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Topic"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <input
                type="text"
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="Question text (English)..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              />
              <input
                type="text"
                value={newQTextBn}
                onChange={(e) => setNewQTextBn(e.target.value)}
                placeholder="প্রশ্নের বাংলা অনুবাদ (ঐচ্ছিক)..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bengali"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Option A"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Option B"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Option C"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Option D"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-700">Verified Key:</label>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value as OptionKey)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
                <input
                  type="text"
                  value={conceptBn}
                  onChange={(e) => setConceptBn(e.target.value)}
                  placeholder="সহজ বাংলা ব্যাখ্যা..."
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bengali"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Verify & Import Question into Bank
              </button>

              {importFeedback && (
                <div className="text-xs font-medium text-sky-900 bg-sky-50 border border-sky-200 rounded p-2">
                  {importFeedback}
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: QUESTION BANK & QUALITY MONITORING */}
        {activeTab === 'QUESTION_BANK' && (
          <div className="mt-5 space-y-3">
            <div className="text-xs text-slate-600">
              Showing all {questions.length} questions in database. Questions marked <code className="font-mono-tabular">DISPUTED_EXCLUDED</code> or <code className="font-mono-tabular">FLAGGED_AMBIGUOUS</code> are automatically excluded from scored student mock tests.
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3">ID & Origin</th>
                    <th className="py-2.5 px-3">Subject & Topic</th>
                    <th className="py-2.5 px-3">Question Statement</th>
                    <th className="py-2.5 px-3">Key Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono-tabular">
                        <div className="font-semibold text-slate-900">{q.id}</div>
                        <div className="text-slate-500">{q.questionOrigin}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{q.subject}</div>
                        <div className="text-slate-500">{q.topic}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-md">
                        <div className="text-slate-900 line-clamp-2">{q.questionText}</div>
                        <div className="text-slate-500 mt-0.5 font-mono-tabular">
                          Ans: {q.correctAnswer} ({q.options[q.correctAnswer]}) · Hash: {q.contentHash}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono-tabular">
                        <span
                          className={
                            q.verificationStatus === 'VERIFIED'
                              ? 'text-emerald-700 font-semibold'
                              : 'text-rose-700 font-semibold'
                          }
                        >
                          {q.verificationStatus} / {q.answerKeyStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {q.verificationStatus === 'VERIFIED' ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(q.id, 'FLAGGED_AMBIGUOUS', 'DISPUTED_EXCLUDED')
                            }
                            className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800 hover:bg-rose-100 whitespace-nowrap"
                          >
                            Flag Disputed
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(q.id, 'VERIFIED', 'FINAL_VERIFIED')
                            }
                            className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 hover:bg-emerald-100 whitespace-nowrap"
                          >
                            Approve Verified
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL SCHEMES & SOURCE REGISTRY */}
        {activeTab === 'SOURCES_CONFIG' && (
          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Versioned Official Examination Configurations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {examConfigurations.map((cfg) => (
                  <div key={cfg.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{cfg.examinationName}</div>
                    <div>Advt. No.: {cfg.advertisementNumber} · Version: {cfg.schemeVersion}</div>
                    <div className="font-mono-tabular">
                      Total Qs: {cfg.totalQuestions} · Marks: {cfg.totalMarks} · Duration: {cfg.durationSeconds / 60}m · Negative: -{cfg.negativeMarkingPerWrong}
                    </div>
                    <div className="text-slate-500 pt-1">{cfg.verificationNote}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Official WBPSC Source Documents Registry (Primary Source: https://psc.wb.gov.in/)
              </h3>
              <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                {sourceDocuments.map((doc) => (
                  <div key={doc.id} className="p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-slate-500">
                        Ref: {doc.documentReference} · Advt: {doc.advertisementNumber} · Year: {doc.examinationYear} · Shift: {doc.sessionShift}
                      </div>
                      <div className="text-slate-600 mt-0.5">{doc.notes}</div>
                    </div>
                    <div className="font-mono-tabular text-emerald-700 font-semibold">
                      ✓ {doc.answerKeyStatus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORICAL PYQ TOPIC FREQUENCY BLUEPRINT */}
        {activeTab === 'PATTERN_ANALYSIS' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-600">
              AI Historical Question Paper Analysis: Tracks topic distribution across verified PYQs and original practice items. Note: Historical frequency is used as one signal alongside official syllabus coverage, never as a guarantee of future paper questions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(topicCounts).map(([label, stats]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <div className="font-semibold text-slate-900">{label}</div>
                  <div className="mt-1.5 flex items-center justify-between font-mono-tabular text-slate-600">
                    <span>Total Pool: {stats.count} Qs</span>
                    <span>Authentic PYQs: {stats.pyqCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
