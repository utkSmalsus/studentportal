import * as React from 'react';
import { Route } from '../../navigation/types';
import { Divider, Eyebrow, StatusPill, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { moduleStatusMeta } from '../../ui/statusMeta';
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

function groupStatus(group: ModuleGroup, progress: ReturnType<typeof useAppState>['state']): 'completed' | 'current' | 'upcoming' | 'locked' {
  const inGroup = moduleDefs.filter((m) => m.group === group);
  const statuses = inGroup.map((m) => progression.getModuleStatus(m, moduleDefs, progress));
  if (statuses.every((s) => s === 'completed')) return 'completed';
  if (statuses.some((s) => s === 'current')) return 'current';
  if (statuses.every((s) => s === 'locked')) return 'locked';
  return 'upcoming';
}

const FocusItem: React.FC<{
  index: number;
  title: string;
  subtitle: string;
  meta: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ index, title, subtitle, meta, actionLabel, onAction }) => (
  <div className="flex items-start gap-4">
    <div className="text-sm font-semibold text-gray-300 w-6 pt-0.5">{index < 10 ? `0${index}` : index}</div>
    <div className="flex-1">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</div>
      <div className="text-base font-medium text-gray-900 mt-0.5">{subtitle}</div>
      <div className="text-sm text-gray-400 mt-0.5">{meta}</div>
      <PrimaryButton className="mt-2.5" onClick={onAction}>
        {actionLabel}
      </PrimaryButton>
    </div>
  </div>
);

const miniTaskActionLabel: Record<string, string> = {
  'Not Started': 'Start Task',
  'In Progress': 'Continue Task',
  Submitted: 'View Submission',
  'Under Review': 'View Submission',
  'Changes Requested': 'Fix & Resubmit',
  Resubmitted: 'View Submission',
  Passed: 'View Task',
};

const MiniTaskFocusItem: React.FC<{ index: number; moduleId: string; onNavigate: (r: Route) => void }> = ({ index, moduleId, onNavigate }) => {
  const { state: progress } = useAppState();
  const module = getModuleById(moduleId);
  if (!module?.miniTaskId) return null;
  const task = getMiniTaskById(module.miniTaskId);
  if (!task) return null;
  const status = progress.miniTasks[task.id]?.status || 'Not Started';
  return (
    <FocusItem
      index={index}
      title="Mini Task"
      subtitle={task.title}
      meta={status}
      actionLabel={miniTaskActionLabel[status]}
      onAction={() => onNavigate({ view: 'taskDetail', taskId: task.id })}
    />
  );
};

const ProgressStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const HomePage: React.FC<{ userDisplayName: string; onNavigate: (r: Route) => void }> = ({ userDisplayName, onNavigate }) => {
  const { state: progress } = useAppState();
  const active = progression.currentModule(course, moduleDefs, progress);
  const overallProgress = courseOverallProgress(progress);
  const taskStats = miniTaskStats(progress);
  const assessStats = assessmentStats(progress);
  const todaysChallenge = codingQuestions.find((q) => q.day === progress.codingCurrentDay);
  const alreadySolvedToday = todaysChallenge ? (progress.coding[todaysChallenge.id]?.attempts.some((a) => a.passed) ?? false) : false;

  // The one Changes-Requested task currently needing the student's attention, if any.
  const attentionTask = miniTasks
    .map((t) => ({ def: t, entry: progress.miniTasks[t.id] }))
    .find((x) => x.entry?.status === 'Changes Requested');

  const action = active ? progression.nextModuleAction(active, progress) : undefined;
  const projectModule = getModuleById(majorProject.moduleId);
  const projectUnlocked = projectModule ? progression.isModuleUnlocked(projectModule, moduleDefs, progress) : false;
  const currentMilestone = majorProject.milestones.find((m) => progress.project.milestoneStatus[m.id] === 'current');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        {greeting()}, {userDisplayName.split(' ')[0]}
      </h1>
      <p className="text-gray-500 mt-1">
        {course.title}
        {active && (
          <>
            <span className="text-gray-300 mx-1.5">·</span> Currently: {active.title}
          </>
        )}
      </p>

      <Divider />

      <Eyebrow>Today&apos;s Focus</Eyebrow>
      <div className="space-y-5">
        {active && action && (action.kind === 'learn' || action.kind === 'practice') && (
          <FocusItem
            index={1}
            title="Continue Learning"
            subtitle={action.title}
            meta={action.meta}
            actionLabel="Continue Learning"
            onAction={() => onNavigate({ view: 'moduleDetail', moduleId: active.id })}
          />
        )}
        {active && action && action.kind === 'miniTask' && (
          <MiniTaskFocusItem index={1} moduleId={active.id} onNavigate={onNavigate} />
        )}
        {active && action && action.kind === 'assessment' && (
          <FocusItem
            index={1}
            title="Assessment"
            subtitle={action.title}
            meta={action.meta}
            actionLabel="Start Assessment"
            onAction={() => onNavigate({ view: 'assessmentDetail', assessmentId: active.assessmentId! })}
          />
        )}
        {active && action && action.kind === 'moduleComplete' && (
          <FocusItem
            index={1}
            title="Module Complete"
            subtitle={`${active.title} is fully complete`}
            meta="Check the Journey to see what's next"
            actionLabel="View Journey"
            onAction={() => onNavigate({ view: 'journey' })}
          />
        )}
        {!active && (
          <FocusItem index={1} title="Course" subtitle="Every module is complete" meta="Nice work" actionLabel="View Journey" onAction={() => onNavigate({ view: 'journey' })} />
        )}

        {todaysChallenge ? (
          <FocusItem
            index={2}
            title="Daily Coding"
            subtitle={alreadySolvedToday ? `Day ${todaysChallenge.day} — solved` : `Day ${todaysChallenge.day} — ${todaysChallenge.title}`}
            meta={alreadySolvedToday ? "You're caught up — try a future challenge or revisit past ones" : `${todaysChallenge.difficulty} · ~20 min`}
            actionLabel={alreadySolvedToday ? 'View Daily Coding' : 'Solve Challenge'}
            onAction={() => onNavigate(alreadySolvedToday ? { view: 'coding' } : { view: 'challengeDetail', questionId: todaysChallenge.id })}
          />
        ) : (
          <FocusItem index={2} title="Daily Coding" subtitle="No challenge scheduled today" meta="Check back tomorrow" actionLabel="View Daily Coding" onAction={() => onNavigate({ view: 'coding' })} />
        )}
      </div>

      {projectUnlocked && (
        <div className="mt-5 text-sm text-gray-500">
          Also in progress: <span className="text-gray-800 font-medium">Major Project</span>
          {currentMilestone && ` — ${currentMilestone.title} milestone`} ({majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length}/{majorProject.milestones.length} milestones)
          {'  '}
          <button onClick={() => onNavigate({ view: 'project' })} className="text-blue-600 hover:underline">
            Continue Project &rarr;
          </button>
        </div>
      )}

      <Divider />

      <Eyebrow>Your Journey</Eyebrow>
      <ul>
        {GROUP_ORDER.map((group) => {
          const status = groupStatus(group, progress);
          const meta = moduleStatusMeta[status];
          return (
            <li key={group} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-gray-800">{GROUP_LABEL[group]}</span>
              <StatusPill color={meta.color}>{meta.label}</StatusPill>
            </li>
          );
        })}
      </ul>
      <button onClick={() => onNavigate({ view: 'journey' })} className="text-sm text-blue-600 hover:underline mt-3">
        View full journey &rarr;
      </button>

      {attentionTask && (
        <>
          <Divider />
          <Eyebrow>Needs Your Attention</Eyebrow>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">{attentionTask.def.title}</div>
              <StatusPill color="amber">Changes Requested</StatusPill>
              <p className="text-sm text-gray-600 mt-2 italic">
                &quot;{attentionTask.entry!.versions[attentionTask.entry!.versions.length - 1].evaluation?.feedback}&quot;
              </p>
            </div>
            <SecondaryButton onClick={() => onNavigate({ view: 'taskDetail', taskId: attentionTask.def.id })}>Fix &amp; Resubmit</SecondaryButton>
          </div>
        </>
      )}

      <Divider />

      <Eyebrow>Your Progress</Eyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <ProgressStat label="Course Progress" value={`${overallProgress}%`} />
        <ProgressStat label="Coding Streak" value={`${progress.codingStreak.current} days`} />
        <ProgressStat label="Tasks Completed" value={`${taskStats.completed} / ${taskStats.total}`} />
        <ProgressStat label="Assessments" value={`${assessStats.completed} / ${assessStats.total}`} />
      </div>

      {progress.notifications.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Activity</Eyebrow>
          <ul className="space-y-1.5">
            {progress.notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="text-sm text-gray-600 flex items-start gap-2">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    n.kind === 'success' ? 'bg-emerald-500' : n.kind === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                />
                {n.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HomePage;
