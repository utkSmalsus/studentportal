import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as subRepo from '../admin/repository/submissionRepository';
import * as projSubRepo from '../admin/repository/projectSubmissionRepository';
import * as rosterRepo from '../admin/repository/rosterRepository';
import * as courseRepo from '../admin/repository/courseRepository';
import { MiniTaskSubmission, ProjectSubmission } from '../state/submissionTypes';
import { EvaluationStatus } from '../admin/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface EvaluationQueueItem {
  id: string;
  kind: 'miniTask' | 'project';
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  submittedAt: string;
  status: EvaluationStatus;
  attempt: number;
  githubUrl?: string;
  branch?: string;
  commitSha?: string;
  pullRequestUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  notes?: string;
  taskId?: string;
}

// ---- Mini Task Submissions ----

export function useSubmissionsForStudent(studentId: string, courseId: string) {
  return useQuery(
    ['submissions', studentId, courseId],
    async () => {
      await delay(400);
      return subRepo.listSubmissionsForStudent(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function usePendingSubmissions(studentIds: string[], courseId: string) {
  return useQuery(
    ['pendingSubmissions', courseId, studentIds.slice().sort().join(',')],
    async () => {
      await delay(450);
      return subRepo.listPendingSubmissions(studentIds, courseId);
    },
    { enabled: !!courseId && studentIds.length > 0 }
  );
}

export function useSubmission(studentId: string, courseId: string, taskId: string, attempt: number) {
  return useQuery(
    ['submission', studentId, courseId, taskId, attempt],
    async () => {
      await delay(300);
      return subRepo.getSubmission(studentId, courseId, taskId, attempt);
    },
    { enabled: !!studentId && !!courseId && !!taskId && attempt > 0 }
  );
}

export function useEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      studentId,
      courseId,
      taskId,
      attempt,
      input,
    }: {
      studentId: string;
      courseId: string;
      taskId: string;
      attempt: number;
      input: { criteria: { label: string; score: number; maxScore: number }[]; feedback: string; outcome: 'Passed' | 'Changes Requested' };
    }) => {
      await delay(500);
      subRepo.evaluateSubmission(studentId, courseId, taskId, attempt, input);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['submissions', studentId, courseId]);
        queryClient.invalidateQueries(['pendingSubmissions', courseId]);
        queryClient.invalidateQueries('evaluationQueue');
        queryClient.invalidateQueries('adminDashboardMetrics');
        queryClient.invalidateQueries('mentorReviewQueue');
        queryClient.invalidateQueries('mentorDashboard');
        queryClient.invalidateQueries('mentorPendingCount');
        queryClient.invalidateQueries(['progress', studentId, courseId]);
        queryClient.invalidateQueries(['progressView', studentId, courseId]);
      },
    }
  );
}

// ---- Major Project Submissions ----

export function useProjectSubmissions(studentId: string, courseId: string) {
  return useQuery(
    ['projectSubmissions', studentId, courseId],
    async () => {
      await delay(400);
      return projSubRepo.listProjectSubmissions(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function useProjectSubmission(studentId: string, courseId: string) {
  return useQuery(
    ['projectSubmission', studentId, courseId],
    async () => {
      await delay(350);
      return projSubRepo.getProjectSubmission(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function usePendingProjectSubmissions(studentIds: string[], courseId: string) {
  return useQuery(
    ['pendingProjectSubmissions', courseId, studentIds.slice().sort().join(',')],
    async () => {
      await delay(450);
      return projSubRepo.listPendingProjectSubmissions(studentIds, courseId);
    },
    { enabled: !!courseId && studentIds.length > 0 }
  );
}

export function useEvaluateProjectSubmission() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      studentId,
      courseId,
      attempt,
      input,
    }: {
      studentId: string;
      courseId: string;
      attempt: number;
      input: { criteria: { label: string; score: number; maxScore: number }[]; feedback: string; outcome: 'Passed' | 'Changes Requested' };
    }) => {
      await delay(500);
      projSubRepo.evaluateProjectSubmission(studentId, courseId, attempt, input);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['projectSubmissions', studentId, courseId]);
        queryClient.invalidateQueries(['projectSubmission', studentId, courseId]);
        queryClient.invalidateQueries(['pendingProjectSubmissions', courseId]);
        queryClient.invalidateQueries('evaluationQueue');
        queryClient.invalidateQueries('adminDashboardMetrics');
        queryClient.invalidateQueries('mentorReviewQueue');
        queryClient.invalidateQueries('mentorDashboard');
        queryClient.invalidateQueries('mentorPendingCount');
        queryClient.invalidateQueries(['progress', studentId, courseId]);
        queryClient.invalidateQueries(['progressView', studentId, courseId]);
      },
    }
  );
}

// ---- Full Evaluation Queue ----

export function useEvaluationQueue() {
  return useQuery(
    ['evaluationQueue'],
    async (): Promise<{ miniTasks: EvaluationQueueItem[]; projects: EvaluationQueueItem[] }> => {
      await delay(450);
      const students = rosterRepo.listStudents();
      const courses = courseRepo.listCourses();

      const miniTasks: EvaluationQueueItem[] = students.reduce<EvaluationQueueItem[]>((rows, s) => {
        const content = courseRepo.getCourseContent(s.courseId);
        return rows.concat(
          subRepo.listPendingSubmissions([s.id], s.courseId).map((sub) => ({
            id: sub.id,
            kind: 'miniTask' as const,
            studentId: sub.studentId,
            courseId: sub.courseId,
            studentName: s.name,
            courseTitle: courses.find((c) => c.id === s.courseId)?.title || '',
            moduleTitle: content?.moduleDefs.find((m) => m.id === sub.moduleId)?.title || '',
            title: content?.miniTasks.find((t) => t.id === sub.taskId)?.title || sub.taskId,
            submittedAt: sub.submittedAt,
            status: sub.status as EvaluationStatus,
            attempt: sub.attempt,
            githubUrl: sub.repositoryName ? `https://github.com/${sub.repositoryName}` : undefined,
            branch: sub.branch,
            commitSha: sub.commitSha,
            pullRequestUrl: sub.pullRequestUrl,
            liveUrl: sub.liveUrl,
            notes: sub.notes,
            taskId: sub.taskId,
          }))
        );
      }, []);

      const projects: EvaluationQueueItem[] = students.reduce<EvaluationQueueItem[]>((rows, s) => {
        const content = courseRepo.getCourseContent(s.courseId);
        const submission = projSubRepo.getProjectSubmission(s.id, s.courseId);
        if (!content || !submission || ['Under Review', 'Submitted', 'Resubmitted'].indexOf(submission.status) === -1) return rows;
        return rows.concat([
          {
            id: submission.id,
            kind: 'project' as const,
            studentId: submission.studentId,
            courseId: submission.courseId,
            studentName: s.name,
            courseTitle: courses.find((c) => c.id === s.courseId)?.title || '',
            moduleTitle: content.moduleDefs.find((m) => m.id === content.majorProject.moduleId)?.title || content.majorProject.title,
            title: content.majorProject.title,
            submittedAt: submission.submittedAt,
            status: submission.status as EvaluationStatus,
            attempt: submission.attempt,
            githubUrl: submission.repositoryName ? `https://github.com/${submission.repositoryName}` : undefined,
            branch: submission.branch,
            commitSha: submission.commitSha,
            pullRequestUrl: submission.pullRequestUrl,
            liveUrl: submission.liveUrl,
            documentationUrl: submission.documentationUrl,
          },
        ]);
      }, []);

      return { miniTasks, projects };
    }
  );
}
