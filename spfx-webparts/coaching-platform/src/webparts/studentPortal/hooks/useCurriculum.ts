import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as curriculumRepo from '../admin/repository/curriculumRepository';
import { ModuleDef, TopicDef, ModuleGroup, ProgressionRules, TopicTestDef } from '../data/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Modules ----

export function useModule(courseId: string, moduleId: string) {
  return useQuery(
    ['module', courseId, moduleId],
    async () => {
      await delay(300);
      return curriculumRepo.getModule(courseId, moduleId);
    },
    { enabled: !!courseId && !!moduleId }
  );
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      input,
    }: {
      courseId: string;
      input: { title: string; group: ModuleGroup; estimatedDuration: string; prerequisiteModuleId?: string };
    }) => {
      await delay(500);
      return curriculumRepo.createModule(courseId, input);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      patch,
    }: {
      courseId: string;
      moduleId: string;
      patch: Partial<Omit<ModuleDef, 'id' | 'topics' | 'practice'>>;
    }) => {
      await delay(400);
      curriculumRepo.updateModule(courseId, moduleId, patch);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useSetModuleProgressionRules() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, moduleId, rules }: { courseId: string; moduleId: string; rules: ProgressionRules }) => {
      await delay(400);
      curriculumRepo.setModuleProgressionRules(courseId, moduleId, rules);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
      },
    }
  );
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, moduleId }: { courseId: string; moduleId: string }) => {
      await delay(500);
      curriculumRepo.deleteModule(courseId, moduleId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useDuplicateModule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, moduleId }: { courseId: string; moduleId: string }) => {
      await delay(600);
      return curriculumRepo.duplicateModule(courseId, moduleId);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries('courses');
      },
    }
  );
}

export function useReorderModule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, moduleId, direction }: { courseId: string; moduleId: string; direction: 'up' | 'down' }) => {
      await delay(300);
      curriculumRepo.reorderModule(courseId, moduleId, direction);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
      },
    }
  );
}

// ---- Topics ----

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      input,
    }: {
      courseId: string;
      moduleId: string;
      input: { title: string; estimatedMinutes: number };
    }) => {
      await delay(500);
      return curriculumRepo.createTopic(courseId, moduleId, input);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
      },
    }
  );
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      topicId,
      patch,
    }: {
      courseId: string;
      moduleId: string;
      topicId: string;
      patch: Partial<Omit<TopicDef, 'id' | 'moduleId' | 'testId'>>;
    }) => {
      await delay(400);
      curriculumRepo.updateTopic(courseId, moduleId, topicId, patch);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
      },
    }
  );
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ courseId, moduleId, topicId }: { courseId: string; moduleId: string; topicId: string }) => {
      await delay(400);
      curriculumRepo.deleteTopic(courseId, moduleId, topicId);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
      },
    }
  );
}

export function useReorderTopic() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      moduleId,
      topicId,
      direction,
    }: {
      courseId: string;
      moduleId: string;
      topicId: string;
      direction: 'up' | 'down';
    }) => {
      await delay(300);
      curriculumRepo.reorderTopic(courseId, moduleId, topicId, direction);
    },
    {
      onSuccess: (_, { courseId, moduleId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['module', courseId, moduleId]);
      },
    }
  );
}

// ---- Topic Tests ----

export function useTopicTest(courseId: string, testId: string) {
  return useQuery(
    ['topicTest', courseId, testId],
    async () => {
      await delay(300);
      return curriculumRepo.getTopicTest(courseId, testId);
    },
    { enabled: !!courseId && !!testId }
  );
}

export function useUpdateTopicTest() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      testId,
      patch,
    }: {
      courseId: string;
      testId: string;
      patch: Partial<Omit<TopicTestDef, 'id' | 'topicId'>>;
    }) => {
      await delay(400);
      curriculumRepo.updateTopicTest(courseId, testId, patch);
    },
    {
      onSuccess: (_, { courseId, testId }) => {
        queryClient.invalidateQueries(['courseContent', courseId]);
        queryClient.invalidateQueries(['topicTest', courseId, testId]);
      },
    }
  );
}
