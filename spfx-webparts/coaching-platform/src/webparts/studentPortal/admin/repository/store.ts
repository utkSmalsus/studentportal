// The admin data store: the single in-memory "database" behind every repository
// in this folder. Holds ALL courses (each fully independent — see clone()), plus
// the operational roster data (question bank, batches, mentors, students,
// enrollments, GitHub connections/links/activity).
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
import {
  CourseContent, CourseMeta, BankQuestion, Batch, StudentRecord, Enrollment, RosterEvaluationItem,
  DEFAULT_TIMELINE, DEFAULT_PROGRESSION_RULES, DEFAULT_GITHUB_SETTINGS, CertificateConfig, NotificationRule,
  Mentor, GitHubConnection, GitHubRepositoryLink, GitHubActivityItem, GitHubRepositorySnapshot,
} from '../types';
import { StudentProgress } from '../../state/types';
import { createInitialProgressState, createEmptyProgressState } from '../../state/initialState';

const STORAGE_KEY = 'coachingPlatform.adminStore.v1';
const STORE_SCHEMA_VERSION = 3;

export interface StoreShape {
  schemaVersion: number;
  activeCourseId: string;
  courses: Record<string, CourseContent>;
  questionBank: BankQuestion[];
  batches: Batch[];
  students: StudentRecord[];
  enrollments: Enrollment[];
  rosterEvaluations: RosterEvaluationItem[];
  certificates: CertificateConfig[];
  notificationRules: NotificationRule[];
  mentors: Mentor[];
  githubConnections: GitHubConnection[];
  githubRepositoryLinks: GitHubRepositoryLink[];
  githubActivities: GitHubActivityItem[];
  // Keyed by "owner/repo" — the simulated GitHub-side state (branches/commits/
  // PRs) the mock provider serves. See admin/repository/githubRepository.ts.
  githubRepoSnapshots: Record<string, GitHubRepositorySnapshot>;
  // One record per (studentId, courseId) — see admin/repository/progressRepository.ts.
  // This, not a single global StudentProgressState, is the source of truth for
  // what any given student has done in any given course.
  progressRecords: StudentProgress[];
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
    githubSettings: { ...DEFAULT_GITHUB_SETTINGS },
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
      githubSettings: { ...DEFAULT_GITHUB_SETTINGS },
    },
    course: { id, title, moduleOrder: [] },
    moduleDefs: [],
    topicTests: [],
    moduleTests: [],
    assessments: [],
    miniTasks: [],
    majorProject: { id: `${id}-major-project`, courseId: id, moduleId: '', title: '', description: '', deadlineInDays: 0, milestones: [], evaluationCriteriaTemplate: [] },
    codingQuestions: [],
  };
}

function buildSeedMentors(): Mentor[] {
  return [
    { id: 'mentor-ananya', name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 90000 11111', specialization: 'Full Stack Development', experience: '6 years', status: 'active', joiningDate: '2025-01-15', bio: 'Full stack engineer turned mentor, focused on React and Node.js.' },
    { id: 'mentor-vikram', name: 'Vikram Desai', email: 'vikram.desai@example.com', phone: '+91 90000 22222', specialization: 'Backend & Databases', experience: '8 years', status: 'active', joiningDate: '2025-03-01', bio: 'Backend specialist with a focus on API design and MongoDB.' },
  ];
}

function buildSeedRoster(): Pick<StoreShape, 'batches' | 'students' | 'enrollments' | 'rosterEvaluations' | 'questionBank'> {
  const batches: Batch[] = [
    { id: 'batch-mern-01', name: 'MERN-01 · Morning Batch', courseId: 'mern', startDate: '2026-04-01', endDate: '2026-09-30', scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '9:00 AM – 11:00 AM', mentorIds: ['mentor-ananya', 'mentor-vikram'], primaryMentorId: 'mentor-ananya', status: 'active' },
  ];
  const students: StudentRecord[] = [
    { id: 'student-demo', name: mockData.profile.name, email: 'rahul.sharma@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: mockData.profile.joiningDate, status: 'active', isLiveDemoStudent: true, onboardingComplete: true },
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
  // Mini Task rows no longer live here — see admin/repository/submissionRepository.ts,
  // which reads real per-student StudentProgress instead. Major Project reviews
  // still use this array (ProjectProgressState has no evaluation-status field yet).
  const rosterEvaluations: RosterEvaluationItem[] = [
    { id: 'reval-3', kind: 'project', studentId: 'student-2', courseId: 'mern', moduleId: 'major-project', title: 'Full Stack E-Commerce Application — Frontend Milestone', submittedAt: '2026-09-17', status: 'Under Review', attempt: 1, githubUrl: 'https://github.com/priya-nair/mern-training', githubBranch: 'feature/ecommerce-frontend', liveUrl: 'https://priya-shop.example.com' },
  ];
  const questionBank: BankQuestion[] = [];
  return { batches, students, enrollments, rosterEvaluations, questionBank };
}

function makeProgressRecord(studentId: string, courseId: string, state: ReturnType<typeof createEmptyProgressState>): StudentProgress {
  const now = new Date().toISOString();
  return { id: `${studentId}::${courseId}`, studentId, courseId, createdAt: now, updatedAt: now, ...state };
}

// Every roster student gets a REAL progress record so Mentor Portal/Evaluation
// Queue reflect genuine per-student data instead of the old static
// rosterEvaluations rows. student-demo keeps the full rich narrative; the
// others are lighter but still real (their own topics/mini task submissions).
function buildSeedProgressRecords(): StudentProgress[] {
  const demo = makeProgressRecord('student-demo', 'mern', createInitialProgressState());

  const priya = createEmptyProgressState();
  ['html-t1', 'html-t2', 'css-t1', 'css-t2', 'js-basics-t1', 'js-basics-t2', 'js-basics-t3'].forEach((id) => {
    priya.topics[id] = { contentViewed: true, testAttempts: [{ attemptNo: 1, answers: {}, scorePercent: 88, passed: true, date: '2026-08-01T09:00:00.000Z' }] };
  });
  priya.miniTasks['task-react-todo'] = {
    status: 'Under Review',
    versions: [
      {
        version: 1, githubUrl: 'https://github.com/priya-nair/mern-training', githubRepositoryName: 'priya-nair/mern-training',
        githubBranch: 'feature/react-todo', githubCommitSha: 'a82f31c', liveUrl: 'https://priya-todo.example.com',
        notes: 'First pass, feedback welcome.', submittedAt: '2026-09-19T00:00:00.000Z',
      },
    ],
  };
  priya.project.milestoneStatus = { m1: 'completed', m2: 'completed', m3: 'completed', m4: 'completed', m5: 'current', m6: 'upcoming', m7: 'upcoming', m8: 'upcoming' };
  priya.project.submission = { githubUrl: 'https://github.com/priya-nair/mern-training', liveUrl: 'https://priya-shop.example.com', documentationUrl: '', submittedAt: '2026-09-17T00:00:00.000Z' };
  priya.notifications = [{ id: 'p-n1', message: '"Build a React Todo Application" submitted for review.', date: '2026-09-19T00:00:00.000Z', kind: 'success' }];

  const arjun = createEmptyProgressState();
  ['html-t1', 'html-t2', 'css-t1', 'css-t2', 'js-basics-t1', 'js-basics-t2', 'js-basics-t3', 'js-intermediate-t1', 'js-intermediate-t2', 'js-intermediate-t3'].forEach((id) => {
    arjun.topics[id] = { contentViewed: true, testAttempts: [{ attemptNo: 1, answers: {}, scorePercent: 80, passed: true, date: '2026-08-15T09:00:00.000Z' }] };
  });
  arjun.miniTasks['task-node-cli'] = {
    status: 'Under Review',
    versions: [
      {
        version: 1, githubUrl: 'https://github.com/arjun-mehta/mern-training', githubRepositoryName: 'arjun-mehta/mern-training',
        githubBranch: 'feature/node-cli', githubCommitSha: 'e91b04d', liveUrl: '',
        notes: '', submittedAt: '2026-09-18T00:00:00.000Z',
      },
    ],
  };
  arjun.notifications = [{ id: 'a-n1', message: '"Build a Node CLI Tool" submitted for review.', date: '2026-09-18T00:00:00.000Z', kind: 'success' }];

  const sana = createEmptyProgressState();
  sana.topics['html-t1'] = { contentViewed: true, testAttempts: [] };

  return [
    demo,
    makeProgressRecord('student-2', 'mern', priya),
    makeProgressRecord('student-3', 'mern', arjun),
    makeProgressRecord('student-4', 'mern', sana),
  ];
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
  { event: 'githubConnected', description: 'Student connected their GitHub account' },
  { event: 'repositoryLinked', description: 'Student linked a training repository' },
  { event: 'studentFallingBehind', description: 'Student falling behind expected schedule' },
];

// Seeds the mock GitHub "server-side" state for the live demo student's
// training repository, so Mentor Student Detail / student GitHub views have
// real (simulated) commits/branches/PRs to show from the very first load.
function buildSeedGithub(): Pick<StoreShape, 'githubConnections' | 'githubRepositoryLinks' | 'githubActivities' | 'githubRepoSnapshots'> {
  const owner = 'rahul-sharma';
  const repoName = 'mern-training';
  const fullName = `${owner}/${repoName}`;
  const connection: GitHubConnection = {
    id: 'ghc-demo', studentId: 'student-demo', githubUserId: 'gh-1001', username: owner, displayName: mockData.profile.name,
    avatarUrl: `https://avatars.githubusercontent.com/u/1001?v=4`, connectedAt: '2026-04-01T09:00:00.000Z', status: 'connected',
  };
  const link: GitHubRepositoryLink = {
    id: 'ghl-demo', studentId: 'student-demo', courseId: 'mern', repositoryId: 'repo-1', repositoryName: fullName, owner, defaultBranch: 'main', connectedAt: '2026-04-01T09:05:00.000Z',
  };
  const commits = [
    { sha: 'a1b2c3d', message: 'Initial course setup', branch: 'main', author: mockData.profile.name, date: '2026-04-02T10:00:00.000Z', url: `https://github.com/${fullName}/commit/a1b2c3d` },
    { sha: 'b2c3d4e', message: 'Complete HTML exercises', branch: 'main', author: mockData.profile.name, date: '2026-04-10T10:00:00.000Z', url: `https://github.com/${fullName}/commit/b2c3d4e` },
    { sha: 'c3d4e5f', message: 'Implement array utilities', branch: 'feature/js-intermediate', author: mockData.profile.name, date: '2026-06-01T10:00:00.000Z', url: `https://github.com/${fullName}/commit/c3d4e5f` },
    { sha: 'a82f31c', message: 'Build React Todo application', branch: 'feature/react-todo', author: mockData.profile.name, date: '2026-08-30T10:42:00.000Z', url: `https://github.com/${fullName}/commit/a82f31c` },
    { sha: 'e91b04d', message: 'Implement Node CLI tool', branch: 'feature/node-cli', author: mockData.profile.name, date: '2026-09-18T09:10:00.000Z', url: `https://github.com/${fullName}/commit/e91b04d` },
  ];
  const pullRequests = [
    { number: 12, title: 'React Todo Application', branch: 'feature/react-todo', status: 'open' as const, createdAt: '2026-08-30T11:00:00.000Z', updatedAt: '2026-08-30T11:00:00.000Z', url: `https://github.com/${fullName}/pull/12` },
    { number: 15, title: 'Node CLI Tool', branch: 'feature/node-cli', status: 'open' as const, createdAt: '2026-09-18T09:30:00.000Z', updatedAt: '2026-09-18T09:30:00.000Z', url: `https://github.com/${fullName}/pull/15` },
  ];
  const snapshot: GitHubRepositorySnapshot = {
    owner, name: repoName, defaultBranch: 'main', branches: ['main', 'feature/react-todo', 'feature/node-api', 'feature/js-intermediate', 'feature/node-cli'], commits, pullRequests,
  };
  const activities: GitHubActivityItem[] = [
    { id: 'gha-1', studentId: 'student-demo', courseId: 'mern', repositoryName: fullName, action: 'push', branch: 'feature/node-cli', message: 'Implement Node CLI tool', sha: 'e91b04d', createdAt: '2026-09-18T09:10:00.000Z' },
    { id: 'gha-2', studentId: 'student-demo', courseId: 'mern', repositoryName: fullName, action: 'open_pr', branch: 'feature/node-cli', prNumber: 15, createdAt: '2026-09-18T09:30:00.000Z' },
    { id: 'gha-3', studentId: 'student-demo', courseId: 'mern', repositoryName: fullName, action: 'push', branch: 'feature/react-todo', message: 'Build React Todo application', sha: 'a82f31c', createdAt: '2026-08-30T10:42:00.000Z' },
  ];
  return {
    githubConnections: [connection],
    githubRepositoryLinks: [link],
    githubActivities: activities,
    githubRepoSnapshots: { [fullName]: snapshot },
  };
}

function buildSeedState(): StoreShape {
  const mern = buildSeedMernCourse();
  const roster = buildSeedRoster();
  const github = buildSeedGithub();
  const certificates: CertificateConfig[] = [
    { courseId: 'mern', name: 'MERN Full Stack Development — Certificate of Completion', prefix: 'MERN-CERT', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' },
  ];
  const notificationRules: NotificationRule[] = DEFAULT_NOTIFICATION_EVENTS.map((e, i) => ({ id: `nr-${i}`, event: e.event, description: e.description, enabled: true }));
  return {
    schemaVersion: STORE_SCHEMA_VERSION,
    activeCourseId: 'mern',
    courses: { mern },
    ...roster,
    certificates,
    notificationRules,
    mentors: buildSeedMentors(),
    ...github,
    progressRecords: buildSeedProgressRecords(),
  };
}

// Backwards-compatible migration: a store persisted by an earlier version of
// this app may be missing fields this version now requires (mentors, GitHub
// collections, courseId on content entities, mentorIds on batches, …).
// Detects gaps and backfills sane defaults in place — never drops existing
// content or progress. Runs on every load, seeded or restored, so it also
// covers a freshly-built seed if buildSeedState ever falls behind the shape.
function migrate(raw: StoreShape): StoreShape {
  const s = raw;
  if (!s.mentors) s.mentors = [];
  if (!s.githubConnections) s.githubConnections = [];
  if (!s.githubRepositoryLinks) s.githubRepositoryLinks = [];
  if (!s.githubActivities) s.githubActivities = [];
  if (!s.githubRepoSnapshots) s.githubRepoSnapshots = {};
  if (!s.certificates) s.certificates = [];
  if (!s.notificationRules) s.notificationRules = [];
  if (!s.questionBank) s.questionBank = [];
  if (!s.rosterEvaluations) s.rosterEvaluations = [];

  // Pre-v3 stores never persisted student progress at all — it lived only in
  // React's useReducer state (state/AppStateContext.tsx), never in
  // localStorage, so there is no old single-global record to port field by
  // field. The one-time "migration" here is simply: give every existing
  // roster student a real, scoped StudentProgress row the first time this
  // runs. Guarded by the array's presence, so it only ever runs once.
  if (!s.progressRecords) {
    s.progressRecords = buildSeedProgressRecords().filter((p) => s.students.some((st) => st.id === p.studentId));
  }

  // Students that existed before onboarding tracking was added are already
  // mid-course — treat them as already onboarded rather than forcing the wizard.
  s.students.forEach((student) => {
    if (student.onboardingComplete === undefined) student.onboardingComplete = true;
  });

  // Old Batch.instructor (a display string) -> a real seeded Mentor record,
  // referenced by id instead of duplicated as text on every batch.
  s.batches.forEach((b) => {
    const legacy = b as unknown as { instructor?: string; mentorIds?: string[]; primaryMentorId?: string };
    if (!legacy.mentorIds) {
      let mentorId: string | undefined;
      if (legacy.instructor) {
        const existing = s.mentors.find((m) => m.name === legacy.instructor);
        if (existing) {
          mentorId = existing.id;
        } else {
          const created: Mentor = {
            id: `mentor-${legacy.instructor.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: legacy.instructor,
            email: `${legacy.instructor.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
            status: 'active',
            joiningDate: b.startDate || new Date().toISOString().slice(0, 10),
          };
          s.mentors.push(created);
          mentorId = created.id;
        }
      }
      b.mentorIds = mentorId ? [mentorId] : [];
      b.primaryMentorId = mentorId;
      delete legacy.instructor;
    }
  });

  Object.keys(s.courses).forEach((courseId) => {
    const c = s.courses[courseId];
    if (!c.meta.githubSettings) c.meta.githubSettings = { ...DEFAULT_GITHUB_SETTINGS };
    if (!c.meta.defaultProgressionRules) c.meta.defaultProgressionRules = { ...DEFAULT_PROGRESSION_RULES };
    c.moduleDefs.forEach((m) => {
      const mm = m as unknown as { courseId?: string };
      if (!mm.courseId) mm.courseId = courseId;
      m.topics.forEach((t) => {
        const tt = t as unknown as { courseId?: string };
        if (!tt.courseId) tt.courseId = courseId;
      });
      m.practice.forEach((p) => {
        const pp = p as unknown as { courseId?: string; moduleId?: string };
        if (!pp.courseId) pp.courseId = courseId;
        if (!pp.moduleId) pp.moduleId = m.id;
      });
    });
    c.topicTests.forEach((t) => {
      const tt = t as unknown as { courseId?: string; moduleId?: string };
      if (!tt.courseId) tt.courseId = courseId;
      if (!tt.moduleId) tt.moduleId = c.moduleDefs.find((m) => m.topics.some((top) => top.id === t.topicId))?.id || '';
    });
    c.moduleTests.forEach((t) => {
      const tt = t as unknown as { courseId?: string };
      if (!tt.courseId) tt.courseId = courseId;
    });
    c.assessments.forEach((a) => {
      const aa = a as unknown as { courseId?: string };
      if (!aa.courseId) aa.courseId = courseId;
    });
    c.miniTasks.forEach((t) => {
      const tt = t as unknown as { courseId?: string; githubRequired?: boolean };
      if (!tt.courseId) tt.courseId = courseId;
      if (tt.githubRequired === undefined) tt.githubRequired = false;
    });
    c.codingQuestions.forEach((q) => {
      const qq = q as unknown as { scope?: string; courseId?: string };
      if (!qq.scope) {
        qq.scope = 'course';
        qq.courseId = courseId;
      }
    });
    const mp = c.majorProject as unknown as { id?: string; courseId?: string };
    if (!mp.id) mp.id = `${courseId}-major-project`;
    if (!mp.courseId) mp.courseId = courseId;
  });

  s.schemaVersion = STORE_SCHEMA_VERSION;
  return s;
}

function loadPersisted(): StoreShape | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || !parsed.courses || !parsed.activeCourseId) return undefined;
    return migrate(parsed);
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
