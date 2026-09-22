import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextInput, TextArea, Select, EmptyRowsState, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, SearchIcon, TrashIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as questionRepo from '../repository/questionBankRepository';
import { BankQuestion } from '../types';
import { Difficulty } from '../../data/types';

const difficultyColor: Record<Difficulty, SemanticColor> = { Beginner: 'green', Intermediate: 'amber', Advanced: 'red' };

const emptyDraft = (courseId: string): Omit<BankQuestion, 'id'> => ({ courseId, text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', difficulty: 'Beginner', tags: [] });

const QuestionBankPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [editing, setEditing] = useState<BankQuestion | undefined>();
  const [draft, setDraft] = useState<Omit<BankQuestion, 'id'> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<BankQuestion | undefined>();

  const content = courseRepo.getCourseContent(courseId);
  const modules = content?.moduleDefs || [];
  const questions = questionRepo.searchQuestions({ courseId, search: search || undefined, difficulty: difficulty || undefined });

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
    if (editing) questionRepo.updateQuestion(editing.id, draft);
    else questionRepo.createQuestion(draft);
    closeDrawer();
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
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(q); }} className="text-slate-300 hover:text-red-500">
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

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
        <AdminTable columns={columns} rows={questions} rowKey={(q) => q.id} onRowClick={openEdit} emptyLabel="No questions yet — add the first one." />
      )}

      <Drawer open={!!draft} title={editing ? 'Edit Question' : 'Add Question'} onClose={closeDrawer} footer={<>
        <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
        <PrimaryButton onClick={save} disabled={!draft?.text.trim()}>Save</PrimaryButton>
      </>}>
        {draft && (
          <div className="space-y-4">
            <FormField label="Question">
              <TextArea rows={3} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
            </FormField>
            <FormField label="Options" hint="Select the radio button next to the correct answer.">
              <div className="space-y-2">
                {draft.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" checked={draft.correctIndex === i} onChange={() => setDraft({ ...draft, correctIndex: i })} />
                    <TextInput
                      value={opt}
                      onChange={(e) => {
                        const options = [...draft.options];
                        options[i] = e.target.value;
                        setDraft({ ...draft, options });
                      }}
                    />
                  </div>
                ))}
              </div>
            </FormField>
            <FormField label="Explanation">
              <TextArea rows={2} value={draft.explanation || ''} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} />
            </FormField>
            <FormField label="Course" hint="Course is fixed to the course selected above — a question can never point at another course's module or topic.">
              <TextInput value={courses.find((c) => c.id === draft.courseId)?.title || draft.courseId} disabled className="bg-slate-50 text-slate-500" />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Module">
                <Select
                  value={draft.moduleId || ''}
                  onChange={(e) => setDraft({ ...draft, moduleId: e.target.value || undefined, topicId: undefined })}
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
                  disabled={!draft.moduleId}
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
                <Select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Difficulty })}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Tags" hint="Comma-separated">
              <TextInput value={draft.tags.join(', ')} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            </FormField>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this question?"
        description={deleteTarget ? `"${deleteTarget.text}" will be permanently removed. This won't remove it from tests it's already been copied into.` : undefined}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) questionRepo.deleteQuestion(deleteTarget.id);
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default QuestionBankPage;
