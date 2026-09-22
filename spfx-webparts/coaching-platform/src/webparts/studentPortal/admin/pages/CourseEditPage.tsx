import * as React from 'react';
import { useState } from 'react';
import { AdminRoute } from '../navigation/types';
import { BackLink, Card, SectionTitle, PrimaryButton, SecondaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, TextArea, Select, Checkbox, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import * as courseRepo from '../repository/courseRepository';
import * as curriculum from '../repository/curriculumRepository';
import { CourseMeta, TimelineType, ScheduleMode, LearningMode, ProgressionRules, GithubRepositoryStrategy, GithubBranchStrategy } from '../types';
import { ModuleDef, ModuleGroup } from '../../data/types';

type Tab = 'basic' | 'timeline' | 'rules' | 'curriculum' | 'github' | 'publish';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GROUPS: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];

// Section 7: a convenient module-management surface right inside Course Edit —
// Curriculum Builder (admin/pages/CurriculumBuilderPage.tsx) remains available
// for detailed topic/content editing; this is the quick overview + add/edit/
// delete/reorder/publish-status list.
const CurriculumTab: React.FC<{ courseId: string; onOpenBuilder: () => void }> = ({ courseId, onOpenBuilder }) => {
  const content = courseRepo.getCourseContent(courseId);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGroup, setNewGroup] = useState<ModuleGroup>('Foundation');
  const [newDuration, setNewDuration] = useState('1 week');
  const [deleteTarget, setDeleteTarget] = useState<ModuleDef | undefined>();

  if (!content) return null;
  const modules = content.course.moduleOrder.map((id) => content.moduleDefs.find((m) => m.id === id)).filter((m): m is ModuleDef => !!m);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle className="mb-0">Modules ({modules.length})</SectionTitle>
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={onOpenBuilder} className="text-xs px-3 py-1.5">
            Open Curriculum Builder →
          </SecondaryButton>
          <PrimaryButton onClick={() => setCreating(true)} className="text-xs px-3 py-1.5">
            <PlusIcon className="w-3.5 h-3.5" /> Add Module
          </PrimaryButton>
        </div>
      </div>

      {creating && (
        <Card className="mb-4 !bg-indigo-50/40 !border-indigo-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <TextInput autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Module title" />
            <Select value={newGroup} onChange={(e) => setNewGroup(e.target.value as ModuleGroup)}>
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <TextInput value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="Estimated duration" />
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              className="text-xs px-3 py-1.5"
              onClick={() => {
                if (!newTitle.trim()) return;
                curriculum.createModule(courseId, { title: newTitle, group: newGroup, estimatedDuration: newDuration });
                setCreating(false);
                setNewTitle('');
              }}
            >
              Add
            </PrimaryButton>
            <SecondaryButton className="text-xs px-3 py-1.5" onClick={() => setCreating(false)}>
              Cancel
            </SecondaryButton>
          </div>
        </Card>
      )}

      {modules.length === 0 ? (
        <EmptyState title="No modules yet" description="Add your first module, or use the Curriculum Builder for full topic/content editing." />
      ) : (
        <div className="space-y-2">
          {modules.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-xs font-bold text-slate-400 w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{m.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {m.group} &middot; {m.estimatedDuration} &middot; {m.topics.length} topics
                  {m.miniTaskId && ' · Mini Task'}
                  {m.moduleTestId && ' · Module Test'}
                  {m.assessmentId && ' · Assessment'}
                </div>
              </div>
              <button disabled={i === 0} onClick={() => curriculum.reorderModule(courseId, m.id, 'up')} className="text-slate-300 hover:text-slate-600 disabled:opacity-30 shrink-0">
                ↑
              </button>
              <button disabled={i === modules.length - 1} onClick={() => curriculum.reorderModule(courseId, m.id, 'down')} className="text-slate-300 hover:text-slate-600 disabled:opacity-30 shrink-0">
                ↓
              </button>
              <button onClick={onOpenBuilder} className="text-xs font-semibold text-indigo-600 hover:underline shrink-0">
                Edit
              </button>
              <button onClick={() => setDeleteTarget(m)} className="text-slate-300 hover:text-red-500 shrink-0">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This removes the module, its topics and tests permanently."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteTarget) curriculum.deleteModule(courseId, deleteTarget.id);
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

const PublishPanel: React.FC<{ courseId: string; onPreviewAsStudent: (courseId: string) => void }> = ({ courseId, onPreviewAsStudent }) => {
  const [issues, setIssues] = useState(() => courseRepo.validateCourse(courseId));
  const meta = courseRepo.getCourseMeta(courseId);
  if (!meta) return null;
  const errors = issues.filter((i) => i.severity === 'error');

  return (
    <Card className="max-w-2xl">
      <SectionTitle>Publish Course</SectionTitle>
      <div className="flex items-center gap-2 mb-4">
        <SecondaryButton onClick={() => setIssues(courseRepo.validateCourse(courseId))}>Validate</SecondaryButton>
        <PrimaryButton
          onClick={() => {
            const result = courseRepo.publishCourse(courseId);
            setIssues(result.issues);
          }}
          disabled={errors.length > 0}
        >
          Publish Course
        </PrimaryButton>
      </div>

      {issues.length === 0 ? (
        <p className="text-sm text-emerald-600 font-medium">No issues found — this course is ready to publish.</p>
      ) : (
        <div className="space-y-2">
          {errors.length > 0 && <p className="text-sm font-semibold text-red-600">Cannot publish course. {errors.length} issue{errors.length === 1 ? '' : 's'} found:</p>}
          <ul className="space-y-1.5">
            {issues.map((issue, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${issue.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                <span>{issue.severity === 'error' ? '⚠' : '•'}</span> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <SecondaryButton onClick={() => onPreviewAsStudent(courseId)}>Preview as Student →</SecondaryButton>
      </div>
    </Card>
  );
};

const CourseEditPage: React.FC<{ courseId: string; onNavigate: (r: AdminRoute) => void; onPreviewAsStudent: (courseId: string) => void }> = ({ courseId, onNavigate, onPreviewAsStudent }) => {
  const content = courseRepo.getCourseContent(courseId);
  const [tab, setTab] = useState<Tab>('basic');

  if (!content) return <EmptyState title="Course not found" />;
  const meta = content.meta;

  const update = (patch: Partial<CourseMeta>): void => courseRepo.updateCourseMeta(courseId, patch);
  const updateTimeline = (patch: Partial<CourseMeta['timeline']>): void => update({ timeline: { ...meta.timeline, ...patch } });
  const updateRules = (patch: Partial<ProgressionRules>): void => update({ defaultProgressionRules: { ...meta.defaultProgressionRules, ...patch } });
  const updateGithub = (patch: Partial<CourseMeta['githubSettings']>): void => update({ githubSettings: { ...meta.githubSettings, ...patch } });

  const toggleDay = (day: string): void => {
    const days = meta.timeline.classDays.indexOf(day) !== -1 ? meta.timeline.classDays.filter((d) => d !== day) : [...meta.timeline.classDays, day];
    updateTimeline({ classDays: days });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'basic', label: 'Basic Information' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'rules', label: 'Progression Rules' },
    { key: 'github', label: 'GitHub' },
    { key: 'publish', label: 'Publish' },
  ];

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'courses' })}>Courses</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{meta.title || 'Untitled Course'}</h1>
          <p className="text-slate-500 mt-1">{meta.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill color={meta.status === 'published' ? 'green' : meta.status === 'draft' ? 'gray' : 'red'}>{meta.status}</StatusPill>
          <SecondaryButton onClick={() => onNavigate({ view: 'curriculum', courseId })}>Open Curriculum Builder →</SecondaryButton>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <Card className="max-w-2xl">
          <FormSection>
            <FormField label="Course Name">
              <TextInput value={meta.title} onChange={(e) => update({ title: e.target.value })} />
            </FormField>
            <FormField label="Course Code">
              <TextInput value={meta.code} onChange={(e) => update({ code: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <TextInput value={meta.category} onChange={(e) => update({ category: e.target.value })} />
              </FormField>
              <FormField label="Difficulty">
                <Select value={meta.difficulty} onChange={(e) => update({ difficulty: e.target.value as CourseMeta['difficulty'] })}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Short Description">
              <TextInput value={meta.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} />
            </FormField>
            <FormField label="Description">
              <TextArea rows={4} value={meta.description} onChange={(e) => update({ description: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Duration Label" hint='e.g. "6 Months"'>
                <TextInput value={meta.durationLabel} onChange={(e) => update({ durationLabel: e.target.value })} />
              </FormField>
              <FormField label="Estimated Hours">
                <TextInput type="number" value={meta.estimatedHours} onChange={(e) => update({ estimatedHours: Number(e.target.value) })} />
              </FormField>
            </div>
            <FormField label="Course Objectives" hint="One per line">
              <TextArea rows={3} value={meta.objectives.join('\n')} onChange={(e) => update({ objectives: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <FormField label="Prerequisites" hint="One per line">
              <TextArea rows={2} value={meta.prerequisites.join('\n')} onChange={(e) => update({ prerequisites: e.target.value.split('\n').filter(Boolean) })} />
            </FormField>
            <Checkbox label="Certificate Enabled" checked={meta.certificateEnabled} onChange={(v) => update({ certificateEnabled: v })} />
          </FormSection>
        </Card>
      )}

      {tab === 'timeline' && (
        <Card className="max-w-2xl">
          <FormSection title="Schedule Type">
            <FormField label="Timeline Type">
              <Select value={meta.timeline.type} onChange={(e) => updateTimeline({ type: e.target.value as TimelineType })}>
                <option value="calendar">Calendar dates</option>
                <option value="weeks">Weeks</option>
                <option value="self-paced">Self-paced</option>
              </Select>
            </FormField>
            <FormField label="Learning Mode">
              <Select value={meta.timeline.learningMode} onChange={(e) => updateTimeline({ learningMode: e.target.value as LearningMode })}>
                <option value="instructor-led">Instructor-led</option>
                <option value="self-paced">Self-paced</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </FormField>
          </FormSection>

          {meta.timeline.type !== 'self-paced' && (
            <FormSection title="Schedule">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Course Start Date">
                  <TextInput type="date" value={meta.timeline.startDate || ''} onChange={(e) => updateTimeline({ startDate: e.target.value })} />
                </FormField>
                <FormField label="Duration (weeks)">
                  <TextInput type="number" value={meta.timeline.durationWeeks || 0} onChange={(e) => updateTimeline({ durationWeeks: Number(e.target.value) })} />
                </FormField>
              </div>
              <FormField label="Class Days">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        meta.timeline.classDays.indexOf(d) !== -1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Daily Learning Time (hours)">
                <TextInput type="number" value={meta.timeline.dailyLearningHours || 0} onChange={(e) => updateTimeline({ dailyLearningHours: Number(e.target.value) })} />
              </FormField>
              <FormField label="Schedule Mode" hint="Strict: topics cannot unlock before their scheduled week. Flexible: students can move ahead as soon as prerequisites are met.">
                <Select value={meta.timeline.scheduleMode} onChange={(e) => updateTimeline({ scheduleMode: e.target.value as ScheduleMode })}>
                  <option value="flexible">Flexible</option>
                  <option value="strict">Strict</option>
                </Select>
              </FormField>
            </FormSection>
          )}

          <p className="text-xs text-slate-400">
            Assigning modules/topics to specific weeks is done from the Curriculum Builder&apos;s week view.
          </p>
        </Card>
      )}

      {tab === 'rules' && (
        <Card className="max-w-2xl">
          <SectionTitle>Default Progression Rules</SectionTitle>
          <p className="text-xs text-slate-400 mb-4">
            Applied to every new module created in this course. Each module can still override these individually from the Curriculum Builder.
          </p>
          <div className="space-y-3 mb-6">
            <Checkbox label="Require Topic Test" checked={meta.defaultProgressionRules.requireTopicTest} onChange={(v) => updateRules({ requireTopicTest: v })} />
            <Checkbox label="Require Daily Coding" checked={meta.defaultProgressionRules.requireDailyCoding} onChange={(v) => updateRules({ requireDailyCoding: v })} />
            <Checkbox label="Require Mini Task" checked={meta.defaultProgressionRules.requireMiniTask} onChange={(v) => updateRules({ requireMiniTask: v })} />
            <Checkbox label="Require Module Test" checked={meta.defaultProgressionRules.requireModuleTest} onChange={(v) => updateRules({ requireModuleTest: v })} />
            <Checkbox label="Require Assessment" checked={meta.defaultProgressionRules.requireAssessment} onChange={(v) => updateRules({ requireAssessment: v })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Topic Test Passing %">
              <TextInput type="number" value={meta.defaultProgressionRules.topicTestPassingScore} onChange={(e) => updateRules({ topicTestPassingScore: Number(e.target.value) })} />
            </FormField>
            <FormField label="Module Test Passing %">
              <TextInput type="number" value={meta.defaultProgressionRules.moduleTestPassingScore} onChange={(e) => updateRules({ moduleTestPassingScore: Number(e.target.value) })} />
            </FormField>
            <FormField label="Assessment Passing %">
              <TextInput type="number" value={meta.defaultProgressionRules.assessmentPassingScore} onChange={(e) => updateRules({ assessmentPassingScore: Number(e.target.value) })} />
            </FormField>
          </div>
        </Card>
      )}

      {tab === 'curriculum' && <CurriculumTab courseId={courseId} onOpenBuilder={() => onNavigate({ view: 'curriculum', courseId })} />}

      {tab === 'github' && (
        <Card className="max-w-2xl">
          <SectionTitle>GitHub Integration</SectionTitle>
          <p className="text-xs text-slate-400 mb-4">
            A theory-only course can turn this off entirely; development courses default to on and required.
          </p>
          <div className="space-y-3 mb-6">
            <Checkbox label="Enable GitHub Integration" checked={meta.githubSettings.enabled} onChange={(v) => updateGithub({ enabled: v })} />
            {meta.githubSettings.enabled && (
              <>
                <Checkbox label="Require GitHub During Onboarding" checked={meta.githubSettings.requiredForOnboarding} onChange={(v) => updateGithub({ requiredForOnboarding: v })} />
                <Checkbox label="Require Training Repository" checked={meta.githubSettings.trainingRepositoryRequired} onChange={(v) => updateGithub({ trainingRepositoryRequired: v })} />
                <Checkbox label="Require Pull Request" checked={meta.githubSettings.pullRequestRequired} onChange={(v) => updateGithub({ pullRequestRequired: v })} />
              </>
            )}
          </div>
          {meta.githubSettings.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Repository Strategy">
                <Select value={meta.githubSettings.repositoryStrategy} onChange={(e) => updateGithub({ repositoryStrategy: e.target.value as GithubRepositoryStrategy })}>
                  <option value="single">One Training Repository</option>
                  <option value="major-project">Repository Per Major Project</option>
                </Select>
              </FormField>
              <FormField label="Branch Strategy">
                <Select value={meta.githubSettings.branchStrategy} onChange={(e) => updateGithub({ branchStrategy: e.target.value as GithubBranchStrategy })}>
                  <option value="main">Main</option>
                  <option value="feature">Feature Branch</option>
                  <option value="feature-pr">Feature Branch + Pull Request</option>
                </Select>
              </FormField>
              <FormField label="Default Branch">
                <TextInput value={meta.githubSettings.defaultBranch} onChange={(e) => updateGithub({ defaultBranch: e.target.value })} />
              </FormField>
            </div>
          )}
        </Card>
      )}

      {tab === 'publish' && <PublishPanel courseId={courseId} onPreviewAsStudent={onPreviewAsStudent} />}
    </div>
  );
};

export default CourseEditPage;
