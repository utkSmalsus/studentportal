import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as mentorRepo from '../admin/repository/mentorRepository';
import * as courseRepo from '../admin/repository/courseRepository';
import * as subRepo from '../admin/repository/submissionRepository';
import * as projSubRepo from '../admin/repository/projectSubmissionRepository';
import * as githubRepo from '../admin/repository/githubRepository';
import * as progressView from '../admin/repository/progressView';
import { Mentor, MentorStatus, CourseMeta, StudentRecord, Batch, EvaluationStatus, GitHubActivityItem } from '../admin/types';
import { StudentProgressView } from '../admin/repository/progressView';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMentors() {
  return useQuery('mentors', async () => {
    await delay(400);
    return mentorRepo.listMentors();
  });
}

export function useMentor(id: string) {
  return useQuery(
    ['mentor', id],
    async () => {
      await delay(300);
      return mentorRepo.getMentor(id);
    },
    { enabled: !!id }
  );
}

export function useCreateMentor() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Omit<Mentor, 'id'>) => {
      await delay(500);
      return mentorRepo.createMentor(input);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mentors');
      },
    }
  );
}

export function useUpdateMentor() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, patch }: { id: string; patch: Partial<Omit<Mentor, 'id'>> }) => {
      await delay(400);
      mentorRepo.updateMentor(id, patch);
    },
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('mentors');
        queryClient.invalidateQueries(['mentor', id]);
      },
    }
  );
}

export function useSetMentorStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, status }: { id: string; status: MentorStatus }) => {
      await delay(400);
      mentorRepo.setMentorStatus(id, status);
    },
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('mentors');
        queryClient.invalidateQueries(['mentor', id]);
      },
    }
  );
}

export function useAssignMentorsToBatch() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      batchId,
      mentorIds,
      primaryMentorId,
    }: {
      batchId: string;
      mentorIds: string[];
      primaryMentorId?: string;
    }) => {
      await delay(500);
      mentorRepo.assignMentorsToBatch(batchId, mentorIds, primaryMentorId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('batches');
        queryClient.invalidateQueries('mentors');
        queryClient.invalidateQueries('mentorBatches');
      },
    }
  );
}

export function useBatchesForMentor(mentorId: string) {
  return useQuery(
    ['mentorBatches', mentorId],
    async () => {
      await delay(350);
      return mentorRepo.getBatchesForMentor(mentorId);
    },
    { enabled: !!mentorId }
  );
}

export function useStudentsForMentor(mentorId: string) {
  return useQuery(
    ['mentorStudents', mentorId],
    async () => {
      await delay(400);
      return mentorRepo.getStudentsForMentor(mentorId);
    },
    { enabled: !!mentorId }
  );
}

export function usePendingReviewCountForMentor(mentorId: string) {
  return useQuery(
    ['mentorPendingCount', mentorId],
    async () => {
      await delay(300);
      return mentorRepo.getPendingReviewCountForMentor(mentorId);
    },
    { enabled: !!mentorId }
  );
}

export interface MentorReviewQueueItem {
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
  githubBranch?: string;
  commitSha?: string;
  pullRequestUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  notes?: string;
  taskId?: string;
}

export interface MentorDashboardData {
  students: StudentRecord[];
  batches: Batch[];
  courses: CourseMeta[];
  pending: { id: string; studentId: string; courseId: string; title: string; submittedAt: string }[];
  behind: StudentRecord[];
  recentActivity: GitHubActivityItem[];
}

export function useMentorDashboard(mentorId: string) {
  return useQuery(
    ['mentorDashboard', mentorId],
    async (): Promise<MentorDashboardData> => {
      await delay(400);
      const students = mentorRepo.getStudentsForMentor(mentorId);
      const batches = mentorRepo.getBatchesForMentor(mentorId);
      const courses = courseRepo.listCourses();
      const pending = students.reduce<{ id: string; studentId: string; courseId: string; title: string; submittedAt: string }[]>(
        (rows, s) =>
          rows.concat(
            subRepo.listPendingSubmissions([s.id], s.courseId).map((sub) => ({
              id: sub.id,
              studentId: sub.studentId,
              courseId: sub.courseId,
              title: courseRepo.getCourseContent(sub.courseId)?.miniTasks.find((t) => t.id === sub.taskId)?.title || sub.taskId,
              submittedAt: sub.submittedAt,
            })),
            projSubRepo.listPendingProjectSubmissions([s.id], s.courseId).map((sub) => ({
              id: sub.id,
              studentId: sub.studentId,
              courseId: sub.courseId,
              title: courseRepo.getCourseContent(sub.courseId)?.majorProject.title || 'Major Project',
              submittedAt: sub.submittedAt,
            }))
          ),
        []
      );
      const behind = students.filter((s) => s.status === 'paused');
      const recentActivity = githubRepo.listRecentActivity(students.map((s) => s.id), 5);

      return {
        students,
        batches,
        courses,
        pending,
        behind,
        recentActivity,
      };
    },
    { enabled: !!mentorId }
  );
}

export function useMentorStudentsProgress(mentorId: string) {
  return useQuery(
    ['mentorStudentsProgress', mentorId],
    async () => {
      await delay(400);
      const courses = courseRepo.listCourses();
      const allStudents = mentorRepo.getStudentsForMentor(mentorId);
      const viewByStudentId: Record<string, StudentProgressView | undefined> = {};
      allStudents.forEach((s) => {
        viewByStudentId[s.id] = progressView.getStudentProgressView(s.id, s.courseId);
      });
      return { courses, allStudents, viewByStudentId };
    },
    { enabled: !!mentorId }
  );
}

export function useMentorReviewQueue(mentorId: string) {
  return useQuery(
    ['mentorReviewQueue', mentorId],
    async (): Promise<{ miniTasks: MentorReviewQueueItem[]; projects: MentorReviewQueueItem[] }> => {
      await delay(450);
      const myStudents = mentorRepo.getStudentsForMentor(mentorId);
      const courses = courseRepo.listCourses();

      const miniTasks: MentorReviewQueueItem[] = myStudents.reduce<MentorReviewQueueItem[]>((rows, s) => {
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
            githubBranch: sub.branch,
            commitSha: sub.commitSha,
            pullRequestUrl: sub.pullRequestUrl,
            liveUrl: sub.liveUrl,
            notes: sub.notes,
            taskId: sub.taskId,
          }))
        );
      }, []);

      const projects: MentorReviewQueueItem[] = myStudents.reduce<MentorReviewQueueItem[]>((rows, s) => {
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
            githubBranch: submission.branch,
            commitSha: submission.commitSha,
            pullRequestUrl: submission.pullRequestUrl,
            liveUrl: submission.liveUrl,
            documentationUrl: submission.documentationUrl,
          },
        ]);
      }, []);

      return { miniTasks, projects };
    },
    { enabled: !!mentorId }
  );
}
