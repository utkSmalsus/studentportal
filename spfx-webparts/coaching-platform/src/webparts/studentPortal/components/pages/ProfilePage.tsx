import * as React from 'react';
import { Card, PageHeader } from '../../ui/Primitives';
import { profile } from '../../data/mockData';

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <dt className="text-slate-400">{label}</dt>
    <dd className="text-slate-800 font-semibold">{value}</dd>
  </div>
);

const ProfilePage: React.FC<{ userDisplayName: string }> = ({ userDisplayName }) => (
  <div>
    <PageHeader eyebrow="Account" title="Profile" />

    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
        {(userDisplayName || profile.name).charAt(0)}
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900">{userDisplayName || profile.name}</div>
        <div className="text-sm text-slate-500">{profile.batch}</div>
      </div>
    </div>

    <Card className="max-w-md">
      <dl className="text-sm space-y-3">
        <Row label="Course" value={profile.course} />
        <Row label="Batch" value={profile.batch} />
        <Row label="Joined" value={profile.joiningDate} />
      </dl>
    </Card>
  </div>
);

export default ProfilePage;
