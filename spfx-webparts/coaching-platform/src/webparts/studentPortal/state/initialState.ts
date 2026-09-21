// The seed narrative: one coherent student, not a grab-bag of demo fragments.
// Foundation → Frontend is complete (including a full resubmit-to-pass mini task
// history on React Hooks), Node.js is the active module with a live "Changes
// Requested" task ready to be fixed and resubmitted, Backend/Full Stack beyond
// Node are locked, and the Major Project has unlocked in parallel (it only needs
// Frontend, not the whole course) and is 40% in progress — matching a coaching
// center that lets capstone work start once core skills are covered.
import { StudentProgressState } from './types';

const now = new Date();
const daysAgo = (n: number): string => new Date(now.getTime() - n * 86400000).toISOString();

export function createInitialProgressState(): StudentProgressState {
  return {
    lessonStatus: {
      'html-l1': 'completed', 'html-l2': 'completed',
      'css-l1': 'completed', 'css-l2': 'completed',
      'jsb-l1': 'completed', 'jsb-l2': 'completed', 'jsb-l3': 'completed',
      'jsi-l1': 'completed', 'jsi-l2': 'completed', 'jsi-l3': 'completed',
      'jsa-l1': 'completed', 'jsa-l2': 'completed', 'jsa-l3': 'completed',
      'react-l1': 'completed', 'react-l2': 'completed',
      'rh-l1': 'completed', 'rh-l2': 'completed', 'rh-l3': 'completed',
      'sm-l1': 'completed',
      'rp-l1': 'completed',
      'node-l1': 'completed', 'node-l2': 'completed', 'node-l3': 'current',
    },
    practiceStatus: {
      'html-p1': 'completed', 'html-p2': 'completed',
      'css-p1': 'completed',
      'jsb-p1': 'completed', 'jsb-p2': 'completed',
      'jsi-p1': 'completed', 'jsi-p2': 'completed', 'jsi-p3': 'completed',
      'jsa-p1': 'completed',
      'react-p1': 'completed',
      'rh-p1': 'completed', 'rh-p2': 'completed',
      'sm-p1': 'completed',
      'rp-p1': 'completed',
      'node-p1': 'current', 'node-p2': 'upcoming',
    },
    coding: {
      q1: { attempts: [{ code: "function solve(s) {\n  return s.split('').reverse().join('');\n}", passed: true, passedTests: 6, totalTests: 6, scorePercent: 100, timeComplexity: 'O(n)', whatWentWell: ['Clean one-line solution using built-in array methods.'], whatToImprove: [], explanation: 'Correctly reverses the string for all test cases.', submittedAt: daysAgo(47) }] },
      q2: { attempts: [{ code: "function solve(s) {\n  let count = 0;\n  for (const c of s) if ('aeiou'.includes(c.toLowerCase())) count++;\n  return count;\n}", passed: true, passedTests: 5, totalTests: 5, scorePercent: 100, timeComplexity: 'O(n)', whatWentWell: ['Simple, readable vowel check.'], whatToImprove: [], explanation: 'Handles upper and lower case correctly.', submittedAt: daysAgo(37) }] },
      q3: { attempts: [{ code: 'function solve(arr) {\n  return Math.max(...arr);\n}', passed: true, passedTests: 5, totalTests: 5, scorePercent: 100, timeComplexity: 'O(n)', whatWentWell: ['Idiomatic use of Math.max with spread.'], whatToImprove: [], explanation: 'Correct for all provided arrays.', submittedAt: daysAgo(27) }] },
      q4: { attempts: [{ code: 'function solve(arr, target) {\n  const seen = new Map();\n  for (let i = 0; i < arr.length; i++) {\n    const need = target - arr[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(arr[i], i);\n  }\n}', passed: true, passedTests: 8, totalTests: 8, scorePercent: 100, timeComplexity: 'O(n)', whatWentWell: ['Hash map approach — O(n) instead of the brute-force O(n²).'], whatToImprove: [], explanation: 'All target pairs found correctly.', submittedAt: daysAgo(17) }] },
      q5: { attempts: [{ code: 'function solve(s) {\n  let open = 0;\n  for (const c of s) {\n    if (c === "(") open++;\n    if (c === ")") open--;\n  }\n  return open === 0;\n}', passed: false, passedTests: 3, totalTests: 6, scorePercent: 50, timeComplexity: 'O(n)', whatWentWell: ['Correctly counts overall bracket balance.'], whatToImprove: ['This only checks the total count, not order — "([)]" would incorrectly pass. Use a stack so the most recent open bracket must match the next close.'], explanation: 'Fails on mismatched bracket order, since a simple counter cannot detect that.', submittedAt: daysAgo(9) }] },
      q6: { attempts: [{ code: "function solve(arr, key) {\n  return arr.reduce((acc, item) => {\n    (acc[item[key]] ||= []).push(item);\n    return acc;\n  }, {});\n}", passed: true, passedTests: 6, totalTests: 6, scorePercent: 100, timeComplexity: 'O(n)', whatWentWell: ['Clean reduce-based grouping.'], whatToImprove: [], explanation: 'Groups correctly for all provided keys.', submittedAt: daysAgo(2) }] },
      q7: { attempts: [] },
      q8: { attempts: [] },
      q9: { attempts: [] },
      q10: { attempts: [] },
    },
    codingCurrentDay: 47,
    codingStreak: { current: 12, best: 21 },
    miniTasks: {
      'task-html': { status: 'Passed', versions: [{ version: 1, githubUrl: 'https://github.com/rahul/portfolio', liveUrl: 'https://rahul-portfolio.example.com', notes: '', submittedAt: daysAgo(180), evaluation: { outcome: 'Passed', evaluatedAt: daysAgo(178), feedback: 'Clean structure and good use of semantic tags.', criteria: [{ label: 'Code Quality', score: 9, maxScore: 10 }, { label: 'Functionality', score: 9, maxScore: 10 }, { label: 'UI / UX', score: 8, maxScore: 10 }, { label: 'Architecture', score: 8, maxScore: 10 }, { label: 'Best Practices', score: 8, maxScore: 10 }] } }] },
      'task-css': { status: 'Passed', versions: [{ version: 1, githubUrl: 'https://github.com/rahul/landing-page', liveUrl: 'https://rahul-landing.example.com', notes: '', submittedAt: daysAgo(168), evaluation: { outcome: 'Passed', evaluatedAt: daysAgo(166), feedback: 'Good responsive behavior across breakpoints.', criteria: [{ label: 'Code Quality', score: 8, maxScore: 10 }, { label: 'Functionality', score: 8, maxScore: 10 }, { label: 'UI / UX', score: 9, maxScore: 10 }, { label: 'Architecture', score: 8, maxScore: 10 }, { label: 'Best Practices', score: 8, maxScore: 10 }] } }] },
      'task-js-utils': { status: 'Passed', versions: [{ version: 1, githubUrl: 'https://github.com/rahul/array-utils', liveUrl: '', notes: '', submittedAt: daysAgo(140), evaluation: { outcome: 'Passed', evaluatedAt: daysAgo(138), feedback: 'Solid implementation with good test coverage.', criteria: [{ label: 'Code Quality', score: 9, maxScore: 10 }, { label: 'Functionality', score: 10, maxScore: 10 }, { label: 'Error Handling', score: 8, maxScore: 10 }, { label: 'Architecture', score: 8, maxScore: 10 }, { label: 'Best Practices', score: 8, maxScore: 10 }] } }] },
      'task-react-components': { status: 'Passed', versions: [{ version: 1, githubUrl: 'https://github.com/rahul/ui-kit', liveUrl: 'https://rahul-ui-kit.example.com', notes: '', submittedAt: daysAgo(100), evaluation: { outcome: 'Passed', evaluatedAt: daysAgo(98), feedback: 'Well-structured, reusable components.', criteria: [{ label: 'Code Quality', score: 8, maxScore: 10 }, { label: 'Functionality', score: 9, maxScore: 10 }, { label: 'UI / UX', score: 8, maxScore: 10 }, { label: 'Architecture', score: 9, maxScore: 10 }, { label: 'Best Practices', score: 8, maxScore: 10 }] } }] },
      'task-react-todo': {
        status: 'Passed',
        versions: [
          {
            version: 1, githubUrl: 'https://github.com/rahul/react-todo', liveUrl: 'https://rahul-todo.example.com', notes: 'Used localStorage for persistence.', submittedAt: daysAgo(30),
            evaluation: { outcome: 'Changes Requested', evaluatedAt: daysAgo(28), feedback: 'Good implementation. Filtering logic should be extracted into a reusable hook. Also improve error handling.', criteria: [{ label: 'Code Quality', score: 8, maxScore: 10 }, { label: 'Functionality', score: 9, maxScore: 10 }, { label: 'UI / UX', score: 8, maxScore: 10 }, { label: 'Architecture', score: 6, maxScore: 10 }, { label: 'Best Practices', score: 7, maxScore: 10 }] },
          },
          {
            version: 2, githubUrl: 'https://github.com/rahul/react-todo', liveUrl: 'https://rahul-todo.example.com', notes: 'Extracted filtering into a useFilteredTodos hook, added error handling around localStorage reads.', submittedAt: daysAgo(22),
            evaluation: { outcome: 'Passed', evaluatedAt: daysAgo(20), feedback: 'Great fix — the filtering hook is clean and reusable, and the error handling is much more robust now.', criteria: [{ label: 'Code Quality', score: 9, maxScore: 10 }, { label: 'Functionality', score: 9, maxScore: 10 }, { label: 'UI / UX', score: 8, maxScore: 10 }, { label: 'Architecture', score: 9, maxScore: 10 }, { label: 'Best Practices', score: 9, maxScore: 10 }] },
          },
        ],
      },
      'task-node-cli': {
        status: 'Changes Requested',
        versions: [
          {
            version: 1, githubUrl: 'https://github.com/rahul/node-cli', liveUrl: '', notes: 'Reads a JSON file and writes a transformed copy.', submittedAt: daysAgo(3),
            evaluation: { outcome: 'Changes Requested', evaluatedAt: daysAgo(1), feedback: "Core transform logic works well. The tool crashes with an unhandled exception when the input file doesn't exist — wrap the read in a try/catch and print a clear error instead.", criteria: [{ label: 'Code Quality', score: 8, maxScore: 10 }, { label: 'Functionality', score: 8, maxScore: 10 }, { label: 'Error Handling', score: 4, maxScore: 10 }, { label: 'Architecture', score: 7, maxScore: 10 }, { label: 'Best Practices', score: 7, maxScore: 10 }] },
          },
        ],
      },
      'task-express-api': { status: 'Not Started', versions: [] },
      'task-mongo-schema': { status: 'Not Started', versions: [] },
    },
    assessments: {
      'assess-html-css': { attempts: [{ attemptNo: 1, answers: {}, scorePercent: 92, passed: true, strongTopics: ['HTML', 'CSS', 'Responsive Design'], weakTopics: [], date: daysAgo(165) }] },
      'assess-js-basics': { attempts: [{ attemptNo: 1, answers: {}, scorePercent: 82, passed: true, strongTopics: ['Loops', 'Functions'], weakTopics: [], date: daysAgo(150) }] },
      'assess-js-intermediate': {
        attempts: [
          { attemptNo: 1, answers: {}, scorePercent: 68, passed: false, strongTopics: ['Arrays'], weakTopics: ['Objects', 'Closures', 'Async JavaScript'], date: daysAgo(136) },
          { attemptNo: 2, answers: {}, scorePercent: 74, passed: true, strongTopics: ['Arrays', 'Objects'], weakTopics: ['Closures', 'Async JavaScript'], date: daysAgo(133) },
        ],
      },
      'assess-js-advanced': {
        attempts: [
          { attemptNo: 1, answers: {}, scorePercent: 62, passed: false, strongTopics: ['Promises'], weakTopics: ['Event Loop', 'Closures'], date: daysAgo(115) },
          { attemptNo: 2, answers: {}, scorePercent: 78, passed: true, strongTopics: ['Promises', 'Closures'], weakTopics: ['Event Loop'], date: daysAgo(112) },
        ],
      },
      'assess-react': { attempts: [{ attemptNo: 1, answers: {}, scorePercent: 85, passed: true, strongTopics: ['Components', 'Props', 'State'], weakTopics: [], date: daysAgo(95) }] },
      'assess-react-hooks': { attempts: [{ attemptNo: 1, answers: {}, scorePercent: 88, passed: true, strongTopics: ['useState', 'useEffect', 'Custom Hooks'], weakTopics: [], date: daysAgo(25) }] },
      'assess-node': { attempts: [] },
    },
    project: {
      milestoneStatus: {
        m1: 'completed', m2: 'completed', m3: 'completed', m4: 'completed',
        m5: 'current', m6: 'upcoming', m7: 'upcoming', m8: 'upcoming',
      },
    },
    notifications: [
      { id: 'n1', message: 'Instructor requested changes on your Node CLI Tool submission.', date: daysAgo(1), kind: 'warning' },
      { id: 'n2', message: 'Your React Todo Application resubmission was approved.', date: daysAgo(20), kind: 'success' },
      { id: 'n3', message: 'Major Project unlocked — you can start the Frontend milestone.', date: daysAgo(35), kind: 'info' },
      { id: 'n4', message: 'React Hooks assessment result: 88% — passed.', date: daysAgo(25), kind: 'success' },
    ],
  };
}
