// Shared scorer for Topic Tests and Module Tests — both are just
// "N questions, single correct option, a passing percentage."
import { TopicTestQuestionDef } from '../../data/types';

export interface QuizResult {
  scorePercent: number;
  passed: boolean;
}

export function scoreQuiz(questions: TopicTestQuestionDef[], answers: Record<string, number>, passingScorePercent: number): QuizResult {
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const scorePercent = questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
  return { scorePercent, passed: scorePercent >= passingScorePercent };
}
