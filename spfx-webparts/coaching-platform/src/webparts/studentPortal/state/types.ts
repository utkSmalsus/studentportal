// What THIS student has actually done. Combined with data/types.ts content
// definitions by the engine to produce everything a page renders. This is the
// single source of truth — no page keeps its own copy of "is this done".

export type PracticeStatus = 'completed' | 'current' | 'upcoming';

// A lightweight scored attempt shared by Topic Tests and Module Tests — neither
// needs the full Assessment shape (no strong/weak topic breakdown), just a score.
export interface QuizAttemptRecord {
  attemptNo: number;
  answers: Record<string, number>;
  scorePercent: number;
  passed: boolean;
  date: string;
}

export interface TopicProgressEntry {
  contentViewed: boolean;
  testAttempts: QuizAttemptRecord[];
}

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
  // Structured GitHub evidence captured alongside the URL — repository/branch/
  // commit is what the mentor actually reviews. See admin/types.ts GitHubConnection
  // /GitHubRepositoryLink for the connection this is drawn from. A GitHub commit
  // existing here is evidence of activity, never a completion signal by itself —
  // only a mentor's evaluation (below) decides pass/fail.
  githubRepositoryName?: string;
  githubBranch?: string;
  githubCommitSha?: string;
  githubPullRequestUrl?: string;
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
  topics: Record<string, TopicProgressEntry>;
  practiceStatus: Record<string, PracticeStatus>;
  coding: Record<string, CodingProgressEntry>;
  codingCurrentDay: number;
  codingStreak: { current: number; best: number };
  miniTasks: Record<string, MiniTaskProgressEntry>;
  moduleTests: Record<string, { attempts: QuizAttemptRecord[] }>;
  assessments: Record<string, AssessmentProgressEntry>;
  project: ProjectProgressState;
  notifications: NotificationItem[];
}

// A student's progress is always scoped to ONE course — this is the record
// studentProgressRepository actually stores/returns. StudentProgressState above
// stays the "what has this student done in this course" shape; this just adds
// the identity/audit fields around it. See admin/repository/progressRepository.ts.
export interface StudentProgress extends StudentProgressState {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}
