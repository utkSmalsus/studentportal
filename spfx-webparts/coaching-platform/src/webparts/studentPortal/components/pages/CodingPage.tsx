import * as React from 'react';
import { Card, SectionTitle, StatTile, Badge } from '../../ui/Primitives';
import { dailyCodingStats, codingSchedule } from '../../data/mockData';

const statusBadge: Record<string, { label: string; color: 'green' | 'red' | 'gray' | 'blue' }> = {
  solved: { label: 'Solved', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
  pending: { label: 'Upcoming', color: 'gray' },
  today: { label: "Today's Challenge", color: 'blue' },
};

const difficultyBadge: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

const CodingPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Daily Coding</h1>
      <p className="text-gray-500">Logical thinking &amp; problem solving, every day of your course</p>
    </div>

    <Card>
      <div className="flex flex-wrap gap-3">
        <StatTile label="Attempted" value={dailyCodingStats.attempted} />
        <StatTile label="Solved" value={dailyCodingStats.solved} accent="text-emerald-600" />
        <StatTile label="Success Rate" value={`${dailyCodingStats.successRate}%`} />
        <StatTile label="Current Streak" value={`🔥 ${dailyCodingStats.currentStreak} days`} accent="text-orange-500" />
        <StatTile label="Best Streak" value={`${dailyCodingStats.bestStreak} days`} />
      </div>
    </Card>

    <Card>
      <SectionTitle>Schedule</SectionTitle>
      <div className="divide-y divide-gray-100">
        {codingSchedule.map((q) => (
          <div key={q.day} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="w-14 text-sm font-semibold text-gray-400">Day {q.day}</div>
              <div>
                <div className="font-medium text-gray-900">{q.title}</div>
                <div className="mt-1">
                  <Badge color={difficultyBadge[q.difficulty]}>{q.difficulty}</Badge>
                </div>
              </div>
            </div>
            <Badge color={statusBadge[q.status].color}>{statusBadge[q.status].label}</Badge>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default CodingPage;
