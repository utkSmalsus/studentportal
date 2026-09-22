import * as React from 'react';
import { PageHeader, Card, SectionTitle } from '../../ui/Primitives';
import { Tag } from '../../ui/Primitives';
import { AdminRole } from '../types';

const roles: { role: AdminRole; description: string }[] = [
  { role: 'admin', description: 'Full access: courses, curriculum, question bank, students, batches, evaluation, reports, certificates, settings.' },
  { role: 'mentor', description: 'Only their assigned batches/students — monitor progress, review Mini Tasks and Major Projects, view GitHub activity, evaluate submissions.' },
  { role: 'student', description: 'The student experience only.' },
];

const SettingsPage: React.FC = () => (
  <div>
    <PageHeader eyebrow="System" title="Settings" subtitle="Platform-wide configuration." />

    <Card className="max-w-2xl mb-6">
      <SectionTitle>Roles &amp; Access</SectionTitle>
      <p className="text-xs text-slate-400 mb-4">
        This demo runs as a single Admin session (no login system), but every repository call already carries the shape a real role check would gate — the
        pages this account can reach map 1:1 onto the Admin role below.
      </p>
      <div className="space-y-4">
        {roles.map((r) => (
          <div key={r.role} className="flex items-start gap-3">
            <Tag>{r.role}</Tag>
            <p className="text-sm text-slate-600">{r.description}</p>
          </div>
        ))}
      </div>
    </Card>

    <Card className="max-w-2xl">
      <SectionTitle>Persistence</SectionTitle>
      <p className="text-sm text-slate-600">
        Admin edits are stored in this browser&apos;s local storage (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">coachingPlatform.adminStore.v1</code>) so they
        survive a refresh during development. Swapping this for SharePoint Lists + Graph API is a repository-layer change only — no page in this Admin Panel
        talks to storage directly.
      </p>
    </Card>
  </div>
);

export default SettingsPage;
