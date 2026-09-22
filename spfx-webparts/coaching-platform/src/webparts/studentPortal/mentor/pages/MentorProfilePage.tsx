import * as React from 'react';
import { PageHeader, Card, SectionTitle } from '../../ui/Primitives';
import * as mentorRepo from '../../admin/repository/mentorRepository';

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <dt className="text-slate-400">{label}</dt>
    <dd className="text-slate-800 font-semibold">{value}</dd>
  </div>
);

const MentorProfilePage: React.FC<{ mentorId: string }> = ({ mentorId }) => {
  const mentor = mentorRepo.getMentor(mentorId);
  if (!mentor) return null;

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">{mentor.name.charAt(0)}</div>
        <div>
          <div className="text-lg font-bold text-slate-900">{mentor.name}</div>
          <div className="text-sm text-slate-500">{mentor.specialization}</div>
        </div>
      </div>
      <Card className="max-w-md">
        <SectionTitle>Details</SectionTitle>
        <dl className="space-y-2.5">
          <Row label="Email" value={mentor.email} />
          <Row label="Phone" value={mentor.phone || '—'} />
          <Row label="Experience" value={mentor.experience || '—'} />
          <Row label="Joined" value={mentor.joiningDate} />
        </dl>
        {mentor.bio && <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">{mentor.bio}</p>}
      </Card>
    </div>
  );
};

export default MentorProfilePage;
