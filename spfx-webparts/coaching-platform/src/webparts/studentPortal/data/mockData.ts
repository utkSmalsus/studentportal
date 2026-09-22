// Course CONTENT only — never a student's progress. moduleDefs order is the
// canonical course sequence; the engine (state/engine/progression.ts) combines this
// with live progress state to compute lock/current/complete status. Swapping this
// file for a real API/SharePoint List response is the only change needed later.
import {
  Course,
  ModuleDef,
  TopicDef,
  TopicTestDef,
  ModuleTestDef,
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

// ---- Topic content + test authoring helpers -------------------------------------
// Every topic gets a real, functioning quiz. A handful of topics below are hand
// authored with curated content and a verified real YouTube video; the rest use
// this generator so every topic in the course has a complete, working page rather
// than leaving 25+ topics blank. This is exactly the shape an admin-authored topic
// would have — some topics get more editorial attention than others, same schema.
function defaultTopicTest(courseId: string, moduleId: string, topicId: string, title: string): TopicTestDef {
  const testId = `${topicId}-test`;
  return {
    id: testId,
    courseId,
    moduleId,
    topicId,
    passingScorePercent: 70,
    questions: [
      {
        id: `${testId}-q1`,
        text: `What is the primary focus of "${title}"?`,
        options: [
          `Understanding ${title.toLowerCase()} and how to apply it correctly`,
          'Memorizing unrelated syntax with no practical use',
          'Styling a page with CSS animations',
          'Configuring a cloud deployment pipeline',
        ],
        correctIndex: 0,
      },
      {
        id: `${testId}-q2`,
        text: `True or False: "${title}" is a concept you will build on in later topics of this module.`,
        options: ['True', 'False'],
        correctIndex: 0,
      },
      {
        id: `${testId}-q3`,
        text: 'What is the best way to solidify a new topic like this one?',
        options: [
          'Practice it with real, small examples and review the key concepts',
          'Skip straight to the next topic without practicing',
          'Only read the topic title',
          'Wait until the final exam to think about it',
        ],
        correctIndex: 0,
      },
    ],
  };
}

function defaultTopicContent(title: string, group: string): TopicDef['content'] {
  return {
    whatYoullLearn: [`Core ideas behind ${title}`, `How ${title} fits into ${group.toLowerCase()} development`, 'A small hands-on example'],
    keyConcepts: [title],
    examples: [`A minimal, realistic example demonstrating ${title.toLowerCase()}.`],
    notes: [`Take your time with ${title.toLowerCase()} — it comes up again later in this module.`],
    resources: [`MDN / official docs search: "${title}"`],
  };
}

const topicTests: TopicTestDef[] = [];
function topic(
  courseId: string,
  moduleId: string,
  moduleGroup: string,
  index: number,
  title: string,
  estimatedMinutes: number,
  opts?: { youtubeVideoId?: string; content?: TopicDef['content'] }
): TopicDef {
  const id = `${moduleId}-t${index}`;
  const test = defaultTopicTest(courseId, moduleId, id, title);
  topicTests.push(test);
  return {
    id,
    courseId,
    moduleId,
    title,
    estimatedMinutes,
    youtubeVideoId: opts?.youtubeVideoId,
    content: opts?.content || defaultTopicContent(title, moduleGroup),
    testId: test.id,
  };
}

export const moduleDefs: ModuleDef[] = [
  {
    courseId: 'mern', id: 'html', title: 'HTML', group: 'Foundation', estimatedDuration: '1 week',
    whatYoullLearn: ['Semantic HTML', 'Forms', 'Tables', 'Accessibility basics'],
    topics: [
      topic('mern', 'html', 'Foundation', 1, 'Document Structure & Semantics', 30, {
        youtubeVideoId: 'qz0aGYrrlhU',
        content: {
          whatYoullLearn: ['The HTML document skeleton', 'Semantic tags: header, main, section, article, footer', 'Why semantics matter for accessibility and SEO'],
          keyConcepts: ['<!DOCTYPE html>', '<header> / <main> / <footer>', 'Block vs inline elements'],
          examples: ['A blog post structured with <article> and <section> instead of generic <div>s.'],
          notes: ['Screen readers and search engines both rely on semantic structure — this is not just style preference.'],
          resources: ['MDN: HTML elements reference', 'web.dev: Learn HTML'],
        },
      }),
      topic('mern', 'html', 'Foundation', 2, 'Forms & Inputs', 30, {
        content: {
          whatYoullLearn: ['Form elements and input types', 'Labels and accessibility', 'Client-side validation attributes'],
          keyConcepts: ['<form>', '<input type="...">', 'required / pattern / min / max'],
          examples: ['A registration form with labeled, validated email and password fields.'],
          notes: ['Always pair an <input> with a <label> — it is not optional for accessibility.'],
          resources: ['MDN: Your first form', 'MDN: Form validation'],
        },
      }),
    ],
    practice: [
      { id: 'html-p1', courseId: 'mern', moduleId: 'html', title: 'Build a semantic article page', description: 'Structure a blog post using header, article, section and footer.', estimatedMinutes: 40 },
      { id: 'html-p2', courseId: 'mern', moduleId: 'html', title: 'Build a registration form', description: 'A form with validated inputs and labels.', estimatedMinutes: 40 },
    ],
    miniTaskId: 'task-html',
  },
  {
    courseId: 'mern', id: 'css', title: 'CSS', group: 'Foundation', estimatedDuration: '1 week',
    whatYoullLearn: ['Box model', 'Flexbox', 'Grid', 'Responsive design'],
    topics: [
      topic('mern', 'css', 'Foundation', 1, 'Box Model & Selectors', 30, {
        youtubeVideoId: 'ESnrn1kAD4E',
        content: {
          whatYoullLearn: ['Content, padding, border, margin', 'Selector specificity', 'box-sizing: border-box'],
          keyConcepts: ['box-sizing', 'Class vs id selectors', 'Margin collapsing'],
          examples: ['Two boxes with identical widths behaving differently under content-box vs border-box.'],
          notes: ['Set box-sizing: border-box globally — it avoids most sizing headaches.'],
          resources: ['MDN: The box model'],
        },
      }),
      topic('mern', 'css', 'Foundation', 2, 'Flexbox & Grid', 40, {
        content: {
          whatYoullLearn: ['1D layout with Flexbox', '2D layout with Grid', 'When to use which'],
          keyConcepts: ['display: flex', 'justify-content / align-items', 'display: grid, grid-template-columns'],
          examples: ['A responsive nav bar with Flexbox; a card gallery with Grid.'],
          notes: ['Flexbox for a row or column of items, Grid for a full 2D layout — they are complementary, not competing.'],
          resources: ['CSS-Tricks: A Complete Guide to Flexbox', 'CSS-Tricks: A Complete Guide to Grid'],
        },
      }),
    ],
    practice: [{ id: 'css-p1', courseId: 'mern', moduleId: 'css', title: 'Build a responsive nav bar', description: 'A nav bar that collapses on mobile.', estimatedMinutes: 35 }],
    miniTaskId: 'task-css',
    assessmentId: 'assess-html-css',
    moduleTestId: 'test-css',
    prerequisiteModuleId: 'html',
  },
  {
    courseId: 'mern', id: 'js-basics', title: 'JavaScript Basics', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Variables & data types', 'Operators & conditions', 'Loops', 'Functions'],
    topics: [
      topic('mern', 'js-basics', 'Programming', 1, 'Variables, Types & Operators', 35, {
        youtubeVideoId: 'hdI2bqOjy3c',
        content: {
          whatYoullLearn: ['let / const / var', 'Primitive types', 'Arithmetic & comparison operators'],
          keyConcepts: ['let vs const', 'typeof', '=== vs =='],
          examples: ['const total = price * quantity; and why === is safer than ==.'],
          notes: ['Default to const. Only use let when a variable genuinely needs to be reassigned.'],
          resources: ['MDN: JavaScript data types', 'MDN: Operators'],
        },
      }),
      topic('mern', 'js-basics', 'Programming', 2, 'Conditions & Loops', 35),
      topic('mern', 'js-basics', 'Programming', 3, 'Functions', 30, {
        content: {
          whatYoullLearn: ['Function declarations vs expressions', 'Arrow functions', 'Parameters, defaults and return values'],
          keyConcepts: ['function foo() {}', 'const foo = () => {}', 'Default parameters'],
          examples: ['A greet(name = "there") function returning a personalized string.'],
          notes: ['Arrow functions do not have their own `this` — that matters once you reach class/React contexts.'],
          resources: ['MDN: Functions'],
        },
      }),
    ],
    practice: [
      { id: 'jsb-p1', courseId: 'mern', moduleId: 'js-basics', title: 'FizzBuzz & loop drills', description: 'Classic loop and condition warm-ups.', estimatedMinutes: 30 },
      { id: 'jsb-p2', courseId: 'mern', moduleId: 'js-basics', title: 'Function exercises', description: 'Write small reusable functions.', estimatedMinutes: 30 },
    ],
    assessmentId: 'assess-js-basics',
    moduleTestId: 'test-js-basics',
    prerequisiteModuleId: 'css',
  },
  {
    courseId: 'mern', id: 'js-intermediate', title: 'JavaScript Intermediate', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Array methods', 'Object manipulation', 'Destructuring', 'Spread / rest', 'Higher-order functions'],
    topics: [
      topic('mern', 'js-intermediate', 'Programming', 1, 'Array Methods (map, filter, reduce)', 40),
      topic('mern', 'js-intermediate', 'Programming', 2, 'Objects, Destructuring & Spread', 35),
      topic('mern', 'js-intermediate', 'Programming', 3, 'Higher-Order Functions', 30),
    ],
    practice: [
      { id: 'jsi-p1', courseId: 'mern', moduleId: 'js-intermediate', title: 'Array method drills', description: 'map/filter/reduce practice set.', estimatedMinutes: 35 },
      { id: 'jsi-p2', courseId: 'mern', moduleId: 'js-intermediate', title: 'Object transformation exercises', description: 'Reshape and merge objects.', estimatedMinutes: 30 },
      { id: 'jsi-p3', courseId: 'mern', moduleId: 'js-intermediate', title: 'Build a small utility library', description: 'chunk, unique, groupBy, flatten.', estimatedMinutes: 45 },
    ],
    miniTaskId: 'task-js-utils',
    assessmentId: 'assess-js-intermediate',
    moduleTestId: 'test-js-intermediate',
    prerequisiteModuleId: 'js-basics',
  },
  {
    courseId: 'mern', id: 'js-advanced', title: 'JavaScript Advanced', group: 'Programming', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Closures', 'The event loop', 'Promises & async/await', 'Debouncing & throttling'],
    topics: [
      topic('mern', 'js-advanced', 'Programming', 1, 'Closures & Scope', 35),
      topic('mern', 'js-advanced', 'Programming', 2, 'The Event Loop', 35),
      topic('mern', 'js-advanced', 'Programming', 3, 'Promises & Async/Await', 40),
    ],
    practice: [{ id: 'jsa-p1', courseId: 'mern', moduleId: 'js-advanced', title: 'Closure & async drills', description: 'Write closures and async helpers.', estimatedMinutes: 40 }],
    assessmentId: 'assess-js-advanced',
    moduleTestId: 'test-js-advanced',
    prerequisiteModuleId: 'js-intermediate',
  },
  {
    courseId: 'mern', id: 'react', title: 'React', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Components & props', 'State', 'Rendering & the virtual DOM'],
    topics: [
      topic('mern', 'react', 'Frontend', 1, 'Components & Props', 35),
      topic('mern', 'react', 'Frontend', 2, 'State & Events', 35),
    ],
    practice: [{ id: 'react-p1', courseId: 'mern', moduleId: 'react', title: 'Build a component library', description: 'Small prop-driven UI components.', estimatedMinutes: 45 }],
    miniTaskId: 'task-react-components',
    assessmentId: 'assess-react',
    moduleTestId: 'test-react',
    prerequisiteModuleId: 'js-advanced',
  },
  {
    courseId: 'mern', id: 'react-hooks', title: 'React Hooks', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['useState & useEffect', 'Custom hooks', 'Forms with hooks', 'Data fetching'],
    topics: [
      topic('mern', 'react-hooks', 'Frontend', 1, 'useState & useEffect', 35),
      topic('mern', 'react-hooks', 'Frontend', 2, 'Custom Hooks', 35),
      topic('mern', 'react-hooks', 'Frontend', 3, 'Data Fetching Patterns', 40),
    ],
    practice: [
      { id: 'rh-p1', courseId: 'mern', moduleId: 'react-hooks', title: 'Build a useLocalStorage hook', description: 'Persist state to localStorage.', estimatedMinutes: 35 },
      { id: 'rh-p2', courseId: 'mern', moduleId: 'react-hooks', title: 'Build a useFetch hook', description: 'Reusable data-fetching hook.', estimatedMinutes: 40 },
    ],
    miniTaskId: 'task-react-todo',
    assessmentId: 'assess-react-hooks',
    moduleTestId: 'test-react-hooks',
    prerequisiteModuleId: 'react',
  },
  {
    courseId: 'mern', id: 'state-management', title: 'State Management', group: 'Frontend', estimatedDuration: '1 week',
    whatYoullLearn: ['Context API', 'Lifting state up', 'Intro to external state libraries'],
    topics: [topic('mern', 'state-management', 'Frontend', 1, 'Context API', 30)],
    practice: [{ id: 'sm-p1', courseId: 'mern', moduleId: 'state-management', title: 'Global theme/auth context', description: 'Share state across the app with Context.', estimatedMinutes: 35 }],
    prerequisiteModuleId: 'react-hooks',
  },
  {
    courseId: 'mern', id: 'react-projects', title: 'React Projects', group: 'Frontend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Combining hooks, context and routing into a real app'],
    topics: [topic('mern', 'react-projects', 'Frontend', 1, 'Routing with React Router', 35)],
    practice: [{ id: 'rp-p1', courseId: 'mern', moduleId: 'react-projects', title: 'Multi-page project', description: 'A small multi-route React app.', estimatedMinutes: 60 }],
    prerequisiteModuleId: 'state-management',
  },
  {
    courseId: 'mern', id: 'node', title: 'Node.js', group: 'Backend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Node runtime & modules', 'npm', 'File system & streams'],
    topics: [
      topic('mern', 'node', 'Backend', 1, 'Node Fundamentals', 30, {
        content: {
          whatYoullLearn: ['What the Node runtime is and how it differs from the browser', 'The global object and process', 'Running a script with `node file.js`'],
          keyConcepts: ['V8 engine', 'process.argv / process.env', 'Event-driven, non-blocking I/O'],
          examples: ['A tiny script reading process.argv to greet a name passed on the command line.'],
          notes: ['Node has no `window` or `document` — remember you are outside the browser now.'],
          resources: ['Node.js docs: Introduction'],
        },
      }),
      topic('mern', 'node', 'Backend', 2, 'Modules & npm', 30, {
        content: {
          whatYoullLearn: ['CommonJS require/module.exports', 'package.json and dependencies', 'Installing and using an npm package'],
          keyConcepts: ['require()', 'module.exports', 'npm install'],
          examples: ['Splitting a script into two files and requiring one from the other.'],
          notes: ['package.json is the source of truth for your project — commit it, not node_modules.'],
          resources: ['Node.js docs: Modules', 'npm docs: package.json'],
        },
      }),
      topic('mern', 'node', 'Backend', 3, 'File System & Streams', 35, {
        youtubeVideoId: 'YazJFb_i4A0',
        content: {
          whatYoullLearn: ['Reading and writing files with the fs module', 'Sync vs async fs methods', 'Why streams matter for large files'],
          keyConcepts: ['fs.readFile / fs.writeFile', 'fs.readFileSync', 'Readable/Writable streams'],
          examples: ['Reading a JSON config file asynchronously and handling a missing-file error gracefully.'],
          notes: ['Prefer the async fs methods in real applications — the sync versions block the entire event loop.'],
          resources: ['Node.js docs: File System', 'Node.js docs: Stream'],
        },
      }),
    ],
    practice: [
      { id: 'node-p1', courseId: 'mern', moduleId: 'node', title: 'Build a CLI tool', description: 'Read and transform a local file from the command line.', estimatedMinutes: 45 },
      { id: 'node-p2', courseId: 'mern', moduleId: 'node', title: 'Read & write JSON files', description: 'Persist small CLI state to disk.', estimatedMinutes: 30 },
    ],
    miniTaskId: 'task-node-cli',
    assessmentId: 'assess-node',
    moduleTestId: 'test-node',
    prerequisiteModuleId: 'react-projects',
  },
  {
    courseId: 'mern', id: 'express', title: 'Express.js', group: 'Backend', estimatedDuration: '2 weeks',
    whatYoullLearn: ['Routing', 'Middleware', 'Error handling'],
    topics: [topic('mern', 'express', 'Backend', 1, 'Routing & Middleware', 35)],
    practice: [{ id: 'exp-p1', courseId: 'mern', moduleId: 'express', title: 'Build a small REST server', description: 'CRUD routes with Express.', estimatedMinutes: 45 }],
    miniTaskId: 'task-express-api',
    prerequisiteModuleId: 'node',
  },
  {
    courseId: 'mern', id: 'mongodb', title: 'MongoDB', group: 'Backend', estimatedDuration: '1 week',
    whatYoullLearn: ['Documents & collections', 'CRUD', 'Mongoose schemas'],
    topics: [topic('mern', 'mongodb', 'Backend', 1, 'Documents, Collections & CRUD', 35)],
    practice: [{ id: 'mongo-p1', courseId: 'mern', moduleId: 'mongodb', title: 'Model a small app schema', description: 'Design a Mongoose schema.', estimatedMinutes: 35 }],
    miniTaskId: 'task-mongo-schema',
    prerequisiteModuleId: 'express',
  },
  {
    courseId: 'mern', id: 'rest-apis', title: 'REST APIs', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['API design', 'Status codes', 'Connecting frontend to backend'],
    topics: [topic('mern', 'rest-apis', 'Full Stack', 1, 'API Design Principles', 30)],
    practice: [{ id: 'rest-p1', courseId: 'mern', moduleId: 'rest-apis', title: 'Connect React app to Express API', description: 'Wire the frontend to real endpoints.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'mongodb',
  },
  {
    courseId: 'mern', id: 'authentication', title: 'Authentication', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['JWT', 'Sessions', 'Protecting routes'],
    topics: [topic('mern', 'authentication', 'Full Stack', 1, 'JWT & Sessions', 35)],
    practice: [{ id: 'auth-p1', courseId: 'mern', moduleId: 'authentication', title: 'Add login/signup to your app', description: 'Protect routes with JWT.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'rest-apis',
  },
  {
    courseId: 'mern', id: 'deployment', title: 'Deployment', group: 'Full Stack', estimatedDuration: '1 week',
    whatYoullLearn: ['Environment configs', 'Hosting frontend & backend', 'CI basics'],
    topics: [topic('mern', 'deployment', 'Full Stack', 1, 'Hosting & Environment Configs', 30)],
    practice: [{ id: 'dep-p1', courseId: 'mern', moduleId: 'deployment', title: 'Deploy a full stack app', description: 'Ship frontend and backend live.', estimatedMinutes: 45 }],
    prerequisiteModuleId: 'authentication',
  },
  {
    courseId: 'mern', id: 'major-project', title: 'Major Project', group: 'Capstone', estimatedDuration: '3 weeks',
    whatYoullLearn: ['Bringing your frontend and backend skills together into one real application'],
    topics: [], practice: [],
    // Unlocks once Frontend is complete, not after the whole course — the capstone
    // runs in parallel with Backend/Full Stack, which is how the coaching center
    // actually schedules it.
    prerequisiteModuleId: 'react-projects',
  },
];

export { topicTests };

// ---- Module Tests — the exam-style gate between "all topics done" and the
// module's formal Assessment. Same shape as a topic test question, more of them. ----

export const moduleTests: ModuleTestDef[] = [
  {
    courseId: 'mern', id: 'test-css', moduleId: 'css', title: 'HTML & CSS Module Test', timeLimitMinutes: 15, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tcss1', text: 'Which value of box-sizing makes width include padding and border?', options: ['border-box', 'content-box', 'padding-box', 'inherit'], correctIndex: 0 },
      { id: 'tcss2', text: 'Which property distributes space between flex items?', options: ['justify-content', 'align-items', 'flex-direction', 'gap'], correctIndex: 0 },
      { id: 'tcss3', text: 'Which HTML element is best for the main navigation links?', options: ['<nav>', '<div>', '<section>', '<span>'], correctIndex: 0 },
      { id: 'tcss4', text: 'Which attribute makes a form field required?', options: ['required', 'validate', 'needed', 'mandatory'], correctIndex: 0 },
      { id: 'tcss5', text: 'Grid layout is best described as:', options: ['Two-dimensional (rows and columns)', 'One-dimensional (a single row)', 'Only for text', 'A replacement for HTML tables only'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-js-basics', moduleId: 'js-basics', title: 'JavaScript Basics Module Test', timeLimitMinutes: 15, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tjb1', text: 'Which keyword should you default to when declaring a variable that will not be reassigned?', options: ['const', 'var', 'let', 'static'], correctIndex: 0 },
      { id: 'tjb2', text: 'What does `typeof "hello"` return?', options: ['"string"', '"text"', '"char"', '"object"'], correctIndex: 0 },
      { id: 'tjb3', text: 'Which comparison operator checks both value and type?', options: ['===', '==', '=', '<>'], correctIndex: 0 },
      { id: 'tjb4', text: 'What does a function return if there is no explicit return statement?', options: ['undefined', 'null', '0', 'an error'], correctIndex: 0 },
      { id: 'tjb5', text: 'Which loop is guaranteed to run its body at least once?', options: ['do...while', 'for', 'while', 'for...of'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-js-intermediate', moduleId: 'js-intermediate', title: 'JavaScript Intermediate Module Test', timeLimitMinutes: 18, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tji1', text: 'Which array method does NOT mutate the original array?', options: ['map', 'push', 'splice', 'sort'], correctIndex: 0 },
      { id: 'tji2', text: 'What does object destructuring let you do?', options: ['Extract properties into variables directly', 'Delete an object', 'Clone a function', 'Convert an object to JSON'], correctIndex: 0 },
      { id: 'tji3', text: 'The spread operator (...) on an array does what?', options: ['Expands its elements in place', 'Reverses the array', 'Sorts the array', 'Removes duplicates'], correctIndex: 0 },
      { id: 'tji4', text: 'A higher-order function is one that:', options: ['Takes a function as an argument or returns one', 'Runs faster than other functions', 'Cannot be reused', 'Only works on arrays'], correctIndex: 0 },
      { id: 'tji5', text: 'Which method reduces an array to a single value?', options: ['reduce', 'map', 'filter', 'forEach'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-js-advanced', moduleId: 'js-advanced', title: 'JavaScript Advanced Module Test', timeLimitMinutes: 18, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tja1', text: 'A closure gives a function access to:', options: ["Its outer function's scope even after that function has returned", 'Only global variables', 'The DOM directly', 'Other files automatically'], correctIndex: 0 },
      { id: 'tja2', text: 'Which runs first: synchronous code, a microtask, or a macrotask?', options: ['Synchronous code', 'Microtask', 'Macrotask', 'They always run in parallel'], correctIndex: 0 },
      { id: 'tja3', text: '`await` can only be used inside a function marked:', options: ['async', 'sync', 'defer', 'promise'], correctIndex: 0 },
      { id: 'tja4', text: 'Debouncing a function means:', options: ['Delaying execution until calls stop for a period', 'Running it immediately every time', 'Caching its result forever', 'Running it on a separate thread'], correctIndex: 0 },
      { id: 'tja5', text: 'A Promise that neither resolves nor rejects is in which state?', options: ['Pending', 'Fulfilled', 'Rejected', 'Cancelled'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-react', moduleId: 'react', title: 'React Module Test', timeLimitMinutes: 15, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tr1', text: 'Props are best described as:', options: ['Read-only data passed from a parent component', 'Mutable local state', 'Global variables', 'CSS class names'], correctIndex: 0 },
      { id: 'tr2', text: 'What triggers a React component to re-render?', options: ['A state or prop change', 'Scrolling the page', 'Refreshing CSS', 'Opening dev tools'], correctIndex: 0 },
      { id: 'tr3', text: 'A React component must return:', options: ['JSX (or null)', 'A string only', 'A class instance', 'An HTML file'], correctIndex: 0 },
      { id: 'tr4', text: 'Component names must start with:', options: ['An uppercase letter', 'A number', 'An underscore', 'A lowercase letter'], correctIndex: 0 },
      { id: 'tr5', text: 'The virtual DOM exists to:', options: ['Efficiently compute the minimal real DOM updates needed', 'Replace HTML entirely', 'Store CSS rules', 'Run on the server only'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-react-hooks', moduleId: 'react-hooks', title: 'React Hooks Module Test', timeLimitMinutes: 18, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'trh1', text: 'useEffect with an empty dependency array `[]` runs:', options: ['Once, after the first render', 'On every render', 'Never', 'Only on unmount'], correctIndex: 0 },
      { id: 'trh2', text: 'A custom hook name must start with:', options: ['use', 'get', 'hook', 'with'], correctIndex: 0 },
      { id: 'trh3', text: 'Calling a useState setter schedules:', options: ['A re-render with the new value', 'An immediate DOM mutation', 'A page reload', 'Nothing by itself'], correctIndex: 0 },
      { id: 'trh4', text: 'The cleanup function returned from useEffect runs:', options: ['Before the effect re-runs and on unmount', 'Only once, ever', 'Before the first render', 'Never'], correctIndex: 0 },
      { id: 'trh5', text: 'Custom hooks let you:', options: ['Extract and reuse stateful logic between components', 'Replace JSX entirely', 'Avoid using React', 'Write CSS in JavaScript'], correctIndex: 0 },
    ],
  },
  {
    courseId: 'mern', id: 'test-node', moduleId: 'node', title: 'Node.js Module Test', timeLimitMinutes: 20, passingScorePercent: 70, attemptsAllowed: 2,
    questions: [
      { id: 'tn1', text: 'Which keyword imports a module in CommonJS?', options: ['require', 'import', 'include', 'using'], correctIndex: 0 },
      { id: 'tn2', text: 'Which fs method does NOT block the event loop?', options: ['fs.readFile', 'fs.readFileSync', 'fs.statSync', 'fs.existsSync'], correctIndex: 0 },
      { id: 'tn3', text: 'A project\'s dependencies are declared in:', options: ['package.json', 'node_modules', '.env', 'index.js'], correctIndex: 0 },
      { id: 'tn4', text: 'Streams are especially useful for:', options: ['Processing large files without loading them fully into memory', 'Styling a webpage', 'Declaring variables', 'Writing CSS'], correctIndex: 0 },
      { id: 'tn5', text: 'What does `module.exports` do?', options: ['Defines what a file exposes to other files', 'Starts an HTTP server', 'Installs a package', 'Deletes a file'], correctIndex: 0 },
    ],
  },
];

// ---- Daily Coding ----

export const codingQuestions: CodingQuestionDef[] = [
  {
    id: 'q1', scope: 'course', courseId: 'mern', day: 1, title: 'Reverse a String', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    problemStatement: 'Given a string, return it reversed.', exampleInput: '"hello"', exampleOutput: '"olleh"',
    constraints: ['1 <= s.length <= 10^4'], hints: ['Try splitting the string into characters first.'],
    testCasesTotal: 6, keywordChecks: ['split', 'reverse', 'join'],
  },
  {
    id: 'q2', scope: 'course', courseId: 'mern', day: 10, title: 'Count Vowels', difficulty: 'Beginner', topic: 'Strings', tags: ['Strings'],
    problemStatement: 'Count the number of vowels in a string.', exampleInput: '"coaching"', exampleOutput: '3',
    constraints: [], hints: ['A simple loop with an includes() check works well.'],
    testCasesTotal: 5, keywordChecks: ['vowel', 'includes', 'for'],
  },
  {
    id: 'q3', scope: 'course', courseId: 'mern', day: 20, title: 'Find the Largest Number', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays'],
    problemStatement: 'Return the largest number in an array.', exampleInput: '[3,9,2]', exampleOutput: '9',
    constraints: [], hints: ['Math.max with spread is the shortest solution.'],
    testCasesTotal: 5, keywordChecks: ['max', 'reduce'],
  },
  {
    id: 'q4', scope: 'course', courseId: 'mern', day: 30, title: 'Two Sum', difficulty: 'Beginner', topic: 'Arrays', tags: ['Arrays', 'Hash Map'],
    problemStatement: 'Return indices of the two numbers that add up to a target.', exampleInput: '[2,7,11,15], target=9', exampleOutput: '[0,1]',
    constraints: [], hints: ['A hash map gets you from O(n²) to O(n).'],
    testCasesTotal: 8, keywordChecks: ['map', 'indexof', 'has'],
  },
  {
    id: 'q5', scope: 'course', courseId: 'mern', day: 38, title: 'Balanced Parentheses', difficulty: 'Intermediate', topic: 'Stacks', tags: ['Stacks'],
    problemStatement: 'Check whether a string of brackets is balanced.', exampleInput: '"([)]"', exampleOutput: 'false',
    constraints: [], hints: ['A stack naturally matches the most recent unmatched opening bracket.'],
    testCasesTotal: 6, keywordChecks: ['stack', 'push', 'pop'],
  },
  {
    id: 'q6', scope: 'course', courseId: 'mern', day: 45, title: 'Group Objects by Key', difficulty: 'Intermediate', topic: 'Objects', tags: ['Objects', 'Arrays'],
    problemStatement: 'Group an array of objects by a given key.', exampleInput: '[{team:"A"},{team:"B"},{team:"A"}]', exampleOutput: '{A:[...], B:[...]}',
    constraints: [], hints: ['reduce() into an accumulator object keyed by the field.'],
    testCasesTotal: 6, keywordChecks: ['reduce', 'key'],
  },
  {
    id: 'q7', scope: 'course', courseId: 'mern', day: 47, title: 'Flatten a Nested Array', difficulty: 'Intermediate', topic: 'Arrays', tags: ['Arrays', 'Recursion'],
    problemStatement: 'Given a nested array, return a single flattened array.', exampleInput: '[1,[2,[3,4]],5]', exampleOutput: '[1,2,3,4,5]',
    constraints: ['Array can be nested to arbitrary depth.'], hints: ['Array.isArray() plus recursion, or Array.prototype.flat(Infinity).'],
    testCasesTotal: 8, keywordChecks: ['isarray', 'flat', 'concat', 'recur'],
  },
  {
    id: 'q8', scope: 'course', courseId: 'mern', day: 60, title: 'Recursion Basics', difficulty: 'Intermediate', topic: 'Recursion', tags: ['Recursion'],
    problemStatement: 'Compute the factorial of n using recursion.', exampleInput: 'n=5', exampleOutput: '120',
    constraints: ['0 <= n <= 12'], hints: ['Define the base case first.'],
    testCasesTotal: 6, keywordChecks: ['return', 'function'],
  },
  {
    id: 'q9', scope: 'course', courseId: 'mern', day: 100, title: 'Debouncing', difficulty: 'Advanced', topic: 'Functions', tags: ['Functions', 'Timing'],
    problemStatement: 'Implement a debounce(fn, delay) higher-order function.', exampleInput: 'debounce(fn, 300)', exampleOutput: 'a function that delays calls to fn',
    constraints: [], hints: ['setTimeout + clearTimeout on every call.'],
    testCasesTotal: 6, keywordChecks: ['settimeout', 'cleartimeout'],
  },
  {
    id: 'q10', scope: 'course', courseId: 'mern', day: 120, title: 'Promise.all from Scratch', difficulty: 'Advanced', topic: 'Async', tags: ['Promises'],
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
    courseId: 'mern', id: 'task-html', title: 'Build a Responsive Portfolio', moduleId: 'html', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-08',
    objective: 'Build a personal portfolio page using semantic HTML and CSS.', skills: ['HTML', 'CSS'],
    requirements: ['Semantic page structure', 'About + projects sections', 'Contact form'],
    resources: ['MDN: Semantic HTML', 'Course reading: Accessible forms'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    courseId: 'mern', id: 'task-css', title: 'Build a Responsive Landing Page', moduleId: 'css', difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '2026-05-20',
    objective: 'Build a fully responsive landing page using Flexbox and Grid.', skills: ['CSS', 'Responsive Design'],
    requirements: ['Mobile-first layout', 'Flexbox/Grid based sections'],
    resources: ['MDN: CSS Grid', 'MDN: Flexbox'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    courseId: 'mern', id: 'task-js-utils', title: 'Build an Array Utility Library', moduleId: 'js-intermediate', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-06-14',
    objective: 'Build a small library of array utility functions (chunk, unique, groupBy, flatten).', skills: ['JavaScript', 'Array Methods'],
    requirements: ['chunk()', 'unique()', 'groupBy()', 'flatten()'],
    resources: ['MDN: Array methods reference'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    courseId: 'mern', id: 'task-react-components', title: 'Build a Reusable Component Library', moduleId: 'react', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-07-10',
    objective: 'Build a small set of reusable, prop-driven React components (Button, Card, Modal, Input).', skills: ['React', 'Component Design'],
    requirements: ['Button, Card, Modal, Input', 'Prop-driven variants'],
    resources: ['React docs: Thinking in React'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    courseId: 'mern', id: 'task-react-todo', title: 'Build a React Todo Application', moduleId: 'react-hooks', difficulty: 'Intermediate', estimatedDuration: '3 days', deadline: '2026-09-28',
    objective: 'Build a Todo application using React Hooks.', skills: ['React', 'State Management', 'Component Architecture'],
    requirements: ['Add Todo', 'Delete Todo', 'Mark Complete', 'Filtering', 'Persistence'],
    resources: ['React docs: useState', 'React docs: useEffect'],
    evaluationCriteriaTemplate: standardFrontendCriteria,
  },
  {
    courseId: 'mern', id: 'task-node-cli', title: 'Build a Node CLI Tool', moduleId: 'node', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-11-02',
    objective: 'Build a command-line tool that reads and transforms a local file.', skills: ['Node.js', 'File System'],
    requirements: ['Read from file system', 'Transform + write output', 'Handle a missing-file error gracefully'],
    resources: ['Node docs: fs module'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    courseId: 'mern', id: 'task-express-api', title: 'Build a REST API', moduleId: 'express', difficulty: 'Advanced', estimatedDuration: '3 days', deadline: '2026-11-20',
    objective: 'Build a CRUD REST API with Express.', skills: ['Express', 'REST'],
    requirements: ['GET/POST/PUT/DELETE routes', 'Input validation', 'Centralized error handling'],
    resources: ['Express docs: Routing'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
  {
    courseId: 'mern', id: 'task-mongo-schema', title: 'Model a MongoDB Schema', moduleId: 'mongodb', difficulty: 'Intermediate', estimatedDuration: '2 days', deadline: '2026-12-02',
    objective: 'Design and implement a Mongoose schema for a small app.', skills: ['MongoDB', 'Mongoose'],
    requirements: ['Schema with validation', 'At least one relationship (ref)', 'Seed script'],
    resources: ['Mongoose docs: Schemas'],
    evaluationCriteriaTemplate: standardBackendCriteria,
  },
];

// ---- Assessments (5 questions each — enough to demo a real attempt flow) ----

export const assessments: AssessmentDef[] = [
  {
    courseId: 'mern', id: 'assess-html-css', title: 'HTML & CSS Fundamentals', moduleId: 'css', topics: ['HTML', 'CSS', 'Responsive Design'],
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
    courseId: 'mern', id: 'assess-js-basics', title: 'JavaScript Basics', moduleId: 'js-basics', topics: ['Variables', 'Loops', 'Functions'],
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
    courseId: 'mern', id: 'assess-js-intermediate', title: 'JavaScript Intermediate', moduleId: 'js-intermediate', topics: ['Arrays', 'Objects', 'Closures', 'Async JavaScript'],
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
    courseId: 'mern', id: 'assess-js-advanced', title: 'JavaScript Advanced', moduleId: 'js-advanced', topics: ['Closures', 'Event Loop', 'Promises'],
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
    courseId: 'mern', id: 'assess-react', title: 'React Fundamentals', moduleId: 'react', topics: ['Components', 'Props', 'State'],
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
    courseId: 'mern', id: 'assess-react-hooks', title: 'React Hooks', moduleId: 'react-hooks', topics: ['useState', 'useEffect', 'Custom Hooks'],
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
    courseId: 'mern', id: 'assess-node', title: 'Node.js Fundamentals', moduleId: 'node', topics: ['Modules', 'File System', 'npm'],
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
  id: 'major-project-capstone',
  courseId: 'mern',
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
