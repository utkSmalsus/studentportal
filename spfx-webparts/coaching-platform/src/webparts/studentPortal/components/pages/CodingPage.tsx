import * as React from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, SectionTitle, PrimaryButton, StatusPill, ProgressBar } from '../../ui/Primitives';
import { codingStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { FlameIcon, ArrowRightIcon, CodeIcon } from '../../ui/icons';
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
  today: 'bg-indigo-600 text-white ring-4 ring-indigo-100',
  missed: 'bg-slate-100 text-slate-300',
};
const dayIcon: Record<string, string> = { solved: '✓', today: '●', missed: '–' };

const CodingPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();
  const today = codingQuestions.find((q) => q.day === progress.codingCurrentDay);
  const todayAttempts = today ? progress.coding[today.id]?.attempts || [] : [];
  const todaySolved = todayAttempts.some((a) => a.passed);

  const withStatus = codingQuestions.map((q) => ({ q, status: displayStatus(q.id, q.day, progress) }));
  const recent = withStatus.filter((x) => x.status === 'solved' || x.status === 'failed' || x.status === 'missed').slice(-6).reverse();
  const upcoming = withStatus.filter((x) => x.status === 'pending').slice(0, 4);
  const week = buildWeekStrip(progress);
  const solvedCount = withStatus.filter((x) => x.status === 'solved').length;
  const totalScheduled = codingQuestions.length;

  return (
    <div>
      <PageHeader
        eyebrow="Practice"
        title="Daily Coding"
        subtitle="Logical thinking and problem solving, one challenge every day of your course."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's challenge */}
          <Card className="!bg-slate-900 !border-slate-900 !text-white">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-300">Today&apos;s Challenge &middot; Day {progress.codingCurrentDay}</div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                <FlameIcon className="w-4 h-4" />
                {progress.codingStreak.current} day streak
              </div>
            </div>

            {today ? (
              <>
                <div className="text-2xl font-bold text-white">{today.title}</div>
                <div className="flex items-center gap-2 mt-2.5">
                  <StatusPill color={difficultyColor[today.difficulty]}>{today.difficulty}</StatusPill>
                  <span className="text-sm text-slate-400">{today.tags.join(' · ')}</span>
                </div>
                {todaySolved ? (
                  <div className="mt-5 inline-flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">&#10003;</span> Solved for today
                  </div>
                ) : (
                  <PrimaryButton className="mt-5 !bg-white !text-slate-900 hover:!bg-slate-100" onClick={() => onNavigate({ view: 'challengeDetail', questionId: today.id })}>
                    {todayAttempts.length > 0 ? 'Try Again' : 'Start Challenge'} <ArrowRightIcon className="w-4 h-4" />
                  </PrimaryButton>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm">No challenge scheduled for today.</p>
            )}
          </Card>

          {/* Recent challenges */}
          <Card>
            <SectionTitle>Recent Challenges</SectionTitle>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-400">No challenges attempted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map(({ q, status }) => (
                  <button
                    key={q.id}
                    onClick={() => onNavigate({ view: 'challengeDetail', questionId: q.id })}
                    className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 rounded-lg px-2.5 -mx-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          status === 'solved' ? 'bg-emerald-50 text-emerald-600' : status === 'failed' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <CodeIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{q.title}</div>
                        <div className="text-xs text-slate-400">
                          Day {q.day} &middot; {q.difficulty}
                        </div>
                      </div>
                    </div>
                    <StatusPill color={codingStatusMeta[status].color}>{codingStatusMeta[status].label}</StatusPill>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {upcoming.length > 0 && (
            <Card>
              <SectionTitle>Coming Up</SectionTitle>
              <div className="divide-y divide-slate-100">
                {upcoming.map(({ q }) => (
                  <div key={q.id} className="flex items-center justify-between py-3 opacity-60">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{q.title}</div>
                      <div className="text-xs text-slate-400">
                        Day {q.day} &middot; {q.difficulty}
                      </div>
                    </div>
                    <StatusPill color="gray">Upcoming</StatusPill>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>This Week</SectionTitle>
            <div className="flex justify-between">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">{d.label}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dayDot[d.status]}`}>{dayIcon[d.status]}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Coding Progress</SectionTitle>
            <div className="text-2xl font-bold text-slate-900">
              {solvedCount} <span className="text-base font-medium text-slate-400">/ {totalScheduled} days</span>
            </div>
            <div className="mt-3">
              <ProgressBar percent={(solvedCount / totalScheduled) * 100} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <div className="font-bold text-slate-900">{progress.codingStreak.current}</div>
                <div className="text-xs text-slate-400">Current Streak</div>
              </div>
              <div>
                <div className="font-bold text-slate-900">{progress.codingStreak.best}</div>
                <div className="text-xs text-slate-400">Best Streak</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
