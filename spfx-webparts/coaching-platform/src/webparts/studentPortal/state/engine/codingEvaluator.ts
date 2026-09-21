// Mock code evaluator. This is a deliberate stand-in for a real execution/judge
// service — the entire mock lives behind this one function, so swapping in a real
// sandboxed runner later means replacing evaluateCodingSubmission's body only;
// nothing that calls it needs to change.
//
// It judges a submission heuristically: does it look non-trivial, and does it use
// the vocabulary you'd expect a correct solution to use (evaluated per-question via
// keywordChecks). This means different code genuinely produces different results —
// an empty/placeholder submission fails outright, a submission touching most of the
// expected vocabulary passes most tests, nothing here hardcodes "submission = 100%".
import { CodingQuestionDef } from '../../data/types';
import { CodingAttempt } from '../types';

export function evaluateCodingSubmission(question: CodingQuestionDef, code: string): CodingAttempt {
  const trimmed = code.trim();
  const normalized = trimmed.toLowerCase();
  const looksLikeARealAttempt = trimmed.length > 40 && /return/.test(normalized);

  const keywordHits = question.keywordChecks.filter((k) => normalized.includes(k.toLowerCase())).length;
  const keywordRatio = question.keywordChecks.length ? keywordHits / question.keywordChecks.length : 1;

  let passedTests: number;
  if (!looksLikeARealAttempt) {
    passedTests = 0;
  } else {
    const coverage = Math.min(1, 0.35 + keywordRatio * 0.65);
    passedTests = Math.round(question.testCasesTotal * coverage);
  }
  passedTests = Math.max(0, Math.min(question.testCasesTotal, passedTests));

  const scorePercent = Math.round((passedTests / question.testCasesTotal) * 100);
  const passed = passedTests === question.testCasesTotal;

  const whatWentWell: string[] = [];
  const whatToImprove: string[] = [];

  if (looksLikeARealAttempt) whatWentWell.push('Solution has a clear structure with a return value.');
  if (keywordRatio >= 0.5) whatWentWell.push(`Uses the approach expected for ${question.topic.toLowerCase()} problems.`);
  if (whatWentWell.length === 0) whatWentWell.push('Attempt submitted — structure needs work before it can pass tests.');

  if (!looksLikeARealAttempt) {
    whatToImprove.push('This looks like a placeholder — write the actual logic before submitting.');
  } else if (keywordRatio < 1) {
    whatToImprove.push(`Consider using: ${question.keywordChecks.filter((k) => !normalized.includes(k.toLowerCase())).join(', ')}.`);
  }
  if (!passed && passedTests > 0) {
    whatToImprove.push('Check edge cases — some test cases are still failing.');
  }

  const complexityGuess = normalized.includes('for') && normalized.includes('for', normalized.indexOf('for') + 3)
    ? 'O(n²)'
    : 'O(n)';

  const explanation = passed
    ? `Your solution handles the ${question.topic.toLowerCase()} case correctly and passes all ${question.testCasesTotal} test cases.`
    : `Your solution passes ${passedTests} of ${question.testCasesTotal} test cases. Review the ${question.topic.toLowerCase()} approach in the hints before retrying.`;

  return {
    code,
    passed,
    passedTests,
    totalTests: question.testCasesTotal,
    scorePercent,
    timeComplexity: complexityGuess,
    whatWentWell,
    whatToImprove,
    explanation,
    submittedAt: new Date().toISOString(),
  };
}
