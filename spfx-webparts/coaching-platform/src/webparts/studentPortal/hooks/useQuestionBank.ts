import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as qbRepo from '../admin/repository/questionBankRepository';
import { BankQuestion } from '../admin/types';
import { QuestionFilter } from '../admin/repository/questionBankRepository';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useQuestionBank(courseId: string) {
  return useQuery(
    ['questionBank', courseId],
    async () => {
      await delay(400);
      return qbRepo.listQuestions(courseId);
    },
    { enabled: !!courseId }
  );
}

export function useSearchQuestionBank(filter: QuestionFilter) {
  return useQuery(
    ['questionBankSearch', JSON.stringify(filter)],
    async () => {
      await delay(350);
      return qbRepo.searchQuestions(filter);
    }
  );
}

export function useCreateBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: Omit<BankQuestion, 'id'>) => {
      await delay(500);
      return qbRepo.createQuestion(input);
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['questionBank', data.courseId]);
        queryClient.invalidateQueries('questionBankSearch');
      },
    }
  );
}

export function useUpdateBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, courseId, patch }: { id: string; courseId: string; patch: Partial<Omit<BankQuestion, 'id'>> }) => {
      await delay(400);
      qbRepo.updateQuestion(id, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['questionBank', courseId]);
        queryClient.invalidateQueries('questionBankSearch');
      },
    }
  );
}

export function useDeleteBankQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, courseId }: { id: string; courseId: string }) => {
      await delay(400);
      qbRepo.deleteQuestion(id);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['questionBank', courseId]);
        queryClient.invalidateQueries('questionBankSearch');
      },
    }
  );
}

export function useAddBankQuestionToTopicTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, testId, bankQuestionId }: { courseId: string; testId: string; bankQuestionId: string }) => {
      await delay(400);
      qbRepo.addBankQuestionToTopicTest(courseId, testId, bankQuestionId);
    },
    {
      onSuccess: (_, { courseId, testId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['topicTest', courseId, testId]);
      },
    }
  );
}

export function useAddBankQuestionToAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      assessmentId,
      bankQuestionId,
      topic,
    }: {
      courseId: string;
      assessmentId: string;
      bankQuestionId: string;
      topic: string;
    }) => {
      await delay(400);
      qbRepo.addBankQuestionToAssessment(courseId, assessmentId, bankQuestionId, topic);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}
