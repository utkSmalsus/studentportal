import * as React from 'react';
import { Route } from '../../navigation/types';
import { Card, SectionTitle, PrimaryButton, SecondaryButton, MetricTile, StageTimeline, StageInfo } from '../../ui/Primitives';
import { CodeIcon, ClipboardIcon, ChartIcon, FlameIcon, ArrowRightIcon, AlertIcon, CheckIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { course, moduleDefs, miniTasks, majorProject, courseOverallProgress, miniTaskStats, assessmentStats, getModuleById, getMiniTaskById } from '../../data/selectors';
import { codingQuestions } from '../../data/mockData';
import { ModuleGroup } from '../../data/types';

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];
const GROUP_LABEL: Record<ModuleGroup, string> = {
  Foundation: 'Foundation',
  Programming: 'JavaScript',
  Frontend: 'Frontend & React',
  Backend: 'Backend',
  'Full Stack': 'Full Stack',
  Capstone: 'Capstone Project',
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const miniTaskActionLabel: Record<string, string> = {
  'Not Started': 'Start Task',
  'In Progress': 'Continue Task',
  Submitted: 'View Submission',
  'Under Review': 'View Submission',
  'Changes Requested': 'Fix & Resubmit',
  Resubmitted: 'View Submission',
  Passed: 'View Task',
};

const PlanRow: React.FC<{
  index: number;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  meta: string;
  actionLabel: string;
  onAction: () => void;
  accent: string;
}> = ({ index, icon, eyebrow, title, meta, actionLabel, onAction, accent }) => (
  <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span>{index < 10 ? `0${index}` : index}</span>
        <span>{eyebrow}</span>
      </div>
      <div className="text-[15px] font-semibold text-slate-900 mt-0.5">{title}</div>
      <div className="text-sm text-slate-400 mt-0.5">{meta}</div>
    </div>
    <SecondaryButton onClick={onAction} className="shrink-0 text-[13px] px-3.5 py-2">
      {actionLabel}
      <ArrowRightIcon className="w-3.5 h-3.5" />
    </SecondaryButton>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const MiniTaskPlanRow: React.FC<{ index: number; moduleId: string; onNavigate: (r: Route) => void }> = ({ index, moduleId, onNavigate }) => {
  const { state: progress } = useAppState();
  const module = getModuleById(moduleId);
  if (!module?.miniTaskId) return null;
  const task = getMiniTaskById(module.miniTaskId);
  if (!task) return null;
  const status = progress.miniTasks[task.id]?.status || 'Not Started';
  return (
    <PlanRow
      index={index}
      icon={<ClipboardIcon className="w-[18px] h-[18px] text-indigo-600" />}
      eyebrow="Build"
      title={task.title}
      meta={status}
      actionLabel={miniTaskActionLabel[status]}
      onAction={() => onNavigate({ view: 'taskDetail', taskId: task.id })}
      accent="bg-indigo-50"
    />
  );
};

const HomePage: React.FC<{ userDisplayName: string; onNavigate: (r: Route) => void }> = ({ userDisplayName, onNavigate }) => {
  const { state: progress } = useAppState();
  const active = progression.currentModule(course, moduleDefs, progress);
  const overallProgress = courseOverallProgress(progress);
  const taskStats = miniTaskStats(progress);
  const assessStats = assessmentStats(progress);
  const todaysChallenge = codingQuestions.find((q) => q.day === progress.codingCurrentDay);
  const alreadySolvedToday = todaysChallenge ? (progress.coding[todaysChallenge.id]?.attempts.some((a) => a.passed) ?? false) : false;

  const attentionTask = miniTasks
    .map((t) => ({ def: t, entry: progress.miniTasks[t.id] }))
    .find((x) => x.entry?.status === 'Changes Requested');

  const action = active ? progression.nextModuleAction(active, progress) : undefined;
  const projectModule = getModuleById(majorProject.moduleId);
  const projectUnlocked = projectModule ? progression.isModuleUnlocked(projectModule, moduleDefs, progress) : false;
  const currentMilestone = majorProject.milestones.find((m) => progress.project.milestoneStatus[m.id] === 'current');

  const stages: StageInfo[] = GROUP_ORDER.map((group) => {
    const inGroup = moduleDefs.filter((m) => m.group === group);
    const statuses = inGroup.map((m) => progression.getModuleStatus(m, moduleDefs, progress));
    const percent = Math.round(inGroup.reduce((s, m) => s + progression.moduleProgressPercent(m, progress), 0) / inGroup.length);
    let status: StageInfo['status'] = 'upcoming';
    if (statuses.every((s) => s === 'completed')) status = 'completed';
    else if (statuses.some((s) => s === 'current')) status = 'current';
    else if (statuses.every((s) => s === 'locked')) status = 'locked';
    return { key: group, label: GROUP_LABEL[group], status, percent };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">
            {greeting()}, {userDisplayName.split(' ')[0]} <span aria-hidden>👋</span>
          </h1>
          <p className="text-slate-500 mt-1.5">
            {course.title}
            {active && <span className="text-slate-700 font-medium"> · {active.title}</span>}
          </p>
        </div>
        {active && (
          <PrimaryButton onClick={() => onNavigate({ view: 'moduleDetail', moduleId: active.id })}>
            Continue Learning <ArrowRightIcon className="w-4 h-4" />
          </PrimaryButton>
        )}
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-3 mb-8">
        <MetricTile label="Course Progress" value={`${overallProgress}%`} icon={<ChartIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Current Module" value={active ? active.title : 'Complete'} icon={<CodeIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Coding Streak" value={`${progress.codingStreak.current} days`} icon={<FlameIcon className="w-[18px] h-[18px]" />} accentColor="amber" />
        <MetricTile label="Tasks Completed" value={`${taskStats.completed}/${taskStats.total}`} icon={<ClipboardIcon className="w-[18px] h-[18px]" />} accentColor="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Plan */}
          <Card>
            <SectionTitle>Today&apos;s Plan</SectionTitle>
            <div>
              {active && action && (action.kind === 'learn' || action.kind === 'practice') && (
                <PlanRow
                  index={1}
                  icon={<CodeIcon className="w-[18px] h-[18px] text-indigo-600" />}
                  eyebrow="Learn"
                  title={action.title}
                  meta={action.meta}
                  actionLabel="Continue Learning"
                  onAction={() => onNavigate({ view: 'moduleDetail', moduleId: active.id })}
                  accent="bg-indigo-50"
                />
              )}
              {active && action && action.kind === 'miniTask' && (
                <MiniTaskPlanRow index={1} moduleId={active.id} onNavigate={onNavigate} />
              )}
              {active && action && action.kind === 'assessment' && (
                <PlanRow
                  index={1}
                  icon={<ClipboardIcon className="w-[18px] h-[18px] text-indigo-600" />}
                  eyebrow="Assessment"
                  title={action.title}
                  meta={action.meta}
                  actionLabel="Start Assessment"
                  onAction={() => onNavigate({ view: 'assessmentDetail', assessmentId: active.assessmentId! })}
                  accent="bg-indigo-50"
                />
              )}
              {active && action && action.kind === 'moduleComplete' && (
                <PlanRow
                  index={1}
                  icon={<CheckIcon className="w-[18px] h-[18px] text-emerald-600" />}
                  eyebrow="Module Complete"
                  title={`${active.title} is fully complete`}
                  meta="Check the Journey to see what's next"
                  actionLabel="View Journey"
                  onAction={() => onNavigate({ view: 'journey' })}
                  accent="bg-emerald-50"
                />
              )}
              {!active && (
                <PlanRow
                  index={1}
                  icon={<CheckIcon className="w-[18px] h-[18px] text-emerald-600" />}
                  eyebrow="Course"
                  title="Every module is complete"
                  meta="Nice work"
                  actionLabel="View Journey"
                  onAction={() => onNavigate({ view: 'journey' })}
                  accent="bg-emerald-50"
                />
              )}

              {todaysChallenge ? (
                <PlanRow
                  index={2}
                  icon={<CodeIcon className="w-[18px] h-[18px] text-amber-600" />}
                  eyebrow="Daily Coding"
                  title={alreadySolvedToday ? `Day ${todaysChallenge.day} — solved` : `Day ${todaysChallenge.day} — ${todaysChallenge.title}`}
                  meta={alreadySolvedToday ? "You're caught up for today" : `${todaysChallenge.difficulty} · ~20 min`}
                  actionLabel={alreadySolvedToday ? 'View Daily Coding' : 'Solve Challenge'}
                  onAction={() => onNavigate(alreadySolvedToday ? { view: 'coding' } : { view: 'challengeDetail', questionId: todaysChallenge.id })}
                  accent="bg-amber-50"
                />
              ) : (
                <PlanRow
                  index={2}
                  icon={<CodeIcon className="w-[18px] h-[18px] text-amber-600" />}
                  eyebrow="Daily Coding"
                  title="No challenge scheduled today"
                  meta="Check back tomorrow"
                  actionLabel="View Daily Coding"
                  onAction={() => onNavigate({ view: 'coding' })}
                  accent="bg-amber-50"
                />
              )}
            </div>

            {projectUnlocked && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-500">
                  Also in progress: <span className="text-slate-800 font-semibold">Major Project</span>
                  {currentMilestone && ` — ${currentMilestone.title}`} (
                  {majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length}/{majorProject.milestones.length})
                </div>
                <button onClick={() => onNavigate({ view: 'project' })} className="text-sm font-semibold text-indigo-600 hover:underline shrink-0">
                  Continue Project &rarr;
                </button>
              </div>
            )}
          </Card>

          {/* Needs attention */}
          {attentionTask && (
            <Card className="!border-amber-200 !bg-amber-50/40">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertIcon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1">Needs Your Attention</div>
                  <div className="text-[15px] font-semibold text-slate-900">{attentionTask.def.title}</div>
                  <p className="text-sm text-slate-600 mt-1.5 italic">
                    &quot;{attentionTask.entry!.versions[attentionTask.entry!.versions.length - 1].evaluation?.feedback}&quot;
                  </p>
                  <PrimaryButton className="mt-3" onClick={() => onNavigate({ view: 'taskDetail', taskId: attentionTask.def.id })}>
                    Fix &amp; Resubmit
                  </PrimaryButton>
                </div>
              </div>
            </Card>
          )}

          {/* Recent activity */}
          {progress.notifications.length > 0 && (
            <Card>
              <SectionTitle>Recent Activity</SectionTitle>
              <ul className="space-y-3">
                {progress.notifications.slice(0, 5).map((n) => (
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
            </Card>
          )}
        </div>

        {/* Journey sidebar */}
        <div>
          <Card>
            <SectionTitle
              action={
                <button onClick={() => onNavigate({ view: 'journey' })} className="text-xs font-semibold text-indigo-600 hover:underline">
                  View full journey
                </button>
              }
            >
              Your Journey
            </SectionTitle>
            <StageTimeline stages={stages} />
          </Card>

          <Card className="mt-6">
            <SectionTitle>This Course</SectionTitle>
            <div className="space-y-2.5 text-sm">
              <Row label="Assessments" value={`${assessStats.completed}/${assessStats.total}`} />
              <Row label="Average Score" value={`${assessStats.averagePercent}%`} />
              <Row label="Mini Tasks" value={`${taskStats.completed}/${taskStats.total}`} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
