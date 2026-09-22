// The student-facing adapter over the scoped progress repository. Every page
// still reads via useAppState() and dispatches through the returned helpers —
// that part is unchanged. What changed is WHERE the state actually lives: it
// is no longer a React useReducer's private copy, but a
// admin/repository/progressRepository.ts record keyed by studentId + courseId.
// That is what lets an admin/mentor act on a DIFFERENT student's record
// (evaluate their mini task, view their progress) with the exact same
// reducer logic, without a second live React tree — see
// state/progressReducer.ts and admin/repository/progressRepository.ts.
import * as React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { StudentProgressState } from './types';
import * as progressRepository from '../admin/repository/progressRepository';
import * as rosterRepository from '../admin/repository/rosterRepository';
import { useAdminStoreVersion } from '../admin/hooks';

// The one student with a live session in this demo — see admin/repository/store.ts.
const DEFAULT_STUDENT_ID = 'student-demo';

interface AppStateContextValue {
  state: StudentProgressState;
  studentId: string;
  courseId: string;
  markTopicViewed: (topicId: string) => void;
  submitTopicTest: (topicId: string, answers: Record<string, number>) => void;
  submitModuleTest: (moduleId: string, moduleTestId: string, answers: Record<string, number>) => void;
  completePractice: (practiceId: string) => void;
  submitCoding: (questionId: string, code: string) => void;
  submitMiniTask: (taskId: string, githubUrl: string, liveUrl: string, notes: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => void;
  submitAssessment: (assessmentId: string, answers: Record<string, number>) => void;
  advanceMilestone: (milestoneId: string, nextMilestoneId?: string) => void;
  submitProject: (githubUrl: string, liveUrl: string, documentationUrl: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode; studentId?: string }> = ({ children, studentId = DEFAULT_STUDENT_ID }) => {
  useAdminStoreVersion();

  // Re-derived on every store change, not read once — so switching this
  // student's enrollment (admin re-enrolls them into a different course)
  // immediately swaps which StudentProgress record they see, with no stale
  // binding to the course they used to be in.
  const courseId = rosterRepository.getStudent(studentId)?.courseId;
  const progress = courseId ? progressRepository.getOrCreateProgress(studentId, courseId) : undefined;

  const markTopicViewed = useCallback((topicId: string) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'MARK_TOPIC_VIEWED', topicId }); }, [studentId, courseId]);
  const submitTopicTest = useCallback((topicId: string, answers: Record<string, number>) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'SUBMIT_TOPIC_TEST', topicId, answers }); }, [studentId, courseId]);
  const submitModuleTest = useCallback((moduleId: string, moduleTestId: string, answers: Record<string, number>) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'SUBMIT_MODULE_TEST', moduleId, moduleTestId, answers }); }, [studentId, courseId]);
  const completePractice = useCallback((practiceId: string) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'COMPLETE_PRACTICE', practiceId }); }, [studentId, courseId]);
  const submitCoding = useCallback((questionId: string, code: string) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'RECORD_CODING_ATTEMPT', questionId, code }); }, [studentId, courseId]);

  const submitMiniTask = useCallback(
    (taskId: string, githubUrl: string, liveUrl: string, notes: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => {
      // A submission now waits for a real Mentor Portal review (see
      // mentor/pages/MentorReviewPage.tsx, via submissionRepository — never
      // this context, since evaluating is admin/mentor logic, not the
      // logged-in student's own action) instead of resolving itself — GitHub
      // activity is evidence, not completion, and only a mentor's evaluation
      // decides Passed vs Changes Requested.
      if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'SUBMIT_MINI_TASK', taskId, githubUrl, liveUrl, notes, github });
    },
    [studentId, courseId]
  );

  const submitAssessment = useCallback((assessmentId: string, answers: Record<string, number>) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId, answers }); }, [studentId, courseId]);
  const advanceMilestone = useCallback((milestoneId: string, nextMilestoneId?: string) => { if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'ADVANCE_MILESTONE', milestoneId, nextMilestoneId }); }, [studentId, courseId]);
  const submitProject = useCallback(
    (githubUrl: string, liveUrl: string, documentationUrl: string, github?: { repositoryName?: string; branch?: string; commitSha?: string; pullRequestUrl?: string }) => {
      if (courseId) progressRepository.dispatch(studentId, courseId, { type: 'SUBMIT_PROJECT', githubUrl, liveUrl, documentationUrl, github });
    },
    [studentId, courseId]
  );

  const value = useMemo<AppStateContextValue | undefined>(() => {
    if (!progress || !courseId) return undefined;
    return {
      state: progress,
      studentId,
      courseId,
      markTopicViewed,
      submitTopicTest,
      submitModuleTest,
      completePractice,
      submitCoding,
      submitMiniTask,
      submitAssessment,
      advanceMilestone,
      submitProject,
    };
  }, [progress, studentId, courseId, markTopicViewed, submitTopicTest, submitModuleTest, completePractice, submitCoding, submitMiniTask, submitAssessment, advanceMilestone, submitProject]);

  if (!value) return null;

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
