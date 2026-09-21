// The admin data store: the single in-memory "database" behind every repository
// in this folder. Holds ALL courses (each fully independent — see clone()), plus
// the operational roster data (question bank, batches, students, enrollments).
//
// The ACTIVE course (the one the live demo student is enrolled in) is mirrored
// in place into data/mockData.ts's exported arrays/objects on every commit, via
// splice/Object.assign — never reassignment. That is what lets every existing
// student page keep importing `moduleDefs`, `course`, `topicTests`, etc. from
// mockData.ts completely unchanged while still being backed by admin-editable,
// persisted data. mockData.ts is therefore best understood as a materialized
// view of "whichever course is currently active", not a static seed.
//
// Persisted to localStorage so admin edits survive a refresh in this dev/demo
// environment. Swapping this file for a real SharePoint-backed store later is
// the only change needed — nothing above the repository layer should notice.
import * as mockData from '../../data/mockData';
import { CourseContent, CourseMeta, BankQuestion, Batch, StudentRecord, Enrollment, RosterEvaluationItem, DEFAULT_TIMELINE, DEFAULT_PROGRESSION_RULES, CertificateConfig, NotificationRule } from '../types';

const STORAGE_KEY = 'coachingPlatform.adminStore.v1';

export interface StoreShape {
  activeCourseId: string;
  courses: Record<string, CourseContent>;
  questionBank: BankQuestion[];
  batches: Batch[];
  students: StudentRecord[];
  enrollments: Enrollment[];
  rosterEvaluations: RosterEvaluationItem[];
  certificates: CertificateConfig[];
  notificationRules: NotificationRule[];
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function buildSeedMernCourse(): CourseContent {
  const meta: CourseMeta = {
    id: 'mern',
    title: mockData.course.title,
    code: 'MERN-2026',
    category: 'Full Stack Development',
    difficulty: 'Intermediate',
    description:
      'A complete MERN stack program covering HTML, CSS, JavaScript, React, Node.js, Express and MongoDB, ending in a full stack capstone project.',
    shortDescription: 'Become a full stack MERN developer.',
    estimatedHours: 420,
    durationLabel: '6 Months',
    status: 'published',
    certificateEnabled: true,
    createdDate: '2026-03-01',
    objectives: [
      'Build production-ready React applications',
      'Design and build REST APIs with Node.js and Express',
      'Model application data with MongoDB',
      'Ship a full stack capstone project end to end',
    ],
    prerequisites: ['Basic computer literacy', 'No prior programming experience required'],
    timeline: {
      type: 'weeks',
      startDate: '2026-04-01',
      durationWeeks: 24,
      classDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dailyLearningHours: 2,
      scheduleMode: 'flexible',
      learningMode: 'instructor-led',
    },
    weekAssignments: mockData.course.moduleOrder.map((moduleId, i) => ({ week: Math.floor(i * 1.5) + 1, moduleId })),
    courseVersion: '1.0',
    defaultProgressionRules: { ...DEFAULT_PROGRESSION_RULES },
  };
  return {
    meta,
    course: clone(mockData.course),
    moduleDefs: clone(mockData.moduleDefs),
    topicTests: clone(mockData.topicTests),
    moduleTests: clone(mockData.moduleTests),
    assessments: clone(mockData.assessments),
    miniTasks: clone(mockData.miniTasks),
    majorProject: clone(mockData.majorProject),
    codingQuestions: clone(mockData.codingQuestions),
  };
}

export function buildEmptyCourse(id: string, title: string, code: string): CourseContent {
  return {
    meta: {
      id,
      title,
      code,
      category: '',
      difficulty: 'Beginner',
      description: '',
      shortDescription: '',
      estimatedHours: 0,
      durationLabel: '',
      status: 'draft',
      certificateEnabled: false,
      createdDate: new Date().toISOString().slice(0, 10),
      objectives: [],
      prerequisites: [],
      timeline: { ...DEFAULT_TIMELINE },
      weekAssignments: [],
      courseVersion: '1.0',
      defaultProgressionRules: { ...DEFAULT_PROGRESSION_RULES },
    },
    course: { id, title, moduleOrder: [] },
    moduleDefs: [],
    topicTests: [],
    moduleTests: [],
    assessments: [],
    miniTasks: [],
    majorProject: { moduleId: '', title: '', description: '', deadlineInDays: 0, milestones: [], evaluationCriteriaTemplate: [] },
    codingQuestions: [],
  };
}

function buildSeedRoster(): Pick<StoreShape, 'batches' | 'students' | 'enrollments' | 'rosterEvaluations' | 'questionBank'> {
  const batches: Batch[] = [
    { id: 'batch-mern-01', name: 'MERN-01 · Morning Batch', courseId: 'mern', startDate: '2026-04-01', endDate: '2026-09-30', scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '9:00 AM – 11:00 AM', instructor: 'Ananya Rao', status: 'active' },
  ];
  const students: StudentRecord[] = [
    { id: 'student-demo', name: mockData.profile.name, email: 'rahul.sharma@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: mockData.profile.joiningDate, status: 'active', isLiveDemoStudent: true },
    { id: 'student-2', name: 'Priya Nair', email: 'priya.nair@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-01', status: 'active' },
    { id: 'student-3', name: 'Arjun Mehta', email: 'arjun.mehta@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-02', status: 'active' },
    { id: 'student-4', name: 'Sana Iqbal', email: 'sana.iqbal@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-03', status: 'paused' },
  ];
  const enrollments: Enrollment[] = students.map((s, i) => ({
    id: `enroll-${i + 1}`,
    studentId: s.id,
    courseId: s.courseId,
    batchId: s.batchId,
    startDate: s.enrollmentDate,
    expectedCompletion: '2026-09-30',
    status: 'active',
  }));
  const rosterEvaluations: RosterEvaluationItem[] = [
    { id: 'reval-1', kind: 'miniTask', studentId: 'student-2', courseId: 'mern', moduleId: 'react-hooks', title: 'Build a React Todo Application', submittedAt: '2026-09-19', status: 'Under Review', attempt: 1, githubUrl: 'https://github.com/priya/react-todo', liveUrl: 'https://priya-todo.example.com', notes: 'First pass, feedback welcome.' },
    { id: 'reval-2', kind: 'miniTask', studentId: 'student-3', courseId: 'mern', moduleId: 'node', title: 'Build a Node CLI Tool', submittedAt: '2026-09-18', status: 'Under Review', attempt: 1, githubUrl: 'https://github.com/arjun/node-cli' },
    { id: 'reval-3', kind: 'project', studentId: 'student-2', courseId: 'mern', moduleId: 'major-project', title: 'Full Stack E-Commerce Application — Frontend Milestone', submittedAt: '2026-09-17', status: 'Under Review', attempt: 1, githubUrl: 'https://github.com/priya/ecommerce', liveUrl: 'https://priya-shop.example.com' },
  ];
  const questionBank: BankQuestion[] = [];
  return { batches, students, enrollments, rosterEvaluations, questionBank };
}

const DEFAULT_NOTIFICATION_EVENTS: { event: string; description: string }[] = [
  { event: 'studentSubmission', description: 'Student submitted a Mini Task or Project' },
  { event: 'evaluationCompleted', description: 'Evaluation completed' },
  { event: 'changesRequested', description: 'Changes requested on a submission' },
  { event: 'assessmentPassed', description: 'Assessment passed' },
  { event: 'assessmentFailed', description: 'Assessment failed' },
  { event: 'moduleUnlocked', description: 'Module unlocked' },
  { event: 'coursePublished', description: 'Course published' },
  { event: 'batchStarting', description: 'Batch starting soon' },
  { event: 'deadlineApproaching', description: 'Deadline approaching' },
];

function buildSeedState(): StoreShape {
  const mern = buildSeedMernCourse();
  const roster = buildSeedRoster();
  const certificates: CertificateConfig[] = [
    { courseId: 'mern', name: 'MERN Full Stack Development — Certificate of Completion', prefix: 'MERN-CERT', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' },
  ];
  const notificationRules: NotificationRule[] = DEFAULT_NOTIFICATION_EVENTS.map((e, i) => ({ id: `nr-${i}`, event: e.event, description: e.description, enabled: true }));
  return {
    activeCourseId: 'mern',
    courses: { mern },
    ...roster,
    certificates,
    notificationRules,
  };
}

function loadPersisted(): StoreShape | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || !parsed.courses || !parsed.activeCourseId) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export const state: StoreShape = loadPersisted() || buildSeedState();

function save(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ponytail: best-effort dev persistence — a full/blocked localStorage just
    // means edits don't survive a refresh, not a functional failure.
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Mirrors the active course's content into data/mockData.ts's live bindings —
// see file header. Called by every repository mutation via commit().
function syncActiveCourseToMockData(): void {
  const active = state.courses[state.activeCourseId];
  if (!active) return;
  Object.assign(mockData.course, clone(active.course));
  mockData.moduleDefs.splice(0, mockData.moduleDefs.length, ...clone(active.moduleDefs));
  mockData.topicTests.splice(0, mockData.topicTests.length, ...clone(active.topicTests));
  mockData.moduleTests.splice(0, mockData.moduleTests.length, ...clone(active.moduleTests));
  mockData.assessments.splice(0, mockData.assessments.length, ...clone(active.assessments));
  mockData.miniTasks.splice(0, mockData.miniTasks.length, ...clone(active.miniTasks));
  Object.assign(mockData.majorProject, clone(active.majorProject));
  mockData.codingQuestions.splice(0, mockData.codingQuestions.length, ...clone(active.codingQuestions));
  mockData.profile.course = active.meta.title;
}

// Call after any mutation. Pass the courseId that was mutated so we only pay
// for the mockData sync when it actually affects the active course.
export function commit(mutatedCourseId?: string): void {
  if (!mutatedCourseId || mutatedCourseId === state.activeCourseId) {
    syncActiveCourseToMockData();
  }
  save();
  listeners.forEach((l) => l());
}

// Make sure mockData reflects whatever course is active right now (covers the
// very first load, where courses['mern'] was cloned FROM mockData so the two
// already agree — this only matters after a localStorage restore where the
// active course might not be 'mern').
syncActiveCourseToMockData();
