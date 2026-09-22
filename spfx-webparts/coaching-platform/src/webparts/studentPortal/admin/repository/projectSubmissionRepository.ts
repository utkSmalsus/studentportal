// The Major Project mirror of submissionRepository.ts — same boundary rule:
// UI/admin/mentor code reads a Major Project submission through here, never by
// reaching into StudentProgress.project.versions directly. See
// state/submissionTypes.ts for why storage stays embedded rather than a fully
// separate table.
import { ProjectSubmission, projectSubmissionId } from '../../state/submissionTypes';
import { ProjectEvaluation, ProjectSubmissionVersion, MiniTaskStatus } from '../../state/types';
import * as progressRepository from './progressRepository';
import { getCourseContent } from './courseRepository';

const PENDING_STATUSES = ['Under Review', 'Submitted', 'Resubmitted'];

function toSubmission(studentId: string, courseId: string, projectId: string, version: ProjectSubmissionVersion, isLatest: boolean, overallStatus: MiniTaskStatus): ProjectSubmission {
  return {
    id: projectSubmissionId(studentId, courseId, version.version),
    studentId,
    courseId,
    projectId,
    repositoryName: version.repositoryName,
    branch: version.branch,
    commitSha: version.commitSha,
    pullRequestUrl: version.pullRequestUrl,
    liveUrl: version.liveUrl,
    documentationUrl: version.documentationUrl,
    submittedAt: version.submittedAt,
    updatedAt: version.evaluation?.evaluatedAt || version.submittedAt,
    // Only the latest attempt carries the record's live status (Under Review /
    // Passed / Changes Requested) — an older, superseded attempt is evidence
    // only, exactly like submissionRepository treats superseded Mini Task
    // versions, so history never reads as if it were still awaiting review.
    status: isLatest ? overallStatus : version.evaluation?.outcome || 'Changes Requested',
    attempt: version.version,
    evaluation: version.evaluation,
  };
}

// Every submission attempt for this student+course's Major Project, oldest
// first — the audit/history view. Never mutated; a resubmission only ever
// appends a new version (see progressReducer.ts's SUBMIT_PROJECT).
export function listProjectSubmissions(studentId: string, courseId: string): ProjectSubmission[] {
  const progress = progressRepository.getProgress(studentId, courseId);
  const content = getCourseContent(courseId);
  if (!progress || !content) return [];
  const lastIndex = progress.project.versions.length - 1;
  return progress.project.versions.map((v, i) => toSubmission(studentId, courseId, content.majorProject.id, v, i === lastIndex, progress.project.status));
}

export function getProjectSubmission(studentId: string, courseId: string): ProjectSubmission | undefined {
  const submissions = listProjectSubmissions(studentId, courseId);
  return submissions[submissions.length - 1];
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
