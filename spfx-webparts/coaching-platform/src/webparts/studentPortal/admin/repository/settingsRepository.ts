// Certificate configuration and notification-rule toggles. Both are genuine,
// persisted admin settings — see admin/pages/CertificatesAdminPage.tsx and
// NotificationsAdminPage.tsx for where they're read back.
import { state, commit } from './store';
import { CertificateConfig, NotificationRule } from '../types';

export function listCertificates(): CertificateConfig[] {
  return state.certificates;
}

export function getCertificateForCourse(courseId: string): CertificateConfig | undefined {
  return state.certificates.find((c) => c.courseId === courseId);
}

export function upsertCertificate(courseId: string, patch: Partial<Omit<CertificateConfig, 'courseId'>>): void {
  const existing = state.certificates.find((c) => c.courseId === courseId);
  if (existing) {
    Object.assign(existing, patch);
  } else {
    state.certificates.push({ courseId, name: '', prefix: '', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard', ...patch });
  }
  commit();
}

export function listNotificationRules(): NotificationRule[] {
  return state.notificationRules;
}

export function toggleNotificationRule(id: string, enabled: boolean): void {
  const rule = state.notificationRules.find((r) => r.id === id);
  if (!rule) return;
  rule.enabled = enabled;
  commit();
}
