import * as React from 'react';
import { useState } from 'react';
import { TopicTestQuestionDef } from '../../data/types';
import { Card, PrimaryButton, SecondaryButton, ProgressBar, EmptyState } from '../../ui/Primitives';
import { CheckIcon, AlertIcon } from '../../ui/icons';
import { scoreQuiz } from '../../state/engine/quizEngine';

// Shared single-question quiz flow for Topic Tests and Module Tests: pick an
// answer, see immediate correct/incorrect feedback, move on; a result screen at
// the end. Heavier multi-question-visible navigation (like the course Assessment)
// isn't needed here — these are lightweight checks, not exams.
interface QuizAttemptPageProps {
  title: string;
  questions: TopicTestQuestionDef[];
  passingScorePercent: number;
  onFinish: (answers: Record<string, number>) => void;
  onExit: () => void;
  onContinue: () => void;
  continueLabel: string;
}

const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({ title, questions, passingScorePercent, onFinish, onExit, onContinue, continueLabel }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return <EmptyState title="No questions yet" description="This test hasn't been configured with any questions." />;
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const selectAnswer = (optionIndex: number): void => {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    setRevealed(true);
  };

  const next = (): void => {
    if (isLast) {
      onFinish(answers);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const retry = (): void => {
    setIndex(0);
    setAnswers({});
    setRevealed(false);
    setDone(false);
  };

  if (done) {
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const { scorePercent, passed } = scoreQuiz(questions, answers, passingScorePercent);
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {passed ? <CheckIcon className="w-6 h-6" /> : <AlertIcon className="w-6 h-6" />}
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-4">{passed ? 'Passed' : 'Not Yet Passing'}</h1>
        <p className="text-slate-500 mt-1">
          {scorePercent}% &middot; {correct}/{questions.length} correct &middot; {passingScorePercent}% required to pass
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <SecondaryButton onClick={onExit}>Back</SecondaryButton>
          {passed ? <PrimaryButton onClick={onContinue}>{continueLabel}</PrimaryButton> : <PrimaryButton onClick={retry}>Try Again</PrimaryButton>}
        </div>
      </div>
    );
  }

  const selected = answers[question.id];
  const isCorrect = selected === question.correctIndex;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2.5">
        <span className="font-semibold text-slate-700">
          {title} &middot; Question {index + 1} of {questions.length}
        </span>
      </div>
      <ProgressBar percent={((index + (revealed ? 1 : 0)) / questions.length) * 100} color="blue" />

      <Card className="mt-6">
        <h1 className="text-lg font-bold text-slate-900">{question.text}</h1>
        <div className="mt-5 space-y-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            let stateClass = 'border-slate-200 text-slate-700 hover:bg-slate-50';
            if (revealed && i === question.correctIndex) stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold';
            else if (revealed && isSelected) stateClass = 'border-red-300 bg-red-50 text-red-700 font-semibold';
            else if (isSelected) stateClass = 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold';
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={revealed}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition disabled:cursor-default ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={`mt-4 text-sm font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
            {isCorrect ? 'Correct!' : `Incorrect — the right answer is "${question.options[question.correctIndex]}."`}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between mt-6">
        <SecondaryButton onClick={onExit}>Exit</SecondaryButton>
        <PrimaryButton onClick={next} disabled={!revealed}>
          {isLast ? 'See Results' : 'Next Question'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
