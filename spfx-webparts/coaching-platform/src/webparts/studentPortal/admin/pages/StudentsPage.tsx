import * as React from 'react';
import { useState } from 'react';
import { PageHeader } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, Select } from '../ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import { getStudentProgressView } from '../repository/progressView';
import { StudentRecord, StudentStatus } from '../types';

const statusColor: Record<StudentStatus, SemanticColor> = { active: 'green', paused: 'amber', completed: 'blue', dropped: 'red' };

const StudentsPage: React.FC = () => {
  const students = rosterRepo.listStudents();
  const courses = courseRepo.listCourses();
  const batches = rosterRepo.listBatches();
  const [selected, setSelected] = useState<StudentRecord | undefined>();

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Name', render: (s) => <span className="font-semibold text-slate-900">{s.name}</span> },
    { key: 'email', label: 'Email', render: (s) => s.email },
    { key: 'course', label: 'Course', render: (s) => courses.find((c) => c.id === s.courseId)?.title || '—' },
    { key: 'batch', label: 'Batch', render: (s) => batches.find((b) => b.id === s.batchId)?.name || '—' },
    { key: 'progress', label: 'Progress', render: (s) => `${getStudentProgressView(s.id, s.courseId)?.overallPercent ?? 0}%` },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge color={statusColor[s.status]}>{s.status}</StatusBadge> },
  ];

  const selectedView = selected ? getStudentProgressView(selected.id, selected.courseId) : undefined;

  return (
    <div>
      <PageHeader eyebrow="Students" title="Students" subtitle="Everyone enrolled across your courses." />
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
    </div>
  );
};

export default StudentsPage;
