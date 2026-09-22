import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, Select, TextInput } from '../ui/AdminPrimitives';
import { PlusIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import { getStudentProgressView } from '../repository/progressView';
import { StudentRecord, StudentStatus } from '../types';

const statusColor: Record<StudentStatus, SemanticColor> = { active: 'green', paused: 'amber', completed: 'blue', dropped: 'red' };

interface NewStudentDraft {
  name: string;
  email: string;
  courseId: string;
  batchId: string;
  enrollmentDate: string;
}

const StudentsPage: React.FC = () => {
  const students = rosterRepo.listStudents();
  const courses = courseRepo.listCourses();
  const batches = rosterRepo.listBatches();
  const [selected, setSelected] = useState<StudentRecord | undefined>();
  const [creating, setCreating] = useState<NewStudentDraft | undefined>();

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Name', render: (s) => <span className="font-semibold text-slate-900">{s.name}</span> },
    { key: 'email', label: 'Email', render: (s) => s.email },
    { key: 'course', label: 'Course', render: (s) => courses.find((c) => c.id === s.courseId)?.title || '—' },
    { key: 'batch', label: 'Batch', render: (s) => batches.find((b) => b.id === s.batchId)?.name || '—' },
    { key: 'progress', label: 'Progress', render: (s) => `${getStudentProgressView(s.id, s.courseId)?.overallPercent ?? 0}%` },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge color={statusColor[s.status]}>{s.status}</StatusBadge> },
  ];

  const selectedView = selected ? getStudentProgressView(selected.id, selected.courseId) : undefined;

  const openCreate = (): void => setCreating({ name: '', email: '', courseId: courses[0]?.id || '', batchId: '', enrollmentDate: new Date().toISOString().slice(0, 10) });
  const closeCreate = (): void => setCreating(undefined);
  const handleCreate = (): void => {
    if (!creating || !creating.name.trim() || !creating.email.trim() || !creating.courseId) return;
    const student = rosterRepo.createStudent({
      name: creating.name.trim(), email: creating.email.trim(), courseId: creating.courseId,
      batchId: creating.batchId || undefined, enrollmentDate: creating.enrollmentDate, status: 'active',
    });
    rosterRepo.enrollStudent({
      studentId: student.id, courseId: creating.courseId, batchId: creating.batchId || undefined,
      startDate: creating.enrollmentDate, expectedCompletion: creating.enrollmentDate,
    });
    closeCreate();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Students"
        title="Students"
        subtitle="Everyone enrolled across your courses."
        action={
          <PrimaryButton onClick={openCreate}>
            <PlusIcon className="w-4 h-4" /> Create Student
          </PrimaryButton>
        }
      />
      <AdminTable columns={columns} rows={students} rowKey={(s) => s.id} onRowClick={setSelected} emptyLabel="No students yet." />

      <Drawer open={!!selected} title={selected?.name || ''} subtitle={selected?.email} onClose={() => setSelected(undefined)}>
        {selected && (
          <div className="space-y-5">
            <FormField label="Status">
              <Select value={selected.status} onChange={(e) => rosterRepo.updateStudent(selected.id, { status: e.target.value as StudentStatus })}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </Select>
            </FormField>
            <FormField label="Batch">
              <Select value={selected.batchId || ''} onChange={(e) => rosterRepo.updateStudent(selected.id, { batchId: e.target.value || undefined })}>
                <option value="">—</option>
                {batches.filter((b) => b.courseId === selected.courseId).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="text-sm text-slate-500">
              Enrolled {selected.enrollmentDate} &middot; Course: {courses.find((c) => c.id === selected.courseId)?.title || '—'}
            </div>
            {selectedView && (
              <div className="pt-3 border-t border-slate-100">
                {selected.isLiveDemoStudent && (
                  <p className="text-xs text-slate-400 mb-2">This is the live demo student — their journey, submissions and assessments are the real, shared app state.</p>
                )}
                <div className="text-sm space-y-1.5">
                  <div>Current progress: {selectedView.overallPercent}%</div>
                  <div>Coding streak: {selectedView.progress.codingStreak.current} days</div>
                  <div>Mini tasks: {Object.keys(selectedView.progress.miniTasks).filter((id) => selectedView.progress.miniTasks[id].status === 'Passed').length} passed</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={!!creating}
        title="Create Student"
        onClose={closeCreate}
        footer={
          <>
            <SecondaryButton onClick={closeCreate}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleCreate} disabled={!creating?.name.trim() || !creating?.email.trim() || !creating?.courseId}>
              Create &amp; Enroll
            </PrimaryButton>
          </>
        }
      >
        {creating && (
          <div className="space-y-4">
            <FormField label="Name">
              <TextInput value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <TextInput type="email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} />
            </FormField>
            <FormField label="Course">
              <Select value={creating.courseId} onChange={(e) => setCreating({ ...creating, courseId: e.target.value, batchId: '' })}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Batch">
              <Select value={creating.batchId} onChange={(e) => setCreating({ ...creating, batchId: e.target.value })}>
                <option value="">—</option>
                {batches.filter((b) => b.courseId === creating.courseId).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Enrollment Date">
              <input
                type="date"
                value={creating.enrollmentDate}
                onChange={(e) => setCreating({ ...creating, enrollmentDate: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
              />
            </FormField>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StudentsPage;
