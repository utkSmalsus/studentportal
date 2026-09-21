import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, PrimaryButton, SecondaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { difficultyColor } from '../../ui/statusMeta';
import { getCodingQuestionById } from '../../data/selectors';

type Phase = 'writing' | 'running' | 'result';

const ChallengeDetailPage: React.FC<{ questionId: string; onNavigate: (r: Route) => void }> = ({ questionId, onNavigate }) => {
  const q = getCodingQuestionById(questionId);
  const [solution, setSolution] = useState('function solve(input) {\n  // your solution\n}\n');
  const [phase, setPhase] = useState<Phase>(q && (q.status === 'solved' || q.status === 'failed') ? 'result' : 'writing');

  if (!q) return <EmptyState title="Challenge not found" />;

  const alreadyAttempted = q.status === 'solved' || q.status === 'failed';
  const passed = alreadyAttempted ? q.status === 'solved' : true; // simulated outcome for a fresh submission
  const testCasesPassed = alreadyAttempted ? q.testCasesPassed ?? 0 : q.testCasesTotal;
  const scorePercent = alreadyAttempted ? q.scorePercent ?? 0 : 100;

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'coding' })}>Back to Daily Coding</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{q.title}</h1>
        <StatusPill color={difficultyColor[q.difficulty]}>{q.difficulty}</StatusPill>
      </div>
      <p className="text-sm text-gray-400 mt-1">Day {q.day} · {q.tags.join(' · ')}</p>

      <Divider />

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

      <Divider />

      {phase !== 'result' ? (
        <>
          <Eyebrow>Your Solution</Eyebrow>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm border border-gray-200 rounded-md p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            spellCheck={false}
          />
          <div className="flex gap-2 mt-3">
            <SecondaryButton onClick={() => setPhase('running')} disabled={phase === 'running'}>
              {phase === 'running' ? 'Running…' : 'Run Tests'}
            </SecondaryButton>
            <PrimaryButton onClick={() => setPhase('result')}>Submit</PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <Eyebrow>Result</Eyebrow>
          <div className={`text-lg font-medium ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
            {passed ? '✓' : '✗'} {testCasesPassed} / {q.testCasesTotal} test cases passed
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <div className="text-xs text-gray-400">Score</div>
              <div className="text-xl font-semibold text-gray-900">{scorePercent}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Time Complexity</div>
              <div className="text-xl font-semibold text-gray-900">{q.timeComplexity || 'O(n)'}</div>
            </div>
          </div>
          {q.feedback && (
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-1">Feedback</div>
              <p className="text-sm text-gray-700">{q.feedback}</p>
            </div>
          )}
          <div className="flex gap-2 mt-5">
            <SecondaryButton onClick={() => setPhase('writing')}>{passed ? 'View Solution' : 'Retry'}</SecondaryButton>
            <PrimaryButton onClick={() => onNavigate({ view: 'coding' })}>Next Challenge</PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
};

export default ChallengeDetailPage;
