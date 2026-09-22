// Standalone Mini Task submission/evaluation shapes. Storage still lives
// embedded on StudentProgress.miniTasks[taskId].versions (see state/types.ts's
// MiniTaskSubmissionVersion) — ponytail: a fully separate submissions table
// would duplicate the studentId/courseId/taskId scoping StudentProgress
// already gives for free, for no behavioral gain at this phase. What actually
// matters — a submission always belonging to exactly one student+course+task,
// never colliding with another student's attempt at the same task — is true
// today because it's a property of the record it's nested under. These types
// are the STANDALONE VIEW admin/repository/submissionRepository.ts produces
// from that storage, so every caller (queues, mentor review, reports) works
// against one flat shape instead of reaching into StudentProgress by hand.
// Migrating the storage itself to a flat table is a mechanical follow-up once
// a real backend needs to query submissions independently of their student.
import { MiniTaskStatus, MiniTaskEvaluation, ProjectEvaluation } from './types';

export interface MiniTaskSubmission {
  id: string;
  studentId: string;
  courseId: string;
  moduleId: string;
  taskId: string;
  attempt: number;
  repositoryName?: string;
  branch?: string;
  commitSha?: string;
  path?: string;
  pullRequestUrl?: string;
  liveUrl: string;
  notes: string;
  status: MiniTaskStatus;
  submittedAt: string;
  updatedAt: string;
  evaluationId?: string;
  evaluation?: MiniTaskEvaluation;
}

// A standalone evaluation record referencing its submission by id. The
// embedded MiniTaskEvaluation (state/types.ts) is what's actually persisted
// (nested on the submission version); this is the shape a future
// evaluatorId-tracked, independently-queryable evaluations table would use.
export interface MiniTaskEvaluationRecord {
  id: string;
  submissionId: string;
  evaluatorId?: string;
  status: 'Passed' | 'Changes Requested';
  score: number;
  criteria: { label: string; score: number; maxScore: number }[];
  feedback: string;
  evaluatedAt: string;
}

export function submissionId(studentId: string, courseId: string, taskId: string, attempt: number): string {
  return `${studentId}::${courseId}::${taskId}::v${attempt}`;
}

// The Major Project equivalent of MiniTaskSubmission/MiniTaskEvaluationRecord
// above — same rationale: storage stays embedded on StudentProgress.project
// (see state/types.ts's ProjectSubmissionVersion), this is the standalone
// shape admin/repository/projectSubmissionRepository.ts produces from it, one
// per (studentId, courseId) since a course has exactly one Major Project.
export interface ProjectSubmission {
  id: string;
  studentId: string;
  courseId: string;
  projectId: string;
  repositoryName?: string;
  branch?: string;
  commitSha?: string;
  pullRequestUrl?: string;
  liveUrl: string;
  documentationUrl: string;
  submittedAt: string;
  updatedAt: string;
  status: MiniTaskStatus;
  attempt: number;
  evaluationId?: string;
  evaluation?: ProjectEvaluation;
}

export interface ProjectEvaluationRecord {
  id: string;
  submissionId: string;
  evaluatorId?: string;
  status: 'Passed' | 'Changes Requested';
  score: number;
  criteria: { label: string; score: number; maxScore: number }[];
  feedback: string;
  evaluatedAt: string;
}

export function projectSubmissionId(studentId: string, courseId: string, attempt: number): string {
  return `${studentId}::${courseId}::project::v${attempt}`;
}
