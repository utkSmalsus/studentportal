// Course CONTENT only — never a student's progress. moduleDefs order is the
// canonical course sequence; the engine (state/engine/progression.ts) combines this
// with live progress state to compute lock/current/complete status. Swapping this
// file for a real API/SharePoint List response is the only change needed later.
import {
  Course,
  ModuleDef,
  CodingQuestionDef,
  MiniTaskDef,
  AssessmentDef,
  MajorProjectDef,
  StudentProfile,
} from './types';

export const course: Course = {
  id: 'mern',
  title: 'MERN Full Stack Development',
  moduleOrder: [
    'html', 'css',
    'js-basics', 'js-intermediate', 'js-advanced',
    'react', 'react-hooks', 'state-management', 'react-projects',
    'node', 'express', 'mongodb',
    'rest-apis', 'authentication', 'deployment',
    'major-project',
  ],
};

export const profile: StudentProfile = {
  name: 'Rahul Sharma',
  course: course.title,
  batch: 'MERN-01 · Morning Batch',
  joiningDate: '2026-04-01',
};

export const moduleDefs: ModuleDef[] = [
  {
    id: 'html', title: 'HTML', group: 'Foundation', estimatedDuration: '1 week',
    whatYoullLearn: ['Semantic HTML', 'Forms', 'Tables', 'Accessibility basics'],
    learn: [
      { id: 'html-l1', title: 'Document structure & semantics', estimatedMinutes: 30 },
      { id: 'html-l2', title: 'Forms & inputs', estimatedMinutes: 30 },
    ],
    practice: [
      { id: 'html-p1', title: 'Build a semantic article page', description: 'Structure a blog post using header, article, section and footer.', estimatedMinutes: 40 },
      { id: 'html-p2', title: 'Build a registration form', description: 'A form with validated inputs and labels.', estimatedMinutes: 40 },
    ],
    miniTaskId: 'task-html',
  },
  {
    id: 'css', title: 'CSS', group: 'Foundation', estimatedDuration: '1 week',
    whatYoullLearn: ['Box model', 'Flexbox', 'Grid', 'Responsive design'],
    learn: [
      { id: 'css-l1', title: 'Box model & selectors', estimatedMinutes: 30 },
      { id: 'css-l2', title: 'Flexbox & Grid', estimatedMinutes: 40 },
    ],
    practice: [{ id: 'css-p1', title: 'Build a responsive nav bar', description: 'A nav bar that collapses on mobile.', estimatedMinutes: 35 }],
    miniTaskId: 'task-css',
    assessmentId: 'assess-html-css',
    prerequisiteModuleId: 'html',
  },
  {
    id: 'js-basics', title: 'JavaScript Basics', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Variables & data types', 'Operators & conditions', 'Loops', 'Functions'],
    learn: [
      { id: 'jsb-l1', title: 'Variables, types & operators', estimatedMinutes: 35 },
      { id: 'jsb-l2', title: 'Conditions & loops', estimatedMinutes: 35 },
      { id: 'jsb-l3', title: 'Functions', estimatedMinutes: 30 },
    ],
    practice: [
      { id: 'jsb-p1', title: 'FizzBuzz & loop drills', description: 'Classic loop and condition warm-ups.', estimatedMinutes: 30 },
      { id: 'jsb-p2', title: 'Function exercises', description: 'Write small reusable functions.', estimatedMinutes: 30 },
    ],
    assessmentId: 'assess-js-basics',
    prerequisiteModuleId: 'css',
  },
  {
    id: 'js-intermediate', title: 'JavaScript Intermediate', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Array methods', 'Object manipulation', 'Destructuring', 'Spread / rest', 'Higher-order functions'],
    learn: [
      { id: 'jsi-l1', title: 'Array methods (map, filter, reduce)', estimatedMinutes: 40 },
      { id: 'jsi-l2', title: 'Objects, destructuring & spread', estimatedMinutes: 35 },
      { id: 'jsi-l3', title: 'Higher-order functions', estimatedMinutes: 30 },
    ],
    practice: [
      { id: 'jsi-p1', title: 'Array method drills', description: 'map/filter/reduce practice set.', estimatedMinutes: 35 },
      { id: 'jsi-p2', title: 'Object transformation exercises', description: 'Reshape and merge objects.', estimatedMinutes: 30 },
      { id: 'jsi-p3', title: 'Build a small utility library', description: 'chunk, unique, groupBy, flatten.', estimatedMinutes: 45 },
    ],
    miniTaskId: 'task-js-utils',
    assessmentId: 'assess-js-intermediate',
    prerequisiteModuleId: 'js-basics',
  },
  {
    id: 'js-advanced', title: 'JavaScript Advanced', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Closures', 'The event loop', 'Promises & async/await', 'Debouncing & throttling'],
    learn: [
      { id: 'jsa-l1', title: 'Closures & scope', estimatedMinutes: 35 },
      { id: 'jsa-l2', title: 'The event loop', estimatedMinutes: 35 },
      { id: 'jsa-l3', title: 'Promises & async/await', estimatedMinutes: 40 },
    ],
    practice: [{ id: 'jsa-p1', title: 'Closure & async drills', description: 'Write closures and async helpers.', estimatedMinutes: 40 }],
    assessmentId: 'assess-js-advanced',
    prerequisiteModuleId: 'js-intermediate',
  },
  {
    id: 'react', title: 'React', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Components & props', 'State', 'Rendering & the virtual DOM'],
    learn: [
      { id: 'react-l1', title: 'Components & props', estimatedMinutes: 35 },
      { id: 'react-l2', title: 'State & events', estimatedMinutes: 35 },
    ],
    practice: [{ id: 'react-p1', title: 'Build a component library', description: 'Small prop-driven UI components.', estimatedMinutes: 45 }],
    miniTaskId: 'task-react-components',
    assessmentId: 'assess-react',
    prerequisiteModuleId: 'js-advanced',
  },
  {
    id: 'react-hooks', title: 'React Hooks', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['useState & useEffect', 'Custom hooks', 'Forms with hooks', 'Data fetching'],
    learn: [
      { id: 'rh-l1', title: 'useState & useEffect', estimatedMinutes: 35 },
      { id: 'rh-l2', title: 'Custom hooks', estimatedMinutes: 35 },
      { id: 'rh-l3', title: 'Data fetching patterns', estimatedMinutes: 40 },
    ],
    practice: [
      { id: 'rh-p1', title: 'Build a useLocalStorage hook', description: 'Persist state to localStorage.', estimatedMinutes: 35 },
      { id: 'rh-p2', title: 'Build a useFetch hook', description: 'Reusable data-fetching hook.', estimatedMinutes: 40 },
    ],
    miniTaskId: 'task-react-todo',
    assessmentId: 'assess-react-hooks',
    prerequisiteModuleId: 'react',
  },
  {
    id: 'state-management', title: 'State Management', group: 'Frontend', estimatedDuration: '1 week',
    whatYoullLearn: ['Context API', 'Lifting state up', 'Intro to external state libraries'],
    learn: [{ id: 'sm-l1', title: 'Context API', estimatedMinutes: 30 }],
    practice: [{ id: 'sm-p1', title: 'Global theme/auth context', description: 'Share state across the app with Context.', estimatedMinutes: 35 }],
    prerequisiteModuleId: 'react-hooks',
  },
  {
    id: 'react-projects', title: 'React Projects', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Combining hooks, context and routing into a real app'],
    learn: [{ id: 'rp-l1', title: 'Routing with React Router', estimatedMinutes: 35 }],
    practice: [{ id: 'rp-p1', title: 'Multi-page project', description: 'A small multi-route React app.', estimatedMinutes: 60 }],
    prerequisiteModuleId: 'state-management',
  },
  {
    id: 'node', title: 'Node.js', group: 'Backend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Node runtime & modules', 'npm', 'File system & streams'],
    learn: [
      { id: 'node-l1', title: 'Node fundamentals', estimatedMinutes: 30 },
      { id: 'node-l2', title: 'Modules & npm', estimatedMinutes: 30 },
      { id: 'node-l3', title: 'File system & streams', estimatedMinutes: 35 },
    ],
    practice: [
      { id: 'node-p1', title: 'Build a CLI tool', description: 'Read and transform a local file from the command line.', estimatedMinutes: 45 },
      { id: 'node-p2', title: 'Read & write JSON files', description: 'Persist small CLI state to disk.', estimatedMinutes: 30 },
    ],
    miniTaskId: 'task-node-cli',
    assessmentId: 'assess-node',
    prerequisiteModuleId: 'react-projects',
  },
  {
    id: 'express', title: 'Express.js', group: 'Backend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Routing', 'Middleware', 'Error handling'],
    learn: [{ id: 'exp-l1', title: 'Routing & middleware', estimatedMinutes: 35 }],
    practice: [{ id: 'exp-p1', title: 'Build a small REST server', description: 'CRUD routes with Express.', estimatedMinutes: 45 }],
    miniTaskId: 'task-express-api',
    prerequisiteModuleId: 'node',
  },
  {
    id: 'mongodb', title: 'MongoDB', group: 'Backend', estimatedDuration: '1 week',
    whatYoullLearn: ['Documents & collections', 'CRUD', 'Mongoose schemas'],
    learn: [{ id: 'mongo-l1', title: 'Documents, collections & CRUD', estimatedMinutes: 35 }],
    practice: [{ id: 'mongo-p1', title: 'Model a small app schema', description: 'Design a Mongoose schema.', estimatedMinutes: 35 }],
    miniTaskId: 'task-mongo-schema',
    prerequisiteModuleId: 'express',
  },
  {
    id: 'rest-apis', title: 'REST APIs', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['API design', 'Status codes', 'Connecting frontend to backend'],
    learn: [{ id: 'rest-l1', title: 'API design principles', estimatedMinutes: 30 }],
    practice: [{ id: 'rest-p1', title: 'Connect React app to Express API', description: 'Wire the frontend to real endpoints.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'mongodb',
  },
  {
    id: 'authentication', title: 'Authentication', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['JWT', 'Sessions', 'Protecting routes'],
    learn: [{ id: 'auth-l1', title: 'JWT & sessions', estimatedMinutes: 35 }],
    practice: [{ id: 'auth-p1', title: 'Add login/signup to your app', description: 'Protect routes with JWT.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'rest-apis',
  },
  {
    id: 'deployment', title: 'Deployment', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['Environment configs', 'Hosting frontend & backend', 'CI basics'],
    learn: [{ id: 'dep-l1', title: 'Hosting & environment configs', estimatedMinutes: 30 }],
    practice: [{ id: 'dep-p1', title: 'Deploy a full stack app', description: 'Ship frontend and backend live.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'authentication',
  },
  {
    id: 'major-project', title: 'Major Project', group: 'Capstone', estimatedDuration: '3 weeks',
    whatYoullLearn: ['Bringing your frontend and backend skills together into one real application'],
    learn: [], practice: [],
    // Unlocks once Frontend is complete, not after the whole course — the capstone
    // runs in parallel with Backend/Full Stack, which is how the coaching center
    // actually schedules it.
    prerequisiteModuleId: 'react-projects',
  },
];

// ---- Daily Coding ----

export const codingQuestions: CodingQuestionDef[] = [
  {
    id: 'q1', day: 1, title: 'Reverse a String', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    problemStatement: 'Given a string, return it reversed.', exampleInput: '"hello"', exampleOutput: '"olleh"',
    constraints: ['1 <= s.length <= 10^4'], hints: ['Try splitting the string into characters first.'],
    testCasesTotal: 6, keywordChecks: ['split', 'reverse', 'join'],
  },
  {
    id: 'q2', day: 10, title: 'Count Vowels', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    problemStatement: 'Count the number of vowels in a string.', exampleInput: '"coaching"', exampleOutput: '3',
    constraints: [], hints: ['A simple loop with an includes() check works well.'],
    testCasesTotal: 5, keywordChecks: ['vowel', 'includes', 'for'],
  },
  {
    id: 'q3', day: 20, title: 'Find the Largest Number', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays'],
    problemStatement: 'Return the largest number in an array.', exampleInput: '[3,9,2]', exampleOutput: '9',
    constraints: [], hints: ['Math.max with spread is the shortest solution.'],
    testCasesTotal: 5, keywordChecks: ['max', 'reduce'],
  },
  {
    id: 'q4', day: 30, title: 'Two Sum', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays', 'Hash Map'],
    problemStatement: 'Return indices of the two numbers that add up to a target.', exampleInput: '[2,7,11,15], target=9', exampleOutput: '[0,1]',
    constraints: [], hints: ['A hash map gets you from O(n²) to O(n).'],
    testCasesTotal: 8, keywordChecks: ['map', 'indexof', 'has'],
  },
  {
    id: 'q5', day: 38, title: 'Balanced Parentheses', difficulty: 'Intermediate', topic: 'Stacks', tags: ['Stacks'],
    problemStatement: 'Check whether a string of brackets is balanced.', exampleInput: '"([)]"', exampleOutput: 'false',
    constraints: [], hints: ['A stack naturally matches the most recent unmatched opening bracket.'],
    testCasesTotal: 6, keywordChecks: ['stack', 'push', 'pop'],
  },
  {
    id: 'q6', day: 45, title: 'Group Objects by Key', difficulty: 'Intermediate', topic: 'Objects', tags: ['Objects', 'Arrays'],
    problemStatement: 'Group an array of objects by a given key.', exampleInput: '[{team:"A"},{team:"B"},{team:"A"}]', exampleOutput: '{A:[...], B:[...]}',
    constraints: [], hints: ['reduce() into an accumulator object keyed by the field.'],
    testCasesTotal: 6, keywordChecks: ['reduce', 'key'],
  },
  {
    id: 'q7', day: 47, title: 'Flatten a Nested Array', difficulty: 'Intermediate', topic: 'Arrays', tags: ['Arrays', 'Recursion'],
    problemStatement: 'Given a nested array, return a single flattened array.', exampleInput: '[1,[2,[3,4]],5]', exampleOutput: '[1,2,3,4,5]',
    constraints: ['Array can be nested to arbitrary depth.'], hints: ['Array.isArray() plus recursion, or Array.prototype.flat(Infinity).'],
    testCasesTotal: 8, keywordChecks: ['isarray', 'flat', 'concat', 'recur'],
  },
  {
    id: 'q8', day: 60, title: 'Recursion Basics', difficulty: 'Intermediate', topic: 'Recursion', tags: ['Recursion'],
    problemStatement: 'Compute the factorial of n using recursion.', exampleInput: 'n=5', exampleOutput: '120',
    constraints: ['0 <= n <= 12'], hints: ['Define the base case first.'],
    testCasesTotal: 6, keywordChecks: ['return', 'function'],
  },
  {
    id: 'q9', day: 100, title: 'Debouncing', difficulty: 'Advanced', topic: 'Functions', tags: ['Functions', 'Timing'],
    problemStatement: 'Implement a debounce(fn, delay) higher-order function.', exampleInput: 'debounce(fn, 300)', exampleOutput: 'a function that delays calls to fn',
    constraints: [], hints: ['setTimeout + clearTimeout on every call.'],
    testCasesTotal: 6, keywordChecks: ['settimeout', 'cleartimeout'],
  },
  {
    id: 'q10', day: 120, title: 'Promise.all from Scratch', difficulty: 'Advanced', topic: 'Async', tags: ['Promises'],
    problemStatement: 'Implement a simplified version of Promise.all.', exampleInput: '[p1, p2, p3]', exampleOutput: 'a Promise that resolves with all results, or rejects on the first failure',
    constraints: [], hints: ['Track a results array and a remaining counter.'],
    testCasesTotal: 6, keywordChecks: ['promise', 'resolve', 'reject'],
  },
];

// ---- Mini Tasks ----

const standardFrontendCriteria = [
  { label: 'Code Quality', maxScore: 10 },
  { label: 'Functionality', maxScore: 10 },
  { label: 'UI / UX', maxScore: 10 },
  { label: 'Architecture', maxScore: 10 },
  { label: 'Best Practices', maxScore: 10 },
];
const standardBackendCriteria = [
  { label: 'Code Quality', maxScore: 10 },
  { label: 'Functionality', maxScore: 10 },
  { label: 'Error Handling', maxScore: 10 },
  { label: 'Architecture', maxScore: 10 },
  { label: 'Best Practices', maxScore: 10 },
];

export const miniTasks: MiniTaskDef[] = [
  {
    id: 'task-html', title: 'Build a Responsive Portfolio', moduleId: 'html', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-08',
    objective: 'Build a personal portfolio page using semantic HTML and CSS.', skills: ['HTML', 'CSS'],
    requirements: ['Semantic page structure', 'About + projects sections', 'Contact form'],
    resources: ['MDN: Semantic HTML', 'Course reading: Accessible forms'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    id: 'task-css', title: 'Build a Responsive Landing Page', moduleId: 'css', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-20',
    objective: 'Build a fully responsive landing page using Flexbox and Grid.', skills: ['CSS', 'Responsive Design'],
    requirements: ['Mobile-first layout', 'Flexbox/Grid based sections'],
    resources: ['MDN: CSS Grid', 'MDN: Flexbox'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    id: 'task-js-utils', title: 'Build an Array Utility Library', moduleId: 'js-intermediate', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-06-14',
    objective: 'Build a small library of array utility functions (chunk, unique, groupBy, flatten).', skills: ['JavaScript', 'Array Methods'],
    requirements: ['chunk()', 'unique()', 'groupBy()', 'flatten()'],
    resources: ['MDN: Array methods reference'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    id: 'task-react-components', title: 'Build a Reusable Component Library', moduleId: 'react', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-07-10',
    objective: 'Build a small set of reusable, prop-driven React components (Button, Card, Modal, Input).', skills: ['React', 'Component Design'],
    requirements: ['Button, Card, Modal, Input', 'Prop-driven variants'],
    resources: ['React docs: Thinking in React'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    id: 'task-react-todo', title: 'Build a React Todo Application', moduleId: 'react-hooks', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-09-28',
    objective: 'Build a Todo application using React Hooks.', skills: ['React', 'State Management', 'Component Architecture'],
    requirements: ['Add Todo', 'Delete Todo', 'Mark Complete', 'Filtering', 'Persistence'],
    resources: ['React docs: useState', 'React docs: useEffect'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    id: 'task-node-cli', title: 'Build a Node CLI Tool', moduleId: 'node', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-11-02',
    objective: 'Build a command-line tool that reads and transforms a local file.', skills: ['Node.js', 'File System'],
    requirements: ['Read from file system', 'Transform + write output', 'Handle a missing-file error gracefully'],
    resources: ['Node docs: fs module'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    id: 'task-express-api', title: 'Build a REST API', moduleId: 'express', difficulty: 'Advanced', estimatedDuration: '3 days', deadline: '2026-11-20',
    objective: 'Build a CRUD REST API with Express.', skills: ['Express', 'REST'],
    requirements: ['GET/POST/PUT/DELETE routes', 'Input validation', 'Centralized error handling'],
    resources: ['Express docs: Routing'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    id: 'task-mongo-schema', title: 'Model a MongoDB Schema', moduleId: 'mongodb', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-12-02',
    objective: 'Design and implement a Mongoose schema for a small app.', skills: ['MongoDB', 'Mongoose'],
    requirements: ['Schema with validation', 'At least one relationship (ref)', 'Seed script'],
    resources: ['Mongoose docs: Schemas'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
];

// ---- Assessments (5 questions each — enough to demo a real attempt flow) ----

export const assessments: AssessmentDef[] = [
  {
    id: 'assess-html-css', title: 'HTML & CSS Fundamentals', moduleId: 'css', topics: ['HTML', 'CSS', 'Responsive Design'],
    timeLimitMinutes: 15, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'hc1', topic: 'HTML', text: 'Which tag is used for the most important heading?', options: ['<h1>', '<h6>', '<head>', '<title>'], correctIndex: 0 },
      { id: 'hc2', topic: 'CSS', text: 'Which property changes text color?', options: ['color', 'background-color', 'font-color', 'text-color'], correctIndex: 0 },
      { id: 'hc3', topic: 'CSS', text: 'Which display value creates a flex container?', options: ['flex', 'block', 'inline', 'static'], correctIndex: 0 },
      { id: 'hc4', topic: 'Responsive Design', text: 'Which CSS feature adapts layout to screen width?', options: ['Media queries', 'Pseudo-classes', 'Keyframes', 'Transitions'], correctIndex: 0 },
      { id: 'hc5', topic: 'HTML', text: 'Which attribute provides alternative text for images?', options: ['alt', 'title', 'src', 'longdesc'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-js-basics', title: 'JavaScript Basics', moduleId: 'js-basics', topics: ['Variables', 'Loops', 'Functions'],
    timeLimitMinutes: 15, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'jb1', topic: 'Variables', text: 'Which keyword declares a block-scoped variable?', options: ['let', 'var', 'function', 'static'], correctIndex: 0 },
      { id: 'jb2', topic: 'Loops', text: 'Which loop runs at least once?', options: ['do...while', 'for', 'while', 'for...of'], correctIndex: 0 },
      { id: 'jb3', topic: 'Functions', text: 'What does a function without a return statement return?', options: ['undefined', 'null', '0', 'an error'], correctIndex: 0 },
      { id: 'jb4', topic: 'Variables', text: 'Which of these is NOT a primitive type?', options: ['object', 'string', 'number', 'boolean'], correctIndex: 0 },
      { id: 'jb5', topic: 'Loops', text: 'Which statement exits a loop early?', options: ['break', 'continue', 'return', 'exit'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-js-intermediate', title: 'JavaScript Intermediate', moduleId: 'js-intermediate', topics: ['Arrays', 'Objects', 'Closures', 'Async JavaScript'],
    timeLimitMinutes: 20, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'ji1', topic: 'Arrays', text: 'Which array method creates a new array from transformed elements?', options: ['map', 'forEach', 'filter', 'reduce'], correctIndex: 0 },
      { id: 'ji2', topic: 'Objects', text: 'Which syntax extracts properties into variables?', options: ['Destructuring', 'Spread', 'Rest', 'Closures'], correctIndex: 0 },
      { id: 'ji3', topic: 'Closures', text: 'A closure is formed when...', options: ['a function retains access to its outer scope after that scope has returned', 'a function calls itself', 'two functions share a global variable', 'an object inherits from a prototype'], correctIndex: 0 },
      { id: 'ji4', topic: 'Async JavaScript', text: 'What does `await` do inside an async function?', options: ['Pauses execution until the promise settles', 'Stops the whole program', 'Converts a promise to a callback', 'Runs code on a separate thread'], correctIndex: 0 },
      { id: 'ji5', topic: 'Arrays', text: 'Which method removes the last element of an array?', options: ['pop', 'shift', 'slice', 'splice(0)'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-js-advanced', title: 'JavaScript Advanced', moduleId: 'js-advanced', topics: ['Closures', 'Event Loop', 'Promises'],
    timeLimitMinutes: 20, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'ja1', topic: 'Event Loop', text: 'Which queue do resolved Promise callbacks go into?', options: ['Microtask queue', 'Macrotask queue', 'Render queue', 'Call stack'], correctIndex: 0 },
      { id: 'ja2', topic: 'Promises', text: 'Promise.all rejects as soon as...', options: ['any one promise rejects', 'all promises reject', 'the first promise resolves', 'never'], correctIndex: 0 },
      { id: 'ja3', topic: 'Closures', text: 'Closures are commonly used to...', options: ['create private state', 'block the event loop', 'clear timers', 'define CSS variables'], correctIndex: 0 },
      { id: 'ja4', topic: 'Event Loop', text: 'Given sync code, a microtask, and a macrotask (setTimeout) scheduled together, which runs first?', options: ['The synchronous code', 'The microtask', 'The macrotask', 'Order is random'], correctIndex: 0 },
      { id: 'ja5', topic: 'Promises', text: 'What does `Promise.race` do?', options: ['Settles as soon as the first promise settles', 'Waits for all promises', 'Retries failed promises', 'Cancels other promises'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-react', title: 'React Fundamentals', moduleId: 'react', topics: ['Components', 'Props', 'State'],
    timeLimitMinutes: 20, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'r1', topic: 'Components', text: 'What must a React component return?', options: ['JSX (or null)', 'A string only', 'A Promise', 'An HTML file'], correctIndex: 0 },
      { id: 'r2', topic: 'Props', text: 'Props are...', options: ['Read-only inputs passed from a parent', 'Mutable internal data', 'Global variables', 'CSS classes'], correctIndex: 0 },
      { id: 'r3', topic: 'State', text: 'Calling a state setter causes...', options: ['A re-render', 'An immediate synchronous mutation', 'A page reload', 'Nothing until refresh'], correctIndex: 0 },
      { id: 'r4', topic: 'Components', text: 'A component name must start with...', options: ['An uppercase letter', 'A lowercase letter', 'A number', 'An underscore'], correctIndex: 0 },
      { id: 'r5', topic: 'Props', text: 'How do you pass a value to a child component?', options: ['As a prop attribute in JSX', 'Via a global variable', 'Via localStorage', 'Via a CSS class'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-react-hooks', title: 'React Hooks', moduleId: 'react-hooks', topics: ['useState', 'useEffect', 'Custom Hooks'],
    timeLimitMinutes: 20, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'rh1', topic: 'useState', text: 'The useState initializer function/value is used...', options: ['Only on the first render', 'On every render', 'Never', 'Only when props change'], correctIndex: 0 },
      { id: 'rh2', topic: 'useEffect', text: 'An empty dependency array `[]` means the effect runs...', options: ['Once, after the first render', 'On every render', 'Never', 'Before render'], correctIndex: 0 },
      { id: 'rh3', topic: 'Custom Hooks', text: "A custom hook's name must start with...", options: ['use', 'get', 'on', 'with'], correctIndex: 0 },
      { id: 'rh4', topic: 'useEffect', text: 'The cleanup function returned from useEffect runs...', options: ['Before the effect re-runs and on unmount', 'Only on unmount', 'Only on mount', 'Never'], correctIndex: 0 },
      { id: 'rh5', topic: 'useState', text: 'What triggers a re-render when using useState?', options: ['Calling the setter with a new value', 'Reading the state value', 'Declaring the state', 'Passing props'], correctIndex: 0 },
    ],
  },
  {
    id: 'assess-node', title: 'Node.js Fundamentals', moduleId: 'node', topics: ['Modules', 'File System', 'npm'],
    timeLimitMinutes: 15, passingScorePercent: 60, attemptsAllowed: 2,
    questions: [
      { id: 'n1', topic: 'Modules', text: 'Which keyword imports a module in CommonJS?', options: ['require', 'import', 'include', 'using'], correctIndex: 0 },
      { id: 'n2', topic: 'File System', text: 'Which fs method reads a file without blocking the event loop?', options: ['fs.readFile', 'fs.readFileSync', 'fs.open', 'fs.stat'], correctIndex: 0 },
      { id: 'n3', topic: 'npm', text: "Where are a project's dependencies declared?", options: ['package.json', 'node_modules', '.npmrc', 'index.js'], correctIndex: 0 },
      { id: 'n4', topic: 'Modules', text: 'What does `module.exports` do?', options: ['Defines what a file exposes to other files', 'Starts the server', 'Installs a package', 'Reads environment variables'], correctIndex: 0 },
      { id: 'n5', topic: 'File System', text: 'Which method appends data to an existing file?', options: ['fs.appendFile', 'fs.writeFile', 'fs.createFile', 'fs.readFile'], correctIndex: 0 },
    ],
  },
];

// ---- Major Project ----

export const majorProject: MajorProjectDef = {
  moduleId: 'major-project',
  title: 'Full Stack E-Commerce Application',
  description: 'A complete MERN application with product catalog, cart, checkout, auth and an admin panel.',
  deadlineInDays: 10,
  milestones: [
    { id: 'm1', title: 'Requirements', objectives: ['Define user stories', 'Define data model'], deliverables: ['Requirements doc'] },
    { id: 'm2', title: 'UI Design', objectives: ['Wireframe key screens', 'Pick a component library or design system'], deliverables: ['Wireframes / mockups'] },
    { id: 'm3', title: 'Database', objectives: ['Design MongoDB schemas for products, users, orders'], deliverables: ['Schema diagram', 'Seed data'] },
    { id: 'm4', title: 'Backend', objectives: ['Build REST API for catalog, cart, orders', 'Add authentication'], deliverables: ['API repository', 'API documentation'] },
    { id: 'm5', title: 'Frontend', objectives: ['Build catalog, cart and checkout UI', 'Connect to the live API'], deliverables: ['Frontend repository'] },
    { id: 'm6', title: 'Authentication', objectives: ['Login/signup flow', 'Protected routes for checkout and admin'], deliverables: ['Auth flow demo'] },
    { id: 'm7', title: 'Deployment', objectives: ['Deploy frontend and backend', 'Configure environment variables'], deliverables: ['Live URL'] },
    { id: 'm8', title: 'Final Review', objectives: ['End-to-end walkthrough', 'Fix review feedback'], deliverables: ['Final submission'] },
  ],
  evaluationCriteriaTemplate: [
    { label: 'Functionality', maxScore: 25 },
    { label: 'Code Quality', maxScore: 15 },
    { label: 'UI / UX', maxScore: 15 },
    { label: 'Architecture', maxScore: 15 },
    { label: 'Database', maxScore: 10 },
    { label: 'Deployment', maxScore: 10 },
    { label: 'Documentation', maxScore: 10 },
  ],
};
