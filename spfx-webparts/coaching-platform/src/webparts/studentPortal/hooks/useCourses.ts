import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as courseRepo from '../admin/repository/courseRepository';
import { CourseMeta, CourseStatus } from '../admin/types';

// Fake network delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCourses() {
  return useQuery('courses', async () => {
    await delay(500); // Simulate network latency
    return courseRepo.listCourses();
  });
}

export function useCourseMeta(courseId: string) {
  return useQuery(
    ['courseMeta', courseId],
    async () => {
      await delay(300);
      const meta = courseRepo.getCourseMeta(courseId);
      if (!meta) throw new Error('Course not found');
      return meta;
    },
    { enabled: !!courseId }
  );
}

export function useCourseContent(courseId: string) {
  return useQuery(
    ['courseContent', courseId],
    async () => {
      await delay(400);
      const content = courseRepo.getCourseContent(courseId);
      if (!content) throw new Error('Course content not found');
      return content;
    },
    { enabled: !!courseId }
  );
}

export function useSetActiveCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (courseId: string) => {
      courseRepo.setActiveCourseId(courseId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
        queryClient.invalidateQueries('activeCourseId');
      },
    }
  );
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: { title: string; code: string; category?: string; difficulty?: CourseMeta['difficulty'] }) => {
      await delay(600);
      return courseRepo.createCourse(input);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useUpdateCourseMeta() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, patch }: { courseId: string; patch: Partial<Omit<CourseMeta, 'id'>> }) => {
      await delay(400);
      courseRepo.updateCourseMeta(courseId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries('courses');
        queryClient.invalidateQueries(['courseMeta', courseId]);
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['courseValidation', courseId]);
      },
    }
  );
}

export function useValidateCourse(courseId: string) {
  return useQuery(
    ['courseValidation', courseId],
    async () => {
      await delay(300);
      return courseRepo.validateCourse(courseId);
    },
    { enabled: !!courseId }
  );
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (courseId: string) => {
      await delay(500);
      return courseRepo.publishCourse(courseId);
    },
    {
      onSuccess: (_, courseId) => {
        queryClient.invalidateQueries('courses');
        queryClient.invalidateQueries(['courseMeta', courseId]);
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['courseValidation', courseId]);
      },
    }
  );
}

export function useUnpublishCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (courseId: string) => {
      await delay(500);
      courseRepo.unpublishCourse(courseId);
    },
    {
      onSuccess: (_, courseId) => {
        queryClient.invalidateQueries('courses');
        queryClient.invalidateQueries(['courseMeta', courseId]);
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (courseId: string) => {
      await delay(500);
      courseRepo.archiveCourse(courseId);
    },
    {
      onSuccess: (_, courseId) => {
        queryClient.invalidateQueries('courses');
        queryClient.invalidateQueries(['courseMeta', courseId]);
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async (courseId: string) => {
      await delay(500);
      courseRepo.deleteCourse(courseId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, newTitle }: { courseId: string; newTitle: string }) => {
      await delay(800);
      const newCourse = courseRepo.duplicateCourse(courseId, newTitle);
      if (!newCourse) throw new Error('Failed to duplicate course');
      return newCourse;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('courses');
      },
    }
  );
}
