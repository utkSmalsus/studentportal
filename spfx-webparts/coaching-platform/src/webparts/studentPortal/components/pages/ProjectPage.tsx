import * as React from 'react';
import { Divider, Eyebrow, ProgressBar, PrimaryButton, EmptyState } from '../../ui/Primitives';
import { majorProject } from '../../data/mockData';
import { getModuleById } from '../../data/selectors';

const milestoneIcon = (status: string): string => (status === 'completed' ? '✓' : status === 'current' ? '●' : '○');
const milestoneColor = (status: string): string =>
  status === 'completed' ? 'text-emerald-600' : status === 'current' ? 'text-blue-600' : 'text-gray-400';

const ProjectPage: React.FC = () => {
  const capstone = getModuleById('major-project');
  const isLocked = capstone?.status === 'locked';

  if (isLocked) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-400">Major Project</h1>
        <EmptyState title="Your capstone unlocks once every module is complete" description="Keep going — you're building toward this." />
      </div>
    );
  }

  const totalScore = majorProject.evaluationCriteria.reduce((s, c) => s + c.score, 0);
  const maxScore = majorProject.evaluationCriteria.reduce((s, c) => s + c.maxScore, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{majorProject.title}</h1>
      <p className="text-gray-500 mt-1">{majorProject.subtitle}</p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={majorProject.progressPercent} color="blue" heightClass="h-2.5" />
        </div>
        <span className="text-sm font-medium text-gray-700">{majorProject.progressPercent}%</span>
      </div>

      <Divider />

      <Eyebrow>Milestones</Eyebrow>
      <ul className="space-y-1.5">
        {majorProject.milestones.map((m) => (
          <li key={m.title} className={`text-sm flex items-center gap-2 ${milestoneColor(m.status)}`}>
            <span className="w-4 text-center font-medium">{milestoneIcon(m.status)}</span>
            <span className={m.status === 'upcoming' ? 'text-gray-400' : 'text-gray-800'}>{m.title}</span>
          </li>
        ))}
      </ul>

      <Divider />

      <Eyebrow>Current Milestone</Eyebrow>
      <div className="text-lg font-medium text-gray-900">{majorProject.currentMilestone}</div>
      <p className="text-sm text-gray-400 mt-1">Deadline in {majorProject.deadlineInDays} days</p>
      <PrimaryButton className="mt-3">Continue Project</PrimaryButton>

      <Divider />

      <Eyebrow>Evaluation Criteria</Eyebrow>
      <div className="space-y-2.5 max-w-lg">
        {majorProject.evaluationCriteria.map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{c.label}</span>
              <span className="text-gray-500">
                {c.score} / {c.maxScore}
              </span>
            </div>
            <ProgressBar percent={(c.score / c.maxScore) * 100} color="gray" />
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>
            {totalScore} / {maxScore}
          </span>
        </div>
        <p className="text-xs text-gray-400">Scored on final submission.</p>
      </div>
    </div>
  );
};

export default ProjectPage;
