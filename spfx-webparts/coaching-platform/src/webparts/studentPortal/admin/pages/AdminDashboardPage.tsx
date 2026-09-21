import * as React from 'react';
import { AdminRoute } from '../navigation/types';
import { PageHeader, Card, SectionTitle, MetricTile } from '../../ui/Primitives';
import { UsersIcon, BookIcon, BuildingIcon, ClipboardIcon, ChartIcon, AwardIcon, AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import * as progression from '../../state/engine/progression';
import { moduleDefs, course, assessments } from '../../data/selectors';

const AdminDashboardPage: React.FC<{ onNavigate: (r: AdminRoute) => void }> = ({ onNavigate }) => {
  const { state: liveProgress } = useAppState();
  const courses = courseRepo.listCourses();
  const students = rosterRepo.listStudents();
  const batches = rosterRepo.listBatches();
  const rosterEvals = rosterRepo.listRosterEvaluations();

  const livePendingMiniTasks = Object.keys(liveProgress.miniTasks).filter((id) =>
    ['Under Review', 'Submitted', 'Resubmitted'].indexOf(liveProgress.miniTasks[id].status) !== -1
  ).length;
  const pendingMiniTasks = rosterEvals.filter((e) => e.kind === 'miniTask' && e.status === 'Under Review').length + livePendingMiniTasks;
  const pendingProjects = rosterEvals.filter((e) => e.kind === 'project' && e.status === 'Under Review').length;

  const assessmentsCompleted = assessments.filter((a) => liveProgress.assessments[a.id]?.attempts.length > 0).length;
  const overallProgress = progression.courseOverallProgress(course, moduleDefs, liveProgress);

  const activeCourses = courses.filter((c) => c.status === 'published').length;
  const activeBatches = batches.filter((b) => b.status === 'active').length;

  const behindStudents = students.filter((s) => s.status === 'paused').length;

  const recentActivity = [
    ...liveProgress.notifications.slice(0, 4).map((n) => ({ id: n.id, message: `${students[0]?.name || 'Student'}: ${n.message}`, date: n.date })),
    ...rosterEvals.slice(0, 3).map((e) => ({ id: e.id, message: `${students.find((s) => s.id === e.studentId)?.name || 'Student'} submitted "${e.title}"`, date: e.submittedAt })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" subtitle="Operational overview for your coaching center." />

      <div className="flex flex-wrap gap-3 mb-8">
        <MetricTile label="Total Students" value={students.length} icon={<UsersIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Active Courses" value={activeCourses} icon={<BookIcon className="w-[18px] h-[18px]" />} accentColor="green" />
        <MetricTile label="Active Batches" value={activeBatches} icon={<BuildingIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Pending Evaluations" value={pendingMiniTasks + pendingProjects} icon={<ClipboardIcon className="w-[18px] h-[18px]" />} accentColor="amber" />
        <MetricTile label="Assessments Completed" value={assessmentsCompleted} icon={<AwardIcon className="w-[18px] h-[18px]" />} accentColor="green" />
        <MetricTile label="Avg. Course Progress" value={`${overallProgress}%`} icon={<ChartIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle>Recent Activity</SectionTitle>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-slate-600">{a.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle>Courses</SectionTitle>
            <div className="space-y-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onNavigate({ view: 'curriculum', courseId: c.id })}
                  className="w-full flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-3 py-2.5 -mx-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {c.code} &middot; {students.filter((s) => s.courseId === c.id).length} students
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'published' ? 'bg-emerald-50 text-emerald-700' : c.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="!border-amber-200 !bg-amber-50/40">
            <div className="flex items-center gap-2 mb-3">
              <AlertIcon className="w-[18px] h-[18px] text-amber-600" />
              <h2 className="text-[15px] font-bold text-slate-900">Action Required</h2>
            </div>
            <ul className="space-y-2.5 text-sm">
              {pendingMiniTasks > 0 && (
                <li>
                  <button onClick={() => onNavigate({ view: 'evaluationQueue' })} className="text-slate-700 hover:underline text-left">
                    {pendingMiniTasks} Mini Task{pendingMiniTasks === 1 ? '' : 's'} awaiting review
                  </button>
                </li>
              )}
              {pendingProjects > 0 && (
                <li>
                  <button onClick={() => onNavigate({ view: 'evaluationQueue' })} className="text-slate-700 hover:underline text-left">
                    {pendingProjects} Major Project{pendingProjects === 1 ? '' : 's'} awaiting evaluation
                  </button>
                </li>
              )}
              {behindStudents > 0 && (
                <li>
                  <button onClick={() => onNavigate({ view: 'students' })} className="text-slate-700 hover:underline text-left">
                    {behindStudents} student{behindStudents === 1 ? '' : 's'} paused / falling behind schedule
                  </button>
                </li>
              )}
              {pendingMiniTasks === 0 && pendingProjects === 0 && behindStudents === 0 && <li className="text-slate-500">Nothing needs your attention right now.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
