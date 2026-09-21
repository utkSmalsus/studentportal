// Realistic, interconnected placeholder data — mini tasks and assessments reference
// real module ids, the daily-coding feed is independent of the course, and the
// performance numbers are derived from these same records (see selectors.ts) rather
// than being separately hand-typed. This is what makes the app feel like one working
// product instead of disconnected demo screens.
import {
  Course,
  CourseModule,
  CodingQuestion,
  WeekDayStatus,
  MiniTask,
  Assessment,
  MajorProject,
  RecentFeedback,
  StudentProfile,
} from './types';

export const course: Course = {
  id: 'mern',
  title: 'MERN Full Stack Development',
  currentWeek: 9,
  currentModuleId: 'react-hooks',
};

export const profile: StudentProfile = {
  name: 'Rahul Sharma',
  course: course.title,
  batch: 'MERN-01 · Morning Batch',
  joiningDate: '2026-04-01',
};

export const modules: CourseModule[] = [
  {
    id: 'html', title: 'HTML', group: 'Foundation', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Semantic HTML', 'Forms', 'Tables', 'Accessibility basics'],
    learn: [
      { id: 'html-l1', title: 'Document structure & semantics', status: 'completed' },
      { id: 'html-l2', title: 'Forms & inputs', status: 'completed' },
    ],
    practice: [
      { id: 'html-p1', title: 'Build a semantic article page', status: 'completed' },
      { id: 'html-p2', title: 'Build a registration form', status: 'completed' },
    ],
    miniTaskId: 'task-html',
  },
  {
    id: 'css', title: 'CSS', group: 'Foundation', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Box model', 'Flexbox', 'Grid', 'Responsive design'],
    learn: [
      { id: 'css-l1', title: 'Box model & selectors', status: 'completed' },
      { id: 'css-l2', title: 'Flexbox & Grid', status: 'completed' },
    ],
    practice: [
      { id: 'css-p1', title: 'Build a responsive nav bar', status: 'completed' },
    ],
    miniTaskId: 'task-css',
    assessmentId: 'assess-html-css',
    prerequisiteModuleId: 'html',
  },
  {
    id: 'js-basics', title: 'JavaScript Basics', group: 'Programming', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Variables & data types', 'Operators & conditions', 'Loops', 'Functions'],
    learn: [
      { id: 'jsb-l1', title: 'Variables, types & operators', status: 'completed' },
      { id: 'jsb-l2', title: 'Conditions & loops', status: 'completed' },
      { id: 'jsb-l3', title: 'Functions', status: 'completed' },
    ],
    practice: [
      { id: 'jsb-p1', title: 'FizzBuzz & loop drills', status: 'completed' },
      { id: 'jsb-p2', title: 'Function exercises', status: 'completed' },
    ],
    assessmentId: 'assess-js-basics',
    prerequisiteModuleId: 'css',
  },
  {
    id: 'js-intermediate', title: 'JavaScript Intermediate', group: 'Programming', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Array methods', 'Object manipulation', 'Destructuring', 'Spread / rest', 'Higher-order functions'],
    learn: [
      { id: 'jsi-l1', title: 'Array methods (map, filter, reduce)', status: 'completed' },
      { id: 'jsi-l2', title: 'Objects, destructuring & spread', status: 'completed' },
      { id: 'jsi-l3', title: 'Higher-order functions', status: 'completed' },
    ],
    practice: [
      { id: 'jsi-p1', title: 'Array method drills', status: 'completed' },
      { id: 'jsi-p2', title: 'Object transformation exercises', status: 'completed' },
      { id: 'jsi-p3', title: 'Build a small utility library', status: 'completed' },
    ],
    miniTaskId: 'task-js-utils',
    assessmentId: 'assess-js-intermediate',
    prerequisiteModuleId: 'js-basics',
  },
  {
    id: 'js-advanced', title: 'JavaScript Advanced', group: 'Programming', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Closures', 'The event loop', 'Promises & async/await', 'Debouncing & throttling'],
    learn: [
      { id: 'jsa-l1', title: 'Closures & scope', status: 'completed' },
      { id: 'jsa-l2', title: 'The event loop', status: 'completed' },
      { id: 'jsa-l3', title: 'Promises & async/await', status: 'completed' },
    ],
    practice: [
      { id: 'jsa-p1', title: 'Closure & async drills', status: 'completed' },
    ],
    assessmentId: 'assess-js-advanced',
    prerequisiteModuleId: 'js-intermediate',
  },
  {
    id: 'react', title: 'React', group: 'Frontend', status: 'completed', progressPercent: 100,
    whatYoullLearn: ['Components & props', 'State', 'Rendering & the virtual DOM'],
    learn: [
      { id: 'react-l1', title: 'Components & props', status: 'completed' },
      { id: 'react-l2', title: 'State & events', status: 'completed' },
    ],
    practice: [
      { id: 'react-p1', title: 'Build a component library', status: 'completed' },
    ],
    miniTaskId: 'task-react-components',
    assessmentId: 'assess-react',
    prerequisiteModuleId: 'js-advanced',
  },
  {
    id: 'react-hooks', title: 'React Hooks', group: 'Frontend', status: 'current', progressPercent: 65,
    whatYoullLearn: ['useState & useEffect', 'Custom hooks', 'Forms with hooks', 'Data fetching'],
    learn: [
      { id: 'rh-l1', title: 'useState & useEffect', status: 'completed' },
      { id: 'rh-l2', title: 'Custom hooks', status: 'completed' },
      { id: 'rh-l3', title: 'Data fetching patterns', status: 'current' },
    ],
    practice: [
      { id: 'rh-p1', title: 'Build a useLocalStorage hook', status: 'completed' },
      { id: 'rh-p2', title: 'Build a useFetch hook', status: 'current' },
    ],
    miniTaskId: 'task-react-todo',
    assessmentId: 'assess-react-hooks',
    prerequisiteModuleId: 'react',
  },
  {
    id: 'state-management', title: 'State Management', group: 'Frontend', status: 'upcoming', progressPercent: 0,
    whatYoullLearn: ['Context API', 'Lifting state up', 'Intro to external state libraries'],
    learn: [{ id: 'sm-l1', title: 'Context API', status: 'upcoming' }],
    practice: [{ id: 'sm-p1', title: 'Global theme/auth context', status: 'upcoming' }],
    prerequisiteModuleId: 'react-hooks',
  },
  {
    id: 'react-projects', title: 'React Projects', group: 'Frontend', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Combining hooks, context and routing into a real app'],
    learn: [{ id: 'rp-l1', title: 'Routing with React Router', status: 'upcoming' }],
    practice: [{ id: 'rp-p1', title: 'Multi-page project', status: 'upcoming' }],
    prerequisiteModuleId: 'state-management',
  },
  {
    id: 'node', title: 'Node.js', group: 'Backend', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Node runtime & modules', 'npm', 'File system & streams'],
    learn: [{ id: 'node-l1', title: 'Node fundamentals', status: 'upcoming' }],
    practice: [{ id: 'node-p1', title: 'Build a CLI tool', status: 'upcoming' }],
    miniTaskId: 'task-node-cli',
    assessmentId: 'assess-node',
    prerequisiteModuleId: 'react-projects',
  },
  {
    id: 'express', title: 'Express.js', group: 'Backend', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Routing', 'Middleware', 'Error handling'],
    learn: [{ id: 'exp-l1', title: 'Routing & middleware', status: 'upcoming' }],
    practice: [{ id: 'exp-p1', title: 'Build a small REST server', status: 'upcoming' }],
    miniTaskId: 'task-express-api',
    prerequisiteModuleId: 'node',
  },
  {
    id: 'mongodb', title: 'MongoDB', group: 'Backend', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Documents & collections', 'CRUD', 'Mongoose schemas'],
    learn: [{ id: 'mongo-l1', title: 'Documents, collections & CRUD', status: 'upcoming' }],
    practice: [{ id: 'mongo-p1', title: 'Model a small app schema', status: 'upcoming' }],
    miniTaskId: 'task-mongo-schema',
    prerequisiteModuleId: 'express',
  },
  {
    id: 'rest-apis', title: 'REST APIs', group: 'Full Stack', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['API design', 'Status codes', 'Connecting frontend to backend'],
    learn: [{ id: 'rest-l1', title: 'API design principles', status: 'upcoming' }],
    practice: [{ id: 'rest-p1', title: 'Connect React app to Express API', status: 'upcoming' }],
    prerequisiteModuleId: 'mongodb',
  },
  {
    id: 'authentication', title: 'Authentication', group: 'Full Stack', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['JWT', 'Sessions', 'Protecting routes'],
    learn: [{ id: 'auth-l1', title: 'JWT & sessions', status: 'upcoming' }],
    practice: [{ id: 'auth-p1', title: 'Add login/signup to your app', status: 'upcoming' }],
    prerequisiteModuleId: 'rest-apis',
  },
  {
    id: 'deployment', title: 'Deployment', group: 'Full Stack', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Environment configs', 'Hosting frontend & backend', 'CI basics'],
    learn: [{ id: 'dep-l1', title: 'Hosting & environment configs', status: 'upcoming' }],
    practice: [{ id: 'dep-p1', title: 'Deploy a full stack app', status: 'upcoming' }],
    prerequisiteModuleId: 'authentication',
  },
  {
    id: 'major-project', title: 'Major Project', group: 'Capstone', status: 'locked', progressPercent: 0,
    whatYoullLearn: ['Bringing every module together into one real application'],
    learn: [], practice: [],
    prerequisiteModuleId: 'deployment',
  },
];

// ---- Daily Coding ----

export const codingQuestions: CodingQuestion[] = [
  {
    id: 'q1', day: 1, title: 'Reverse a String', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    status: 'solved', problemStatement: 'Given a string, return it reversed.', exampleInput: '"hello"', exampleOutput: '"olleh"',
    constraints: ['1 <= s.length <= 10^4'], testCasesTotal: 6, testCasesPassed: 6, scorePercent: 100, timeComplexity: 'O(n)',
  },
  {
    id: 'q2', day: 10, title: 'Count Vowels', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    status: 'solved', problemStatement: 'Count the number of vowels in a string.', exampleInput: '"coaching"', exampleOutput: '3',
    constraints: [], testCasesTotal: 5, testCasesPassed: 5, scorePercent: 100, timeComplexity: 'O(n)',
  },
  {
    id: 'q3', day: 20, title: 'Find the Largest Number', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays'],
    status: 'solved', problemStatement: 'Return the largest number in an array.', exampleInput: '[3,9,2]', exampleOutput: '9',
    constraints: [], testCasesTotal: 5, testCasesPassed: 5, scorePercent: 100, timeComplexity: 'O(n)',
  },
  {
    id: 'q4', day: 30, title: 'Two Sum', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays', 'Hash Map'],
    status: 'solved', problemStatement: 'Return indices of the two numbers that add up to a target.', exampleInput: '[2,7,11,15], target=9', exampleOutput: '[0,1]',
    constraints: [], testCasesTotal: 8, testCasesPassed: 8, scorePercent: 100, timeComplexity: 'O(n)',
  },
  {
    id: 'q5', day: 38, title: 'Balanced Parentheses', difficulty: 'Intermediate', topic: 'Stacks', tags: ['Stacks'],
    status: 'failed', problemStatement: 'Check whether a string of brackets is balanced.', exampleInput: '"([)]"', exampleOutput: 'false',
    constraints: [], testCasesTotal: 6, testCasesPassed: 3, scorePercent: 50, timeComplexity: 'O(n)',
    feedback: 'Your solution fails on mismatched bracket order — a closing bracket must match the most recent unmatched opening bracket.',
  },
  {
    id: 'q6', day: 45, title: 'Group Objects by Key', difficulty: 'Intermediate', topic: 'Objects', tags: ['Objects', 'Arrays'],
    status: 'solved', problemStatement: 'Group an array of objects by a given key.', exampleInput: '[{team:"A"},{team:"B"},{team:"A"}]', exampleOutput: '{A:[...], B:[...]}',
    constraints: [], testCasesTotal: 6, testCasesPassed: 6, scorePercent: 100, timeComplexity: 'O(n)',
  },
  {
    id: 'q7', day: 47, title: 'Flatten a Nested Array', difficulty: 'Intermediate', topic: 'Arrays', tags: ['Arrays', 'Recursion'],
    status: 'today', problemStatement: 'Given a nested array, return a single flattened array.', exampleInput: '[1,[2,[3,4]],5]', exampleOutput: '[1,2,3,4,5]',
    constraints: ['Array can be nested to arbitrary depth.'], testCasesTotal: 8,
  },
  { id: 'q8', day: 60, title: 'Recursion Basics', difficulty: 'Intermediate', topic: 'Recursion', tags: ['Recursion'], status: 'pending', problemStatement: '', exampleInput: '', exampleOutput: '', constraints: [], testCasesTotal: 6 },
  { id: 'q9', day: 100, title: 'Debouncing', difficulty: 'Advanced', topic: 'Functions', tags: ['Functions', 'Timing'], status: 'pending', problemStatement: '', exampleInput: '', exampleOutput: '', constraints: [], testCasesTotal: 6 },
  { id: 'q10', day: 120, title: 'Promise.all from Scratch', difficulty: 'Advanced', topic: 'Async', tags: ['Promises'], status: 'pending', problemStatement: '', exampleInput: '', exampleOutput: '', constraints: [], testCasesTotal: 6 },
];

export const codingStreak = { current: 12, best: 21, dayNumber: 47 };

export const codingWeek: WeekDayStatus[] = [
  { day: 'Mon', status: 'solved' },
  { day: 'Tue', status: 'solved' },
  { day: 'Wed', status: 'solved' },
  { day: 'Thu', status: 'solved' },
  { day: 'Fri', status: 'today' },
  { day: 'Sat', status: 'upcoming' },
  { day: 'Sun', status: 'upcoming' },
];

// ---- Mini Tasks ----

export const miniTasks: MiniTask[] = [
  {
    id: 'task-html', title: 'Build a Responsive Portfolio', moduleId: 'html', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-08',
    objective: 'Build a personal portfolio page using semantic HTML and CSS.', skills: ['HTML', 'CSS'],
    requirements: [
      { label: 'Semantic page structure', done: true },
      { label: 'About + projects sections', done: true },
      { label: 'Contact form', done: true },
    ],
    status: 'Passed',
    submission: { githubUrl: 'https://github.com/rahul/portfolio', liveUrl: 'https://rahul-portfolio.example.com', notes: '' },
    evaluation: { status: 'Approved', evaluatedAt: '2026-05-06', feedback: 'Clean structure and good use of semantic tags.', criteria: [
      { label: 'Code Quality', score: 9, maxScore: 10 },
      { label: 'Functionality', score: 9, maxScore: 10 },
      { label: 'UI / UX', score: 8, maxScore: 10 },
    ] },
  },
  {
    id: 'task-css', title: 'Build a Responsive Landing Page', moduleId: 'css', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-20',
    objective: 'Build a fully responsive landing page using Flexbox and Grid.', skills: ['CSS', 'Responsive Design'],
    requirements: [
      { label: 'Mobile-first layout', done: true },
      { label: 'Flexbox/Grid based sections', done: true },
    ],
    status: 'Passed',
    submission: { githubUrl: 'https://github.com/rahul/landing-page', liveUrl: 'https://rahul-landing.example.com', notes: '' },
    evaluation: { status: 'Approved', evaluatedAt: '2026-05-18', feedback: 'Good responsive behavior across breakpoints.', criteria: [
      { label: 'Code Quality', score: 8, maxScore: 10 },
      { label: 'Responsiveness', score: 9, maxScore: 10 },
      { label: 'UI / UX', score: 8, maxScore: 10 },
    ] },
  },
  {
    id: 'task-js-utils', title: 'Build an Array Utility Library', moduleId: 'js-intermediate', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-06-14',
    objective: 'Build a small library of array utility functions (chunk, unique, groupBy, flatten).', skills: ['JavaScript', 'Array Methods'],
    requirements: [
      { label: 'chunk()', done: true },
      { label: 'unique()', done: true },
      { label: 'groupBy()', done: true },
      { label: 'flatten()', done: true },
    ],
    status: 'Passed',
    submission: { githubUrl: 'https://github.com/rahul/array-utils', liveUrl: '', notes: '' },
    evaluation: { status: 'Approved', evaluatedAt: '2026-06-13', feedback: 'Solid implementation with good test coverage.', criteria: [
      { label: 'Code Quality', score: 9, maxScore: 10 },
      { label: 'Functionality', score: 10, maxScore: 10 },
      { label: 'Test Coverage', score: 8, maxScore: 10 },
    ] },
  },
  {
    id: 'task-react-components', title: 'Build a Reusable Component Library', moduleId: 'react', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-07-10',
    objective: 'Build a small set of reusable, prop-driven React components (Button, Card, Modal, Input).', skills: ['React', 'Component Design'],
    requirements: [
      { label: 'Button, Card, Modal, Input', done: true },
      { label: 'Prop-driven variants', done: true },
    ],
    status: 'Passed',
    submission: { githubUrl: 'https://github.com/rahul/ui-kit', liveUrl: 'https://rahul-ui-kit.example.com', notes: '' },
    evaluation: { status: 'Approved', evaluatedAt: '2026-07-09', feedback: 'Well-structured, reusable components.', criteria: [
      { label: 'Code Quality', score: 8, maxScore: 10 },
      { label: 'React Usage', score: 9, maxScore: 10 },
      { label: 'Architecture', score: 8, maxScore: 10 },
    ] },
  },
  {
    id: 'task-react-todo', title: 'Build a React Todo Application', moduleId: 'react-hooks', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-09-28',
    objective: 'Build a Todo application using React Hooks.', skills: ['React', 'State Management', 'Component Architecture'],
    requirements: [
      { label: 'Add Todo', done: true },
      { label: 'Delete Todo', done: true },
      { label: 'Mark Complete', done: true },
      { label: 'Filtering', done: true },
      { label: 'Persistence', done: true },
    ],
    status: 'Changes Requested',
    submission: { githubUrl: 'https://github.com/rahul/react-todo', liveUrl: 'https://rahul-todo.example.com', notes: 'Used localStorage for persistence.' },
    evaluation: {
      status: 'Changes Requested', evaluatedAt: '2026-09-26',
      feedback: 'Good implementation. Filtering logic should be extracted into a reusable hook. Also improve error handling.',
      criteria: [
        { label: 'Code Quality', score: 8, maxScore: 10 },
        { label: 'React Usage', score: 9, maxScore: 10 },
        { label: 'UI / UX', score: 8, maxScore: 10 },
        { label: 'Architecture', score: 8, maxScore: 10 },
        { label: 'Best Practices', score: 8, maxScore: 10 },
      ],
    },
  },
  {
    id: 'task-node-cli', title: 'Build a Node CLI Tool', moduleId: 'node', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-10-20',
    objective: 'Build a command-line tool that reads and transforms a local file.', skills: ['Node.js', 'File System'],
    requirements: [
      { label: 'Read from file system', done: true },
      { label: 'Transform + write output', done: true },
    ],
    status: 'Under Review',
    submission: { githubUrl: 'https://github.com/rahul/node-cli', liveUrl: '', notes: '' },
  },
  { id: 'task-express-api', title: 'Build a REST API', moduleId: 'express', difficulty: 'Advanced', estimatedDuration: '3 days', deadline: '2026-11-05', objective: 'Build a CRUD REST API with Express.', skills: ['Express', 'REST'], requirements: [], status: 'Not Started' },
  { id: 'task-mongo-schema', title: 'Model a MongoDB Schema', moduleId: 'mongodb', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-11-20', objective: 'Design and implement a Mongoose schema for a small app.', skills: ['MongoDB', 'Mongoose'], requirements: [], status: 'Not Started' },
];

// ---- Assessments ----

export const assessments: Assessment[] = [
  {
    id: 'assess-html-css', title: 'HTML & CSS Fundamentals', moduleId: 'css', topics: ['HTML', 'CSS', 'Responsive Design'],
    totalQuestions: 25, timeLimitMinutes: 30, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [{ attemptNo: 1, scorePercent: 92, date: '2026-05-19' }], status: 'passed',
    strongAreas: ['Selectors', 'Flexbox'], needsImprovement: [],
  },
  {
    id: 'assess-js-basics', title: 'JavaScript Basics', moduleId: 'js-basics', topics: ['Variables', 'Loops', 'Functions'],
    totalQuestions: 25, timeLimitMinutes: 30, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [{ attemptNo: 1, scorePercent: 82, date: '2026-05-28' }], status: 'passed',
    strongAreas: ['Loops', 'Functions'], needsImprovement: [],
  },
  {
    id: 'assess-js-intermediate', title: 'JavaScript Intermediate', moduleId: 'js-intermediate', topics: ['Arrays', 'Objects', 'Closures', 'Async JavaScript'],
    totalQuestions: 30, timeLimitMinutes: 45, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [
      { attemptNo: 1, scorePercent: 68, date: '2026-06-12' },
      { attemptNo: 2, scorePercent: 74, date: '2026-06-15' },
    ],
    status: 'passed', strongAreas: ['Arrays', 'Objects'], needsImprovement: ['Closures', 'Async JavaScript'],
  },
  {
    id: 'assess-js-advanced', title: 'JavaScript Advanced', moduleId: 'js-advanced', topics: ['Closures', 'Event Loop', 'Promises'],
    totalQuestions: 30, timeLimitMinutes: 45, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [{ attemptNo: 1, scorePercent: 62, date: '2026-06-28' }], status: 'failed',
    strongAreas: ['Promises'], needsImprovement: ['Event Loop'],
  },
  {
    id: 'assess-react', title: 'React Fundamentals', moduleId: 'react', topics: ['Components', 'Props', 'State'],
    totalQuestions: 25, timeLimitMinutes: 40, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [{ attemptNo: 1, scorePercent: 85, date: '2026-07-12' }], status: 'passed',
    strongAreas: ['Components', 'Props'], needsImprovement: [],
  },
  {
    id: 'assess-react-hooks', title: 'React Hooks', moduleId: 'react-hooks', topics: ['useState', 'useEffect', 'Custom Hooks'],
    totalQuestions: 25, timeLimitMinutes: 40, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [], status: 'not-started', strongAreas: [], needsImprovement: [],
  },
  {
    id: 'assess-node', title: 'Node.js Fundamentals', moduleId: 'node', topics: ['Modules', 'File System', 'npm'],
    totalQuestions: 20, timeLimitMinutes: 30, passingScorePercent: 60, attemptsAllowed: 2,
    attempts: [], status: 'not-started', strongAreas: [], needsImprovement: [],
  },
];

// ---- Major Project ----

export const majorProject: MajorProject = {
  title: 'Full Stack E-Commerce Application',
  subtitle: 'Course Capstone',
  progressPercent: 40,
  milestones: [
    { title: 'Requirements', status: 'completed' },
    { title: 'UI Design', status: 'completed' },
    { title: 'Database', status: 'completed' },
    { title: 'Backend', status: 'completed' },
    { title: 'Frontend', status: 'current' },
    { title: 'Authentication', status: 'upcoming' },
    { title: 'Deployment', status: 'upcoming' },
    { title: 'Final Review', status: 'upcoming' },
  ],
  currentMilestone: 'Frontend',
  deadlineInDays: 10,
  evaluationCriteria: [
    { label: 'Functionality', score: 0, maxScore: 25 },
    { label: 'Code Quality', score: 0, maxScore: 15 },
    { label: 'UI / UX', score: 0, maxScore: 15 },
    { label: 'Architecture', score: 0, maxScore: 15 },
    { label: 'Database', score: 0, maxScore: 10 },
    { label: 'Deployment', score: 0, maxScore: 10 },
    { label: 'Documentation', score: 0, maxScore: 10 },
  ],
};

// ---- Recent feedback (surfaced on Home) ----

export const recentFeedback: RecentFeedback[] = [
  {
    id: 'fb1', sourceType: 'miniTask', sourceId: 'task-react-todo', title: 'React Todo Application',
    status: 'Changes Requested', comment: 'Move filtering logic into a reusable hook.',
  },
];
