// What THIS student has actually done. Combined with data/types.ts content
// definitions by the engine to produce everything a page renders. This is the
// single source of truth — no page keeps its own copy of "is this done".

export type LessonStatus = 'completed' | 'current' | 'upcoming';
export type PracticeStatus = 'completed' | 'current' | 'upcoming';

export interface CodingAttempt {
  code: string;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  scorePercent: number;
  timeComplexity: string;
  whatWentWell: string[];
  whatToImprove: string[];
  explanation: string;
  submittedAt: string;
}

export interface CodingProgressEntry {
  attempts: CodingAttempt[];
}

export type MiniTaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Changes Requested'
  | 'Resubmitted'
  | 'Passed';

export interface MiniTaskEvaluation {
  criteria: { label: string; score: number; maxScore: number }[];
  feedback: string;
  outcome: 'Passed' | 'Changes Requested';
  evaluatedAt: string;
}

export interface MiniTaskSubmissionVersion {
  version: number;
  githubUrl: string;
  liveUrl: string;
  notes: string;
  submittedAt: string;
  evaluation?: MiniTaskEvaluation;
}

export interface MiniTaskProgressEntry {
  status: MiniTaskStatus;
  versions: MiniTaskSubmissionVersion[];
}

export interface AssessmentAttemptRecord {
  attemptNo: number;
  answers: Record<string, number>;
  scorePercent: number;
  passed: boolean;
  strongTopics: string[];
  weakTopics: string[];
  date: string;
}

export interface AssessmentProgressEntry {
  attempts: AssessmentAttemptRecord[];
}

export type MilestoneStatus = 'completed' | 'current' | 'upcoming';

export interface ProjectSubmission {
  githubUrl: string;
  liveUrl: string;
  documentationUrl: string;
  submittedAt: string;
}

export interface ProjectProgressState {
  milestoneStatus: Record<string, MilestoneStatus>;
  submission?: ProjectSubmission;
}

export interface NotificationItem {
  id: string;
  message: string;
  date: string;
  kind: 'info' | 'success' | 'warning';
}

export interface StudentProgressState {
  lessonStatus: Record<string, LessonStatus>;
  practiceStatus: Record<string, PracticeStatus>;
  coding: Record<string, CodingProgressEntry>;
  codingCurrentDay: number;
  codingStreak: { current: number; best: number };
  miniTasks: Record<string, MiniTaskProgressEntry>;
  assessments: Record<string, AssessmentProgressEntry>;
  project: ProjectProgressState;
  notifications: NotificationItem[];
}
