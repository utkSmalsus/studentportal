import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, Drawer, FormField, TextInput, TextArea, Select, Checkbox, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import { MiniTaskDef, Difficulty } from '../../data/types';
import { useCourses, useCourseContent, useCreateMiniTask, useUpdateMiniTask, useDeleteMiniTask } from '../../hooks';

const emptyDraft = (courseId: string, moduleId: string): Omit<MiniTaskDef, 'id'> => ({
  courseId,
  title: '',
  moduleId,
  difficulty: 'Beginner',
  estimatedDuration: '2 days',
  deadline: '',
  objective: '',
  requirements: [],
  skills: [],
  resources: [],
  evaluationCriteriaTemplate: [
    { label: 'Code Quality', maxScore: 20 },
    { label: 'Functionality', maxScore: 30 },
    { label: 'UI / UX', maxScore: 20 },
    { label: 'Error Handling', maxScore: 15 },
    { label: 'Documentation', maxScore: 15 },
  ],
  githubRequired: false,
  githubRepositoryMode: 'student-repo',
  githubBranch: '',
  githubPath: '',
  pullRequestRequired: false,
});

const MiniTasksAdminPage: React.FC = () => {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const courseId = selectedCourseId || courses[0]?.id || '';
  const { data: content, isLoading: contentLoading } = useCourseContent(courseId);

  const createMiniTaskMutation = useCreateMiniTask();
  const updateMiniTaskMutation = useUpdateMiniTask();
  const deleteMiniTaskMutation = useDeleteMiniTask();

  const [editing, setEditing] = useState<MiniTaskDef | undefined>();
  const [draft, setDraft] = useState<Omit<MiniTaskDef, 'id'> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<MiniTaskDef | undefined>();

  const isLoading = coursesLoading || (!!courseId && contentLoading);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          eyebrow="Content"
          title="Mini Tasks"
          subtitle="Practical assignments students submit for instructor review."
        />
        <LoadingState label="Loading mini tasks..." />
      </div>
    );
  }

  if (!content) return null;
  const modules = content.moduleDefs;
  const tasks = content.miniTasks;

  const openCreate = (): void => setDraft(emptyDraft(courseId, modules[0]?.id || ''));
  const openEdit = (t: MiniTaskDef): void => {
    setEditing(t);
    setDraft({ ...t });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };

  const save = async (): Promise<void> => {
    if (!draft || !draft.title.trim()) return;
    if (editing) {
      await updateMiniTaskMutation.mutateAsync({ courseId, id: editing.id, patch: draft });
    } else {
      await createMiniTaskMutation.mutateAsync({ courseId, input: draft });
    }
    closeDrawer();
  };

  const total = draft ? draft.evaluationCriteriaTemplate.reduce((s, c) => s + c.maxScore, 0) : 0;

  const columns: AdminColumn<MiniTaskDef>[] = [
    { key: 'title', label: 'Task Name', render: (t) => <span className="font-semibold text-slate-900">{t.title}</span> },
    { key: 'module', label: 'Module', render: (t) => modules.find((m) => m.id === t.moduleId)?.title || '—' },
    { key: 'difficulty', label: 'Difficulty', render: (t) => t.difficulty },
    { key: 'deadline', label: 'Deadline', render: (t) => t.deadline || '—' },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(t);
          }}
          className="text-slate-300 hover:text-red-500"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const isSaving = createMiniTaskMutation.isLoading || updateMiniTaskMutation.isLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Mini Tasks"
        subtitle="Practical assignments students submit for instructor review."
        action={
          <PrimaryButton onClick={openCreate} disabled={modules.length === 0}>
            <PlusIcon className="w-4 h-4" /> Create Mini Task
          </PrimaryButton>
        }
      />

      <div className="mb-5">
        <Select value={courseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="max-w-[260px]">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <AdminTable columns={columns} rows={tasks} rowKey={(t) => t.id} onRowClick={openEdit} emptyLabel="No mini tasks yet." />

      <Drawer
        open={!!draft}
        title={editing ? 'Edit Mini Task' : 'Create Mini Task'}
        wide
        onClose={closeDrawer}
        footer={
          <>
            <SecondaryButton onClick={closeDrawer} disabled={isSaving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={save} disabled={!draft?.title.trim() || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Task Title">
              <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Build a Responsive Dashboard" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Module">
                <Select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Difficulty">
                <Select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Difficulty })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Estimated Duration">
                <TextInput value={draft.estimatedDuration} onChange={(e) => setDraft({ ...draft, estimatedDuration: e.target.value })} placeholder="e.g. 2 days" />
              </FormField>
              <FormField label="Deadline (optional)">
                <TextInput type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Objective">
              <TextArea rows={3} value={draft.objective} onChange={(e) => setDraft({ ...draft, objective: e.target.value })} placeholder="What will the student accomplish?" />
            </FormField>
            <FormField label="Requirements" hint="One per line">
              <TextArea rows={4} value={draft.requirements.join('\n')} onChange={(e) => setDraft({ ...draft, requirements: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label="Skills Practiced" hint="Comma-separated">
              <TextInput value={draft.skills.join(', ')} onChange={(e) => setDraft({ ...draft, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </FormField>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluation Rubric</span>
                <span className={`text-xs font-semibold ${total === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>Total: {total} / 100</span>
              </div>
              <div className="space-y-2">
                {draft.evaluationCriteriaTemplate.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      value={c.label}
                      onChange={(e) => {
                        const copy = [...draft.evaluationCriteriaTemplate];
                        copy[i] = { ...copy[i], label: e.target.value };
                        setDraft({ ...draft, evaluationCriteriaTemplate: copy });
                      }}
                      className="flex-1 text-sm py-1.5"
                    />
                    <TextInput
                      type="number"
                      value={c.maxScore}
                      onChange={(e) => {
                        const copy = [...draft.evaluationCriteriaTemplate];
                        copy[i] = { ...copy[i], maxScore: Number(e.target.value) };
                        setDraft({ ...draft, evaluationCriteriaTemplate: copy });
                      }}
                      className="w-20 text-sm py-1.5 text-right"
                    />
                    <button
                      onClick={() =>
                        setDraft({
                          ...draft,
                          evaluationCriteriaTemplate: draft.evaluationCriteriaTemplate.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-slate-300 hover:text-red-500"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <SecondaryButton
                  className="text-xs px-3 py-1.5"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      evaluationCriteriaTemplate: [...draft.evaluationCriteriaTemplate, { label: 'New Criterion', maxScore: 10 }],
                    })
                  }
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add Criterion
                </SecondaryButton>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GitHub Requirements</span>
              <Checkbox label="Require GitHub Submission" checked={!!draft.githubRequired} onChange={(v) => setDraft({ ...draft, githubRequired: v })} />
              {draft.githubRequired && (
                <div className="space-y-2 pl-6">
                  <Checkbox label="Require Pull Request" checked={!!draft.pullRequestRequired} onChange={(v) => setDraft({ ...draft, pullRequestRequired: v })} />
                  <FormField label="Target Branch (optional)">
                    <TextInput value={draft.githubBranch || ''} onChange={(e) => setDraft({ ...draft, githubBranch: e.target.value })} placeholder="e.g. main" />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMiniTaskMutation.mutateAsync({ courseId, id: deleteTarget.id });
          }
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default MiniTasksAdminPage;
