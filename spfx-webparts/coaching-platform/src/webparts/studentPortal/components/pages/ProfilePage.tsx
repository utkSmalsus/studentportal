import * as React from 'react';
import { Divider } from '../../ui/Primitives';
import { profile } from '../../data/mockData';

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between max-w-sm">
    <dt className="text-gray-400">{label}</dt>
    <dd className="text-gray-800 font-medium">{value}</dd>
  </div>
);

const ProfilePage: React.FC<{ userDisplayName: string }> = ({ userDisplayName }) => (
  <div>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
        {(userDisplayName || profile.name).charAt(0)}
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{userDisplayName || profile.name}</h1>
        <p className="text-sm text-gray-500">{profile.batch}</p>
      </div>
    </div>

    <Divider />

    <dl className="text-sm space-y-2">
      <Row label="Course" value={profile.course} />
      <Row label="Batch" value={profile.batch} />
      <Row label="Joined" value={profile.joiningDate} />
    </dl>
  </div>
);

export default ProfilePage;
