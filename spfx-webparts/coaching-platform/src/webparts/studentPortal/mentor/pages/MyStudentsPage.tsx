import * as React from 'react';
import { useState } from 'react';
import { MentorRoute } from '../navigation/types';
import { PageHeader } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Select } from '../../admin/ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as courseRepo from '../../admin/repository/courseRepository';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs as activeModuleDefs, course as activeCourse } from '../../data/selectors';
import { StudentRecord, StudentStatus } from '../../admin/types';

const statusColor: Record<StudentStatus, SemanticColor> = { active: 'green', paused: 'amber', completed: 'blue', dropped: 'red' };

const MyStudentsPage: React.FC<{ mentorId: string; onNavigate: (r: MentorRoute) => void }> = ({ mentorId, onNavigate }) => {
  const { state: liveProgress } = useAppState();
  const courses = courseRepo.listCourses();
  const allStudents = mentorRepo.getStudentsForMentor(mentorId);
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');

  const students = statusFilter ? allStudents.filter((s) => s.status === statusFilter) : allStudents;

  const progressFor = (s: StudentRecord): number => (s.isLiveDemoStudent ? progression.courseOverallProgress(activeCourse, activeModuleDefs, liveProgress) : 0);
  const currentModuleFor = (s: StudentRecord): string =>
    s.isLiveDemoStudent ? progression.currentModule(activeCourse, activeModuleDefs, liveProgress)?.title || 'Complete' : '—';

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Student', render: (s) => <span className="font-semibold text-slate-900">{s.name}</span> },
    { key: 'course', label: 'Course', render: (s) => courses.find((c) => c.id === s.courseId)?.title || '—' },
    { key: 'progress', label: 'Progress', render: (s) => (s.isLiveDemoStudent ? `${progressFor(s)}%` : '—') },
    { key: 'module', label: 'Current Module', render: (s) => currentModuleFor(s) },
    {
      key: 'dailyCoding',
      label: 'Daily Coding',
      render: (s) => (s.isLiveDemoStudent ? `${liveProgress.codingStreak.current}-day streak` : '—'),
    },
    {
      key: 'miniTasks',
      label: 'Mini Tasks',
      render: (s) => (s.isLiveDemoStudent ? Object.keys(liveProgress.miniTasks).filter((id) => liveProgress.miniTasks[id].status === 'Passed').length : '—'),
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
