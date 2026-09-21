import * as React from 'react';
import { Card, PageHeader, SectionTitle, MetricTile, ProgressBar } from '../../ui/Primitives';
import { ChartIcon, FlameIcon, CodeIcon, ClipboardIcon, AwardIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { profile } from '../../data/mockData';
import { course, moduleDefs, courseOverallProgress, miniTaskStats, assessmentStats, codingStats } from '../../data/selectors';
import { ModuleGroup } from '../../data/types';

const GROUP_LABEL: Record<ModuleGroup, string> = {
  Foundation: 'Foundation',
  Programming: 'JavaScript',
  Frontend: 'Frontend & React',
  Backend: 'Backend',
  'Full Stack': 'Full Stack',
  Capstone: 'Capstone Project',
};

const SKILL_MODULE_IDS: { label: string; moduleId: string }[] = [
  { label: 'HTML & CSS', moduleId: 'css' },
  { label: 'JavaScript', moduleId: 'js-advanced' },
  { label: 'React', moduleId: 'react-hooks' },
  { label: 'Node.js', moduleId: 'node' },
];

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <dt className="text-slate-400">{label}</dt>
    <dd className="text-slate-800 font-semibold">{value}</dd>
  </div>
);

const ProfilePage: React.FC<{ userDisplayName: string }> = ({ userDisplayName }) => {
  const { state: progress } = useAppState();
  const overallPercent = courseOverallProgress(progress);
  const current = progression.currentModule(course, moduleDefs, progress);
  const currentGroup = current?.group;
  const taskStats = miniTaskStats(progress);
  const assessStats = assessmentStats(progress);
  const solveStats = codingStats(progress);

  const skills = SKILL_MODULE_IDS.map(({ label, moduleId }) => {
    const module = moduleDefs.find((m) => m.id === moduleId);
    return { label, percent: module ? progression.moduleProgressPercent(module, progress) : 0 };
  });

  const completedModules = moduleDefs.filter((m) => progression.getModuleStatus(m, moduleDefs, progress) === 'completed');
  const oneShotTasks = Object.keys(progress.miniTasks).filter((id) => {
    const entry = progress.miniTasks[id];
    return entry.status === 'Passed' && entry.versions.length === 1;
  });

  const achievements: { label: string; detail: string }[] = [];
  if (completedModules.length > 0) achievements.push({ label: `${completedModules.length} module${completedModules.length === 1 ? '' : 's'} completed`, detail: completedModules.map((m) => m.title).join(', ') });
  if (progress.codingStreak.best >= 7) achievements.push({ label: `${progress.codingStreak.best}-day coding streak`, detail: 'Best streak so far' });
  if (assessStats.completed > 0) achievements.push({ label: `${assessStats.completed} assessment${assessStats.completed === 1 ? '' : 's'} passed`, detail: `Average score ${assessStats.averagePercent}%` });
  if (oneShotTasks.length > 0) achievements.push({ label: `${oneShotTasks.length} mini task${oneShotTasks.length === 1 ? '' : 's'} passed on first submission`, detail: 'No revisions needed' });
  if (solveStats.solved > 0) achievements.push({ label: `${solveStats.solved} daily coding challenges solved`, detail: `${solveStats.successRate}% success rate` });

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {(userDisplayName || profile.name).charAt(0)}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-lg font-bold text-slate-900">{userDisplayName || profile.name}</div>
            <div className="text-sm text-slate-500">{profile.batch}</div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <Row label="Course" value={profile.course} />
            <Row label="Joined" value={profile.joiningDate} />
            <Row label="Stage" value={currentGroup ? GROUP_LABEL[currentGroup] : 'Complete'} />
            <Row label="Current Module" value={current ? current.title : 'Course complete'} />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3 mb-8">
        <MetricTile label="Course Progress" value={`${overallPercent}%`} icon={<ChartIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Coding Streak" value={`${progress.codingStreak.current} days`} icon={<FlameIcon className="w-[18px] h-[18px]" />} accentColor="amber" />
        <MetricTile label="Daily Coding Solved" value={solveStats.solved} icon={<CodeIcon className="w-[18px] h-[18px]" />} accentColor="green" />
        <MetricTile label="Mini Tasks" value={`${taskStats.completed}/${taskStats.total}`} icon={<ClipboardIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Assessments" value={`${assessStats.completed}/${assessStats.total}`} icon={<AwardIcon className="w-[18px] h-[18px]" />} accentColor="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle>Learning Profile</SectionTitle>
            <dl className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
              <Row label="Batch" value={profile.batch} />
              <Row label="Course" value={profile.course} />
              <Row label="Joining Date" value={profile.joiningDate} />
              <Row label="Modules Completed" value={`${completedModules.length}/${moduleDefs.length}`} />
              <Row label="Best Coding Streak" value={`${progress.codingStreak.best} days`} />
              <Row label="Average Assessment Score" value={`${assessStats.averagePercent}%`} />
            </dl>
          </Card>

          <Card>
            <SectionTitle>Skills Progress</SectionTitle>
            <div className="space-y-4">
              {skills.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{s.label}</span>
                    <span className="text-slate-500">{s.percent}%</span>
                  </div>
                  <ProgressBar percent={s.percent} color={s.percent === 100 ? 'green' : 'blue'} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Recent Activity</SectionTitle>
            {progress.notifications.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {progress.notifications.slice(0, 8).map((n) => (
                  <li key={n.id} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        n.kind === 'success' ? 'bg-emerald-500' : n.kind === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-slate-600">{n.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <SectionTitle>Achievements</SectionTitle>
            {achievements.length === 0 ? (
              <p className="text-sm text-slate-400">Keep going — your achievements will show up here as you make progress.</p>
            ) : (
              <ul className="space-y-3">
                {achievements.map((a) => (
                  <li key={a.label} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <AwardIcon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{a.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
