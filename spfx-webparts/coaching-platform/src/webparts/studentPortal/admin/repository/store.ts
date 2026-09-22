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
  CourseContent, CourseMeta, BankQuestion, Batch, StudentRecord, Enrollment,
  DEFAULT_TIMELINE, DEFAULT_PROGRESSION_RULES, DEFAULT_GITHUB_SETTINGS, CertificateConfig, NotificationRule,
  Mentor, GitHubConnection, GitHubRepositoryLink, GitHubActivityItem, GitHubRepositorySnapshot,
} from '../types';
import { Course, ModuleDef, TopicContent, TopicTestDef, ModuleTestDef, AssessmentDef, MiniTaskDef, CodingQuestionDef, MajorProjectDef } from '../../data/types';
import { StudentProgress } from '../../state/types';
import { createInitialProgressState, createEmptyProgressState } from '../../state/initialState';

const STORAGE_KEY = 'coachingPlatform.adminStore.v1';
const STORE_SCHEMA_VERSION = 4;

export interface StoreShape {
  schemaVersion: number;
  activeCourseId: string;
  courses: Record<string, CourseContent>;
  questionBank: BankQuestion[];
  batches: Batch[];
  students: StudentRecord[];
  enrollments: Enrollment[];
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

// A second, independently-authored course — proves the platform is actually
// course-generic (content resolved through courseRepository, never a
// MERN-shaped assumption baked into a page) rather than merely claiming to
// be. Deliberately leaner than MERN (4 modules vs 15+): enough to demo every
// journey stage — module→topic→test, module test, mini task, assessment,
// daily coding, major project — without padding out unnecessary seed data.
function buildSeedPythonCourse(): CourseContent {
  const courseId = 'python-backend';
  const topicContent = (learn: string[], concepts: string[]): TopicContent => ({
    whatYoullLearn: learn,
    keyConcepts: concepts,
    examples: [],
    notes: [],
    resources: [],
  });
  const topicTest = (id: string, moduleId: string, topicId: string, q1: string, q2: string): TopicTestDef => ({
    id, courseId, moduleId, topicId, passingScorePercent: 70,
    questions: [
      { id: `${id}-q1`, text: q1, options: ['Correct answer', 'Wrong option A', 'Wrong option B', 'Wrong option C'], correctIndex: 0 },
      { id: `${id}-q2`, text: q2, options: ['Wrong option A', 'Correct answer', 'Wrong option B', 'Wrong option C'], correctIndex: 1 },
    ],
  });

  const moduleDefs: ModuleDef[] = [
    {
      id: 'py-foundations', courseId, title: 'Python Foundations', group: 'Foundation', estimatedDuration: '2 weeks',
      whatYoullLearn: ['Python syntax and data types', 'Control flow, functions and modules'],
      topics: [
        { id: 'py-syntax', courseId, moduleId: 'py-foundations', title: 'Python Syntax & Data Types', estimatedMinutes: 40, content: topicContent(['Variables and types', 'Strings, lists, dicts'], ['Dynamic typing', 'Mutability']), testId: 'py-syntax-test' },
        { id: 'py-control-flow', courseId, moduleId: 'py-foundations', title: 'Control Flow & Functions', estimatedMinutes: 45, content: topicContent(['if/for/while', 'Defining functions'], ['Scope', 'Default arguments']), testId: 'py-control-flow-test' },
      ],
      practice: [], moduleTestId: 'py-foundations-test',
    },
    {
      id: 'py-oop-data', courseId, title: 'Object-Oriented Python', group: 'Programming', estimatedDuration: '2 weeks',
      whatYoullLearn: ['Classes and objects', 'Collections and file I/O'],
      topics: [
        { id: 'py-oop', courseId, moduleId: 'py-oop-data', title: 'Classes & Objects', estimatedMinutes: 45, content: topicContent(['Defining classes', 'Inheritance'], ['self', 'Encapsulation']), testId: 'py-oop-test' },
        { id: 'py-collections', courseId, moduleId: 'py-oop-data', title: 'Collections & File I/O', estimatedMinutes: 40, content: topicContent(['List/dict comprehensions', 'Reading and writing files'], ['Comprehensions', 'Context managers']), testId: 'py-collections-test' },
      ],
      practice: [], miniTaskId: 'task-py-cli', assessmentId: 'assess-py-foundations', prerequisiteModuleId: 'py-foundations',
    },
    {
      id: 'py-django', courseId, title: 'Django Web Development', group: 'Backend', estimatedDuration: '3 weeks',
      whatYoullLearn: ['Django models and the ORM', 'Views, templates and forms'],
      topics: [
        { id: 'py-django-models', courseId, moduleId: 'py-django', title: 'Django Models & ORM', estimatedMinutes: 50, content: topicContent(['Defining models', 'Querysets'], ['Migrations', 'Relationships']), testId: 'py-django-models-test' },
        { id: 'py-django-views', courseId, moduleId: 'py-django', title: 'Views, Templates & Forms', estimatedMinutes: 50, content: topicContent(['Function-based views', 'Django forms'], ['URL routing', 'Template rendering']), testId: 'py-django-views-test' },
      ],
      practice: [], moduleTestId: 'py-django-test', miniTaskId: 'task-py-api', prerequisiteModuleId: 'py-oop-data',
    },
    {
      id: 'py-rest-db', courseId, title: 'REST APIs & Databases', group: 'Backend', estimatedDuration: '3 weeks',
      whatYoullLearn: ['Building REST APIs with Django REST Framework', 'PostgreSQL and migrations'],
      topics: [
        { id: 'py-drf', courseId, moduleId: 'py-rest-db', title: 'Django REST Framework', estimatedMinutes: 50, content: topicContent(['Serializers', 'ViewSets and routers'], ['Serialization', 'Authentication']), testId: 'py-drf-test' },
        { id: 'py-postgres', courseId, moduleId: 'py-rest-db', title: 'PostgreSQL & Migrations', estimatedMinutes: 45, content: topicContent(['Schema design', 'Running migrations'], ['Indexes', 'Foreign keys']), testId: 'py-postgres-test' },
      ],
      practice: [], assessmentId: 'assess-py-backend', prerequisiteModuleId: 'py-django',
    },
  ];

  const topicTests: TopicTestDef[] = [
    topicTest('py-syntax-test', 'py-foundations', 'py-syntax', 'Which of these is a mutable type in Python?', 'What does `len()` return for a string?'),
    topicTest('py-control-flow-test', 'py-foundations', 'py-control-flow', 'Which keyword defines a function?', 'What does a function return by default with no `return` statement?'),
    topicTest('py-oop-test', 'py-oop-data', 'py-oop', 'What is `self` in a Python method?', 'Which keyword is used for inheritance?'),
    topicTest('py-collections-test', 'py-oop-data', 'py-collections', 'What does a list comprehension produce?', 'Which statement safely closes a file automatically?'),
    topicTest('py-django-models-test', 'py-django', 'py-django-models', 'What generates SQL schema changes from a Django model?', 'What is the Django ORM used for?'),
    topicTest('py-django-views-test', 'py-django', 'py-django-views', 'What renders an HTML template in a Django view?', 'What handles user input validation in Django?'),
    topicTest('py-drf-test', 'py-rest-db', 'py-drf', 'What converts model instances to JSON in DRF?', 'What DRF class handles a full set of CRUD routes?'),
    topicTest('py-postgres-test', 'py-rest-db', 'py-postgres', 'What speeds up lookups on a large table?', 'What links a row in one table to another?'),
  ];

  const moduleTests: ModuleTestDef[] = [
    {
      id: 'py-foundations-test', courseId, moduleId: 'py-foundations', title: 'Python Foundations Module Test', timeLimitMinutes: 20, passingScorePercent: 70, attemptsAllowed: 3,
      questions: [
        { id: 'py-foundations-test-q1', text: 'Which of these is immutable in Python?', options: ['tuple', 'list', 'dict', 'set'], correctIndex: 0 },
        { id: 'py-foundations-test-q2', text: 'What does `range(3)` produce?', options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '1, 2'], correctIndex: 0 },
      ],
    },
    {
      id: 'py-django-test', courseId, moduleId: 'py-django', title: 'Django Fundamentals Module Test', timeLimitMinutes: 20, passingScorePercent: 70, attemptsAllowed: 3,
      questions: [
        { id: 'py-django-test-q1', text: 'What command applies pending migrations?', options: ['manage.py migrate', 'manage.py runserver', 'manage.py shell', 'manage.py test'], correctIndex: 0 },
        { id: 'py-django-test-q2', text: 'Which file maps URLs to views?', options: ['urls.py', 'models.py', 'admin.py', 'settings.py'], correctIndex: 0 },
      ],
    },
  ];

  const assessments: AssessmentDef[] = [
    {
      id: 'assess-py-foundations', courseId, title: 'Python Foundations Assessment', moduleId: 'py-oop-data', topics: ['Syntax', 'OOP'], timeLimitMinutes: 30, passingScorePercent: 60, attemptsAllowed: 2,
      questions: [
        { id: 'assess-py-foundations-q1', topic: 'OOP', text: 'What does `__init__` do in a Python class?', options: ['Initializes a new instance', 'Deletes an instance', 'Imports a module', 'Defines a constant'], correctIndex: 0 },
        { id: 'assess-py-foundations-q2', topic: 'Syntax', text: 'Which of these is a valid dict comprehension?', options: ['{k: v for k, v in items}', '[k: v for k, v in items]', '(k: v for k, v in items)', '{k, v for k, v in items}'], correctIndex: 0 },
      ],
    },
    {
      id: 'assess-py-backend', courseId, title: 'Backend & APIs Assessment', moduleId: 'py-rest-db', topics: ['Django', 'REST', 'Databases'], timeLimitMinutes: 35, passingScorePercent: 60, attemptsAllowed: 2,
      questions: [
        { id: 'assess-py-backend-q1', topic: 'REST', text: 'What HTTP method typically creates a new resource?', options: ['POST', 'GET', 'DELETE', 'OPTIONS'], correctIndex: 0 },
        { id: 'assess-py-backend-q2', topic: 'Databases', text: 'What keyword defines a foreign key relationship in a Django model?', options: ['ForeignKey', 'ManyToMany', 'PrimaryKey', 'Relation'], correctIndex: 0 },
      ],
    },
  ];

  const miniTasks: MiniTaskDef[] = [
    {
      id: 'task-py-cli', courseId, title: 'Build a Python CLI Tool', moduleId: 'py-oop-data', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-10-15',
      objective: 'Build a small command-line tool that reads a CSV file and prints summary statistics.',
      requirements: ['Accept a file path as an argument', 'Handle a missing/invalid file gracefully', 'Print row count and column averages'],
      skills: ['Python', 'File I/O', 'argparse'], resources: [],
      evaluationCriteriaTemplate: [{ label: 'Code Quality', maxScore: 10 }, { label: 'Functionality', maxScore: 10 }, { label: 'Error Handling', maxScore: 10 }],
      githubRequired: true,
    },
    {
      id: 'task-py-api', courseId, title: 'Build a Django REST API', moduleId: 'py-django', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-11-10',
      objective: 'Build a small Django REST Framework API with one model and full CRUD endpoints.',
      requirements: ['A model with at least 3 fields', 'Serializer and ViewSet', 'Registered in a router'],
      skills: ['Django', 'DRF', 'REST APIs'], resources: [],
      evaluationCriteriaTemplate: [{ label: 'Code Quality', maxScore: 10 }, { label: 'API Design', maxScore: 10 }, { label: 'Best Practices', maxScore: 10 }],
      githubRequired: true, pullRequestRequired: true,
    },
  ];

  const codingQuestions: CodingQuestionDef[] = [
    {
      id: 'py-q1', scope: 'course', courseId, day: 1, title: 'Reverse a List', difficulty: 'Beginner', topic: 'Lists', tags: ['Lists'],
      problemStatement: 'Given a list, return it reversed.', exampleInput: '[1,2,3]', exampleOutput: '[3,2,1]',
      constraints: [], hints: ['Slicing with a step of -1 reverses a list.'], testCasesTotal: 5, keywordChecks: ['reverse', 'return'],
    },
    {
      id: 'py-q2', scope: 'course', courseId, day: 8, title: 'Count Word Frequency', difficulty: 'Beginner', topic: 'Dictionaries', tags: ['Dictionaries'],
      problemStatement: 'Given a string, return a dict of word counts.', exampleInput: '"a b a"', exampleOutput: '{"a": 2, "b": 1}',
      constraints: [], hints: ['A dict with .get(word, 0) + 1 works well.'], testCasesTotal: 5, keywordChecks: ['split', 'dict', 'for'],
    },
    {
      id: 'py-q3', scope: 'course', courseId, day: 15, title: 'FizzBuzz', difficulty: 'Beginner', topic: 'Control Flow', tags: ['Loops'],
      problemStatement: 'Print Fizz/Buzz/FizzBuzz for numbers 1 to n.', exampleInput: '15', exampleOutput: 'Fizz, Buzz, FizzBuzz at multiples of 3, 5, 15',
      constraints: [], hints: ['Check divisibility by 15 before 3 or 5.'], testCasesTotal: 6, keywordChecks: ['%', 'for', 'if'],
    },
    {
      id: 'py-q4', scope: 'course', courseId, day: 22, title: 'Two Sum', difficulty: 'Intermediate', topic: 'Dictionaries', tags: ['Dictionaries', 'Arrays'],
      problemStatement: 'Given a list and a target, return indices of two numbers that add to the target.', exampleInput: '[2,7,11,15], 9', exampleOutput: '[0,1]',
      constraints: [], hints: ['A dict of value -> index avoids the O(n²) brute force.'], testCasesTotal: 6, keywordChecks: ['dict', 'for', 'return'],
    },
  ];

  const majorProject: MajorProjectDef = {
    id: `${courseId}-major-project`, courseId, moduleId: 'py-rest-db', title: 'Full Stack Django Capstone', description: 'Design and ship a Django REST API-backed application end to end, from data model to a deployed capstone project.',
    deadlineInDays: 30,
    milestones: [
      { id: 'py-m1', title: 'Data Model & Planning', objectives: ['Define the domain model', 'Plan the API surface'], deliverables: ['ER diagram', 'Endpoint list'] },
      { id: 'py-m2', title: 'API Implementation', objectives: ['Build models, serializers and viewsets', 'Add authentication'], deliverables: ['Working API'] },
      { id: 'py-m3', title: 'Testing & Docs', objectives: ['Write tests for core endpoints', 'Document the API'], deliverables: ['Test suite', 'API docs'] },
      { id: 'py-m4', title: 'Deployment', objectives: ['Deploy the API', 'Connect a Postgres database'], deliverables: ['Live deployment link'] },
    ],
    evaluationCriteriaTemplate: [{ label: 'Code Quality', maxScore: 10 }, { label: 'API Design', maxScore: 10 }, { label: 'Testing', maxScore: 10 }, { label: 'Deployment', maxScore: 10 }],
  };

  const course: Course = { id: courseId, title: 'Python Backend Development', moduleOrder: moduleDefs.map((m) => m.id) };

  const meta: CourseMeta = {
    id: courseId, title: course.title, code: 'PY-2026', category: 'Backend Development', difficulty: 'Intermediate',
    description: 'A backend-focused program covering Python fundamentals, object-oriented programming, Django and REST APIs, ending in a deployed capstone project.',
    shortDescription: 'Become a backend developer with Python and Django.',
    estimatedHours: 200, durationLabel: '10 Weeks', status: 'published', certificateEnabled: true, createdDate: '2026-05-01',
    objectives: ['Write idiomatic, object-oriented Python', 'Build REST APIs with Django REST Framework', 'Model and query relational data with PostgreSQL', 'Ship a deployed backend capstone project'],
    prerequisites: ['Basic computer literacy', 'No prior programming experience required'],
    timeline: { type: 'weeks', startDate: '2026-06-01', durationWeeks: 10, classDays: ['Mon', 'Tue', 'Wed', 'Thu'], dailyLearningHours: 2, scheduleMode: 'flexible', learningMode: 'instructor-led' },
    weekAssignments: course.moduleOrder.map((moduleId, i) => ({ week: i * 2 + 1, moduleId })),
    courseVersion: '1.0', defaultProgressionRules: { ...DEFAULT_PROGRESSION_RULES }, githubSettings: { ...DEFAULT_GITHUB_SETTINGS },
  };

  return { meta, course, moduleDefs, topicTests, moduleTests, assessments, miniTasks, majorProject, codingQuestions };
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

function buildSeedRoster(): Pick<StoreShape, 'batches' | 'students' | 'enrollments' | 'questionBank'> {
  const batches: Batch[] = [
    { id: 'batch-mern-01', name: 'MERN-01 · Morning Batch', courseId: 'mern', startDate: '2026-04-01', endDate: '2026-09-30', scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], scheduleTime: '9:00 AM – 11:00 AM', mentorIds: ['mentor-ananya', 'mentor-vikram'], primaryMentorId: 'mentor-ananya', status: 'active' },
    { id: 'batch-py-01', name: 'PY-01 · Evening Batch', courseId: 'python-backend', startDate: '2026-06-01', endDate: '2026-08-10', scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu'], scheduleTime: '6:00 PM – 8:00 PM', mentorIds: ['mentor-vikram'], primaryMentorId: 'mentor-vikram', status: 'active' },
  ];
  const students: StudentRecord[] = [
    { id: 'student-demo', name: mockData.profile.name, email: 'rahul.sharma@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: mockData.profile.joiningDate, status: 'active', isLiveDemoStudent: true, onboardingComplete: true },
    { id: 'student-2', name: 'Priya Nair', email: 'priya.nair@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-01', status: 'active' },
    { id: 'student-3', name: 'Arjun Mehta', email: 'arjun.mehta@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-02', status: 'active' },
    { id: 'student-4', name: 'Sana Iqbal', email: 'sana.iqbal@example.com', courseId: 'mern', batchId: 'batch-mern-01', enrollmentDate: '2026-04-03', status: 'paused' },
    { id: 'student-5', name: 'Karan Verma', email: 'karan.verma@example.com', courseId: 'python-backend', batchId: 'batch-py-01', enrollmentDate: '2026-06-01', status: 'active' },
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
  const questionBank: BankQuestion[] = [];
  return { batches, students, enrollments, questionBank };
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
  priya.project.status = 'Under Review';
  priya.project.versions = [
    {
      version: 1, githubUrl: 'https://github.com/priya-nair/mern-training', repositoryName: 'priya-nair/mern-training',
      branch: 'feature/ecommerce-frontend', liveUrl: 'https://priya-shop.example.com', documentationUrl: '', submittedAt: '2026-09-17T00:00:00.000Z',
    },
  ];
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

  // Karan (python-backend) — demonstrates the Changes Requested -> resubmit
  // loop on a Mini Task, a scenario MERN's seed doesn't otherwise show.
  const karan = createEmptyProgressState();
  ['py-syntax', 'py-control-flow', 'py-oop', 'py-collections'].forEach((id) => {
    karan.topics[id] = { contentViewed: true, testAttempts: [{ attemptNo: 1, answers: {}, scorePercent: 85, passed: true, date: '2026-06-20T09:00:00.000Z' }] };
  });
  karan.miniTasks['task-py-cli'] = {
    status: 'Changes Requested',
    versions: [
      {
        version: 1, githubUrl: 'https://github.com/karan-verma/python-backend-training', githubRepositoryName: 'karan-verma/python-backend-training',
        githubBranch: 'feature/csv-cli', githubCommitSha: 'f4a9c21', liveUrl: '',
        notes: 'Reads a CSV and prints row count and averages.', submittedAt: '2026-06-28T00:00:00.000Z',
        evaluation: {
          outcome: 'Changes Requested', evaluatedAt: '2026-06-29T00:00:00.000Z',
          feedback: 'Good start, but the tool crashes with a stack trace when the file path is missing — wrap the file read in a try/except and print a clear error instead.',
          criteria: [{ label: 'Code Quality', score: 7, maxScore: 10 }, { label: 'Functionality', score: 7, maxScore: 10 }, { label: 'Error Handling', score: 3, maxScore: 10 }],
        },
      },
    ],
  };
  karan.notifications = [{ id: 'k-n1', message: 'Instructor requested changes on your Python CLI Tool submission.', date: '2026-06-29T00:00:00.000Z', kind: 'warning' }];

  return [
    demo,
    makeProgressRecord('student-2', 'mern', priya),
    makeProgressRecord('student-3', 'mern', arjun),
    makeProgressRecord('student-4', 'mern', sana),
    makeProgressRecord('student-5', 'python-backend', karan),
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
  const python = buildSeedPythonCourse();
  const roster = buildSeedRoster();
  const github = buildSeedGithub();
  const certificates: CertificateConfig[] = [
    { courseId: 'mern', name: 'MERN Full Stack Development — Certificate of Completion', prefix: 'MERN-CERT', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' },
    { courseId: 'python-backend', name: 'Python Backend Development — Certificate of Completion', prefix: 'PY-CERT', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' },
  ];
  const notificationRules: NotificationRule[] = DEFAULT_NOTIFICATION_EVENTS.map((e, i) => ({ id: `nr-${i}`, event: e.event, description: e.description, enabled: true }));
  return {
    schemaVersion: STORE_SCHEMA_VERSION,
    activeCourseId: 'mern',
    courses: { mern, 'python-backend': python },
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

  // Pre-v3 stores never persisted student progress at all — it lived only in
  // React's useReducer state (state/AppStateContext.tsx), never in
  // localStorage, so there is no old single-global record to port field by
  // field. The one-time "migration" here is simply: give every existing
  // roster student a real, scoped StudentProgress row the first time this
  // runs. Guarded by the array's presence, so it only ever runs once.
  if (!s.progressRecords) {
    s.progressRecords = buildSeedProgressRecords().filter((p) => s.students.some((st) => st.id === p.studentId));
  }

  // v3 -> v4: Major Project's `submission?: { githubUrl, liveUrl, documentationUrl,
  // submittedAt }` became a versioned status+versions array, matching Mini
  // Tasks (see state/types.ts's ProjectSubmissionVersion). Port any existing
  // single submission into versions[0] rather than dropping it. Guarded by the
  // new field's presence so it only ever runs once per record, and runs even
  // when progressRecords already existed pre-v4.
  s.progressRecords.forEach((p) => {
    const legacyProject = p.project as unknown as { submission?: { githubUrl: string; liveUrl: string; documentationUrl: string; submittedAt: string }; status?: string; versions?: unknown[] };
    if (legacyProject.versions === undefined) {
      const submission = legacyProject.submission;
      legacyProject.versions = submission ? [{ version: 1, ...submission }] : [];
      legacyProject.status = submission ? 'Under Review' : 'Not Started';
      delete legacyProject.submission;
    }
  });

  // v3 -> v4: Major Project reviews used to live in the roster's rosterEvaluations
  // mock queue (kind: 'project'), disconnected from the student's own
  // StudentProgress. That array is gone from the store shape — any pending
  // project row a v3 store still has on disk is folded into the matching
  // student's progress.project (only if they have no real submission yet, so
  // this never overwrites genuine v4 data) so it keeps surfacing in the
  // Evaluation/Review Queues instead of silently vanishing.
  const legacyRosterEvaluations = (raw as unknown as { rosterEvaluations?: { kind: string; studentId: string; courseId: string; status: string; attempt: number; githubUrl?: string; githubBranch?: string; liveUrl?: string; submittedAt: string }[] }).rosterEvaluations;
  if (legacyRosterEvaluations) {
    legacyRosterEvaluations
      .filter((e) => e.kind === 'project')
      .forEach((e) => {
        const record = s.progressRecords.find((p) => p.studentId === e.studentId && p.courseId === e.courseId);
        if (!record || record.project.versions.length > 0) return;
        record.project.status = e.status as StudentProgress['project']['status'];
        record.project.versions = [
          { version: e.attempt || 1, githubUrl: e.githubUrl || '', repositoryName: e.githubUrl?.replace('https://github.com/', ''), branch: e.githubBranch, liveUrl: e.liveUrl || '', documentationUrl: '', submittedAt: e.submittedAt },
        ];
      });
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
