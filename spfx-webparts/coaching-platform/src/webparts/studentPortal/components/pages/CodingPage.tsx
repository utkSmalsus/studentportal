import * as React from 'react';
import { Route } from '../../navigation/types';
import { Divider, Eyebrow, PrimaryButton, StatusPill } from '../../ui/Primitives';
import { codingStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import { codingQuestions } from '../../data/selectors';
import { StudentProgressState } from '../../state/types';

type DisplayStatus = 'solved' | 'failed' | 'missed' | 'pending' | 'today';

function displayStatus(questionId: string, day: number, progress: StudentProgressState): DisplayStatus {
  const attempts = progress.coding[questionId]?.attempts || [];
  if (attempts.some((a) => a.passed)) return 'solved';
  if (day === progress.codingCurrentDay) return 'today';
  if (day < progress.codingCurrentDay) return attempts.length > 0 ? 'failed' : 'missed';
  return 'pending';
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeekStrip(progress: StudentProgressState): { label: string; status: 'solved' | 'missed' | 'today' }[] {
  const solvedDates = new Set<string>();
  Object.keys(progress.coding).forEach((key) => {
    progress.coding[key].attempts.forEach((a) => {
      if (a.passed) solvedDates.add(new Date(a.submittedAt).toDateString());
    });
  });
  const today = new Date();
  const days: { label: string; status: 'solved' | 'missed' | 'today' }[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today.getTime() - offset * 86400000);
    const isToday = offset === 0;
    days.push({
      label: WEEKDAY_LABELS[d.getDay()],
      status: isToday ? 'today' : solvedDates.has(d.toDateString()) ? 'solved' : 'missed',
    });
  }
  return days;
}

const dayDot: Record<string, string> = {
  solved: 'bg-emerald-500 text-white',
  today: 'bg-blue-600 text-white ring-2 ring-blue-200',
  missed: 'bg-gray-200 text-gray-400',
};
const dayIcon: Record<string, string> = { solved: '✓', today: '●', missed: '–' };

const CodingPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();
  const today = codingQuestions.find((q) => q.day === progress.codingCurrentDay);
  const todayAttempts = today ? progress.coding[today.id]?.attempts || [] : [];
  const todaySolved = todayAttempts.some((a) => a.passed);

  const withStatus = codingQuestions.map((q) => ({ q, status: displayStatus(q.id, q.day, progress) }));
  const recent = withStatus.filter((x) => x.status === 'solved' || x.status === 'failed' || x.status === 'missed').slice(-5).reverse();
  const upcoming = withStatus.filter((x) => x.status === 'pending').slice(0, 4);
  const week = buildWeekStrip(progress);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Daily Coding</h1>
      <p className="text-gray-500 mt-1">Logical thinking and problem solving, one challenge every day of your course.</p>

      <Divider />

      <div className="text-3xl font-semibold text-orange-500">{progress.codingStreak.current} day streak</div>
      <p className="text-sm text-gray-400 mt-1">Day {progress.codingCurrentDay} of your coding journey · best streak {progress.codingStreak.best} days</p>

      <Divider />

      {today ? (
        <>
          <Eyebrow>Today&apos;s Challenge</Eyebrow>
          <div className="text-lg font-medium text-gray-900">{today.title}</div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <StatusPill color={difficultyColor[today.difficulty]}>{today.difficulty}</StatusPill>
            <span>{today.tags.join(' · ')}</span>
          </div>
          {todaySolved ? (
            <StatusPill color="green">Solved</StatusPill>
          ) : (
            <PrimaryButton className="mt-4" onClick={() => onNavigate({ view: 'challengeDetail', questionId: today.id })}>
              {todayAttempts.length > 0 ? 'Try Again' : 'Solve Challenge'}
            </PrimaryButton>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">No challenge scheduled for today.</p>
      )}

      <Divider />

      <Eyebrow>This Week</Eyebrow>
      <div className="flex gap-3">
        {week.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-gray-400">{d.label}</span>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${dayDot[d.status]}`}>
              {dayIcon[d.status]}
            </span>
          </div>
        ))}
      </div>

      <Divider />

      <Eyebrow>Recent Challenges</Eyebrow>
      <div className="divide-y divide-gray-100">
        {recent.length === 0 && <p className="text-sm text-gray-400">No challenges attempted yet.</p>}
        {recent.map(({ q, status }) => (
          <button
            key={q.id}
            onClick={() => onNavigate({ view: 'challengeDetail', questionId: q.id })}
            className="w-full flex items-center justify-between py-2.5 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
          >
            <div>
              <div className="text-sm font-medium text-gray-800">{q.title}</div>
              <div className="text-xs text-gray-400">Day {q.day} · {q.difficulty}</div>
            </div>
            <StatusPill color={codingStatusMeta[status].color}>{codingStatusMeta[status].label}</StatusPill>
          </button>
        ))}
      </div>

      {upcoming.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Coming Up</Eyebrow>
          <div className="divide-y divide-gray-100">
            {upcoming.map(({ q }) => (
              <div key={q.id} className="flex items-center justify-between py-2.5 opacity-60">
                <div>
                  <div className="text-sm font-medium text-gray-700">{q.title}</div>
                  <div className="text-xs text-gray-400">Day {q.day} · {q.difficulty}</div>
                </div>
                <StatusPill color="gray">Upcoming</StatusPill>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CodingPage;
