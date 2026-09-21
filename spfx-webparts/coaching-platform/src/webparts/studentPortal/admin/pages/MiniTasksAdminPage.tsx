import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, Drawer, FormField, TextInput, TextArea, Select, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import * as courseRepo from '../repository/courseRepository';
import * as contentRepo from '../repository/contentRepository';
import { MiniTaskDef, Difficulty } from '../../data/types';

const emptyDraft = (moduleId: string): Omit<MiniTaskDef, 'id'> => ({
  title: '', moduleId, difficulty: 'Beginner', estimatedDuration: '2 days', deadline: '', objective: '', requirements: [], skills: [], resources: [],
  evaluationCriteriaTemplate: [{ label: 'Code Quality', maxScore: 20 }, { label: 'Functionality', maxScore: 30 }, { label: 'UI / UX', maxScore: 20 }, { label: 'Error Handling', maxScore: 15 }, { label: 'Documentation', maxScore: 15 }],
});

const MiniTasksAdminPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const content = courseRepo.getCourseContent(courseId);
  const [editing, setEditing] = useState<MiniTaskDef | undefined>();
  const [draft, setDraft] = useState<Omit<MiniTaskDef, 'id'> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<MiniTaskDef | undefined>();

  if (!content) return null;
  const modules = content.moduleDefs;
  const tasks = content.miniTasks;

  const openCreate = (): void => setDraft(emptyDraft(modules[0]?.id || ''));
  const openEdit = (t: MiniTaskDef): void => {
    setEditing(t);
    setDraft({ ...t });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };
  const save = (): void => {
    if (!draft || !draft.title.trim()) return;
    if (editing) contentRepo.updateMiniTask(courseId, editing.id, draft);
    else contentRepo.createMiniTask(courseId, draft);
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
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); }} className="text-slate-300 hover:text-red-500">
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

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
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="max-w-[260px]">
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
            <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save} disabled={!draft?.title.trim()}>
              Save
            </PrimaryButton>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Task Name">
              <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
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
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </Select>
              </FormField>
              <FormField label="Estimated Duration">
                <TextInput value={draft.estimatedDuration} onChange={(e) => setDraft({ ...draft, estimatedDuration: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Deadline">
              <TextInput type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
            </FormField>
            <FormField label="Objective">
              <TextArea rows={2} value={draft.objective} onChange={(e) => setDraft({ ...draft, objective: e.target.value })} />
            </FormField>
            <FormField label="Requirements" hint="One per line">
              <TextArea rows={3} value={draft.requirements.join('\n')} onChange={(e) => setDraft({ ...draft, requirements: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label="Skills" hint="Comma-separated">
              <TextInput value={draft.skills.join(', ')} onChange={(e) => setDraft({ ...draft, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </FormField>
            <FormField label="Resources" hint="One per line">
              <TextArea rows={2} value={draft.resources.join('\n')} onChange={(e) => setDraft({ ...draft, resources: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label={`Evaluation Criteria (total ${total})`}>
              <div className="space-y-2">
                {draft.evaluationCriteriaTemplate.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      value={c.label}
                      onChange={(e) => {
                        const list = [...draft.evaluationCriteriaTemplate];
                        list[i] = { ...list[i], label: e.target.value };
                        setDraft({ ...draft, evaluationCriteriaTemplate: list });
                      }}
                    />
                    <TextInput
                      type="number"
                      className="max-w-[100px]"
                      value={c.maxScore}
                      onChange={(e) => {
                        const list = [...draft.evaluationCriteriaTemplate];
                        list[i] = { ...list[i], maxScore: Number(e.target.value) };
                        setDraft({ ...draft, evaluationCriteriaTemplate: list });
                      }}
                    />
                    <button
                      onClick={() => setDraft({ ...draft, evaluationCriteriaTemplate: draft.evaluationCriteriaTemplate.filter((_, ii) => ii !== i) })}
                      className="text-slate-300 hover:text-red-500 shrink-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <SecondaryButton
                  className="text-xs px-3 py-1.5"
                  onClick={() => setDraft({ ...draft, evaluationCriteriaTemplate: [...draft.evaluationCriteriaTemplate, { label: '', maxScore: 10 }] })}
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add Criterion
                </SecondaryButton>
              </div>
            </FormField>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) contentRepo.deleteMiniTask(courseId, deleteTarget.id);
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default MiniTasksAdminPage;
