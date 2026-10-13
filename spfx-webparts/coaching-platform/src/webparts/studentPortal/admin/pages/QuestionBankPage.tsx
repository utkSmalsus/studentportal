import * as React from 'react';
import { useState, useEffect } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, TextArea, Select, EmptyRowsState, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, SearchIcon, TrashIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import { BankQuestion } from '../types';
import { Difficulty } from '../../data/types';
import { useCourses, useCourseContent, useSearchQuestionBank, useCreateBankQuestion, useUpdateBankQuestion, useDeleteBankQuestion } from '../../hooks';

const difficultyColor: Record<Difficulty, SemanticColor> = { Beginner: 'green', Intermediate: 'amber', Advanced: 'red' };

const emptyDraft = (courseId: string): Omit<BankQuestion, 'id'> => ({ courseId, text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Beginner', tags: [] });

const QuestionBankPage: React.FC = () => {
  const { data: courses = [], isLoading: isLoadingCourses } = useCourses();
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    if (!courseId && courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [editing, setEditing] = useState<BankQuestion | undefined>();
  const [draft, setDraft] = useState<Omit<BankQuestion, 'id'> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<BankQuestion | undefined>();

  const { data: content } = useCourseContent(courseId);
  const modules = content?.moduleDefs || [];
  const { data: questions = [], isLoading: isLoadingQuestions } = useSearchQuestionBank({ courseId, search: search || undefined, difficulty: difficulty || undefined });

  const { mutate: createQuestion, isLoading: isCreating } = useCreateBankQuestion();
  const { mutate: updateQuestion, isLoading: isUpdating } = useUpdateBankQuestion();
  const { mutate: deleteQuestion, isLoading: isDeleting } = useDeleteBankQuestion();

  const isSaving = isCreating || isUpdating;

  const openCreate = (): void => setDraft(emptyDraft(courseId));
  const openEdit = (q: BankQuestion): void => {
    setEditing(q);
    setDraft({ courseId: q.courseId, moduleId: q.moduleId, topicId: q.topicId, text: q.text, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation, difficulty: q.difficulty, tags: [...q.tags] });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };
  const save = (): void => {
    if (!draft || !draft.text.trim()) return;
    if (editing) {
      updateQuestion({ id: editing.id, courseId: draft.courseId, patch: draft }, { onSuccess: closeDrawer });
    } else {
      createQuestion(draft, { onSuccess: closeDrawer });
    }
  };

  const columns: AdminColumn<BankQuestion>[] = [
    { key: 'text', label: 'Question', render: (q) => <span className="line-clamp-2">{q.text}</span> },
    { key: 'module', label: 'Module', render: (q) => modules.find((m) => m.id === q.moduleId)?.title || '—' },
    { key: 'difficulty', label: 'Difficulty', render: (q) => <StatusBadge color={difficultyColor[q.difficulty]}>{q.difficulty}</StatusBadge> },
    { key: 'tags', label: 'Tags', render: (q) => q.tags.join(', ') || '—' },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (q) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(q); }} className="text-slate-300 hover:text-red-500" disabled={isDeleting}>
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (isLoadingCourses) {
    return <LoadingState label="Loading question bank..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Question Bank"
        subtitle="A searchable pool of questions reused across Topic Tests, Module Tests and Assessments."
        action={
          <PrimaryButton onClick={openCreate} disabled={!courseId}>
            <PlusIcon className="w-4 h-4" /> Add Question
          </PrimaryButton>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="max-w-[260px]">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | '')} className="max-w-[180px]">
          <option value="">All difficulties</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </Select>
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <SearchIcon className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className="pl-9" />
        </div>
      </div>

      {!courseId ? (
        <EmptyRowsState title="Create a course first" description="The question bank is scoped per course." />
      ) : (
        <AdminTable columns={columns} rows={questions} rowKey={(q) => q.id} onRowClick={openEdit} emptyLabel={isLoadingQuestions ? "Loading questions..." : "No questions yet — add the first one."} />
      )}

      <Drawer open={!!draft} title={editing ? 'Edit Question' : 'Add Question'} onClose={closeDrawer} footer={<>
        <SecondaryButton onClick={closeDrawer} disabled={isSaving}>Cancel</SecondaryButton>
        <PrimaryButton onClick={save} disabled={!draft?.text.trim() || isSaving}>{isSaving ? 'Saving...' : 'Save'}</PrimaryButton>
      </>}>
        {draft && (
          <div className="space-y-4">
            <FormField label="Question">
              <TextArea rows={3} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} disabled={isSaving} />
            </FormField>
            <FormField label="Options" hint="Select the radio button next to the correct answer.">
              <div className="space-y-2">
                {draft.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" checked={draft.correctIndex === i} onChange={() => setDraft({ ...draft, correctIndex: i })} disabled={isSaving} />
                    <TextInput
                      value={opt}
                      onChange={(e) => {
                        const options = [...draft.options];
                        options[i] = e.target.value;
                        setDraft({ ...draft, options });
                      }}
                      disabled={isSaving}
                    />
                  </div>
                ))}
              </div>
            </FormField>
            <FormField label="Explanation">
              <TextArea rows={2} value={draft.explanation || ''} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} disabled={isSaving} />
            </FormField>
            <FormField label="Course" hint="Course is fixed to the course selected above — a question can never point at another course's module or topic.">
              <TextInput value={courses.find((c) => c.id === draft.courseId)?.title || draft.courseId} disabled className="bg-slate-50 text-slate-500" />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Module">
                <Select
                  value={draft.moduleId || ''}
                  onChange={(e) => setDraft({ ...draft, moduleId: e.target.value || undefined, topicId: undefined })}
                  disabled={isSaving}
                >
                  <option value="">—</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Topic">
                <Select
                  value={draft.topicId || ''}
                  onChange={(e) => setDraft({ ...draft, topicId: e.target.value || undefined })}
                  disabled={!draft.moduleId || isSaving}
                >
                  <option value="">—</option>
                  {(modules.find((m) => m.id === draft.moduleId)?.topics || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Difficulty">
                <Select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Difficulty })} disabled={isSaving}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Tags" hint="Comma-separated">
              <TextInput value={draft.tags.join(', ')} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} disabled={isSaving} />
            </FormField>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this question?"
        description={deleteTarget ? `"${deleteTarget.text}" will be permanently removed. This won't remove it from tests it's already been copied into.` : undefined}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        danger
        onConfirm={() => {
          if (deleteTarget) {
            deleteQuestion({ id: deleteTarget.id, courseId: deleteTarget.courseId }, {
              onSuccess: () => setDeleteTarget(undefined)
            });
          }
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default QuestionBankPage;
