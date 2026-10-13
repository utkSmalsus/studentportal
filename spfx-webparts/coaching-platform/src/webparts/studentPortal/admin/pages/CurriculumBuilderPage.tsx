import * as React from 'react';
import { useState } from 'react';
import { AdminRoute } from '../navigation/types';
import { BackLink, PrimaryButton, SecondaryButton, EmptyState, LoadingState } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, TextArea, Select, Checkbox, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, ChevronRightIcon, TrashIcon, CopyIcon } from '../../ui/icons';
import { ModuleDef, TopicDef, ModuleGroup, TopicTestQuestionDef } from '../../data/types';
import { ProgressionRules } from '../types';
import {
  useCourseContent,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useReorderModule,
  useDuplicateModule,
  useSetModuleProgressionRules,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  useUpdateTopicTest,
  useCreateModuleTest,
  useUpdateModuleTest,
  useCreateAssessment,
  useUpdateAssessment,
} from '../../hooks';

type Selection = { kind: 'module'; moduleId: string } | { kind: 'topic'; moduleId: string; topicId: string } | undefined;

const GROUPS: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];

const QuestionEditor: React.FC<{
  questions: TopicTestQuestionDef[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TopicTestQuestionDef>) => void;
  onRemove: (id: string) => void;
}> = ({ questions, onAdd, onUpdate, onRemove }) => (
  <div className="space-y-3">
    {questions.map((q, qi) => (
      <div key={q.id} className="border border-slate-200 rounded-lg p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400">Q{qi + 1}</span>
          <button onClick={() => onRemove(q.id)} className="text-slate-300 hover:text-red-500">
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        <TextArea
          rows={2}
          value={q.text}
          onChange={(e) => onUpdate(q.id, { text: e.target.value })}
          placeholder="Question text"
          className="mb-2 text-sm"
        />
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2 mb-1.5">
            <input
              type="radio"
              checked={q.correctIndex === oi}
              onChange={() => onUpdate(q.id, { correctIndex: oi })}
              className="shrink-0"
              title="Correct answer"
            />
            <TextInput
              value={opt}
              onChange={(e) => {
                const options = [...q.options];
                options[oi] = e.target.value;
                onUpdate(q.id, { options });
              }}
              className="text-sm py-1.5"
            />
          </div>
        ))}
      </div>
    ))}
    <SecondaryButton onClick={onAdd} className="text-xs px-3 py-1.5">
      <PlusIcon className="w-3.5 h-3.5" /> Add Question
    </SecondaryButton>
  </div>
);

const RulesEditor: React.FC<{ rules: ProgressionRules; onChange: (patch: Partial<ProgressionRules>) => void }> = ({
  rules,
  onChange,
}) => (
  <FormSection title="Progression Rules" description="Which gates this module's own chain enforces.">
    <Checkbox label="Require Topic Test" checked={rules.requireTopicTest} onChange={(v) => onChange({ requireTopicTest: v })} />
    <Checkbox label="Require Daily Coding" checked={rules.requireDailyCoding} onChange={(v) => onChange({ requireDailyCoding: v })} />
    <Checkbox label="Require Mini Task" checked={rules.requireMiniTask} onChange={(v) => onChange({ requireMiniTask: v })} />
    <Checkbox label="Require Module Test" checked={rules.requireModuleTest} onChange={(v) => onChange({ requireModuleTest: v })} />
    <Checkbox label="Require Assessment" checked={rules.requireAssessment} onChange={(v) => onChange({ requireAssessment: v })} />
  </FormSection>
);

const TopicEditor: React.FC<{
  courseId: string;
  module: ModuleDef;
  topic: TopicDef;
  onDeleted: () => void;
}> = ({ courseId, module, topic, onDeleted }) => {
  const { data: content } = useCourseContent(courseId);
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  const updateTestMutation = useUpdateTopicTest();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const test = content?.topicTests.find((t) => t.id === topic.testId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Topic Settings</h2>
        <button onClick={() => setConfirmDelete(true)} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <FormSection title="Basics">
        <FormField label="Topic Name">
          <TextInput
            value={topic.title}
            onChange={(e) => updateTopicMutation.mutate({ courseId, moduleId: module.id, topicId: topic.id, patch: { title: e.target.value } })}
          />
        </FormField>
        <FormField label="Estimated Minutes">
          <TextInput
            type="number"
            value={topic.estimatedMinutes}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { estimatedMinutes: Number(e.target.value) },
              })
            }
          />
        </FormField>
      </FormSection>

      <FormSection title="Video" description="Paste a YouTube URL or ID. Leave empty to show a 'Video coming soon' state.">
        <FormField label="YouTube Video URL or ID">
          <TextInput
            value={topic.youtubeVideoId || ''}
            placeholder="https://www.youtube.com/watch?v=… or a raw video ID"
            onChange={(e) => {
              const raw = e.target.value.trim();
              const match = raw.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
              const id = match ? match[1] : raw;
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { youtubeVideoId: id || undefined },
              });
            }}
          />
        </FormField>
      </FormSection>

      <FormSection title="Content">
        <FormField label="What You'll Learn" hint="One per line">
          <TextArea
            rows={3}
            value={topic.content.whatYoullLearn.join('\n')}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { content: { ...topic.content, whatYoullLearn: e.target.value.split('\n').filter(Boolean) } },
              })
            }
          />
        </FormField>
        <FormField label="Key Concepts" hint="One per line">
          <TextArea
            rows={2}
            value={topic.content.keyConcepts.join('\n')}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { content: { ...topic.content, keyConcepts: e.target.value.split('\n').filter(Boolean) } },
              })
            }
          />
        </FormField>
        <FormField label="Examples" hint="One per line">
          <TextArea
            rows={2}
            value={topic.content.examples.join('\n')}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { content: { ...topic.content, examples: e.target.value.split('\n').filter(Boolean) } },
              })
            }
          />
        </FormField>
        <FormField label="Notes" hint="One per line">
          <TextArea
            rows={2}
            value={topic.content.notes.join('\n')}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { content: { ...topic.content, notes: e.target.value.split('\n').filter(Boolean) } },
              })
            }
          />
        </FormField>
        <FormField label="Resources" hint="One link per line">
          <TextArea
            rows={2}
            value={topic.content.resources.join('\n')}
            onChange={(e) =>
              updateTopicMutation.mutate({
                courseId,
                moduleId: module.id,
                topicId: topic.id,
                patch: { content: { ...topic.content, resources: e.target.value.split('\n').filter(Boolean) } },
              })
            }
          />
        </FormField>
      </FormSection>

      {test && (
        <FormSection title="Topic Test">
          <FormField label="Passing Score (%)">
            <TextInput
              type="number"
              value={test.passingScorePercent}
              onChange={(e) =>
                updateTestMutation.mutate({
                  courseId,
                  testId: test.id,
                  patch: { passingScorePercent: Number(e.target.value) },
                })
              }
            />
          </FormField>
          <QuestionEditor
            questions={test.questions}
            onAdd={() =>
              updateTestMutation.mutate({
                courseId,
                testId: test.id,
                patch: {
                  questions: [
                    ...test.questions,
                    {
                      id: `${test.id}-q${test.questions.length + 1}-${Date.now().toString(36)}`,
                      text: '',
                      options: ['', '', '', ''],
                      correctIndex: 0,
                    },
                  ],
                },
              })
            }
            onUpdate={(qid, patch) =>
              updateTestMutation.mutate({
                courseId,
                testId: test.id,
                patch: {
                  questions: test.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
                },
              })
            }
            onRemove={(qid) =>
              updateTestMutation.mutate({
                courseId,
                testId: test.id,
                patch: {
                  questions: test.questions.filter((q) => q.id !== qid),
                },
              })
            }
          />
        </FormSection>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${topic.title}"?`}
        description="This removes the topic and its test permanently."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          await deleteTopicMutation.mutateAsync({ courseId, moduleId: module.id, topicId: topic.id });
          setConfirmDelete(false);
          onDeleted();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

const ModuleEditor: React.FC<{
  courseId: string;
  module: ModuleDef;
  allModules: ModuleDef[];
  onDeleted: () => void;
}> = ({ courseId, module, allModules, onDeleted }) => {
  const { data: content } = useCourseContent(courseId);
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const setRulesMutation = useSetModuleProgressionRules();
  const createModuleTestMutation = useCreateModuleTest();
  const updateModuleTestMutation = useUpdateModuleTest();
  const createAssessmentMutation = useCreateAssessment();
  const updateAssessmentMutation = useUpdateAssessment();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const moduleTest = content?.moduleTests.find((t) => t.id === module.moduleTestId);
  const assessment = content?.assessments.find((a) => a.id === module.assessmentId);
  const rules = module.progressionRules || content?.meta.defaultProgressionRules;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Module Settings</h2>
        <button onClick={() => setConfirmDelete(true)} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <FormSection title="Basics">
        <FormField label="Module Name">
          <TextInput
            value={module.title}
            onChange={(e) => updateModuleMutation.mutate({ courseId, moduleId: module.id, patch: { title: e.target.value } })}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Stage">
            <Select
              value={module.group}
              onChange={(e) => updateModuleMutation.mutate({ courseId, moduleId: module.id, patch: { group: e.target.value as ModuleGroup } })}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Estimated Duration" hint='e.g. "2 weeks"'>
            <TextInput
              value={module.estimatedDuration}
              onChange={(e) =>
                updateModuleMutation.mutate({ courseId, moduleId: module.id, patch: { estimatedDuration: e.target.value } })
              }
            />
          </FormField>
        </div>
        <FormField label="Learning Objectives" hint="One per line">
          <TextArea
            rows={3}
            value={module.whatYoullLearn.join('\n')}
            onChange={(e) =>
              updateModuleMutation.mutate({
                courseId,
                moduleId: module.id,
                patch: { whatYoullLearn: e.target.value.split('\n').filter(Boolean) },
              })
            }
          />
        </FormField>
        <FormField label="Prerequisite Module">
          <Select
            value={module.prerequisiteModuleId || ''}
            onChange={(e) =>
              updateModuleMutation.mutate({
                courseId,
                moduleId: module.id,
                patch: { prerequisiteModuleId: e.target.value || undefined },
              })
            }
          >
            <option value="">None — unlocked from day one</option>
            {allModules
              .filter((m) => m.id !== module.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
          </Select>
        </FormField>
      </FormSection>

      {rules && (
        <RulesEditor
          rules={rules}
          onChange={(patch) => setRulesMutation.mutate({ courseId, moduleId: module.id, rules: { ...rules, ...patch } })}
        />
      )}

      <FormSection title="Module Test">
        {moduleTest ? (
          <div className="text-sm space-y-2">
            <div className="text-slate-700 font-medium">{moduleTest.title}</div>
            <FormField label="Passing Score (%)">
              <TextInput
                type="number"
                value={moduleTest.passingScorePercent}
                onChange={(e) =>
                  updateModuleTestMutation.mutate({
                    courseId,
                    testId: moduleTest.id,
                    patch: { passingScorePercent: Number(e.target.value) },
                  })
                }
              />
            </FormField>
            <p className="text-xs text-slate-400">{moduleTest.questions.length} questions &middot; edit them from Content → Assessments.</p>
          </div>
        ) : (
          <SecondaryButton
            className="text-xs px-3 py-1.5"
            disabled={createModuleTestMutation.isLoading}
            onClick={() =>
              createModuleTestMutation.mutate({
                courseId,
                moduleId: module.id,
                input: {
                  title: `${module.title} Module Test`,
                  timeLimitMinutes: 15,
                  passingScorePercent: 70,
                  attemptsAllowed: 2,
                },
              })
            }
          >
            <PlusIcon className="w-3.5 h-3.5" /> Create Module Test
          </SecondaryButton>
        )}
      </FormSection>

      <FormSection title="Assessment">
        {assessment ? (
          <div className="text-sm space-y-2">
            <div className="text-slate-700 font-medium">{assessment.title}</div>
            <FormField label="Passing Score (%)">
              <TextInput
                type="number"
                value={assessment.passingScorePercent}
                onChange={(e) =>
                  updateAssessmentMutation.mutate({
                    courseId,
                    assessmentId: assessment.id,
                    patch: { passingScorePercent: Number(e.target.value) },
                  })
                }
              />
            </FormField>
            <p className="text-xs text-slate-400">{assessment.questions.length} questions &middot; edit them from Content → Assessments.</p>
          </div>
        ) : (
          <SecondaryButton
            className="text-xs px-3 py-1.5"
            disabled={createAssessmentMutation.isLoading}
            onClick={() =>
              createAssessmentMutation.mutate({
                courseId,
                moduleId: module.id,
                input: {
                  title: `${module.title} Assessment`,
                  topics: [],
                  timeLimitMinutes: 15,
                  passingScorePercent: 60,
                  attemptsAllowed: 2,
                },
              })
            }
          >
            <PlusIcon className="w-3.5 h-3.5" /> Create Assessment
          </SecondaryButton>
        )}
      </FormSection>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${module.title}"?`}
        description="This removes the module, its topics and tests permanently."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          await deleteModuleMutation.mutateAsync({ courseId, moduleId: module.id });
          setConfirmDelete(false);
          onDeleted();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

const CurriculumBuilderPage: React.FC<{
  courseId: string;
  onNavigate: (r: AdminRoute) => void;
  onPreviewAsStudent: (courseId: string) => void;
}> = ({ courseId, onNavigate, onPreviewAsStudent }) => {
  const { data: content, isLoading } = useCourseContent(courseId);
  const createModuleMutation = useCreateModule();
  const reorderModuleMutation = useReorderModule();
  const duplicateModuleMutation = useDuplicateModule();
  const createTopicMutation = useCreateTopic();

  const [selection, setSelection] = useState<Selection>();
  const [addingModuleToGroup, setAddingModuleToGroup] = useState<ModuleGroup | undefined>();
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingTopicToModule, setAddingTopicToModule] = useState<string | undefined>();
  const [newTopicTitle, setNewTopicTitle] = useState('');

  if (isLoading) {
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'courses' })}>Courses</BackLink>
        <LoadingState label="Loading curriculum..." />
      </div>
    );
  }

  if (!content) return <EmptyState title="Course not found" />;
  const { moduleDefs, course } = content;
  const orderedModules = course.moduleOrder.map((id) => moduleDefs.find((m) => m.id === id)).filter((m): m is ModuleDef => !!m);

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'courses' })}>Courses</BackLink>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{content.meta.title}</h1>
          <p className="text-slate-500 mt-1">Curriculum Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={() => onNavigate({ view: 'courseEdit', courseId })}>Course Settings</SecondaryButton>
          <PrimaryButton onClick={() => onPreviewAsStudent(courseId)}>Preview as Student →</PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="space-y-6">
          {GROUPS.map((group) => {
            const groupModules = orderedModules.filter((m) => m.group === group);
            return (
              <div key={group}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group}</h3>
                  <button
                    onClick={() => {
                      setAddingModuleToGroup(group);
                      setNewModuleTitle('');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    + Add Module
                  </button>
                </div>

                {addingModuleToGroup === group && (
                  <div className="flex items-center gap-2 mb-2 bg-indigo-50/60 border border-indigo-100 rounded-lg p-2.5">
                    <TextInput
                      autoFocus
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="New module name"
                      className="text-sm py-1.5"
                    />
                    <PrimaryButton
                      className="text-xs px-3 py-1.5 shrink-0"
                      disabled={createModuleMutation.isLoading}
                      onClick={async () => {
                        if (!newModuleTitle.trim()) return;
                        const m = await createModuleMutation.mutateAsync({
                          courseId,
                          input: { title: newModuleTitle, group, estimatedDuration: '1 week' },
                        });
                        setAddingModuleToGroup(undefined);
                        if (m) setSelection({ kind: 'module', moduleId: m.id });
                      }}
                    >
                      {createModuleMutation.isLoading ? 'Adding...' : 'Add'}
                    </PrimaryButton>
                    <SecondaryButton className="text-xs px-3 py-1.5 shrink-0" onClick={() => setAddingModuleToGroup(undefined)}>
                      Cancel
                    </SecondaryButton>
                  </div>
                )}

                {groupModules.length === 0 && addingModuleToGroup !== group && <p className="text-xs text-slate-300 mb-2">No modules yet.</p>}

                <ul className="space-y-1.5">
                  {groupModules.map((m) => {
                    const isSelectedModule = selection?.kind === 'module' && selection.moduleId === m.id;
                    return (
                      <li key={m.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <div className={`flex items-center gap-2 px-3 py-2.5 ${isSelectedModule ? 'bg-indigo-50/60' : ''}`}>
                          <button
                            onClick={() => setSelection({ kind: 'module', moduleId: m.id })}
                            className="flex-1 text-left text-sm font-semibold text-slate-900 truncate"
                          >
                            {m.title}
                          </button>
                          <span className="text-xs text-slate-400 shrink-0">{m.topics.length} topics</span>
                          <button
                            onClick={() => reorderModuleMutation.mutate({ courseId, moduleId: m.id, direction: 'up' })}
                            className="text-slate-300 hover:text-slate-600 shrink-0"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => reorderModuleMutation.mutate({ courseId, moduleId: m.id, direction: 'down' })}
                            className="text-slate-300 hover:text-slate-600 shrink-0"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => duplicateModuleMutation.mutate({ courseId, moduleId: m.id })}
                            className="text-slate-300 hover:text-slate-600 shrink-0"
                            title="Duplicate"
                          >
                            <CopyIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {m.topics.length > 0 && (
                          <ul className="border-t border-slate-100">
                            {m.topics.map((t) => {
                              const isSelectedTopic = selection?.kind === 'topic' && selection.topicId === t.id;
                              return (
                                <li key={t.id}>
                                  <button
                                    onClick={() => setSelection({ kind: 'topic', moduleId: m.id, topicId: t.id })}
                                    className={`w-full flex items-center gap-2 pl-8 pr-3 py-2 text-left text-sm ${
                                      isSelectedTopic ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <ChevronRightIcon className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span className="truncate flex-1">{t.title}</span>
                                    {t.youtubeVideoId && <span className="text-[10px] text-slate-300 shrink-0">▶</span>}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        <div className="border-t border-slate-100 px-3 py-2">
                          {addingTopicToModule === m.id ? (
                            <div className="flex items-center gap-2">
                              <TextInput
                                autoFocus
                                value={newTopicTitle}
                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                placeholder="New topic name"
                                className="text-xs py-1.5"
                              />
                              <PrimaryButton
                                className="text-xs px-2.5 py-1.5 shrink-0"
                                disabled={createTopicMutation.isLoading}
                                onClick={async () => {
                                  if (!newTopicTitle.trim()) return;
                                  const t = await createTopicMutation.mutateAsync({
                                    courseId,
                                    moduleId: m.id,
                                    input: { title: newTopicTitle, estimatedMinutes: 30 },
                                  });
                                  setAddingTopicToModule(undefined);
                                  if (t) setSelection({ kind: 'topic', moduleId: m.id, topicId: t.id });
                                }}
                              >
                                {createTopicMutation.isLoading ? 'Adding...' : 'Add'}
                              </PrimaryButton>
                              <SecondaryButton className="text-xs px-2.5 py-1.5 shrink-0" onClick={() => setAddingTopicToModule(undefined)}>
                                Cancel
                              </SecondaryButton>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAddingTopicToModule(m.id);
                                setNewTopicTitle('');
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              + Add Topic
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-6 bg-white border border-slate-200 rounded-xl p-5 max-h-[calc(100vh-140px)] overflow-y-auto">
          {!selection ? (
            <EmptyState title="Select a module or topic" description="Choose an item on the left to edit its settings here." />
          ) : selection.kind === 'module' ? (
            (() => {
              const m = moduleDefs.find((mm) => mm.id === selection.moduleId);
              return m ? (
                <ModuleEditor courseId={courseId} module={m} allModules={moduleDefs} onDeleted={() => setSelection(undefined)} />
              ) : null;
            })()
          ) : (
            (() => {
              const m = moduleDefs.find((mm) => mm.id === selection.moduleId);
              const t = m?.topics.find((tt) => tt.id === selection.topicId);
              return m && t ? <TopicEditor courseId={courseId} module={m} topic={t} onDeleted={() => setSelection(undefined)} /> : null;
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumBuilderPage;
