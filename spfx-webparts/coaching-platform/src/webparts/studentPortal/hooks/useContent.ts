import { useMutation, useQueryClient } from 'react-query';
import * as contentRepo from '../admin/repository/contentRepository';
import {
  ModuleTestDef,
  AssessmentDef,
  CodingQuestionDef,
  MiniTaskDef,
  MajorProjectDef,
  MilestoneDef,
  TopicTestQuestionDef,
  AssessmentQuestionDef,
} from '../data/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Module Tests ----

export function useCreateModuleTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      input,
    }: {
      courseId: string;
      moduleId: string;
      input: { title: string; timeLimitMinutes: number; passingScorePercent: number; attemptsAllowed: number };
    }) => {
      await delay(500);
      return contentRepo.createModuleTest(courseId, moduleId, input);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useUpdateModuleTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      testId,
      patch,
    }: {
      courseId: string;
      testId: string;
      patch: Partial<Omit<ModuleTestDef, 'id' | 'moduleId'>>;
    }) => {
      await delay(400);
      contentRepo.updateModuleTest(courseId, testId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteModuleTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, testId }: { courseId: string; testId: string }) => {
      await delay(400);
      contentRepo.deleteModuleTest(courseId, testId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useAddQuestionToModuleTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      testId,
      question,
    }: {
      courseId: string;
      testId: string;
      question: Omit<TopicTestQuestionDef, 'id'>;
    }) => {
      await delay(400);
      contentRepo.addQuestionToModuleTest(courseId, testId, question);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useRemoveQuestionFromModuleTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, testId, questionId }: { courseId: string; testId: string; questionId: string }) => {
      await delay(300);
      contentRepo.removeQuestionFromModuleTest(courseId, testId, questionId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

// ---- Assessments ----

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      input,
    }: {
      courseId: string;
      moduleId: string;
      input: { title: string; topics: string[]; timeLimitMinutes: number; passingScorePercent: number; attemptsAllowed: number };
    }) => {
      await delay(500);
      return contentRepo.createAssessment(courseId, moduleId, input);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      assessmentId,
      patch,
    }: {
      courseId: string;
      assessmentId: string;
      patch: Partial<Omit<AssessmentDef, 'id' | 'moduleId'>>;
    }) => {
      await delay(400);
      contentRepo.updateAssessment(courseId, assessmentId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, assessmentId }: { courseId: string; assessmentId: string }) => {
      await delay(400);
      contentRepo.deleteAssessment(courseId, assessmentId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useAddQuestionToAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      assessmentId,
      question,
    }: {
      courseId: string;
      assessmentId: string;
      question: Omit<AssessmentQuestionDef, 'id'>;
    }) => {
      await delay(400);
      contentRepo.addQuestionToAssessment(courseId, assessmentId, question);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useRemoveQuestionFromAssessment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, assessmentId, questionId }: { courseId: string; assessmentId: string; questionId: string }) => {
      await delay(300);
      contentRepo.removeQuestionFromAssessment(courseId, assessmentId, questionId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

// ---- Daily Coding ----

export function useCreateCodingQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, input }: { courseId: string; input: Omit<CodingQuestionDef, 'id'> }) => {
      await delay(500);
      return contentRepo.createCodingQuestion(courseId, input);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useUpdateCodingQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, id, patch }: { courseId: string; id: string; patch: Partial<Omit<CodingQuestionDef, 'id'>> }) => {
      await delay(400);
      contentRepo.updateCodingQuestion(courseId, id, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteCodingQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, id }: { courseId: string; id: string }) => {
      await delay(400);
      contentRepo.deleteCodingQuestion(courseId, id);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDuplicateCodingQuestion() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, id }: { courseId: string; id: string }) => {
      await delay(500);
      return contentRepo.duplicateCodingQuestion(courseId, id);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

// ---- Mini Tasks ----

export function useCreateMiniTask() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, input }: { courseId: string; input: Omit<MiniTaskDef, 'id'> }) => {
      await delay(500);
      return contentRepo.createMiniTask(courseId, input);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useUpdateMiniTask() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, id, patch }: { courseId: string; id: string; patch: Partial<Omit<MiniTaskDef, 'id'>> }) => {
      await delay(400);
      contentRepo.updateMiniTask(courseId, id, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteMiniTask() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, id }: { courseId: string; id: string }) => {
      await delay(400);
      contentRepo.deleteMiniTask(courseId, id);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

// ---- Major Project ----

export function useUpdateMajorProject() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, patch }: { courseId: string; patch: Partial<Omit<MajorProjectDef, 'milestones'>> }) => {
      await delay(400);
      contentRepo.updateMajorProject(courseId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, milestone }: { courseId: string; milestone: Omit<MilestoneDef, 'id'> }) => {
      await delay(400);
      contentRepo.addMilestone(courseId, milestone);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, milestoneId, patch }: { courseId: string; milestoneId: string; patch: Partial<Omit<MilestoneDef, 'id'>> }) => {
      await delay(400);
      contentRepo.updateMilestone(courseId, milestoneId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, milestoneId }: { courseId: string; milestoneId: string }) => {
      await delay(400);
      contentRepo.deleteMilestone(courseId, milestoneId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

export function useReorderMilestone() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, milestoneId, direction }: { courseId: string; milestoneId: string; direction: 'up' | 'down' }) => {
      await delay(300);
      contentRepo.reorderMilestone(courseId, milestoneId, direction);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}
