import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, Select, TextInput } from '../ui/AdminPrimitives';
import { PlusIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import { StudentRecord, StudentStatus } from '../types';
import {
  useStudents,
  useCourses,
  useBatches,
  useStudentProgressView,
  useCreateStudent,
  useUpdateStudent,
  useEnrollStudent,
} from '../../hooks';

const statusColor: Record<StudentStatus, SemanticColor> = { active: 'green', paused: 'amber', completed: 'blue', dropped: 'red' };

interface NewStudentDraft {
  name: string;
  email: string;
  courseId: string;
  batchId: string;
  enrollmentDate: string;
}

const StudentProgressCell: React.FC<{ studentId: string; courseId: string }> = ({ studentId, courseId }) => {
  const { data: view, isLoading } = useStudentProgressView(studentId, courseId);
  if (isLoading) return <span className="text-xs text-slate-400">...</span>;
  return <span>{view?.overallPercent ?? 0}%</span>;
};

const StudentProgressDetails: React.FC<{ studentId: string; courseId: string; isLiveDemoStudent?: boolean }> = ({
  studentId,
  courseId,
  isLiveDemoStudent,
}) => {
  const { data: view, isLoading } = useStudentProgressView(studentId, courseId);
  if (isLoading) return <div className="text-xs text-slate-400 py-2">Loading progress details...</div>;
  if (!view) return null;
  return (
    <div className="pt-3 border-t border-slate-100">
      {isLiveDemoStudent && (
        <p className="text-xs text-slate-400 mb-2">
          This is the live demo student — their journey, submissions and assessments are the real, shared app state.
        </p>
      )}
      <div className="text-sm space-y-1.5">
        <div>Current progress: {view.overallPercent}%</div>
        <div>Coding streak: {view.progress.codingStreak.current} days</div>
        <div>
          Mini tasks: {Object.keys(view.progress.miniTasks).filter((id) => view.progress.miniTasks[id].status === 'Passed').length} passed
        </div>
      </div>
    </div>
  );
};

const StudentsPage: React.FC = () => {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: batches = [], isLoading: batchesLoading } = useBatches();

  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const enrollStudentMutation = useEnrollStudent();

  const [selected, setSelected] = useState<StudentRecord | undefined>();
  const [creating, setCreating] = useState<NewStudentDraft | undefined>();

  const isLoading = studentsLoading || coursesLoading || batchesLoading;

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Name', render: (s) => <span className="font-semibold text-slate-900">{s.name}</span> },
    { key: 'email', label: 'Email', render: (s) => s.email },
    { key: 'course', label: 'Course', render: (s) => courses.find((c) => c.id === s.courseId)?.title || '—' },
    { key: 'batch', label: 'Batch', render: (s) => batches.find((b) => b.id === s.batchId)?.name || '—' },
    {
      key: 'progress',
      label: 'Progress',
      render: (s) => <StudentProgressCell studentId={s.id} courseId={s.courseId} />,
    },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge color={statusColor[s.status]}>{s.status}</StatusBadge> },
  ];

  const openCreate = (): void =>
    setCreating({
      name: '',
      email: '',
      courseId: courses[0]?.id || '',
      batchId: '',
      enrollmentDate: new Date().toISOString().slice(0, 10),
    });
  const closeCreate = (): void => setCreating(undefined);

  const handleCreate = async (): Promise<void> => {
    if (!creating || !creating.name.trim() || !creating.email.trim() || !creating.courseId) return;
    const student = await createStudentMutation.mutateAsync({
      name: creating.name.trim(),
      email: creating.email.trim(),
      courseId: creating.courseId,
      batchId: creating.batchId || undefined,
      enrollmentDate: creating.enrollmentDate,
      status: 'active',
    });
    await enrollStudentMutation.mutateAsync({
      studentId: student.id,
      courseId: creating.courseId,
      batchId: creating.batchId || undefined,
      startDate: creating.enrollmentDate,
      expectedCompletion: creating.enrollmentDate,
    });
    closeCreate();
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="Students" title="Students" subtitle="Everyone enrolled across your courses." />
        <LoadingState label="Loading students..." />
      </div>
    );
  }

  const isCreating = createStudentMutation.isLoading || enrollStudentMutation.isLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Students"
        title="Students"
        subtitle="Everyone enrolled across your courses."
        action={
          <PrimaryButton onClick={openCreate} disabled={courses.length === 0}>
            <PlusIcon className="w-4 h-4" /> Create Student
          </PrimaryButton>
        }
      />
      <AdminTable columns={columns} rows={students} rowKey={(s) => s.id} onRowClick={setSelected} emptyLabel="No students yet." />

      <Drawer open={!!selected} title={selected?.name || ''} subtitle={selected?.email} onClose={() => setSelected(undefined)}>
        {selected && (
          <div className="space-y-5">
            <FormField label="Status">
              <Select
                value={selected.status}
                onChange={(e) => {
                  const newStatus = e.target.value as StudentStatus;
                  setSelected({ ...selected, status: newStatus });
                  updateStudentMutation.mutate({ id: selected.id, patch: { status: newStatus } });
                }}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </Select>
            </FormField>
            <FormField label="Batch">
              <Select
                value={selected.batchId || ''}
                onChange={(e) => {
                  const newBatchId = e.target.value || undefined;
                  setSelected({ ...selected, batchId: newBatchId });
                  updateStudentMutation.mutate({ id: selected.id, patch: { batchId: newBatchId } });
                }}
              >
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
            <StudentProgressDetails
              studentId={selected.id}
              courseId={selected.courseId}
              isLiveDemoStudent={selected.isLiveDemoStudent}
            />
          </div>
        )}
      </Drawer>

      <Drawer
        open={!!creating}
        title="Create Student"
        onClose={closeCreate}
        footer={
          <>
            <SecondaryButton onClick={closeCreate} disabled={isCreating}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handleCreate}
              disabled={!creating?.name.trim() || !creating?.email.trim() || !creating?.courseId || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create & Enroll'}
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
