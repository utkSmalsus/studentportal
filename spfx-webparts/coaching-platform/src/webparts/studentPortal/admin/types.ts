// Admin-only domain entities. These describe the coaching CENTER's operational
// data (courses as products, batches, roster, question bank, evaluation) — as
// opposed to data/types.ts, which describes course CONTENT (what a course IS).
// A CourseMeta + a data/types.ts Course+ModuleDef[] bundle together make one
// full "course" the way an admin thinks about it.
import { ModuleDef, TopicTestQuestionDef, Course, TopicTestDef, ModuleTestDef, AssessmentDef, MiniTaskDef, MajorProjectDef, CodingQuestionDef, Difficulty, ProgressionRules, DEFAULT_PROGRESSION_RULES } from '../data/types';

export { ProgressionRules, DEFAULT_PROGRESSION_RULES };

export type CourseStatus = 'draft' | 'published' | 'archived';
export type TimelineType = 'calendar' | 'weeks' | 'self-paced';
export type ScheduleMode = 'strict' | 'flexible';
export type LearningMode = 'instructor-led' | 'self-paced' | 'hybrid';

export interface CourseTimelineConfig {
  type: TimelineType;
  startDate?: string;
  durationWeeks?: number;
  classDays: string[];
  dailyLearningHours?: number;
  scheduleMode: ScheduleMode;
  learningMode: LearningMode;
}

export const DEFAULT_TIMELINE: CourseTimelineConfig = {
  type: 'self-paced',
  classDays: [],
  scheduleMode: 'flexible',
  learningMode: 'self-paced',
};

// Which week a module/topic is assigned to — the Course Timeline "schedule builder".
export interface WeekAssignment {
  week: number;
  moduleId: string;
}

export type GithubRepositoryStrategy = 'single' | 'major-project';
export type GithubBranchStrategy = 'main' | 'feature' | 'feature-pr';

// A course's GitHub requirements. Off by default for non-development courses;
// development courses seed with GitHub on and required at onboarding — see
// store.ts's DEFAULT_GITHUB_SETTINGS.
export interface CourseGithubSettings {
  enabled: boolean;
  requiredForOnboarding: boolean;
  trainingRepositoryRequired: boolean;
  pullRequestRequired: boolean;
  defaultBranch: string;
  repositoryStrategy: GithubRepositoryStrategy;
  branchStrategy: GithubBranchStrategy;
}

export const DEFAULT_GITHUB_SETTINGS: CourseGithubSettings = {
  enabled: true,
  requiredForOnboarding: true,
  trainingRepositoryRequired: true,
  pullRequestRequired: false,
  defaultBranch: 'main',
  repositoryStrategy: 'single',
  branchStrategy: 'feature',
};

export interface CourseMeta {
  id: string;
  title: string;
  code: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  shortDescription: string;
  estimatedHours: number;
  durationLabel: string;
  status: CourseStatus;
  certificateEnabled: boolean;
  createdDate: string;
  objectives: string[];
  prerequisites: string[];
  timeline: CourseTimelineConfig;
  weekAssignments: WeekAssignment[];
  courseVersion: string;
  // Applied to every new module created in this course; each module can still
  // override it individually from the Curriculum Builder.
  defaultProgressionRules: ProgressionRules;
  githubSettings: CourseGithubSettings;
}

// One full course = its operational meta + its content bundle (data/types.ts shapes).
export interface CourseContent {
  meta: CourseMeta;
  course: Course;
  moduleDefs: ModuleDef[];
  topicTests: TopicTestDef[];
  moduleTests: ModuleTestDef[];
  assessments: AssessmentDef[];
  miniTasks: MiniTaskDef[];
  majorProject: MajorProjectDef;
  codingQuestions: CodingQuestionDef[];
}

// Central Question Bank — a searchable pool an admin picks from when building a
// Topic Test / Module Test / Assessment. Picking a question copies a snapshot
// into that test's own `questions` array (the scoring engine expects embedded
// questions); the bank stays the authoring/search surface, not a live join.
export interface BankQuestion {
  id: string;
  courseId: string;
  moduleId?: string;
  topicId?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty: Difficulty;
  tags: string[];
}

export function bankQuestionToTestQuestion(q: BankQuestion): TopicTestQuestionDef {
  return { id: q.id, text: q.text, options: q.options, correctIndex: q.correctIndex };
}

export type BatchStatus = 'upcoming' | 'active' | 'completed';

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  startDate: string;
  endDate: string;
  scheduleDays: string[];
  scheduleTime: string;
  // A batch may have several mentors; primaryMentorId (if set) must also be
  // present in mentorIds. Students inherit access to all of them via their
  // batch assignment — see admin/repository/mentorRepository.ts.
  mentorIds: string[];
  primaryMentorId?: string;
  status: BatchStatus;
}

// ---- Mentor: a first-class entity, not an "instructor" display string. ----

export type MentorStatus = 'active' | 'inactive';

export interface Mentor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  status: MentorStatus;
  avatarUrl?: string;
  joiningDate: string;
  bio?: string;
}

export type StudentStatus = 'active' | 'paused' | 'completed' | 'dropped';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  courseId: string;
  batchId?: string;
  enrollmentDate: string;
  status: StudentStatus;
  // The one student whose progress is the live AppStateContext in this session.
  // Every other roster row is realistic seed data with no live backing state.
  isLiveDemoStudent?: boolean;
  phone?: string;
  avatarUrl?: string;
  onboardingComplete?: boolean;
}

export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  batchId?: string;
  startDate: string;
  expectedCompletion: string;
  status: EnrollmentStatus;
}

// Shared by both Mini Task and Major Project evaluation queues/rows — see
// admin/repository/submissionRepository.ts and projectSubmissionRepository.ts,
// which now derive every queue row from real per-student StudentProgress
// instead of a roster-wide mock queue.
export type EvaluationStatus = 'Under Review' | 'Changes Requested' | 'Passed';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
}

export type AdminRole = 'admin' | 'mentor' | 'student';

// ---- GitHub integration domain. Kept behind a service abstraction (see
// admin/repository/githubRepository.ts / IGitHubProvider) — components never
// call a GitHub API directly, and no OAuth token is ever stored here. ----

export type GithubConnectionStatus = 'connected' | 'disconnected';

export interface GitHubConnection {
  id: string;
  studentId: string;
  githubUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  connectedAt: string;
  status: GithubConnectionStatus;
}

// A student can have a different training repository per course.
export interface GitHubRepositoryLink {
  id: string;
  studentId: string;
  courseId: string;
  repositoryId: string;
  repositoryName: string; // "owner/repo"
  owner: string;
  defaultBranch: string;
  connectedAt: string;
}

export type GitHubActivityAction = 'push' | 'commit' | 'create_branch' | 'open_pr' | 'merge_pr';

// Evidence of work, never completion — see githubRepository.ts header comment.
export interface GitHubActivityItem {
  id: string;
  studentId: string;
  courseId: string;
  repositoryName: string;
  action: GitHubActivityAction;
  branch?: string;
  message?: string;
  sha?: string;
  prNumber?: number;
  createdAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  branch: string;
  author: string;
  date: string;
  url: string;
}

export type GitHubPullRequestStatus = 'open' | 'merged' | 'closed';

export interface GitHubPullRequest {
  number: number;
  title: string;
  branch: string;
  status: GitHubPullRequestStatus;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubRepositorySnapshot {
  owner: string;
  name: string;
  defaultBranch: string;
  branches: string[];
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
}

export interface CertificateConfig {
  courseId: string;
  name: string;
  prefix: string;
  minAssessmentScorePercent: number;
  requireAllModulesComplete: boolean;
  template: string;
}

export interface NotificationRule {
  id: string;
  event: string;
  description: string;
  enabled: boolean;
}
