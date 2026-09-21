import * as React from 'react';
import { useState } from 'react';
import { AdminRoute } from '../navigation/types';
import { BackLink, Card, SectionTitle, PrimaryButton, SecondaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, TextArea, Select, Checkbox } from '../ui/AdminPrimitives';
import * as courseRepo from '../repository/courseRepository';
import { CourseMeta, TimelineType, ScheduleMode, LearningMode, ProgressionRules } from '../types';

type Tab = 'basic' | 'timeline' | 'rules' | 'publish';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const toggleDay = (day: string): void => {
    const days = meta.timeline.classDays.indexOf(day) !== -1 ? meta.timeline.classDays.filter((d) => d !== day) : [...meta.timeline.classDays, day];
    updateTimeline({ classDays: days });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'basic', label: 'Basic Information' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'rules', label: 'Progression Rules' },
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

      {tab === 'publish' && <PublishPanel courseId={courseId} onPreviewAsStudent={onPreviewAsStudent} />}
    </div>
  );
};

export default CourseEditPage;
