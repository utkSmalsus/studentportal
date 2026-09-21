import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, PrimaryButton, SecondaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { difficultyColor } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import { evaluateCodingSubmission } from '../../state/engine/codingEvaluator';
import { getCodingQuestionById } from '../../data/selectors';
import { CodingAttempt } from '../../state/types';

type Phase = 'writing' | 'running' | 'result';

const LANGUAGES = ['JavaScript', 'Python', 'Java'];

const TestList: React.FC<{ passed: number; total: number }> = ({ passed, total }) => (
  <ul className="space-y-1 text-sm">
    {Array.from({ length: total }).map((_, i) => (
      <li key={i} className={i < passed ? 'text-emerald-600' : 'text-red-500'}>
        {i < passed ? '✓' : '✗'} Test {i + 1} {i < passed ? 'passed' : 'failed'}
      </li>
    ))}
  </ul>
);

const ResultPanel: React.FC<{ attempt: CodingAttempt; onTryAgain: () => void; onNext: () => void }> = ({ attempt, onTryAgain, onNext }) => (
  <div>
    <Eyebrow>Result</Eyebrow>
    <div className={`text-lg font-medium ${attempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
      {attempt.passed ? '✓ Passed' : '✗ Not yet passing'}
    </div>

    <div className="mt-3">
      <TestList passed={attempt.passedTests} total={attempt.totalTests} />
    </div>

    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
      <div>
        <div className="text-xs text-gray-400">Score</div>
        <div className="text-xl font-semibold text-gray-900">{attempt.scorePercent}%</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Time Complexity</div>
        <div className="text-xl font-semibold text-gray-900">{attempt.timeComplexity}</div>
      </div>
    </div>

    {attempt.whatWentWell.length > 0 && (
      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-1">What you did well</div>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-0.5">
          {attempt.whatWentWell.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    )}

    {attempt.whatToImprove.length > 0 && (
      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-1">What to improve</div>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-0.5">
          {attempt.whatToImprove.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-4">
      <div className="text-xs text-gray-400 mb-1">Explanation</div>
      <p className="text-sm text-gray-700">{attempt.explanation}</p>
    </div>

    <div className="flex gap-2 mt-5">
      <SecondaryButton onClick={onTryAgain}>Try Again</SecondaryButton>
      <PrimaryButton onClick={onNext}>Next Challenge</PrimaryButton>
    </div>
  </div>
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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{q.title}</h1>
        <StatusPill color={difficultyColor[q.difficulty]}>{q.difficulty}</StatusPill>
      </div>
      <p className="text-sm text-gray-400 mt-1">Day {q.day} · {q.tags.join(' · ')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div>
          <Eyebrow>Problem</Eyebrow>
          <p className="text-sm text-gray-700">{q.problemStatement}</p>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-1">Input</div>
              <code className="text-gray-800">{q.exampleInput}</code>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Output</div>
              <code className="text-gray-800">{q.exampleOutput}</code>
            </div>
          </div>

          {q.constraints.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-500 mt-3 space-y-0.5">
              {q.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}

          {q.hints.length > 0 && (
            <div className="mt-4">
              <button onClick={() => setShowHints((v) => !v)} className="text-sm text-blue-600 hover:underline">
                {showHints ? 'Hide hints' : 'Show hints'}
              </button>
              {showHints && (
                <ul className="list-disc pl-5 text-sm text-gray-500 mt-2 space-y-0.5">
                  {q.hints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          {phase !== 'result' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <Eyebrow>Your Solution</Eyebrow>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600"
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
                rows={12}
                className="w-full font-mono text-sm border border-gray-200 rounded-md p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                spellCheck={false}
              />
              <div className="flex gap-2 mt-3">
                <SecondaryButton onClick={runCode} disabled={phase === 'running'}>
                  {phase === 'running' ? 'Running…' : 'Run Code'}
                </SecondaryButton>
                <PrimaryButton onClick={submit} disabled={phase === 'running'}>
                  Submit
                </PrimaryButton>
                <SecondaryButton onClick={() => { setSolution('function solve(input) {\n  // your solution\n\n  return input;\n}\n'); setPreview(undefined); }}>
                  Reset
                </SecondaryButton>
              </div>

              {phase === 'running' && <p className="text-sm text-gray-400 mt-4">Running…</p>}

              {preview && phase === 'writing' && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Eyebrow>Test Results (not submitted)</Eyebrow>
                  <TestList passed={preview.passedTests} total={preview.totalTests} />
                  <p className="text-xs text-gray-400 mt-2">Run Code previews your result without recording an attempt. Click Submit when you&apos;re ready.</p>
                </div>
              )}
            </>
          ) : resultAttempt ? (
            <ResultPanel
              attempt={resultAttempt}
              onTryAgain={() => setPhase('writing')}
              onNext={() => onNavigate({ view: 'coding' })}
            />
          ) : null}
        </div>
      </div>

      {attempts.length > 0 && phase !== 'result' && (
        <>
          <Divider />
          <Eyebrow>Previous Attempts</Eyebrow>
          <div className="space-y-1.5">
            {attempts.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">Attempt {i + 1}</span>
                <span className={a.passed ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {a.passedTests}/{a.totalTests} tests · {a.scorePercent}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChallengeDetailPage;
