import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, PrimaryButton, SecondaryButton, StatusPill, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, TextArea } from '../ui/AdminPrimitives';
import { PlusIcon, UsersIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import { Mentor, MentorStatus } from '../types';
import {
  useMentors,
  useBatches,
  useStudents,
  useCreateMentor,
  useUpdateMentor,
  useSetMentorStatus,
  useBatchesForMentor,
  useStudentsForMentor,
  usePendingReviewCountForMentor,
} from '../../hooks';

const statusColor: Record<MentorStatus, SemanticColor> = { active: 'green', inactive: 'gray' };

const emptyDraft: Omit<Mentor, 'id'> = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  experience: '',
  status: 'active',
  joiningDate: new Date().toISOString().slice(0, 10),
  bio: '',
};

const MentorDetailDrawer: React.FC<{ mentor: Mentor | undefined; onClose: () => void }> = ({ mentor, onClose }) => {
  const { data: batches = [] } = useBatchesForMentor(mentor?.id || '');
  const { data: students = [] } = useStudentsForMentor(mentor?.id || '');
  const { data: pendingCount = 0 } = usePendingReviewCountForMentor(mentor?.id || '');

  if (!mentor) return null;

  return (
    <Drawer open={!!mentor} title={mentor.name} subtitle={mentor.specialization} onClose={onClose}>
      <div className="space-y-5">
        <Card>
          <SectionTitle>Profile</SectionTitle>
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-slate-400">Email</dt>
              <dd className="text-slate-800">{mentor.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Phone</dt>
              <dd className="text-slate-800">{mentor.phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Experience</dt>
              <dd className="text-slate-800">{mentor.experience || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Joined</dt>
              <dd className="text-slate-800">{mentor.joiningDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Status</dt>
              <dd>
                <StatusPill color={statusColor[mentor.status]}>{mentor.status}</StatusPill>
              </dd>
            </div>
          </dl>
          {mentor.bio && <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{mentor.bio}</p>}
        </Card>

        <Card>
          <SectionTitle>Assigned Batches</SectionTitle>
          {batches.length === 0 ? (
            <p className="text-sm text-slate-400">No batches assigned yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {batches.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <UsersIcon className="w-3.5 h-3.5 text-slate-300" /> {b.name}
                  {b.primaryMentorId === mentor.id && <StatusPill color="blue">Primary</StatusPill>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle>Students ({students.length})</SectionTitle>
          {students.length === 0 ? (
            <p className="text-sm text-slate-400">No students assigned yet.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-700">
              {students.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle>Pending Reviews</SectionTitle>
          <p className="text-sm text-slate-700">
            {pendingCount} submission{pendingCount === 1 ? '' : 's'} awaiting review.
          </p>
        </Card>
      </div>
    </Drawer>
  );
};

const MentorsAdminPage: React.FC = () => {
  const { data: mentors = [], isLoading: mentorsLoading } = useMentors();
  const { data: batches = [], isLoading: batchesLoading } = useBatches();
  const { data: students = [], isLoading: studentsLoading } = useStudents();

  const createMentorMutation = useCreateMentor();
  const updateMentorMutation = useUpdateMentor();
  const setStatusMutation = useSetMentorStatus();

  const [editing, setEditing] = useState<Mentor | undefined>();
  const [draft, setDraft] = useState<Omit<Mentor, 'id'> | undefined>();
  const [detail, setDetail] = useState<Mentor | undefined>();

  const isLoading = mentorsLoading || batchesLoading || studentsLoading;

  const openCreate = (): void => setDraft({ ...emptyDraft });
  const openEdit = (m: Mentor): void => {
    setEditing(m);
    setDraft({ ...m });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };

  const save = async (): Promise<void> => {
    if (!draft || !draft.name.trim() || !draft.email.trim()) return;
    if (editing) {
      await updateMentorMutation.mutateAsync({ id: editing.id, patch: draft });
    } else {
      await createMentorMutation.mutateAsync(draft);
    }
    closeDrawer();
  };

  const columns: AdminColumn<Mentor>[] = [
    { key: 'name', label: 'Name', render: (m) => <span className="font-semibold text-slate-900">{m.name}</span> },
    { key: 'email', label: 'Email', render: (m) => m.email },
    { key: 'specialization', label: 'Specialization', render: (m) => m.specialization || '—' },
    { key: 'experience', label: 'Experience', render: (m) => m.experience || '—' },
    {
      key: 'batches',
      label: 'Assigned Batches',
      render: (m) => batches.filter((b) => b.mentorIds.indexOf(m.id) !== -1).length,
    },
    {
      key: 'students',
      label: 'Assigned Students',
      render: (m) => {
        const myBatchIds = batches.filter((b) => b.mentorIds.indexOf(m.id) !== -1).map((b) => b.id);
        return students.filter((s) => s.batchId && myBatchIds.indexOf(s.batchId) !== -1).length;
      },
    },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge color={statusColor[m.status]}>{m.status}</StatusBadge> },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(m)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Edit
          </button>
          <button
            onClick={() => setStatusMutation.mutate({ id: m.id, status: m.status === 'active' ? 'inactive' : 'active' })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            {m.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader
          eyebrow="Students"
          title="Mentors"
          subtitle="Coaches who review student work and monitor progress."
        />
        <LoadingState label="Loading mentors..." />
      </div>
    );
  }

  const isSaving = createMentorMutation.isLoading || updateMentorMutation.isLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Students"
        title="Mentors"
        subtitle="Coaches who review student work and monitor progress."
        action={
          <PrimaryButton onClick={openCreate}>
            <PlusIcon className="w-4 h-4" /> Create Mentor
          </PrimaryButton>
        }
      />

      <AdminTable columns={columns} rows={mentors} rowKey={(m) => m.id} onRowClick={setDetail} emptyLabel="No mentors yet." />

      <Drawer
        open={!!draft}
        title={editing ? 'Edit Mentor' : 'Create Mentor'}
        onClose={closeDrawer}
        footer={
          <>
            <SecondaryButton onClick={closeDrawer} disabled={isSaving}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save} disabled={!draft?.name.trim() || !draft?.email.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Name">
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <TextInput type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </FormField>
              <FormField label="Phone">
                <TextInput value={draft.phone || ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Specialization">
                <TextInput value={draft.specialization || ''} onChange={(e) => setDraft({ ...draft, specialization: e.target.value })} />
              </FormField>
              <FormField label="Experience">
                <TextInput
                  value={draft.experience || ''}
                  onChange={(e) => setDraft({ ...draft, experience: e.target.value })}
                  placeholder="e.g. 6 years"
                />
              </FormField>
            </div>
            <FormField label="Joining Date">
              <TextInput type="date" value={draft.joiningDate} onChange={(e) => setDraft({ ...draft, joiningDate: e.target.value })} />
            </FormField>
            <FormField label="Bio">
              <TextArea rows={3} value={draft.bio || ''} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </FormField>
          </div>
        )}
      </Drawer>

      <MentorDetailDrawer mentor={detail} onClose={() => setDetail(undefined)} />
    </div>
  );
};

export default MentorsAdminPage;
