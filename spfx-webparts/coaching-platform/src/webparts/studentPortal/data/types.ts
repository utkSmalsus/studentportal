export type JourneyItemStatus =
  | 'completed'
  | 'current'
  | 'locked'
  | 'failed'
  | 'pendingEvaluation'
  | 'resubmissionRequired';

export interface JourneyItem {
  id: string;
  title: string;
  itemType: 'topic' | 'assessment' | 'miniTask' | 'project';
  status: JourneyItemStatus;
  estimatedDuration: string;
}

export interface ModuleProgress {
  title: string;
  percent: number;
}

export interface DailyCodingStats {
  attempted: number;
  solved: number;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
}

export interface CodingQuestion {
  day: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'solved' | 'failed' | 'pending' | 'today';
}

export type SubmissionStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Passed'
  | 'Failed'
  | 'Changes Requested'
  | 'Completed';

export interface MiniTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string;
  status: SubmissionStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
}

export interface AssessmentSummary {
  id: string;
  title: string;
  totalMarks: number;
  passingMarks: number;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  bestScore?: number;
  status: 'not-started' | 'in-progress' | 'passed' | 'failed';
}

export interface ProjectMilestone {
  title: string;
  done: boolean;
}

export interface MajorProjectSummary {
  title: string;
  description: string;
  deadline: string;
  status: SubmissionStatus | 'not-started';
  milestones: ProjectMilestone[];
  evaluationCriteria: { label: string; score: number; maxScore: number }[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  fileUrl: string;
}

export interface StudentProfile {
  name: string;
  course: string;
  batch: string;
  joiningDate: string;
  skills: { label: string; percent: number }[];
}
