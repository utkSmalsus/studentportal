import * as React from 'react';
import { Card, SectionTitle, ProgressBar, Badge } from '../../ui/Primitives';
import { majorProject } from '../../data/mockData';

const ProjectPage: React.FC = () => {
  const totalScore = majorProject.evaluationCriteria.reduce((s, c) => s + c.score, 0);
  const maxScore = majorProject.evaluationCriteria.reduce((s, c) => s + c.maxScore, 0);
  const milestonesDone = majorProject.milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Major Project</h1>
        <p className="text-gray-500">Unlocks after your final module is complete</p>
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{majorProject.title}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{majorProject.description}</p>
            <div className="text-xs text-gray-400 mt-2">Deadline: {majorProject.deadline}</div>
          </div>
          <Badge color="gray">Not Started</Badge>
        </div>
      </Card>

      <Card>
        <SectionTitle>Milestones ({milestonesDone}/{majorProject.milestones.length})</SectionTitle>
        <ul className="space-y-2">
          {majorProject.milestones.map((m) => (
            <li key={m.title} className="flex items-center gap-3 text-sm">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                  m.done ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                {m.done ? '✓' : ''}
              </span>
              <span className={m.done ? 'text-gray-700' : 'text-gray-400'}>{m.title}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle>Evaluation Criteria</SectionTitle>
        <div className="space-y-3">
          {majorProject.evaluationCriteria.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{c.label}</span>
                <span className="text-gray-500">
                  {c.score}/{c.maxScore}
                </span>
              </div>
              <ProgressBar percent={(c.score / c.maxScore) * 100} colorClass="bg-gray-300" />
            </div>
          ))}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>
              {totalScore}/{maxScore}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectPage;
