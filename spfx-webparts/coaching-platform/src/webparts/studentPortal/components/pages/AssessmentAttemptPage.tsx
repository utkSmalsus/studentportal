import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { PrimaryButton, SecondaryButton, ProgressBar, EmptyState } from '../../ui/Primitives';
import { useAppState } from '../../state/AppStateContext';
import { getAssessmentById } from '../../data/selectors';

const AssessmentAttemptPage: React.FC<{ assessmentId: string; onNavigate: (r: Route) => void }> = ({ assessmentId, onNavigate }) => {
  const { submitAssessment } = useAppState();
  const a = getAssessmentById(assessmentId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!a) return <EmptyState title="Assessment not found" />;
  if (a.questions.length === 0) {
    return <EmptyState title="No questions available yet" description="This assessment hasn't been set up in the question bank." />;
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
    <div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>
          Question {index + 1} of {a.questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <ProgressBar percent={((index + 1) / a.questions.length) * 100} color="blue" />

      <h1 className="text-xl font-medium text-gray-900 mt-6">{question.text}</h1>

      <div className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const selected = answers[question.id] === i;
          return (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition ${
                selected ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`inline-block w-4 h-4 rounded-full border mr-2 align-middle ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
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

      <div className="flex gap-1.5 mt-6">
        {a.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full ${
              i === index ? 'bg-blue-600' : answers[q.id] !== undefined ? 'bg-emerald-400' : 'bg-gray-200'
            }`}
            aria-label={`Go to question ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AssessmentAttemptPage;
