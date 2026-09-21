import * as React from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, StatusPill } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { ClipboardIcon, ChevronRightIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import { miniTasks } from '../../data/selectors';

const TasksPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();

  return (
    <div>
      <PageHeader eyebrow="Build" title="Mini Tasks" subtitle="Practical assignments tied to what you're learning right now." />

      <div className="space-y-3">
        {miniTasks.map((t) => {
          const status = progress.miniTasks[t.id]?.status || 'Not Started';
          return (
            <Card key={t.id} padded={false} className="hover:border-slate-300 transition">
              <button onClick={() => onNavigate({ view: 'taskDetail', taskId: t.id })} className="w-full flex items-center gap-4 text-left px-5 py-4">
                <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ClipboardIcon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <StatusPill color={difficultyColor[t.difficulty]}>{t.difficulty}</StatusPill>
                    <span>Due {t.deadline}</span>
                  </div>
                </div>
                <StatusPill color={miniTaskStatusMeta[status].color}>{status}</StatusPill>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
