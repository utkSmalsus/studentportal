import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, Select } from '../ui/AdminPrimitives';
import { PlusIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import { Batch, BatchStatus } from '../types';

const statusColor: Record<BatchStatus, SemanticColor> = { upcoming: 'blue', active: 'green', completed: 'gray' };

const emptyDraft = (courseId: string): Omit<Batch, 'id'> => ({ name: '', courseId, startDate: '', endDate: '', scheduleDays: [], scheduleTime: '', instructor: '', status: 'upcoming' });

const BatchesPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const batches = rosterRepo.listBatches();
  const students = rosterRepo.listStudents();
  const [editing, setEditing] = useState<Batch | undefined>();
  const [draft, setDraft] = useState<Omit<Batch, 'id'> | undefined>();

  const openCreate = (): void => setDraft(emptyDraft(courses[0]?.id || ''));
  const openEdit = (b: Batch): void => {
    setEditing(b);
    setDraft({ ...b });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };
  const save = (): void => {
    if (!draft || !draft.name.trim()) return;
    if (editing) rosterRepo.updateBatch(editing.id, draft);
    else rosterRepo.createBatch(draft);
    closeDrawer();
  };

  const columns: AdminColumn<Batch>[] = [
    { key: 'name', label: 'Batch', render: (b) => <span className="font-semibold text-slate-900">{b.name}</span> },
    { key: 'course', label: 'Course', render: (b) => courses.find((c) => c.id === b.courseId)?.title || '—' },
    { key: 'schedule', label: 'Schedule', render: (b) => `${b.scheduleDays.join(', ')} · ${b.scheduleTime}` },
    { key: 'dates', label: 'Dates', render: (b) => `${b.startDate} → ${b.endDate}` },
    { key: 'instructor', label: 'Instructor', render: (b) => b.instructor },
    { key: 'students', label: 'Students', render: (b) => students.filter((s) => s.batchId === b.id).length },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge color={statusColor[b.status]}>{b.status}</StatusBadge> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Students"
        title="Batches"
        subtitle="Cohorts running a course on a shared schedule."
        action={
          <PrimaryButton onClick={openCreate} disabled={courses.length === 0}>
            <PlusIcon className="w-4 h-4" /> Create Batch
          </PrimaryButton>
        }
      />

      <AdminTable columns={columns} rows={batches} rowKey={(b) => b.id} onRowClick={openEdit} emptyLabel="No batches yet." />

      <Drawer
        open={!!draft}
        title={editing ? 'Edit Batch' : 'Create Batch'}
        onClose={closeDrawer}
        footer={
          <>
            <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save} disabled={!draft?.name.trim()}>
              Save
            </PrimaryButton>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Batch Name">
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. MERN-02 · Weekend Batch" />
            </FormField>
            <FormField label="Course">
              <Select value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date">
                <TextInput type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
              </FormField>
              <FormField label="End Date">
                <TextInput type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Schedule Days" hint="Comma-separated, e.g. Mon, Tue, Wed">
              <TextInput value={draft.scheduleDays.join(', ')} onChange={(e) => setDraft({ ...draft, scheduleDays: e.target.value.split(',').map((d) => d.trim()).filter(Boolean) })} />
            </FormField>
            <FormField label="Schedule Time">
              <TextInput value={draft.scheduleTime} onChange={(e) => setDraft({ ...draft, scheduleTime: e.target.value })} placeholder="9:00 AM – 11:00 AM" />
            </FormField>
            <FormField label="Instructor">
              <TextInput value={draft.instructor} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} />
            </FormField>
            <FormField label="Status">
              <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as BatchStatus })}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>
            </FormField>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BatchesPage;
