import * as React from 'react';
import { PageHeader, Card, SectionTitle, LoadingState } from '../../ui/Primitives';
import { Checkbox } from '../ui/AdminPrimitives';
import { useNotificationRules, useToggleNotificationRule } from '../../hooks';

const NotificationsAdminPage: React.FC = () => {
  const { data: rules = [], isLoading } = useNotificationRules();
  const toggleMutation = useToggleNotificationRule();

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="System" title="Notifications" subtitle="Which platform events generate a notification." />
        <LoadingState label="Loading notification rules..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="System" title="Notifications" subtitle="Which platform events generate a notification." />
      <Card className="max-w-2xl">
        <SectionTitle>Notification Rules</SectionTitle>
        <div className="space-y-3">
          {rules.map((r) => (
            <Checkbox
              key={r.id}
              label={r.description}
              checked={r.enabled}
              onChange={(v) => toggleMutation.mutate({ id: r.id, enabled: v })}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsAdminPage;
