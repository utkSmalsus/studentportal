import * as React from 'react';
import { Card, SectionTitle, LabeledProgress, StatTile, ProgressBar } from '../../ui/Primitives';
import {
  courseTitle,
  overallProgress,
  learningProgress,
  dailyCodingStats,
  miniTasks,
  assessments,
  currentLearning,
  todaysChallenge,
  currentMiniTask,
} from '../../data/mockData';

export interface IDashboardPageProps {
  userDisplayName: string;
}

const DashboardPage: React.FC<IDashboardPageProps> = ({ userDisplayName }) => {
  const miniTasksCompleted = miniTasks.filter((t) => t.status === 'Completed').length;
  const miniTasksAvgScore = Math.round(
    miniTasks.filter((t) => t.score !== undefined).reduce((sum, t) => sum + (t.score! / t.maxScore!) * 100, 0) /
      Math.max(1, miniTasks.filter((t) => t.score !== undefined).length)
  );
  const assessmentsCompleted = assessments.filter((a) => a.status === 'passed' || a.status === 'failed').length;
  const assessmentsAvgScore = Math.round(
    assessments.filter((a) => a.bestScore !== undefined).reduce((sum, a) => sum + (a.bestScore! / a.totalMarks) * 100, 0) /
      Math.max(1, assessments.filter((a) => a.bestScore !== undefined).length)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {userDisplayName.split(' ')[0]} 👋</h1>
        <p className="text-gray-500">{courseTitle}</p>
      </div>

      <Card>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-gray-800">Overall Progress</span>
          <span className="font-semibold text-gray-800">{overallProgress}%</span>
        </div>
        <ProgressBar percent={overallProgress} heightClass="h-3.5" />
      </Card>

      <Card>
        <SectionTitle>Learning Progress</SectionTitle>
        <div className="space-y-3">
          {learningProgress.map((m) => (
            <LabeledProgress key={m.title} label={m.title} percent={m.percent} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <SectionTitle>Daily Coding</SectionTitle>
          <div className="flex flex-wrap gap-3">
            <StatTile label="Attempted" value={dailyCodingStats.attempted} />
            <StatTile label="Solved" value={dailyCodingStats.solved} accent="text-emerald-600" />
            <StatTile label="Success Rate" value={`${dailyCodingStats.successRate}%`} />
            <StatTile label="Current Streak" value={`🔥 ${dailyCodingStats.currentStreak}d`} accent="text-orange-500" />
          </div>
        </Card>

        <Card>
          <SectionTitle>Mini Tasks</SectionTitle>
          <div className="flex gap-3">
            <StatTile label="Completed" value={`${miniTasksCompleted}/${miniTasks.length}`} />
            <StatTile label="Average Score" value={`${miniTasksAvgScore}%`} />
          </div>
        </Card>

        <Card>
          <SectionTitle>Assessments</SectionTitle>
          <div className="flex gap-3">
            <StatTile label="Completed" value={`${assessmentsCompleted}/${assessments.length}`} />
            <StatTile label="Average Score" value={`${assessmentsAvgScore}%`} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Current Learning</div>
          <div className="text-lg font-semibold text-gray-900">{currentLearning}</div>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <div className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-1">Today&apos;s Coding Challenge</div>
          <div className="text-lg font-semibold text-gray-900">&quot;{todaysChallenge}&quot;</div>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Current Mini Task</div>
          <div className="text-lg font-semibold text-gray-900">&quot;{currentMiniTask}&quot;</div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
