import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton, Card, SectionTitle, StatusPill } from '../../ui/Primitives';
import { AdminTable, AdminColumn, Drawer, FormField, TextInput, TextArea, Select, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import * as courseRepo from '../repository/courseRepository';
import * as contentRepo from '../repository/contentRepository';
import { AssessmentDef, ModuleTestDef } from '../../data/types';

const AssessmentsAdminPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const content = courseRepo.getCourseContent(courseId);
  const [editing, setEditing] = useState<AssessmentDef | undefined>();
  const [managing, setManaging] = useState<AssessmentDef | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AssessmentDef | undefined>();
  const [draft, setDraft] = useState<{ title: string; timeLimitMinutes: number; passingScorePercent: number; attemptsAllowed: number; topics: string } | undefined>();

  if (!content) return null;
  const modules = content.moduleDefs;
  const assessments = content.assessments;

  const openEdit = (a: AssessmentDef): void => {
    setEditing(a);
    setDraft({ title: a.title, timeLimitMinutes: a.timeLimitMinutes, passingScorePercent: a.passingScorePercent, attemptsAllowed: a.attemptsAllowed, topics: a.topics.join(', ') });
  };
  const closeDrawer = (): void => {
    setEditing(undefined);
    setDraft(undefined);
  };
  const save = (): void => {
    if (!editing || !draft) return;
    contentRepo.updateAssessment(courseId, editing.id, {
      title: draft.title,
      timeLimitMinutes: draft.timeLimitMinutes,
      passingScorePercent: draft.passingScorePercent,
      attemptsAllowed: draft.attemptsAllowed,
      topics: draft.topics.split(',').map((t) => t.trim()).filter(Boolean),
    });
    closeDrawer();
  };

  const moduleTestColumns: AdminColumn<ModuleTestDef>[] = [
    { key: 'title', label: 'Module Test', render: (t) => <span className="font-semibold text-slate-900">{t.title}</span> },
    { key: 'module', label: 'Module', render: (t) => modules.find((m) => m.id === t.moduleId)?.title || '—' },
    { key: 'pass', label: 'Passing Score', render: (t) => `${t.passingScorePercent}%` },
    { key: 'attempts', label: 'Attempts', render: (t) => t.attemptsAllowed },
    { key: 'questions', label: 'Questions', render: (t) => t.questions.length },
  ];

  const columns: AdminColumn<AssessmentDef>[] = [
    { key: 'title', label: 'Assessment Name', render: (a) => <span className="font-semibold text-slate-900">{a.title}</span> },
    { key: 'module', label: 'Module', render: (a) => modules.find((m) => m.id === a.moduleId)?.title || '—' },
    { key: 'pass', label: 'Passing Score', render: (a) => `${a.passingScorePercent}%` },
    { key: 'attempts', label: 'Attempts', render: (a) => a.attemptsAllowed },
    { key: 'questions', label: 'Questions', render: (a) => a.questions.length },
    { key: 'status', label: '', render: () => <StatusPill color="green">Published</StatusPill> },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setManaging(a)} className="text-xs font-semibold text-indigo-600 hover:underline">
            Questions
          </button>
          <button onClick={() => setDeleteTarget(a)} className="text-slate-300 hover:text-red-500">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader eyebrow="Content" title="Assessments" subtitle="Full exam-style checks that gate module completion. Create a new one from a module's Curriculum Builder panel." />

      <div className="mb-5">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="max-w-[260px]">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <SectionTitle>Assessments</SectionTitle>
      <div className="mb-8">
        <AdminTable columns={columns} rows={assessments} rowKey={(a) => a.id} onRowClick={openEdit} emptyLabel="No assessments yet." />
      </div>

      <SectionTitle>Module Tests</SectionTitle>
      <AdminTable columns={moduleTestColumns} rows={content.moduleTests} rowKey={(t) => t.id} emptyLabel="No module tests yet." />

      <Drawer
        open={!!draft}
        title="Edit Assessment"
        onClose={closeDrawer}
        footer={
          <>
            <SecondaryButton onClick={closeDrawer}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Assessment Name">
              <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </FormField>
            <FormField label="Topics Covered" hint="Comma-separated">
              <TextInput value={draft.topics} onChange={(e) => setDraft({ ...draft, topics: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Time Limit (min)">
                <TextInput type="number" value={draft.timeLimitMinutes} onChange={(e) => setDraft({ ...draft, timeLimitMinutes: Number(e.target.value) })} />
              </FormField>
              <FormField label="Passing Score (%)">
                <TextInput type="number" value={draft.passingScorePercent} onChange={(e) => setDraft({ ...draft, passingScorePercent: Number(e.target.value) })} />
              </FormField>
              <FormField label="Attempts Allowed">
                <TextInput type="number" value={draft.attemptsAllowed} onChange={(e) => setDraft({ ...draft, attemptsAllowed: Number(e.target.value) })} />
              </FormField>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer open={!!managing} title={`Questions — ${managing?.title || ''}`} wide onClose={() => setManaging(undefined)}>
        {managing && (
          <div className="space-y-3">
            {managing.questions.map((q, qi) => (
              <Card key={q.id} className="!p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400">Q{qi + 1} &middot; {q.topic}</span>
                  <button onClick={() => contentRepo.removeQuestionFromAssessment(courseId, managing.id, q.id)} className="text-slate-300 hover:text-red-500">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <TextArea
                  rows={2}
                  value={q.text}
                  onChange={(e) => {
                    const questions = managing.questions.map((qq) => (qq.id === q.id ? { ...qq, text: e.target.value } : qq));
                    contentRepo.updateAssessment(courseId, managing.id, { questions });
                    setManaging({ ...managing, questions });
                  }}
                  className="mb-2 text-sm"
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      checked={q.correctIndex === oi}
                      onChange={() => {
                        const questions = managing.questions.map((qq) => (qq.id === q.id ? { ...qq, correctIndex: oi } : qq));
                        contentRepo.updateAssessment(courseId, managing.id, { questions });
                        setManaging({ ...managing, questions });
                      }}
                    />
                    <TextInput
                      value={opt}
                      onChange={(e) => {
                        const options = [...q.options];
                        options[oi] = e.target.value;
                        const questions = managing.questions.map((qq) => (qq.id === q.id ? { ...qq, options } : qq));
                        contentRepo.updateAssessment(courseId, managing.id, { questions });
                        setManaging({ ...managing, questions });
                      }}
                      className="text-sm py-1.5"
                    />
                  </div>
                ))}
              </Card>
            ))}
            <SecondaryButton
              className="text-xs px-3 py-1.5"
              onClick={() => {
                contentRepo.addQuestionToAssessment(courseId, managing.id, { text: '', options: ['', '', '', ''], correctIndex: 0, topic: managing.topics[0] || '' });
                setManaging(courseRepo.getCourseContent(courseId)?.assessments.find((a) => a.id === managing.id));
              }}
            >
              <PlusIcon className="w-3.5 h-3.5" /> Add Question
            </SecondaryButton>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) contentRepo.deleteAssessment(courseId, deleteTarget.id);
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default AssessmentsAdminPage;
