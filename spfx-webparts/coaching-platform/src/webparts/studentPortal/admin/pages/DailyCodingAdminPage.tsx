import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, TextArea, Select, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon, CopyIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import { CodingQuestionDef, Difficulty } from '../../data/types';
import {
  useCourses,
  useCourseContent,
  useCreateCodingQuestion,
  useUpdateCodingQuestion,
  useDeleteCodingQuestion,
  useDuplicateCodingQuestion,
} from '../../hooks';

const difficultyColor: Record<Difficulty, SemanticColor> = { Beginner: 'green', Intermediate: 'amber', Advanced: 'red' };

const emptyDraft = (courseId: string, day: number): Omit<CodingQuestionDef, 'id'> => ({
  scope: 'course',
  courseId,
  day,
  title: '',
  difficulty: 'Beginner',
  topic: '',
  tags: [],
  problemStatement: '',
  exampleInput: '',
  exampleOutput: '',
  constraints: [],
  hints: [],
  testCasesTotal: 5,
  keywordChecks: [],
});

const DailyCodingAdminPage: React.FC = () => {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const courseId = selectedCourseId || courses[0]?.id || '';
  const { data: content, isLoading: contentLoading } = useCourseContent(courseId);

  const createQuestionMutation = useCreateCodingQuestion();
  const updateQuestionMutation = useUpdateCodingQuestion();
  const deleteQuestionMutation = useDeleteCodingQuestion();
  const duplicateQuestionMutation = useDuplicateCodingQuestion();

  const [editing, setEditing] = useState<CodingQuestionDef | undefined>();
  const [draft, setDraft] = useState<Omit<CodingQuestionDef, 'id'> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CodingQuestionDef | undefined>();

  const isLoading = coursesLoading || (!!courseId && contentLoading);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          eyebrow="Content"
          title="Daily Coding Scheduler"
          subtitle="One coding challenge per scheduled day — independent from module progression, but a mandatory gate alongside it."
        />
        <LoadingState label="Loading daily coding challenges..." />
      </div>
    );
  }

  if (!content) return null;
  const questions = content.codingQuestions;

  const openCreate = (): void => setDraft(emptyDraft(courseId, (questions[questions.length - 1]?.day || 0) + 1));
  const openEdit = (q: CodingQuestionDef): void => {
    setEditing(q);
    setDraft({ ...q });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };

  const save = async (): Promise<void> => {
    if (!draft || !draft.title.trim()) return;
    if (editing) {
      await updateQuestionMutation.mutateAsync({ courseId, id: editing.id, patch: draft });
    } else {
      await createQuestionMutation.mutateAsync({ courseId, input: draft });
    }
    closeDrawer();
  };

  const columns: AdminColumn<CodingQuestionDef>[] = [
    { key: 'day', label: 'Day', render: (q) => <span className="font-semibold">Day {q.day}</span> },
    { key: 'title', label: 'Title', render: (q) => q.title },
    { key: 'difficulty', label: 'Difficulty', render: (q) => <StatusBadge color={difficultyColor[q.difficulty]}>{q.difficulty}</StatusBadge> },
    { key: 'topic', label: 'Topic', render: (q) => q.topic },
    { key: 'tests', label: 'Test Cases', render: (q) => q.testCasesTotal },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (q) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => duplicateQuestionMutation.mutate({ courseId, id: q.id })}
            className="text-slate-300 hover:text-slate-600"
            title="Duplicate"
          >
            <CopyIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(q)}
            className="text-slate-300 hover:text-red-500"
            title="Delete"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const isSaving = createQuestionMutation.isLoading || updateQuestionMutation.isLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Daily Coding Scheduler"
        subtitle="One coding challenge per scheduled day — independent from module progression, but a mandatory gate alongside it."
        action={
          <PrimaryButton onClick={openCreate}>
            <PlusIcon className="w-4 h-4" /> Add Challenge
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

      <AdminTable columns={columns} rows={questions} rowKey={(q) => q.id} onRowClick={openEdit} emptyLabel="No challenges scheduled yet." />

      <Drawer
        open={!!draft}
        title={editing ? 'Edit Challenge' : 'Add Challenge'}
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
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Day #">
                <TextInput type="number" value={draft.day} onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })} />
              </FormField>
              <FormField label="Difficulty">
                <Select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Difficulty })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Challenge Title">
              <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </FormField>
            <FormField label="Topic / Concept">
              <TextInput value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} placeholder="e.g. Array Manipulation" />
            </FormField>
            <FormField label="Problem Statement">
              <TextArea rows={4} value={draft.problemStatement} onChange={(e) => setDraft({ ...draft, problemStatement: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Example Input">
                <TextInput value={draft.exampleInput} onChange={(e) => setDraft({ ...draft, exampleInput: e.target.value })} />
              </FormField>
              <FormField label="Example Output">
                <TextInput value={draft.exampleOutput} onChange={(e) => setDraft({ ...draft, exampleOutput: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Constraints" hint="One per line">
              <TextArea rows={2} value={draft.constraints.join('\n')} onChange={(e) => setDraft({ ...draft, constraints: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label="Hints" hint="One per line">
              <TextArea rows={2} value={draft.hints.join('\n')} onChange={(e) => setDraft({ ...draft, hints: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label="Total Test Cases">
              <TextInput type="number" value={draft.testCasesTotal} onChange={(e) => setDraft({ ...draft, testCasesTotal: Number(e.target.value) })} />
            </FormField>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete Day ${deleteTarget?.day} challenge "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteQuestionMutation.mutateAsync({ courseId, id: deleteTarget.id });
          }
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default DailyCodingAdminPage;
