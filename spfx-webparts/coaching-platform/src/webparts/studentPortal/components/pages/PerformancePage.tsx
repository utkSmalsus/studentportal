import * as React from 'react';
import { Divider, Eyebrow, StatusPill } from '../../ui/Primitives';
import { SemanticColor } from '../../ui/statusMeta';
import { codingStreak } from '../../data/mockData';
import { skillRatings, codingStats, miniTaskStats, assessmentStats } from '../../data/selectors';

const skillColor: Record<string, SemanticColor> = { Strong: 'green', Developing: 'blue', 'Not Started': 'gray' };

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const PerformancePage: React.FC = () => {
  const skills = skillRatings();
  const coding = codingStats();
  const tasks = miniTaskStats();
  const assess = assessmentStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Performance</h1>
      <p className="text-gray-500 mt-1">A snapshot of how you&apos;re actually doing — not a wall of numbers.</p>

      <Divider />

      <Eyebrow>Skills</Eyebrow>
      <ul className="space-y-1.5">
        {skills.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-800">{s.label}</span>
            <StatusPill color={skillColor[s.level]}>{s.level}</StatusPill>
          </li>
        ))}
      </ul>

      <Divider />

      <Eyebrow>Coding</Eyebrow>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Problems Solved" value={String(coding.solved)} />
        <Stat label="Success Rate" value={`${coding.successRate}%`} />
        <Stat label="Current Streak" value={`${codingStreak.current} days`} />
      </div>

      <Divider />

      <Eyebrow>Practical Work</Eyebrow>
      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium text-gray-900">{tasks.completed}</span> <span className="text-gray-500">mini tasks completed</span>
        </div>
        {tasks.underReview > 0 && (
          <div className="text-gray-500">{tasks.underReview} under review</div>
        )}
        {tasks.changesRequested > 0 && (
          <div className="text-amber-600">{tasks.changesRequested} needs changes</div>
        )}
      </div>

      <Divider />

      <Eyebrow>Assessments</Eyebrow>
      <div className="text-sm">
        <span className="font-medium text-gray-900">{assess.averagePercent}%</span>{' '}
        <span className="text-gray-500">average across {assess.completed} completed assessments</span>
      </div>
    </div>
  );
};

export default PerformancePage;
