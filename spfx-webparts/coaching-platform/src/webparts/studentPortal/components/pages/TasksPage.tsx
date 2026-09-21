import * as React from 'react';
import { Route } from '../../navigation/types';
import { StatusPill } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import { miniTasks } from '../../data/selectors';

const TasksPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Mini Tasks</h1>
      <p className="text-gray-500 mt-1">Practical assignments tied to what you&apos;re learning right now.</p>

      <div className="mt-6 divide-y divide-gray-100 border-t border-b border-gray-100">
        {miniTasks.map((t) => {
          const status = progress.miniTasks[t.id]?.status || 'Not Started';
          return (
            <button
              key={t.id}
              onClick={() => onNavigate({ view: 'taskDetail', taskId: t.id })}
              className="w-full flex items-center justify-between py-3.5 text-left hover:bg-gray-50 px-2 -mx-2 rounded-md"
            >
              <div>
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <StatusPill color={difficultyColor[t.difficulty]}>{t.difficulty}</StatusPill>
                  <span>Due {t.deadline}</span>
                </div>
              </div>
              <StatusPill color={miniTaskStatusMeta[status].color}>{status}</StatusPill>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
