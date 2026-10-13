import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as progressRepo from '../admin/repository/progressRepository';
import * as progressView from '../admin/repository/progressView';
import * as rosterRepo from '../admin/repository/rosterRepository';
import * as courseRepo from '../admin/repository/courseRepository';
import * as subRepo from '../admin/repository/submissionRepository';
import * as projSubRepo from '../admin/repository/projectSubmissionRepository';
import { StudentProgress, StudentProgressState } from '../state/types';
import { ProgressAction } from '../state/progressReducer';
import { StudentProgressView } from '../admin/repository/progressView';
import { CourseMeta, StudentRecord, Batch } from '../admin/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useStudentProgress(studentId: string, courseId: string) {
  return useQuery(
    ['progress', studentId, courseId],
    async () => {
      await delay(400);
      return progressRepo.getOrCreateProgress(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function useProgressForStudent(studentId: string) {
  return useQuery(
    ['progressStudent', studentId],
    async () => {
      await delay(400);
      return progressRepo.getProgressForStudent(studentId);
    },
    { enabled: !!studentId }
  );
}

export function useProgressForCourse(courseId: string) {
  return useQuery(
    ['progressCourse', courseId],
    async () => {
      await delay(400);
      return progressRepo.getProgressForCourse(courseId);
    },
    { enabled: !!courseId }
  );
}

export function useProgressForStudents(studentIds: string[], courseId: string) {
  return useQuery(
    ['progressStudents', courseId, studentIds.slice().sort().join(',')],
    async () => {
      await delay(400);
      return progressRepo.getProgressForStudents(studentIds, courseId);
    },
    { enabled: !!courseId && studentIds.length > 0 }
  );
}

export function useStudentProgressView(studentId: string, courseId: string) {
  return useQuery(
    ['progressView', studentId, courseId],
    async () => {
      await delay(350);
      return progressView.getStudentProgressView(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function useDispatchProgressAction() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      studentId,
      courseId,
      action,
    }: {
      studentId: string;
      courseId: string;
      action: ProgressAction;
    }) => {
      await delay(400);
      return progressRepo.dispatch(studentId, courseId, action);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['progress', studentId, courseId]);
        queryClient.invalidateQueries(['progressView', studentId, courseId]);
        queryClient.invalidateQueries(['progressStudent', studentId]);
        queryClient.invalidateQueries(['progressCourse', courseId]);
        queryClient.invalidateQueries('adminDashboardMetrics');
      },
    }
  );
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      studentId,
      courseId,
      updater,
    }: {
      studentId: string;
      courseId: string;
      updater: (p: StudentProgress) => StudentProgressState;
    }) => {
      await delay(400);
      return progressRepo.updateProgress(studentId, courseId, updater);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['progress', studentId, courseId]);
        queryClient.invalidateQueries(['progressView', studentId, courseId]);
        queryClient.invalidateQueries(['progressStudent', studentId]);
        queryClient.invalidateQueries(['progressCourse', courseId]);
        queryClient.invalidateQueries('adminDashboardMetrics');
      },
    }
  );
}

export interface AdminDashboardData {
  courses: CourseMeta[];
  students: StudentRecord[];
  batches: Batch[];
  pendingMiniTasks: number;
  pendingProjects: number;
  assessmentsCompleted: number;
  overallProgress: number;
  activeCourses: number;
  activeBatches: number;
  behindStudents: number;
  recentActivity: { id: string; message: string; date: string }[];
}

export function useAdminDashboardMetrics() {
  return useQuery(
    ['adminDashboardMetrics'],
    async (): Promise<AdminDashboardData> => {
      await delay(400);
      const courses = courseRepo.listCourses();
      const students = rosterRepo.listStudents();
      const batches = rosterRepo.listBatches();

      const rows = students
        .map((student) => ({
          student,
          view: progressView.getStudentProgressView(student.id, student.courseId),
          pendingMiniTasks: subRepo.listPendingSubmissions([student.id], student.courseId).length,
          pendingProjects: projSubRepo.listPendingProjectSubmissions([student.id], student.courseId).length,
        }))
        .filter((r) => r.view);

      const pendingMiniTasks = rows.reduce((sum, r) => sum + r.pendingMiniTasks, 0);
      const pendingProjects = rows.reduce((sum, r) => sum + r.pendingProjects, 0);
      const assessmentsCompleted = rows.reduce((sum, { view }) => sum + Object.keys(view!.progress.assessments).filter((id) => view!.progress.assessments[id].attempts.length > 0).length, 0);
      const overallProgress = rows.length > 0 ? Math.round(rows.reduce((sum, { view }) => sum + view!.overallPercent, 0) / rows.length) : 0;
      const activeCourses = courses.filter((c) => c.status === 'published').length;
      const activeBatches = batches.filter((b) => b.status === 'active').length;
      const behindStudents = students.filter((s) => s.status === 'paused').length;

      const recentActivity = rows
        .reduce<{ id: string; message: string; date: string }[]>(
          (all, { student, view }) => all.concat(view!.progress.notifications.slice(0, 2).map((n) => ({ id: n.id, message: `${student.name}: ${n.message}`, date: n.date }))),
          []
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);

      return {
        courses,
        students,
        batches,
        pendingMiniTasks,
        pendingProjects,
        assessmentsCompleted,
        overallProgress,
        activeCourses,
        activeBatches,
        behindStudents,
        recentActivity,
      };
    }
  );
}
