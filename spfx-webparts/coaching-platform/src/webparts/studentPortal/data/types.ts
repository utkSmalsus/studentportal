// Domain types for the student learning experience. Shaped so a real API/SharePoint
// data source can replace `mockData.ts` later without any UI code changing — every
// page reads these types only, never a hardcoded shape.

export type ModuleStatus = 'completed' | 'current' | 'upcoming' | 'locked' | 'failed';

export type ModuleGroup = 'Foundation' | 'Programming' | 'Frontend' | 'Backend' | 'Full Stack' | 'Capstone';

export interface LearningStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface CourseModule {
  id: string;
  title: string;
  group: ModuleGroup;
  status: ModuleStatus;
  progressPercent: number;
  whatYoullLearn: string[];
  learn: LearningStep[];
  practice: LearningStep[];
  miniTaskId?: string;
  assessmentId?: string;
  prerequisiteModuleId?: string;
}

export interface Course {
  id: string;
  title: string;
  currentWeek: number;
  currentModuleId: string;
}

// ---- Daily Coding (independent of the course journey) ----

export type CodingQuestionStatus = 'solved' | 'failed' | 'pending' | 'today';
export type CodingDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CodingQuestion {
  id: string;
  day: number;
  title: string;
  difficulty: CodingDifficulty;
  topic: string;
  tags: string[];
  status: CodingQuestionStatus;
  problemStatement: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string[];
  testCasesTotal: number;
  testCasesPassed?: number;
  scorePercent?: number;
  timeComplexity?: string;
  feedback?: string;
}

export interface WeekDayStatus {
  day: string;
  status: 'solved' | 'missed' | 'today' | 'upcoming';
}

// ---- Mini Tasks ----

export type MiniTaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Changes Requested'
  | 'Resubmitted'
  | 'Passed';

export interface EvaluationCriterion {
  label: string;
  score: number;
  maxScore: number;
}

export interface Evaluation {
  criteria: EvaluationCriterion[];
  feedback: string;
  status: 'Changes Requested' | 'Approved';
  evaluatedAt: string;
}

export interface MiniTask {
  id: string;
  title: string;
  moduleId: string;
  difficulty: CodingDifficulty;
  estimatedDuration: string;
  deadline: string;
  objective: string;
  requirements: { label: string; done: boolean }[];
  skills: string[];
  status: MiniTaskStatus;
  submission?: { githubUrl: string; liveUrl: string; notes: string };
  evaluation?: Evaluation;
}

// ---- Assessments ----

export interface AssessmentAttempt {
  attemptNo: number;
  scorePercent: number;
  date: string;
}

export interface Assessment {
  id: string;
  title: string;
  moduleId: string;
  topics: string[];
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScorePercent: number;
  attemptsAllowed: number;
  attempts: AssessmentAttempt[];
  status: 'not-started' | 'in-progress' | 'passed' | 'failed';
  strongAreas: string[];
  needsImprovement: string[];
}

// ---- Major Project ----

export interface Milestone {
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface MajorProject {
  title: string;
  subtitle: string;
  progressPercent: number;
  milestones: Milestone[];
  currentMilestone: string;
  deadlineInDays: number;
  evaluationCriteria: EvaluationCriterion[];
}

// ---- Feedback & Performance ----

export interface RecentFeedback {
  id: string;
  sourceType: 'miniTask' | 'assessment' | 'project';
  sourceId: string;
  title: string;
  status: string;
  comment: string;
}

export type SkillLevel = 'Strong' | 'Developing' | 'Not Started';

export interface SkillRating {
  label: string;
  level: SkillLevel;
}

export interface StudentProfile {
  name: string;
  course: string;
  batch: string;
  joiningDate: string;
}
