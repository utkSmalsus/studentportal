// Scores a real attempt against the answer key and groups accuracy by topic —
// this is what makes "Strong Areas" / "Needs Improvement" and Performance's
// Recommended Focus genuinely derived from what the student answered, not authored
// by hand per assessment.
import { AssessmentDef } from '../../data/types';

export interface AssessmentScoreResult {
  scorePercent: number;
  passed: boolean;
  strongTopics: string[];
  weakTopics: string[];
}

export function scoreAssessmentAttempt(assessment: AssessmentDef, answers: Record<string, number>): AssessmentScoreResult {
  const byTopic: Record<string, { correct: number; total: number }> = {};

  assessment.questions.forEach((q) => {
    const entry = byTopic[q.topic] || { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctIndex) entry.correct += 1;
    byTopic[q.topic] = entry;
  });

  const correctCount = assessment.questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const scorePercent = Math.round((correctCount / assessment.questions.length) * 100);
  const passed = scorePercent >= assessment.passingScorePercent;

  const topics = Object.keys(byTopic);
  const strongTopics = topics.filter((topic) => byTopic[topic].correct / byTopic[topic].total >= 0.7);
  const weakTopics = topics.filter((topic) => byTopic[topic].correct / byTopic[topic].total < 0.7);

  return { scorePercent, passed, strongTopics, weakTopics };
}
