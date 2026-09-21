// Content definitions only — what a course IS, never what a particular student has
// done with it. Progress/attempt state lives in state/types.ts and is combined with
// these definitions by the engine. This split is what lets a real backend replace
// mockData.ts later without touching the engine or any page.

export type ModuleGroup = 'Foundation' | 'Programming' | 'Frontend' | 'Backend' | 'Full Stack' | 'Capstone';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface PracticeDef {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

// ---- Topics: the real learning unit. Video + content + a lightweight quiz gate. ----

export interface TopicContent {
  whatYoullLearn: string[];
  keyConcepts: string[];
  examples: string[];
  notes: string[];
  resources: string[];
}

export interface TopicTestQuestionDef {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

// Deliberately lighter than a full Assessment — a handful of questions checking
// whether the student absorbed THIS topic, not a formal exam.
export interface TopicTestDef {
  id: string;
  topicId: string;
  passingScorePercent: number;
  questions: TopicTestQuestionDef[];
}

export interface TopicDef {
  id: string;
  moduleId: string;
  title: string;
  estimatedMinutes: number;
  // Configured through data, never hardcoded in a component — this is what lets an
  // admin attach/change a lesson video later without touching UI code. Undefined is
  // a valid, expected state ("video coming soon"), not an error.
  youtubeVideoId?: string;
  content: TopicContent;
  testId: string;
}

// A full exam-style check spanning every topic in the module — heavier than a topic
// test, lighter than the course Assessment. Sits between "all topics done" and
// "assessment unlocked" in the module completion flow.
export interface ModuleTestDef {
  id: string;
  moduleId: string;
  title: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: TopicTestQuestionDef[];
}

export interface ModuleDef {
  id: string;
  title: string;
  group: ModuleGroup;
  estimatedDuration: string;
  whatYoullLearn: string[];
  topics: TopicDef[];
  practice: PracticeDef[];
  miniTaskId?: string;
  moduleTestId?: string;
  assessmentId?: string;
  // A module with no prerequisite is unlocked from day one. Everything else stays
  // locked until the engine confirms the prerequisite module is complete.
  prerequisiteModuleId?: string;
}

export interface Course {
  id: string;
  title: string;
  // Canonical module sequence for this course — the engine walks this order to find
  // "the" module a student should be working on. Same shape works for SPFx: a course
  // is just an id, a title and an ordered list of module ids.
  moduleOrder: string[];
}

// ---- Daily Coding (independent of the course journey) ----

export interface CodingQuestionDef {
  id: string;
  day: number;
  title: string;
  difficulty: Difficulty;
  topic: string;
  tags: string[];
  problemStatement: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string[];
  hints: string[];
  testCasesTotal: number;
  // Substrings the mock evaluator looks for to decide how "complete" a solution
  // looks. A real execution service would replace evaluateCodingSubmission()
  // entirely; this is what makes the mock evaluator swappable rather than a
  // hardcoded pass/fail.
  keywordChecks: string[];
}

// ---- Mini Tasks ----

export interface MiniTaskDef {
  id: string;
  title: string;
  moduleId: string;
  difficulty: Difficulty;
  estimatedDuration: string;
  deadline: string;
  objective: string;
  requirements: string[];
  skills: string[];
  resources: string[];
  evaluationCriteriaTemplate: { label: string; maxScore: number }[];
}

// ---- Assessments ----

export interface AssessmentQuestionDef {
  id: string;
  topic: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface AssessmentDef {
  id: string;
  title: string;
  moduleId: string;
  topics: string[];
  timeLimitMinutes: number;
  passingScorePercent: number;
  attemptsAllowed: number;
  questions: AssessmentQuestionDef[];
}

// ---- Major Project ----

export interface MilestoneDef {
  id: string;
  title: string;
  objectives: string[];
  deliverables: string[];
}

export interface MajorProjectDef {
  moduleId: string;
  title: string;
  description: string;
  deadlineInDays: number;
  milestones: MilestoneDef[];
  evaluationCriteriaTemplate: { label: string; maxScore: number }[];
}

export interface StudentProfile {
  name: string;
  course: string;
  batch: string;
  joiningDate: string;
}
