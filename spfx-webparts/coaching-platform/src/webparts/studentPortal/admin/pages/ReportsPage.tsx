import * as React from 'react';
import { PageHeader, Card, SectionTitle } from '../../ui/Primitives';
import { AdminTable, AdminColumn } from '../ui/AdminPrimitives';
import * as rosterRepo from '../repository/rosterRepository';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs, course, assessments } from '../../data/selectors';
import { ModuleDef, AssessmentDef } from '../../data/types';

// ponytail: this SPFx demo has exactly one student with a real, live progress
// state (see state/AppStateContext.tsx) — every table below reports on that
// student honestly rather than fabricating aggregate numbers across a roster
// that has no backing session. A real backend replaces this with a genuine
// multi-student rollup with no change to the page shape.
const ReportsPage: React.FC = () => {
  const { state: liveProgress } = useAppState();
  const students = rosterRepo.listStudents();
  const liveStudent = students.find((s) => s.isLiveDemoStudent);
  const rosterEvals = rosterRepo.listRosterEvaluations();

  const moduleColumns: AdminColumn<ModuleDef>[] = [
    { key: 'module', label: 'Module', render: (m) => m.title },
    { key: 'topics', label: 'Topics', render: (m) => m.topics.length },
    { key: 'status', label: `${liveStudent?.name || 'Student'} Status`, render: (m) => progression.getModuleStatus(m, moduleDefs, liveProgress) },
    { key: 'progress', label: 'Progress', render: (m) => `${progression.moduleProgressPercent(m, liveProgress)}%` },
  ];

  const assessmentColumns: AdminColumn<AssessmentDef>[] = [
    { key: 'title', label: 'Assessment', render: (a) => a.title },
    { key: 'attempts', label: 'Attempts', render: (a) => liveProgress.assessments[a.id]?.attempts.length || 0 },
    {
      key: 'pass',
      label: 'Result',
      render: (a) => {
        const entry = liveProgress.assessments[a.id];
        if (!entry || entry.attempts.length === 0) return 'Not attempted';
        return entry.attempts.some((att) => att.passed) ? 'Passed' : 'Not yet passed';
      },
    },
    {
      key: 'avg',
      label: 'Average Score',
      render: (a) => {
        const entry = liveProgress.assessments[a.id];
        if (!entry || entry.attempts.length === 0) return '—';
        return `${Math.round(entry.attempts.reduce((s, att) => s + att.scorePercent, 0) / entry.attempts.length)}%`;
      },
    },
  ];

  const miniTaskCounts = { submitted: 0, underReview: 0, passed: 0, changesRequested: 0 };
  Object.keys(liveProgress.miniTasks).map((id) => liveProgress.miniTasks[id]).forEach((t) => {
    if (t.status === 'Passed') miniTaskCounts.passed += 1;
    else if (t.status === 'Changes Requested') miniTaskCounts.changesRequested += 1;
    else if (t.status !== 'Not Started') miniTaskCounts.underReview += 1;
  });
  rosterEvals
    .filter((e) => e.kind === 'miniTask')
    .forEach((e) => {
      if (e.status === 'Passed') miniTaskCounts.passed += 1;
      else if (e.status === 'Changes Requested') miniTaskCounts.changesRequested += 1;
      else miniTaskCounts.underReview += 1;
    });

  const solvedDays = Object.keys(liveProgress.coding).filter((id) => liveProgress.coding[id].attempts.some((a) => a.passed)).length;
  const attemptedDays = Object.keys(liveProgress.coding).filter((id) => liveProgress.coding[id].attempts.length > 0).length;

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Reports" subtitle="Course, module, assessment and coding performance." />

      <div className="space-y-8">
        <div>
          <SectionTitle>Module Performance — {course.title}</SectionTitle>
          <AdminTable columns={moduleColumns} rows={moduleDefs} rowKey={(m) => m.id} />
        </div>

        <div>
          <SectionTitle>Assessment Performance</SectionTitle>
          <AdminTable columns={assessmentColumns} rows={assessments} rowKey={(a) => a.id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <SectionTitle>Daily Coding</SectionTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Days attempted</dt>
                <dd className="font-semibold text-slate-900">{attemptedDays}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Days solved</dt>
                <dd className="font-semibold text-slate-900">{solvedDays}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Current streak</dt>
                <dd className="font-semibold text-slate-900">{liveProgress.codingStreak.current} days</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Best streak</dt>
                <dd className="font-semibold text-slate-900">{liveProgress.codingStreak.best} days</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <SectionTitle>Mini Tasks</SectionTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Passed</dt>
                <dd className="font-semibold text-emerald-600">{miniTaskCounts.passed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Under Review</dt>
                <dd className="font-semibold text-blue-600">{miniTaskCounts.underReview}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Changes Requested</dt>
                <dd className="font-semibold text-amber-600">{miniTaskCounts.changesRequested}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
