import * as React from 'react';
import { Card, ProgressBar, Badge } from '../../ui/Primitives';
import { submissionStatusBadge } from '../../ui/statusMeta';
import { miniTasks } from '../../data/mockData';

const difficultyBadge: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

const TasksPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mini Tasks</h1>
      <p className="text-gray-500">Practical assignments tied to what you&apos;re currently learning</p>
    </div>

    <div className="space-y-4">
      {miniTasks.map((task) => (
        <Card key={task.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <Badge color={difficultyBadge[task.difficulty]}>{task.difficulty}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
              <div className="text-xs text-gray-400 mt-2">Deadline: {task.deadline}</div>
            </div>
            <Badge color={submissionStatusBadge[task.status]}>{task.status}</Badge>
          </div>

          {task.score !== undefined && task.maxScore !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Score</span>
                <span className="font-medium text-gray-800">
                  {task.score}/{task.maxScore}
                </span>
              </div>
              <ProgressBar percent={(task.score / task.maxScore) * 100} colorClass={task.status === 'Changes Requested' ? 'bg-amber-500' : 'bg-emerald-500'} />
            </div>
          )}

          {task.feedback && (
            <div className="mt-4 text-sm bg-gray-50 rounded-lg p-3 text-gray-700">
              <span className="font-medium text-gray-500">Instructor feedback: </span>
              {task.feedback}
            </div>
          )}

          {task.status === 'Changes Requested' && (
            <div className="mt-4 flex justify-end">
              <button className="text-sm font-medium px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition">
                Resubmit Task
              </button>
            </div>
          )}
        </Card>
      ))}
    </div>
  </div>
);

export default TasksPage;
