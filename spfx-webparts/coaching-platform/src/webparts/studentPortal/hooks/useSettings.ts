import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as settingsRepo from '../admin/repository/settingsRepository';
import { CertificateConfig, NotificationRule } from '../admin/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCertificates() {
  return useQuery('certificates', async () => {
    await delay(350);
    return settingsRepo.listCertificates();
  });
}

export function useCertificateForCourse(courseId: string) {
  return useQuery(
    ['certificate', courseId],
    async () => {
      await delay(300);
      return settingsRepo.getCertificateForCourse(courseId);
    },
    { enabled: !!courseId }
  );
}

export function useUpsertCertificate() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      courseId,
      patch,
    }: {
      courseId: string;
      patch: Partial<Omit<CertificateConfig, 'courseId'>>;
    }) => {
      await delay(450);
      settingsRepo.upsertCertificate(courseId, patch);
    },
    {
      onSuccess: (_, { courseId }) => {
        queryClient.invalidateQueries('certificates');
        queryClient.invalidateQueries(['certificate', courseId]);
      },
    }
  );
}

export function useNotificationRules() {
  return useQuery('notificationRules', async () => {
    await delay(350);
    return settingsRepo.listNotificationRules();
  });
}

export function useToggleNotificationRule() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await delay(300);
      settingsRepo.toggleNotificationRule(id, enabled);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notificationRules');
      },
    }
  );
}
