import * as React from 'react';
import { Route } from '../../navigation/types';
import { Divider, Eyebrow, PrimaryButton, StatusPill } from '../../ui/Primitives';
import { codingStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { codingQuestions, codingStreak, codingWeek } from '../../data/mockData';

const dayDot: Record<string, string> = {
  solved: 'bg-emerald-500 text-white',
  today: 'bg-blue-600 text-white ring-2 ring-blue-200',
  missed: 'bg-gray-200 text-gray-400',
  upcoming: 'bg-gray-100 text-gray-400',
};
const dayIcon: Record<string, string> = { solved: '✓', today: '●', missed: '✗', upcoming: '' };

const CodingPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const today = codingQuestions.find((q) => q.status === 'today');
  const recent = codingQuestions.filter((q) => q.status === 'solved' || q.status === 'failed').slice(-5).reverse();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Daily Coding</h1>
      <p className="text-gray-500 mt-1">Logical thinking and problem solving, one challenge every day of your course.</p>

      <Divider />

      <div className="text-3xl font-semibold text-orange-500">&#128293; {codingStreak.current} day streak</div>
      <p className="text-sm text-gray-400 mt-1">Day {codingStreak.dayNumber} of your coding journey · best streak {codingStreak.best} days</p>

      <Divider />

      {today && (
        <>
          <Eyebrow>Today&apos;s Challenge</Eyebrow>
          <div className="text-lg font-medium text-gray-900">{today.title}</div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <StatusPill color={difficultyColor[today.difficulty]}>{today.difficulty}</StatusPill>
            <span>{today.tags.join(' · ')}</span>
          </div>
          <PrimaryButton className="mt-4" onClick={() => onNavigate({ view: 'challengeDetail', questionId: today.id })}>
            Start Challenge
          </PrimaryButton>
        </>
      )}

      <Divider />

      <Eyebrow>This Week</Eyebrow>
      <div className="flex gap-3">
        {codingWeek.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-gray-400">{d.day}</span>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${dayDot[d.status]}`}>
              {dayIcon[d.status]}
            </span>
          </div>
        ))}
      </div>

      <Divider />

      <Eyebrow>Recent Challenges</Eyebrow>
      <div className="divide-y divide-gray-100">
        {recent.map((q) => (
          <button
            key={q.id}
            onClick={() => onNavigate({ view: 'challengeDetail', questionId: q.id })}
            className="w-full flex items-center justify-between py-2.5 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
          >
            <div>
              <div className="text-sm font-medium text-gray-800">{q.title}</div>
              <div className="text-xs text-gray-400">Day {q.day} · {q.difficulty}</div>
            </div>
            <StatusPill color={codingStatusMeta[q.status].color}>{codingStatusMeta[q.status].label}</StatusPill>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CodingPage;
