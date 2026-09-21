// Mock instructor evaluation. In the real product an instructor scores the rubric
// by hand from the Evaluation Queue (see the Admin architecture notes) — this
// stands in for that during the prototype so the resubmission loop is demonstrable
// end-to-end. Deterministic per task+version (not random) so the same task always
// tells the same story, and a resubmission visibly scores better than the original.
import { MiniTaskDef } from '../../data/types';
import { MiniTaskEvaluation } from '../types';

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function generateMiniTaskEvaluation(task: MiniTaskDef, versionNumber: number): MiniTaskEvaluation {
  const seed = hashString(task.id) % 3; // 0, 1 or 2 — a stable "baseline strictness" per task
  const resubmissionBonus = versionNumber > 1 ? 2 : 0;

  const criteria = task.evaluationCriteriaTemplate.map((c, i) => {
    const base = 6 + seed + ((i + versionNumber) % 2); // varies per criterion, stays deterministic
    const score = Math.max(3, Math.min(10, base + resubmissionBonus));
    return { label: c.label, maxScore: c.maxScore, score: Math.round((score / 10) * c.maxScore) };
  });

  const totalScore = criteria.reduce((s, c) => s + c.score, 0);
  const totalMax = criteria.reduce((s, c) => s + c.maxScore, 0);
  const ratio = totalScore / totalMax;
  const outcome: 'Passed' | 'Changes Requested' = ratio >= 0.75 ? 'Passed' : 'Changes Requested';

  const weakest = [...criteria].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];

  const feedback =
    outcome === 'Passed'
      ? `Solid submission — requirements are met and the code is in good shape. ${
          versionNumber > 1 ? 'The changes you made addressed the earlier feedback well.' : ''
        }`.trim()
      : `Good progress, but this needs another pass before it's ready. Focus on ${weakest.label.toLowerCase()} — ${
          weakest.label === 'Architecture'
            ? 'pull the repeated logic out into a reusable function/hook.'
            : weakest.label === 'Error Handling'
            ? 'handle the missing-input/failure case explicitly instead of letting it throw.'
            : 'tighten this up before resubmitting.'
        }`;

  return {
    criteria,
    feedback,
    outcome,
    evaluatedAt: new Date().toISOString(),
  };
}
