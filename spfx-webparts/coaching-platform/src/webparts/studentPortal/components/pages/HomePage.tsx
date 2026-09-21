import * as React from 'react';
import { Route } from '../../navigation/types';
import { Divider, Eyebrow, StatusPill, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { moduleStatusMeta } from '../../ui/statusMeta';
import { course, recentFeedback, codingQuestions, codingStreak } from '../../data/mockData';
import { modules, currentModule, nextIncompleteStep, courseOverallProgress, miniTaskStats, assessmentStats, getMiniTaskById } from '../../data/selectors';
import { ModuleGroup } from '../../data/types';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];
const GROUP_LABEL: Record<ModuleGroup, string> = {
  Foundation: 'Foundation',
  Programming: 'JavaScript',
  Frontend: 'Frontend & React',
  Backend: 'Backend',
  'Full Stack': 'Full Stack',
  Capstone: 'Capstone Project',
};

function groupStatus(group: ModuleGroup): 'completed' | 'current' | 'upcoming' {
  const inGroup = modules.filter((m) => m.group === group);
  if (inGroup.every((m) => m.status === 'completed')) return 'completed';
  if (inGroup.some((m) => m.status === 'current')) return 'current';
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

const ProgressStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const HomePage: React.FC<{ userDisplayName: string; onNavigate: (r: Route) => void }> = ({ userDisplayName, onNavigate }) => {
  const active = currentModule();
  const next = nextIncompleteStep(active);
  const todaysChallenge = codingQuestions.find((q) => q.status === 'today');
  const activeMiniTask = active.miniTaskId ? getMiniTaskById(active.miniTaskId) : undefined;
  const feedback = recentFeedback[0];
  const overallProgress = courseOverallProgress();
  const taskStats = miniTaskStats();
  const assessStats = assessmentStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        {greeting()}, {userDisplayName.split(' ')[0]}
      </h1>
      <p className="text-gray-500 mt-1">
        {course.title} <span className="text-gray-300 mx-1">·</span> Week {course.currentWeek} · {active.title}
      </p>

      <Divider />

      <Eyebrow>Today&apos;s Focus</Eyebrow>
      <div className="space-y-5">
        <FocusItem
          index={1}
          title="Continue Learning"
          subtitle={next ? next.title : `${active.title} — module complete`}
          meta="~45 min"
          actionLabel="Continue Learning"
          onAction={() => onNavigate({ view: 'moduleDetail', moduleId: active.id })}
        />
        {todaysChallenge && (
          <FocusItem
            index={2}
            title="Daily Coding"
            subtitle={todaysChallenge.title}
            meta={`${todaysChallenge.difficulty} · ~20 min`}
            actionLabel="Start Challenge"
            onAction={() => onNavigate({ view: 'challengeDetail', questionId: todaysChallenge.id })}
          />
        )}
        {activeMiniTask && (
          <FocusItem
            index={3}
            title="Mini Task"
            subtitle={activeMiniTask.title}
            meta={`Due ${activeMiniTask.deadline}`}
            actionLabel="Continue Task"
            onAction={() => onNavigate({ view: 'taskDetail', taskId: activeMiniTask.id })}
          />
        )}
      </div>

      <Divider />

      <Eyebrow>Your Journey</Eyebrow>
      <ul>
        {GROUP_ORDER.map((group) => {
          const status = groupStatus(group);
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

      {feedback && (
        <>
          <Divider />
          <Eyebrow>Recent Feedback</Eyebrow>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">{feedback.title}</div>
              <StatusPill color="amber">{feedback.status}</StatusPill>
              <p className="text-sm text-gray-600 mt-2 italic">&quot;{feedback.comment}&quot;</p>
            </div>
            <SecondaryButton onClick={() => onNavigate({ view: 'taskDetail', taskId: feedback.sourceId })}>
              View Feedback
            </SecondaryButton>
          </div>
        </>
      )}

      <Divider />

      <Eyebrow>Your Progress</Eyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <ProgressStat label="Course Progress" value={`${overallProgress}%`} />
        <ProgressStat label="Coding Streak" value={`🔥 ${codingStreak.current} days`} />
        <ProgressStat label="Tasks Completed" value={`${taskStats.completed} / ${taskStats.total}`} />
        <ProgressStat label="Assessments" value={`${assessStats.completed} / ${assessStats.total}`} />
      </div>
    </div>
  );
};

export default HomePage;
