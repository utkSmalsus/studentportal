import * as React from 'react';
import { Card, SectionTitle, LabeledProgress, StatTile } from '../../ui/Primitives';
import { profile, dailyCodingStats, miniTasks, assessments, majorProject } from '../../data/mockData';

const ProfilePage: React.FC<{ userDisplayName: string }> = ({ userDisplayName }) => {
  const miniTasksCompleted = miniTasks.filter((t) => t.status === 'Completed').length;
  const assessmentsAvgScore = Math.round(
    assessments.filter((a) => a.bestScore !== undefined).reduce((sum, a) => sum + (a.bestScore! / a.totalMarks) * 100, 0) /
      Math.max(1, assessments.filter((a) => a.bestScore !== undefined).length)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
          {userDisplayName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{userDisplayName || profile.name}</h1>
          <p className="text-gray-500">
            {profile.course} · {profile.batch}
          </p>
          <p className="text-xs text-gray-400">Joined {profile.joiningDate}</p>
        </div>
      </div>

      <Card>
        <SectionTitle>Skills</SectionTitle>
        <div className="space-y-3">
          {profile.skills.map((s) => (
            <LabeledProgress key={s.label} label={s.label} percent={s.percent} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <SectionTitle>Coding</SectionTitle>
          <div className="flex flex-col gap-3">
            <StatTile label="Problems Solved" value={dailyCodingStats.solved} />
            <StatTile label="Success Rate" value={`${dailyCodingStats.successRate}%`} />
            <StatTile label="Current Streak" value={`${dailyCodingStats.currentStreak} days`} />
          </div>
        </Card>
        <Card>
          <SectionTitle>Tasks</SectionTitle>
          <div className="flex flex-col gap-3">
            <StatTile label="Completed" value={`${miniTasksCompleted}/${miniTasks.length}`} />
          </div>
        </Card>
        <Card>
          <SectionTitle>Assessments &amp; Projects</SectionTitle>
          <div className="flex flex-col gap-3">
            <StatTile label="Average Score" value={`${assessmentsAvgScore}%`} />
            <StatTile label="Current Project" value={majorProject.title} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
