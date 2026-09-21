import * as React from 'react';
import { PageHeader, Card, SectionTitle } from '../../ui/Primitives';
import { Checkbox } from '../ui/AdminPrimitives';
import * as settingsRepo from '../repository/settingsRepository';

const NotificationsAdminPage: React.FC = () => {
  const rules = settingsRepo.listNotificationRules();

  return (
    <div>
      <PageHeader eyebrow="System" title="Notifications" subtitle="Which platform events generate a notification." />
      <Card className="max-w-2xl">
        <SectionTitle>Notification Rules</SectionTitle>
        <div className="space-y-3">
          {rules.map((r) => (
            <Checkbox key={r.id} label={r.description} checked={r.enabled} onChange={(v) => settingsRepo.toggleNotificationRule(r.id, v)} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsAdminPage;
