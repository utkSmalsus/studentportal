import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { Card, PrimaryButton, SecondaryButton, ProgressBar, EmptyState } from '../../ui/Primitives';
import { useAppState } from '../../state/AppStateContext';
import { getAssessmentById } from '../../data/selectors';

const AssessmentAttemptPage: React.FC<{ assessmentId: string; onNavigate: (r: Route) => void }> = ({ assessmentId, onNavigate }) => {
  const { state: progress, submitAssessment } = useAppState();
  const a = getAssessmentById(assessmentId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!a) return <EmptyState title="Assessment not found" />;
  if (a.questions.length === 0) {
    return <EmptyState title="No questions available yet" description="This assessment hasn't been set up in the question bank." />;
  }

  // Same rule AssessmentDetailPage uses to decide whether to show "Retake" —
  // enforced here too, since this page is reachable directly by route, not
  // only through that button.
  const attempts = progress.assessments[a.id]?.attempts || [];
  const latest = attempts[attempts.length - 1];
  const attemptAllowed = attempts.length === 0 || (!latest.passed && attempts.length < a.attemptsAllowed);
  if (!attemptAllowed) {
    return (
      <EmptyState
        title={latest.passed ? 'You already passed this assessment' : 'No attempts remaining'}
        description={latest.passed ? 'Nothing more to do here.' : `You've used all ${a.attemptsAllowed} allowed attempts.`}
      />
    );
  }

  const question = a.questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === a.questions.length - 1;

  const selectAnswer = (optionIndex: number): void => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const handleSubmit = (): void => {
    submitAssessment(assessmentId, answers);
    onNavigate({ view: 'assessmentDetail', assessmentId });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2.5">
        <span className="font-semibold text-slate-700">
          Question {index + 1} of {a.questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <ProgressBar percent={((index + 1) / a.questions.length) * 100} color="blue" />

      <Card className="mt-6">
        <h1 className="text-lg font-bold text-slate-900">{question.text}</h1>

        <div className="mt-5 space-y-2.5">
          {question.options.map((opt, i) => {
            const selected = answers[question.id] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition ${
                  selected ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                    selected ? 'border-indigo-500' : 'border-slate-300'
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <SecondaryButton onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Previous
        </SecondaryButton>
        {isLast ? (
          <PrimaryButton onClick={handleSubmit} disabled={answeredCount < a.questions.length}>
            Submit Assessment
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => setIndex((i) => Math.min(a.questions.length - 1, i + 1))}>Next</PrimaryButton>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-7 justify-center">
        {a.questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCurrent = i === index;
          return (
            <button
              key={q.id}
              onClick={() => setIndex(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition ${
                isCurrent
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
              aria-label={`Go to question ${i + 1}`}
            >
              {isAnswered && !isCurrent ? '✓' : i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AssessmentAttemptPage;
