// The single source of truth for everything the student has done. Every page reads
// from here via useAppState() and dispatches actions through the returned helpers —
// nothing keeps its own local copy of "is this submitted / is this passed". That's
// what makes an action on one screen show up correctly on every other screen
// without a page refresh.
import * as React from 'react';
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { StudentProgressState, NotificationItem, MiniTaskSubmissionVersion, QuizAttemptRecord, MiniTaskEvaluation } from './types';
import { createInitialProgressState } from './initialState';
import { evaluateCodingSubmission } from './engine/codingEvaluator';
import { scoreAssessmentAttempt, AssessmentScoreResult } from './engine/assessmentEngine';
import { scoreQuiz } from './engine/quizEngine';
import { codingQuestions, miniTasks, assessments, majorProject, topicTests, moduleTests } from '../data/mockData';

type Action =
  | { type: 'MARK_TOPIC_VIEWED'; topicId: string }
  | { type: 'SUBMIT_TOPIC_TEST'; topicId: string; answers: Record<string, number> }
  | { type: 'SUBMIT_MODULE_TEST'; moduleId: string; moduleTestId: string; answers: Record<string, number> }
  | { type: 'COMPLETE_PRACTICE'; practiceId: string }
  | { type: 'RECORD_CODING_ATTEMPT'; questionId: string; code: string }
  | { type: 'SUBMIT_MINI_TASK'; taskId: string; githubUrl: string; liveUrl: string; notes: string; github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string } }
  | { type: 'ADMIN_EVALUATE_MINI_TASK'; taskId: string; version: number; evaluation: MiniTaskEvaluation }
  | { type: 'RECORD_ASSESSMENT_ATTEMPT'; assessmentId: string; answers: Record<string, number> }
  | { type: 'ADVANCE_MILESTONE'; milestoneId: string; nextMilestoneId?: string }
  | { type: 'SUBMIT_PROJECT'; githubUrl: string; liveUrl: string; documentationUrl: string };

function pushNotification(list: NotificationItem[], message: string, kind: NotificationItem['kind']): NotificationItem[] {
  const item: NotificationItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, message, date: new Date().toISOString(), kind };
  return [item, ...list].slice(0, 20);
}

function reducer(state: StudentProgressState, action: Action): StudentProgressState {
  switch (action.type) {
    case 'MARK_TOPIC_VIEWED': {
      const existing = state.topics[action.topicId] || { contentViewed: false, testAttempts: [] };
      if (existing.contentViewed) return state;
      return { ...state, topics: { ...state.topics, [action.topicId]: { ...existing, contentViewed: true } } };
    }

    case 'SUBMIT_TOPIC_TEST': {
      const test = topicTests.find((t) => t.topicId === action.topicId);
      if (!test) return state;
      const result = scoreQuiz(test.questions, action.answers, test.passingScorePercent);
      const existing = state.topics[action.topicId] || { contentViewed: true, testAttempts: [] };
      const record: QuizAttemptRecord = { attemptNo: existing.testAttempts.length + 1, answers: action.answers, scorePercent: result.scorePercent, passed: result.passed, date: new Date().toISOString() };
      const notifications = pushNotification(state.notifications, `Topic test: ${result.scorePercent}% — ${result.passed ? 'passed' : 'not yet passed'}.`, result.passed ? 'success' : 'warning');
      return { ...state, topics: { ...state.topics, [action.topicId]: { contentViewed: true, testAttempts: [...existing.testAttempts, record] } }, notifications };
    }

    case 'SUBMIT_MODULE_TEST': {
      const test = moduleTests.find((t) => t.id === action.moduleTestId);
      if (!test) return state;
      const result = scoreQuiz(test.questions, action.answers, test.passingScorePercent);
      const existing = state.moduleTests[action.moduleTestId] || { attempts: [] };
      const record: QuizAttemptRecord = { attemptNo: existing.attempts.length + 1, answers: action.answers, scorePercent: result.scorePercent, passed: result.passed, date: new Date().toISOString() };
      const notifications = pushNotification(state.notifications, `${test.title}: ${result.scorePercent}% — ${result.passed ? 'passed' : 'not yet passed'}.`, result.passed ? 'success' : 'warning');
      return { ...state, moduleTests: { ...state.moduleTests, [action.moduleTestId]: { attempts: [...existing.attempts, record] } }, notifications };
    }

    case 'COMPLETE_PRACTICE':
      return { ...state, practiceStatus: { ...state.practiceStatus, [action.practiceId]: 'completed' } };

    case 'RECORD_CODING_ATTEMPT': {
      const question = codingQuestions.find((q) => q.id === action.questionId);
      if (!question) return state;
      const attempt = evaluateCodingSubmission(question, action.code);
      const existing = state.coding[action.questionId] || { attempts: [] };
      const alreadySolved = existing.attempts.some((a) => a.passed);
      const isToday = question.day === state.codingCurrentDay;

      let codingCurrentDay = state.codingCurrentDay;
      let streak = state.codingStreak;
      let notifications = state.notifications;

      if (attempt.passed && !alreadySolved && isToday) {
        streak = { current: streak.current + 1, best: Math.max(streak.best, streak.current + 1) };
        const nextDay = codingQuestions.map((q) => q.day).filter((d) => d > question.day).sort((a, b) => a - b)[0];
        if (nextDay) codingCurrentDay = nextDay;
        notifications = pushNotification(notifications, `Day ${question.day} solved — streak now ${streak.current} days.`, 'success');
      } else if (!attempt.passed) {
        notifications = pushNotification(notifications, `Day ${question.day} attempt: ${attempt.passedTests}/${attempt.totalTests} tests passed.`, 'info');
      }

      return {
        ...state,
        coding: { ...state.coding, [action.questionId]: { attempts: [...existing.attempts, attempt] } },
        codingCurrentDay,
        codingStreak: streak,
        notifications,
      };
    }

    case 'SUBMIT_MINI_TASK': {
      const task = miniTasks.find((t) => t.id === action.taskId);
      if (!task) return state;
      const existing = state.miniTasks[action.taskId] || { status: 'Not Started', versions: [] };
      const version: MiniTaskSubmissionVersion = {
        version: existing.versions.length + 1,
        githubUrl: action.githubUrl,
        githubRepositoryName: action.github?.repositoryName,
        githubBranch: action.github?.branch,
        githubCommitSha: action.github?.commitSha,
        githubPullRequestUrl: action.github?.pullRequestUrl,
        liveUrl: action.liveUrl,
        notes: action.notes,
        submittedAt: new Date().toISOString(),
      };
      const notifications = pushNotification(state.notifications, `"${task.title}" submitted for review.`, 'success');
      return {
        ...state,
        miniTasks: { ...state.miniTasks, [action.taskId]: { status: 'Under Review', versions: [...existing.versions, version] } },
        notifications,
      };
    }

    case 'ADMIN_EVALUATE_MINI_TASK': {
      const task = miniTasks.find((t) => t.id === action.taskId);
      const entry = state.miniTasks[action.taskId];
      if (!task || !entry) return state;
      const versionIndex = entry.versions.findIndex((v) => v.version === action.version);
      if (versionIndex === -1) return state;
      const versions = entry.versions.map((v, i) => (i === versionIndex ? { ...v, evaluation: action.evaluation } : v));
      const notifications = pushNotification(
        state.notifications,
        action.evaluation.outcome === 'Passed'
          ? `"${task.title}" passed review.`
          : `Instructor requested changes on "${task.title}".`,
        action.evaluation.outcome === 'Passed' ? 'success' : 'warning'
      );
      return {
        ...state,
        miniTasks: { ...state.miniTasks, [action.taskId]: { status: action.evaluation.outcome, versions } },
        notifications,
      };
    }

    case 'RECORD_ASSESSMENT_ATTEMPT': {
      const assessment = assessments.find((a) => a.id === action.assessmentId);
      if (!assessment) return state;
      const result: AssessmentScoreResult = scoreAssessmentAttempt(assessment, action.answers);
      const existing = state.assessments[action.assessmentId] || { attempts: [] };
      const record = {
        attemptNo: existing.attempts.length + 1,
        answers: action.answers,
        scorePercent: result.scorePercent,
        passed: result.passed,
        strongTopics: result.strongTopics,
        weakTopics: result.weakTopics,
        date: new Date().toISOString(),
      };
      const notifications = pushNotification(
        state.notifications,
        `${assessment.title} result: ${result.scorePercent}% — ${result.passed ? 'passed' : 'not yet passed'}.`,
        result.passed ? 'success' : 'warning'
      );
      return {
        ...state,
        assessments: { ...state.assessments, [action.assessmentId]: { attempts: [...existing.attempts, record] } },
        notifications,
      };
    }

    case 'ADVANCE_MILESTONE': {
      const milestoneStatus = { ...state.project.milestoneStatus, [action.milestoneId]: 'completed' as const };
      if (action.nextMilestoneId) milestoneStatus[action.nextMilestoneId] = 'current';
      const milestone = majorProject.milestones.find((m) => m.id === action.milestoneId);
      const notifications = pushNotification(state.notifications, `Milestone "${milestone?.title || ''}" marked complete.`, 'success');
      return { ...state, project: { ...state.project, milestoneStatus }, notifications };
    }

    case 'SUBMIT_PROJECT': {
      const notifications = pushNotification(state.notifications, 'Major Project submitted for final review.', 'success');
      return {
        ...state,
        project: {
          ...state.project,
          submission: { githubUrl: action.githubUrl, liveUrl: action.liveUrl, documentationUrl: action.documentationUrl, submittedAt: new Date().toISOString() },
        },
        notifications,
      };
    }

    default:
      return state;
  }
}

interface AppStateContextValue {
  state: StudentProgressState;
  markTopicViewed: (topicId: string) => void;
  submitTopicTest: (topicId: string, answers: Record<string, number>) => void;
  submitModuleTest: (moduleId: string, moduleTestId: string, answers: Record<string, number>) => void;
  completePractice: (practiceId: string) => void;
  submitCoding: (questionId: string, code: string) => void;
  submitMiniTask: (taskId: string, githubUrl: string, liveUrl: string, notes: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => void;
  adminEvaluateMiniTask: (taskId: string, version: number, evaluation: MiniTaskEvaluation) => void;
  submitAssessment: (assessmentId: string, answers: Record<string, number>) => void;
  advanceMilestone: (milestoneId: string, nextMilestoneId?: string) => void;
  submitProject: (githubUrl: string, liveUrl: string, documentationUrl: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialProgressState);

  const markTopicViewed = useCallback((topicId: string) => dispatch({ type: 'MARK_TOPIC_VIEWED', topicId }), []);
  const submitTopicTest = useCallback((topicId: string, answers: Record<string, number>) => dispatch({ type: 'SUBMIT_TOPIC_TEST', topicId, answers }), []);
  const submitModuleTest = useCallback((moduleId: string, moduleTestId: string, answers: Record<string, number>) => dispatch({ type: 'SUBMIT_MODULE_TEST', moduleId, moduleTestId, answers }), []);
  const completePractice = useCallback((practiceId: string) => dispatch({ type: 'COMPLETE_PRACTICE', practiceId }), []);
  const submitCoding = useCallback((questionId: string, code: string) => dispatch({ type: 'RECORD_CODING_ATTEMPT', questionId, code }), []);

  const submitMiniTask = useCallback((taskId: string, githubUrl: string, liveUrl: string, notes: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => {
    // A submission now waits for a real Mentor Portal review (see
    // admin/pages/EvaluationQueuePage.tsx / adminEvaluateMiniTask) instead of
    // resolving itself — GitHub activity is evidence, not completion, and only
    // a mentor's evaluation decides Passed vs Changes Requested.
    dispatch({ type: 'SUBMIT_MINI_TASK', taskId, githubUrl, liveUrl, notes, github });
  }, []);

  const adminEvaluateMiniTask = useCallback((taskId: string, version: number, evaluation: MiniTaskEvaluation) => dispatch({ type: 'ADMIN_EVALUATE_MINI_TASK', taskId, version, evaluation }), []);
  const submitAssessment = useCallback((assessmentId: string, answers: Record<string, number>) => dispatch({ type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId, answers }), []);
  const advanceMilestone = useCallback((milestoneId: string, nextMilestoneId?: string) => dispatch({ type: 'ADVANCE_MILESTONE', milestoneId, nextMilestoneId }), []);
  const submitProject = useCallback((githubUrl: string, liveUrl: string, documentationUrl: string) => dispatch({ type: 'SUBMIT_PROJECT', githubUrl, liveUrl, documentationUrl }), []);

  const value = useMemo<AppStateContextValue>(
    () => ({ state, markTopicViewed, submitTopicTest, submitModuleTest, completePractice, submitCoding, submitMiniTask, adminEvaluateMiniTask, submitAssessment, advanceMilestone, submitProject }),
    [state, markTopicViewed, submitTopicTest, submitModuleTest, completePractice, submitCoding, submitMiniTask, adminEvaluateMiniTask, submitAssessment, advanceMilestone, submitProject]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
