// The standalone-shaped view over Mini Task submissions (see
// state/submissionTypes.ts for why storage stays embedded on StudentProgress
// while this gives every caller a flat MiniTaskSubmission to work with).
// This is what the Evaluation Queue (admin) and Review Queue (mentor) pages
// consume instead of reaching into StudentProgress.miniTasks by hand — so a
// submission is always resolved through its student+course+task scope, and
// two students' attempts at the same task can never be confused.
import { MiniTaskSubmission, submissionId } from '../../state/submissionTypes';
import { MiniTaskEvaluation } from '../../state/types';
import * as progressRepository from './progressRepository';
import { assertModuleBelongsToCourse } from './validation';
import { getCourseContent } from './courseRepository';

const PENDING_STATUSES = ['Under Review', 'Submitted', 'Resubmitted'];

export function listSubmissionsForStudent(studentId: string, courseId: string): MiniTaskSubmission[] {
  const progress = progressRepository.getProgress(studentId, courseId);
  const content = getCourseContent(courseId);
  if (!progress || !content) return [];
  const submissions: MiniTaskSubmission[] = [];
  Object.keys(progress.miniTasks).forEach((taskId) => {
    const entry = progress.miniTasks[taskId];
    const task = content.miniTasks.find((t) => t.id === taskId);
    if (!task || entry.versions.length === 0) return;
    entry.versions.forEach((v) => {
      submissions.push({
        id: submissionId(studentId, courseId, taskId, v.version),
        studentId,
        courseId,
        moduleId: task.moduleId,
        taskId,
        attempt: v.version,
        repositoryName: v.githubRepositoryName,
        branch: v.githubBranch,
        commitSha: v.githubCommitSha,
        pullRequestUrl: v.githubPullRequestUrl,
        liveUrl: v.liveUrl,
        notes: v.notes,
        status: v.version === entry.versions.length ? entry.status : 'Changes Requested',
        submittedAt: v.submittedAt,
        updatedAt: v.evaluation?.evaluatedAt || v.submittedAt,
        evaluation: v.evaluation,
      });
    });
  });
  return submissions;
}

// Every (studentId, courseId) pair's latest-attempt submissions still awaiting
// a mentor decision. This is the query an evaluation queue is built from.
export function listPendingSubmissions(studentIds: string[], courseId: string): MiniTaskSubmission[] {
  const rows: MiniTaskSubmission[] = [];
  studentIds.forEach((studentId) => {
    const submissions = listSubmissionsForStudent(studentId, courseId);
    const byTask = new Map<string, MiniTaskSubmission>();
    submissions.forEach((s) => {
      const current = byTask.get(s.taskId);
      if (!current || s.attempt > current.attempt) byTask.set(s.taskId, s);
    });
    byTask.forEach((latest) => {
      if (PENDING_STATUSES.indexOf(latest.status) !== -1) rows.push(latest);
    });
  });
  return rows;
}

export function getSubmission(studentId: string, courseId: string, taskId: string, attempt: number): MiniTaskSubmission | undefined {
  return listSubmissionsForStudent(studentId, courseId).find((s) => s.taskId === taskId && s.attempt === attempt);
}

// Applies a mentor/admin's decision to a specific student+course+task
// submission — never the caller's OWN (possibly unrelated) progress record.
export function evaluateSubmission(
  studentId: string,
  courseId: string,
  taskId: string,
  attempt: number,
  input: { criteria: { label: string; score: number; maxScore: number }[]; feedback: string; outcome: 'Passed' | 'Changes Requested' }
): void {
  const content = getCourseContent(courseId);
  const task = content?.miniTasks.find((t) => t.id === taskId);
  if (task) assertModuleBelongsToCourse(courseId, task.moduleId);
  const evaluation: MiniTaskEvaluation = { criteria: input.criteria, feedback: input.feedback, outcome: input.outcome, evaluatedAt: new Date().toISOString() };
  progressRepository.dispatch(studentId, courseId, { type: 'ADMIN_EVALUATE_MINI_TASK', taskId, version: attempt, evaluation });
}
