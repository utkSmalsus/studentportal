// The Major Project mirror of submissionRepository.ts — same boundary rule:
// UI/admin/mentor code reads a Major Project submission through here, never by
// reaching into StudentProgress.project.versions directly. See
// state/submissionTypes.ts for why storage stays embedded rather than a fully
// separate table.
import { ProjectSubmission } from '../../state/submissionTypes';
import { ProjectEvaluation } from '../../state/types';
import * as progressRepository from './progressRepository';
import { getCourseContent } from './courseRepository';

const PENDING_STATUSES = ['Under Review', 'Submitted', 'Resubmitted'];

export function getProjectSubmission(studentId: string, courseId: string): ProjectSubmission | undefined {
  const progress = progressRepository.getProgress(studentId, courseId);
  const content = getCourseContent(courseId);
  if (!progress || !content || progress.project.versions.length === 0) return undefined;
  const latest = progress.project.versions[progress.project.versions.length - 1];
  return {
    id: `${studentId}::${courseId}::project::v${latest.version}`,
    studentId,
    courseId,
    projectId: content.majorProject.id,
    repositoryName: latest.repositoryName,
    branch: latest.branch,
    commitSha: latest.commitSha,
    pullRequestUrl: latest.pullRequestUrl,
    liveUrl: latest.liveUrl,
    documentationUrl: latest.documentationUrl,
    submittedAt: latest.submittedAt,
    updatedAt: latest.evaluation?.evaluatedAt || latest.submittedAt,
    status: progress.project.status,
    attempt: latest.version,
    evaluation: latest.evaluation,
  };
}

// Every (studentId, courseId) pair's Major Project submission still awaiting a
// mentor decision — the project equivalent of submissionRepository's
// listPendingSubmissions, built the same way.
export function listPendingProjectSubmissions(studentIds: string[], courseId: string): ProjectSubmission[] {
  const rows: ProjectSubmission[] = [];
  studentIds.forEach((studentId) => {
    const submission = getProjectSubmission(studentId, courseId);
    if (submission && PENDING_STATUSES.indexOf(submission.status) !== -1) rows.push(submission);
  });
  return rows;
}

// Applies a mentor/admin's decision to a specific student+course's Major
// Project submission — never the caller's own (possibly unrelated) progress.
export function evaluateProjectSubmission(
  studentId: string,
  courseId: string,
  attempt: number,
  input: { criteria: { label: string; score: number; maxScore: number }[]; feedback: string; outcome: 'Passed' | 'Changes Requested' }
): void {
  if (!getCourseContent(courseId)) throw new Error(`Cannot evaluate a project submission: course "${courseId}" does not exist.`);
  const evaluation: ProjectEvaluation = { criteria: input.criteria, feedback: input.feedback, outcome: input.outcome, evaluatedAt: new Date().toISOString() };
  progressRepository.dispatch(studentId, courseId, { type: 'ADMIN_EVALUATE_PROJECT', version: attempt, evaluation });
}
