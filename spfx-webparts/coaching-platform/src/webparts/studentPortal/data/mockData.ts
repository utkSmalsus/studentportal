// Placeholder data shaped exactly like the real domain model (Course / JourneyItem /
// Submission / Evaluation / Progress from the architecture doc). Swapping this file
// for real calls into the SharePoint-backed API is the only change needed later —
// every page below only depends on these types, never on where the data comes from.
import {
  JourneyItem,
  ModuleProgress,
  DailyCodingStats,
  CodingQuestion,
  MiniTask,
  AssessmentSummary,
  MajorProjectSummary,
  Certificate,
  StudentProfile,
} from './types';

export const courseTitle = 'MERN Full Stack Development';
export const overallProgress = 65;

export const journey: JourneyItem[] = [
  { id: 'html', title: 'HTML', itemType: 'topic', status: 'completed', estimatedDuration: '1 week' },
  { id: 'css', title: 'CSS', itemType: 'topic', status: 'completed', estimatedDuration: '1 week' },
  { id: 'js', title: 'JavaScript', itemType: 'topic', status: 'completed', estimatedDuration: '3 weeks' },
  { id: 'js-assessment', title: 'JavaScript Assessment', itemType: 'assessment', status: 'completed', estimatedDuration: '1 hour' },
  { id: 'js-task', title: 'JavaScript Mini Task', itemType: 'miniTask', status: 'completed', estimatedDuration: '3 days' },
  { id: 'react', title: 'React', itemType: 'topic', status: 'current', estimatedDuration: '3 weeks' },
  { id: 'react-assessment', title: 'React Assessment', itemType: 'assessment', status: 'locked', estimatedDuration: '1 hour' },
  { id: 'react-task', title: 'React Mini Task', itemType: 'miniTask', status: 'locked', estimatedDuration: '4 days' },
  { id: 'node', title: 'Node.js', itemType: 'topic', status: 'locked', estimatedDuration: '2 weeks' },
  { id: 'express', title: 'Express', itemType: 'topic', status: 'locked', estimatedDuration: '2 weeks' },
  { id: 'mongodb', title: 'MongoDB', itemType: 'topic', status: 'locked', estimatedDuration: '2 weeks' },
  { id: 'project', title: 'Full Stack Project', itemType: 'project', status: 'locked', estimatedDuration: '3 weeks' },
];

export const learningProgress: ModuleProgress[] = [
  { title: 'HTML', percent: 100 },
  { title: 'CSS', percent: 90 },
  { title: 'JavaScript', percent: 75 },
  { title: 'React', percent: 40 },
  { title: 'Node.js', percent: 20 },
];

export const dailyCodingStats: DailyCodingStats = {
  attempted: 86,
  solved: 71,
  successRate: 82,
  currentStreak: 12,
  bestStreak: 21,
};

export const codingSchedule: CodingQuestion[] = [
  { day: 1, title: 'Reverse a string', difficulty: 'Beginner', status: 'solved' },
  { day: 10, title: 'Find duplicate values', difficulty: 'Beginner', status: 'solved' },
  { day: 30, title: 'Two Sum', difficulty: 'Beginner', status: 'solved' },
  { day: 50, title: 'Group objects', difficulty: 'Intermediate', status: 'solved' },
  { day: 80, title: 'Recursion basics', difficulty: 'Intermediate', status: 'failed' },
  { day: 86, title: 'Flatten a Nested Array', difficulty: 'Intermediate', status: 'today' },
  { day: 100, title: 'Debouncing', difficulty: 'Advanced', status: 'pending' },
  { day: 120, title: 'Promises', difficulty: 'Advanced', status: 'pending' },
];

export const miniTasks: MiniTask[] = [
  {
    id: 'portfolio',
    title: 'Build a responsive portfolio',
    description: 'A personal portfolio page using semantic HTML and CSS Grid/Flexbox.',
    difficulty: 'Beginner',
    deadline: '2026-06-10',
    status: 'Completed',
    score: 45,
    maxScore: 50,
    feedback: 'Clean structure, good use of semantic tags. Improve mobile breakpoints.',
  },
  {
    id: 'todo',
    title: 'Build a Todo application',
    description: 'A vanilla JS todo app with local storage persistence.',
    difficulty: 'Intermediate',
    deadline: '2026-07-02',
    status: 'Completed',
    score: 39,
    maxScore: 50,
  },
  {
    id: 'react-todo',
    title: 'Build a React Todo Application',
    description: 'Same app, rebuilt with React hooks and component state.',
    difficulty: 'Intermediate',
    deadline: '2026-09-28',
    status: 'Under Review',
  },
  {
    id: 'rest-api',
    title: 'Build a REST API',
    description: 'CRUD API for the Todo app using Express and MongoDB.',
    difficulty: 'Advanced',
    deadline: '2026-10-15',
    status: 'Changes Requested',
    score: 28,
    maxScore: 50,
    feedback: 'Missing input validation on POST /tasks and error handling on DB failures. Resubmit once fixed.',
  },
];

export const assessments: AssessmentSummary[] = [
  { id: 'html-css', title: 'HTML & CSS Fundamentals', totalMarks: 50, passingMarks: 30, timeLimitMinutes: 30, attemptsAllowed: 2, attemptsUsed: 1, bestScore: 44, status: 'passed' },
  { id: 'js-beginner', title: 'JavaScript Beginner', totalMarks: 50, passingMarks: 30, timeLimitMinutes: 45, attemptsAllowed: 2, attemptsUsed: 1, bestScore: 41, status: 'passed' },
  { id: 'js-intermediate', title: 'JavaScript Intermediate', totalMarks: 50, passingMarks: 30, timeLimitMinutes: 45, attemptsAllowed: 2, attemptsUsed: 2, bestScore: 33, status: 'passed' },
  { id: 'js-advanced', title: 'JavaScript Advanced', totalMarks: 50, passingMarks: 30, timeLimitMinutes: 60, attemptsAllowed: 2, attemptsUsed: 1, bestScore: 28, status: 'failed' },
  { id: 'react', title: 'React Assessment', totalMarks: 50, passingMarks: 30, timeLimitMinutes: 45, attemptsAllowed: 2, attemptsUsed: 0, status: 'not-started' },
];

export const majorProject: MajorProjectSummary = {
  title: 'Build a Full Stack E-Commerce Application',
  description: 'A complete MERN application with product catalog, cart, checkout, auth and an admin panel.',
  deadline: '2026-12-15',
  status: 'not-started',
  milestones: [
    { title: 'Requirements & wireframes approved', done: false },
    { title: 'Backend API + auth', done: false },
    { title: 'Frontend catalog + cart', done: false },
    { title: 'Checkout + order flow', done: false },
    { title: 'Deployment + final review', done: false },
  ],
  evaluationCriteria: [
    { label: 'Functionality', score: 0, maxScore: 30 },
    { label: 'Code Quality', score: 0, maxScore: 20 },
    { label: 'UI/UX', score: 0, maxScore: 20 },
    { label: 'Database Design', score: 0, maxScore: 15 },
    { label: 'Deployment', score: 0, maxScore: 15 },
  ],
};

export const certificates: Certificate[] = [
  {
    id: 'html-css-cert',
    courseTitle: 'HTML & CSS Fundamentals (Module Certificate)',
    issuedAt: '2026-05-01',
    fileUrl: '#',
  },
];

export const profile: StudentProfile = {
  name: 'Rahul Sharma',
  course: courseTitle,
  batch: 'MERN-01 · Morning Batch',
  joiningDate: '2026-04-01',
  skills: [
    { label: 'HTML', percent: 100 },
    { label: 'CSS', percent: 90 },
    { label: 'JavaScript', percent: 75 },
    { label: 'React', percent: 40 },
    { label: 'Node.js', percent: 20 },
  ],
};

export const currentLearning = 'React Hooks';
export const todaysChallenge = 'Flatten a Nested Array';
export const currentMiniTask = 'Build a React Todo Application';
