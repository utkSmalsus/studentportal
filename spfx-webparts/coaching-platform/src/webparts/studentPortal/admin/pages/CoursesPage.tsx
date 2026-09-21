import * as React from 'react';
import { useState } from 'react';
import { AdminRoute } from '../navigation/types';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, Select, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, ChevronRightIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import { CourseMeta, CourseStatus } from '../types';

const statusColor: Record<CourseStatus, SemanticColor> = { draft: 'gray', published: 'green', archived: 'red' };

const CoursesPage: React.FC<{ onNavigate: (r: AdminRoute) => void }> = ({ onNavigate }) => {
  const courses = courseRepo.listCourses();
  const students = rosterRepo.listStudents();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<CourseMeta['difficulty']>('Beginner');
  const [duplicateTarget, setDuplicateTarget] = useState<CourseMeta | undefined>();
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<CourseMeta | undefined>();

  const columns: AdminColumn<CourseMeta>[] = [
    { key: 'title', label: 'Course Name', render: (c) => <span className="font-semibold text-slate-900">{c.title}</span> },
    { key: 'code', label: 'Code', render: (c) => c.code || '—' },
    { key: 'category', label: 'Category', render: (c) => c.category || '—' },
    { key: 'duration', label: 'Duration', render: (c) => c.durationLabel || '—' },
    { key: 'modules', label: 'Modules', render: (c) => courseRepo.getCourseContent(c.id)?.moduleDefs.length ?? 0 },
    { key: 'students', label: 'Students', render: (c) => students.filter((s) => s.courseId === c.id).length },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge color={statusColor[c.status]}>{c.status}</StatusBadge> },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {c.status === 'published' ? (
            <button onClick={() => courseRepo.unpublishCourse(c.id)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1">
              Unpublish
            </button>
          ) : c.status === 'draft' ? (
            <button onClick={() => courseRepo.publishCourse(c.id)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1">
              Publish
            </button>
          ) : null}
          <button
            onClick={() => {
              setDuplicateTarget(c);
              setDuplicateTitle(`${c.title} — Copy`);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            Duplicate
          </button>
          {c.status !== 'archived' && (
            <button onClick={() => setArchiveTarget(c)} className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1">
              Archive
            </button>
          )}
          <ChevronRightIcon className="w-4 h-4 text-slate-300" />
        </div>
      ),
    },
  ];

  const resetCreateForm = (): void => {
    setTitle('');
    setCode('');
    setCategory('');
    setDifficulty('Beginner');
  };

  const handleCreate = (): void => {
    if (!title.trim()) return;
    const meta = courseRepo.createCourse({ title, code, category, difficulty });
    setCreating(false);
    resetCreateForm();
    onNavigate({ view: 'courseEdit', courseId: meta.id });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Course Management"
        title="Courses"
        subtitle="Every training program this coaching center offers."
        action={
          <PrimaryButton onClick={() => setCreating(true)}>
            <PlusIcon className="w-4 h-4" /> Create Course
          </PrimaryButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={courses}
        rowKey={(c) => c.id}
        onRowClick={(c) => onNavigate({ view: 'curriculum', courseId: c.id })}
        emptyLabel="No courses yet — create your first one."
      />

      <Drawer
        open={creating}
        title="Create Course"
        subtitle="Step 1 of the course wizard — you can fill in the rest from the course editor."
        onClose={() => setCreating(false)}
        footer={
          <>
            <SecondaryButton onClick={() => setCreating(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleCreate} disabled={!title.trim()}>
              Create Course
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Course Name">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SPFx / SharePoint Development" />
          </FormField>
          <FormField label="Course Code">
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SPFX-2026" />
          </FormField>
          <FormField label="Category">
            <TextInput value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Frontend Development" />
          </FormField>
          <FormField label="Difficulty">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as CourseMeta['difficulty'])}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </Select>
          </FormField>
        </div>
      </Drawer>

      <Drawer
        open={!!duplicateTarget}
        title="Duplicate Course"
        subtitle={duplicateTarget ? `Copying "${duplicateTarget.title}" — modules, topics, tests and assessments included.` : ''}
        onClose={() => setDuplicateTarget(undefined)}
        footer={
          <>
            <SecondaryButton onClick={() => setDuplicateTarget(undefined)}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={() => {
                if (duplicateTarget) courseRepo.duplicateCourse(duplicateTarget.id, duplicateTitle);
                setDuplicateTarget(undefined);
              }}
              disabled={!duplicateTitle.trim()}
            >
              Duplicate
            </PrimaryButton>
          </>
        }
      >
        <FormField label="New Course Name">
          <TextInput value={duplicateTitle} onChange={(e) => setDuplicateTitle(e.target.value)} />
        </FormField>
      </Drawer>

      <ConfirmDialog
        open={!!archiveTarget}
        title={`Archive "${archiveTarget?.title}"?`}
        description="Archived courses are hidden from new enrollment but existing student progress is preserved."
        confirmLabel="Archive"
        danger
        onConfirm={() => {
          if (archiveTarget) courseRepo.archiveCourse(archiveTarget.id);
          setArchiveTarget(undefined);
        }}
        onCancel={() => setArchiveTarget(undefined)}
      />
    </div>
  );
};

export default CoursesPage;
