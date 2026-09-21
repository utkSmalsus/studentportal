import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, PrimaryButton, SecondaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { difficultyColor } from '../../ui/statusMeta';
import { ClockIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import { evaluateCodingSubmission } from '../../state/engine/codingEvaluator';
import { getCodingQuestionById } from '../../data/selectors';
import { CodingAttempt } from '../../state/types';

type Phase = 'writing' | 'running' | 'result';

const LANGUAGES = ['JavaScript', 'Python', 'Java'];

const TestList: React.FC<{ passed: number; total: number }> = ({ passed, total }) => (
  <ul className="space-y-1.5 text-sm">
    {Array.from({ length: total }).map((_, i) => (
      <li key={i} className={`flex items-center gap-2 ${i < passed ? 'text-emerald-600' : 'text-red-500'}`}>
        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${i < passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {i < passed ? '✓' : '✗'}
        </span>
        Test {i + 1} {i < passed ? 'passed' : 'failed'}
      </li>
    ))}
  </ul>
);

const ResultPanel: React.FC<{ attempt: CodingAttempt; onTryAgain: () => void; onNext: () => void }> = ({ attempt, onTryAgain, onNext }) => (
  <Card className={attempt.passed ? '!border-emerald-200 !bg-emerald-50/30' : '!border-amber-200 !bg-amber-50/30'}>
    <div className={`text-lg font-bold ${attempt.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
      {attempt.passed ? '✓ Passed' : '✗ Not yet passing'}
    </div>

    <div className="mt-4">
      <TestList passed={attempt.passedTests} total={attempt.totalTests} />
    </div>

    <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
        <div className="text-xs text-slate-400">Score</div>
        <div className="text-xl font-bold text-slate-900">{attempt.scorePercent}%</div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
        <div className="text-xs text-slate-400">Time Complexity</div>
        <div className="text-xl font-bold text-slate-900">{attempt.timeComplexity}</div>
      </div>
    </div>

    {attempt.whatWentWell.length > 0 && (
      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">What you did well</div>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-0.5">
          {attempt.whatWentWell.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    )}

    {attempt.whatToImprove.length > 0 && (
      <div className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">What to improve</div>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-0.5">
          {attempt.whatToImprove.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Explanation</div>
      <p className="text-sm text-slate-700">{attempt.explanation}</p>
    </div>

    <div className="flex gap-2 mt-5">
      <SecondaryButton onClick={onTryAgain}>Try Again</SecondaryButton>
      <PrimaryButton onClick={onNext}>Next Challenge</PrimaryButton>
    </div>
  </Card>
);

const ChallengeDetailPage: React.FC<{ questionId: string; onNavigate: (r: Route) => void }> = ({ questionId, onNavigate }) => {
  const { state: progress, submitCoding } = useAppState();
  const q = getCodingQuestionById(questionId);
  const [solution, setSolution] = useState('function solve(input) {\n  // your solution\n\n  return input;\n}\n');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [phase, setPhase] = useState<Phase>('writing');
  const [preview, setPreview] = useState<CodingAttempt | undefined>();
  const [showHints, setShowHints] = useState(false);

  if (!q) return <EmptyState title="Challenge not found" />;

  const attempts = progress.coding[questionId]?.attempts || [];
  const lastAttempt = attempts[attempts.length - 1];

  const runCode = (): void => {
    setPhase('running');
    setPreview(undefined);
    window.setTimeout(() => {
      setPreview(evaluateCodingSubmission(q, solution));
      setPhase('writing');
    }, 800);
  };

  const submit = (): void => {
    submitCoding(questionId, solution);
    setPreview(undefined);
    setPhase('result');
  };

  const resultAttempt = phase === 'result' ? lastAttempt : undefined;

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'coding' })}>Back to Daily Coding</BackLink>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{q.title}</h1>
        <StatusPill color={difficultyColor[q.difficulty]}>{q.difficulty}</StatusPill>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <SectionTitle>Problem</SectionTitle>
            <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
              Day {q.day} &middot; {q.tags.join(' · ')}
            </div>
            <p className="text-sm text-slate-700">{q.problemStatement}</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-2.5">
                <div className="text-xs text-slate-400 mb-1">Input</div>
                <code className="text-sm text-slate-800">{q.exampleInput}</code>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-2.5">
                <div className="text-xs text-slate-400 mb-1">Output</div>
                <code className="text-sm text-slate-800">{q.exampleOutput}</code>
              </div>
            </div>

            {q.constraints.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-slate-500 mt-4 space-y-0.5">
                {q.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}

            {q.hints.length > 0 && (
              <div className="mt-4">
                <button onClick={() => setShowHints((v) => !v)} className="text-sm font-semibold text-indigo-600 hover:underline">
                  {showHints ? 'Hide hints' : 'Show hints'}
                </button>
                {showHints && (
                  <ul className="list-disc pl-5 text-sm text-slate-500 mt-2 space-y-0.5">
                    {q.hints.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          {attempts.length > 0 && phase !== 'result' && (
            <Card>
              <SectionTitle>Previous Attempts</SectionTitle>
              <div className="space-y-1.5">
                {attempts.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-500">Attempt {i + 1}</span>
                    <span className={a.passed ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {a.passedTests}/{a.totalTests} tests &middot; {a.scorePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          {phase !== 'result' ? (
            <Card padded={false} className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                rows={14}
                className="w-full font-mono text-[13px] leading-relaxed p-4 bg-slate-900 text-slate-100 focus:outline-none resize-y"
                spellCheck={false}
              />
              <div className="flex gap-2 p-4 border-t border-slate-100">
                <SecondaryButton onClick={runCode} disabled={phase === 'running'}>
                  {phase === 'running' ? 'Running…' : 'Run Code'}
                </SecondaryButton>
                <PrimaryButton onClick={submit} disabled={phase === 'running'}>
                  Submit
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => {
                    setSolution('function solve(input) {\n  // your solution\n\n  return input;\n}\n');
                    setPreview(undefined);
                  }}
                >
                  Reset
                </SecondaryButton>
              </div>

              {phase === 'running' && (
                <div className="px-4 pb-4 flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" /> Running…
                </div>
              )}

              {preview && phase === 'writing' && (
                <div className="px-4 pb-4">
                  <div className="border-t border-slate-100 pt-4">
                    <SectionTitle>Test Results (not submitted)</SectionTitle>
                    <TestList passed={preview.passedTests} total={preview.totalTests} />
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5" /> Run Code previews your result without recording an attempt.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ) : resultAttempt ? (
            <ResultPanel attempt={resultAttempt} onTryAgain={() => setPhase('writing')} onNext={() => onNavigate({ view: 'coding' })} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
