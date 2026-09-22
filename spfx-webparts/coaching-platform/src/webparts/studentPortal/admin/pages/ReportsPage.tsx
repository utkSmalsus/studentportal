import * as React from 'react';
import { PageHeader, Card, SectionTitle } from '../../ui/Primitives';
import { AdminTable, AdminColumn } from '../ui/AdminPrimitives';
import * as rosterRepo from '../repository/rosterRepository';
import * as progressRepository from '../repository/progressRepository';
import * as progression from '../../state/engine/progression';
import { moduleDefs, course, assessments } from '../../data/selectors';
import { ModuleDef, AssessmentDef } from '../../data/types';
import { AssessmentAttemptRecord } from '../../state/types';

// Real per-student data aggregated across every student enrolled in this
// course — see admin/repository/progressRepository.ts.getProgressForCourse.
// No single "current" student's state drives these numbers anymore.
const ReportsPage: React.FC = () => {
  const students = rosterRepo.listStudents();
  const rosterEvals = rosterRepo.listRosterEvaluations();
  const courseProgress = progressRepository.getProgressForCourse(course.id);
  const enrolledCount = Math.max(courseProgress.length, 1);

  const moduleColumns: AdminColumn<ModuleDef>[] = [
    { key: 'module', label: 'Module', render: (m) => m.title },
    { key: 'topics', label: 'Topics', render: (m) => m.topics.length },
    {
      key: 'students',
      label: 'Students Completed',
      render: (m) => courseProgress.filter((p) => progression.getModuleStatus(m, moduleDefs, p) === 'completed').length,
    },
    {
      key: 'avgProgress',
      label: 'Average Progress',
      render: (m) => `${Math.round(courseProgress.reduce((sum, p) => sum + progression.moduleProgressPercent(m, p), 0) / enrolledCount)}%`,
    },
  ];

  const assessmentColumns: AdminColumn<AssessmentDef>[] = [
    { key: 'title', label: 'Assessment', render: (a) => a.title },
    { key: 'attempts', label: 'Attempts', render: (a) => courseProgress.reduce((sum, p) => sum + (p.assessments[a.id]?.attempts.length || 0), 0) },
    {
      key: 'passRate',
      label: 'Pass Rate',
      render: (a) => {
        const attempted = courseProgress.filter((p) => (p.assessments[a.id]?.attempts.length || 0) > 0);
        if (attempted.length === 0) return '—';
        const passed = attempted.filter((p) => p.assessments[a.id].attempts.some((att) => att.passed)).length;
        return `${Math.round((passed / attempted.length) * 100)}%`;
      },
    },
    {
      key: 'avg',
      label: 'Average Score',
      render: (a) => {
        const allAttempts = courseProgress.reduce<AssessmentAttemptRecord[]>((all, p) => all.concat(p.assessments[a.id]?.attempts || []), []);
        if (allAttempts.length === 0) return '—';
        return `${Math.round(allAttempts.reduce((s, att) => s + att.scorePercent, 0) / allAttempts.length)}%`;
      },
    },
  ];

  const miniTaskCounts = { submitted: 0, underReview: 0, passed: 0, changesRequested: 0 };
  courseProgress.forEach((p) => {
    Object.keys(p.miniTasks).forEach((id) => {
      const t = p.miniTasks[id];
      if (t.status === 'Passed') miniTaskCounts.passed += 1;
      else if (t.status === 'Changes Requested') miniTaskCounts.changesRequested += 1;
      else if (t.status !== 'Not Started') miniTaskCounts.underReview += 1;
    });
  });
  rosterEvals
    .filter((e) => e.kind === 'project')
    .forEach((e) => {
      if (e.status === 'Passed') miniTaskCounts.passed += 1;
      else if (e.status === 'Changes Requested') miniTaskCounts.changesRequested += 1;
      else miniTaskCounts.underReview += 1;
    });

  const solvedDays = courseProgress.reduce((sum, p) => sum + Object.keys(p.coding).filter((id) => p.coding[id].attempts.some((a) => a.passed)).length, 0);
  const attemptedDays = courseProgress.reduce((sum, p) => sum + Object.keys(p.coding).filter((id) => p.coding[id].attempts.length > 0).length, 0);
  const avgCurrentStreak = courseProgress.length > 0 ? Math.round(courseProgress.reduce((sum, p) => sum + p.codingStreak.current, 0) / enrolledCount) : 0;
  const bestStreak = courseProgress.reduce((max, p) => Math.max(max, p.codingStreak.best), 0);

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Reports" subtitle="Course, module, assessment and coding performance." />

      <div className="space-y-8">
        <div>
          <SectionTitle>Module Performance — {course.title} ({students.length} students)</SectionTitle>
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
                <dt className="text-slate-500">Days attempted (all students)</dt>
                <dd className="font-semibold text-slate-900">{attemptedDays}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Days solved (all students)</dt>
                <dd className="font-semibold text-slate-900">{solvedDays}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Average current streak</dt>
                <dd className="font-semibold text-slate-900">{avgCurrentStreak} days</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Best streak (any student)</dt>
                <dd className="font-semibold text-slate-900">{bestStreak} days</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <SectionTitle>Mini Tasks &amp; Projects</SectionTitle>
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
