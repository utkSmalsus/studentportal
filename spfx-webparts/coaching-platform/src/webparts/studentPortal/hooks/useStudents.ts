import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as rosterRepo from '../admin/repository/rosterRepository';
import { Batch, StudentRecord, Enrollment } from '../admin/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---- Students ----

export function useStudents() {
  return useQuery('students', async () => {
    await delay(500);
    return rosterRepo.listStudents();
  });
}

export function useStudent(id: string) {
  return useQuery(['student', id], async () => {
    await delay(300);
    return rosterRepo.getStudent(id);
  }, {
    enabled: !!id
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Omit<StudentRecord, 'id'>) => {
      await delay(500);
      return rosterRepo.createStudent(input);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
      }
    }
  );
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, patch }: { id: string; patch: Partial<Omit<StudentRecord, 'id'>> }) => {
      await delay(400);
      rosterRepo.updateStudent(id, patch);
    },
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('students');
        queryClient.invalidateQueries(['student', id]);
      }
    }
  );
}

// ---- Batches ----

export function useBatches() {
  return useQuery('batches', async () => {
    await delay(400);
    return rosterRepo.listBatches();
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Omit<Batch, 'id'>) => {
      await delay(500);
      return rosterRepo.createBatch(input);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('batches');
      }
    }
  );
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, patch }: { id: string; patch: Partial<Omit<Batch, 'id'>> }) => {
      await delay(400);
      rosterRepo.updateBatch(id, patch);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('batches');
      }
    }
  );
}

export function useArchiveBatch() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      await delay(400);
      rosterRepo.archiveBatch(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('batches');
      }
    }
  );
}

// ---- Enrollments ----

export function useEnrollments() {
  return useQuery('enrollments', async () => {
    await delay(400);
    return rosterRepo.listEnrollments();
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: { studentId: string; courseId: string; batchId?: string; startDate: string; expectedCompletion: string }) => {
      await delay(600);
      return rosterRepo.enrollStudent(input);
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('enrollments');
        queryClient.invalidateQueries('students');
        queryClient.invalidateQueries(['student', variables.studentId]);
      }
    }
  );
}
