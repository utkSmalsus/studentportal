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
  instructor: string;
  status: BatchStatus;
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

export type EvaluationKind = 'miniTask' | 'project';
export type EvaluationStatus = 'Under Review' | 'Changes Requested' | 'Passed';

// A queue row for the roster (non-live) students. The live demo student's
// evaluation queue entries are derived directly from AppStateContext instead —
// see admin/repository/evaluationRepository.ts.
export interface RosterEvaluationItem {
  id: string;
  kind: EvaluationKind;
  studentId: string;
  courseId: string;
  moduleId: string;
  title: string;
  submittedAt: string;
  status: EvaluationStatus;
  attempt: number;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
  feedback?: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
}

export type AdminRole = 'admin' | 'instructor' | 'student';

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
