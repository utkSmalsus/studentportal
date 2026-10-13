import * as React from 'react';
import { useState } from 'react';
import { MentorRoute } from '../navigation/types';
import { PageHeader, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Select } from '../../admin/ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import { StudentRecord, StudentStatus } from '../../admin/types';
import { useMentorStudentsProgress } from '../../hooks';

const statusColor: Record<StudentStatus, SemanticColor> = { active: 'green', paused: 'amber', completed: 'blue', dropped: 'red' };

const MyStudentsPage: React.FC<{ mentorId: string; onNavigate: (r: MentorRoute) => void }> = ({ mentorId, onNavigate }) => {
  const { data, isLoading } = useMentorStudentsProgress(mentorId);
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');

  if (isLoading || !data) {
    return <LoadingState label="Loading students..." />;
  }

  const { courses, allStudents, viewByStudentId } = data;
  const students = statusFilter ? allStudents.filter((s) => s.status === statusFilter) : allStudents;

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Student', render: (s) => <span className="font-semibold text-slate-900">{s.name}</span> },
    { key: 'course', label: 'Course', render: (s) => courses.find((c) => c.id === s.courseId)?.title || '—' },
    { key: 'progress', label: 'Progress', render: (s) => `${viewByStudentId[s.id]?.overallPercent ?? 0}%` },
    { key: 'module', label: 'Current Module', render: (s) => viewByStudentId[s.id]?.currentModuleTitle || '—' },
    {
      key: 'dailyCoding',
      label: 'Daily Coding',
      render: (s) => `${viewByStudentId[s.id]?.progress.codingStreak.current ?? 0}-day streak`,
    },
    {
      key: 'miniTasks',
      label: 'Mini Tasks',
      render: (s) => {
        const progress = viewByStudentId[s.id]?.progress;
        return progress ? Object.keys(progress.miniTasks).filter((id) => progress.miniTasks[id].status === 'Passed').length : 0;
      },
    },
    { key: 'status', label: 'Status', render: (s) => <StatusBadge color={statusColor[s.status]}>{s.status}</StatusBadge> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Students" title="My Students" subtitle="Everyone enrolled in your assigned batches." />

      <div className="mb-5 flex gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StudentStatus | '')} className="max-w-[180px]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Needs Attention</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </Select>
      </div>

      <AdminTable
        columns={columns}
        rows={students}
        rowKey={(s) => s.id}
        onRowClick={(s) => onNavigate({ view: 'studentDetail', studentId: s.id })}
        emptyLabel="No students assigned to your batches yet."
      />
    </div>
  );
};

export default MyStudentsPage;
