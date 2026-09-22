import * as React from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, StatusPill } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { ClipboardIcon, ChevronRightIcon, LockIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { miniTasks, moduleDefs, getModuleById } from '../../data/selectors';

const TasksPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();

  return (
    <div>
      <PageHeader eyebrow="Build" title="Mini Tasks" subtitle="Practical assignments tied to what you're learning right now." />

      <div className="space-y-3">
        {miniTasks.map((t) => {
          const status = progress.miniTasks[t.id]?.status || 'Not Started';
          const owningModule = getModuleById(t.moduleId);
          // A task's module gates it exactly like it gates the module's own
          // content — same rule ModuleDetailPage/AssessmentDetailPage already
          // enforce, just missing here until now.
          const isLocked = owningModule ? !progression.isModuleUnlocked(owningModule, moduleDefs, progress) : false;
          return (
            <Card key={t.id} padded={false} className={isLocked ? 'opacity-60' : 'hover:border-slate-300 transition'}>
              <button
                onClick={() => !isLocked && onNavigate({ view: 'taskDetail', taskId: t.id })}
                disabled={isLocked}
                className="w-full flex items-center gap-4 text-left px-5 py-4 disabled:cursor-not-allowed"
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  {isLocked ? <LockIcon className="w-4.5 h-4.5" /> : <ClipboardIcon className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>{t.title}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <StatusPill color={difficultyColor[t.difficulty]}>{t.difficulty}</StatusPill>
                    <span>Due {t.deadline}</span>
                  </div>
                </div>
                {isLocked ? <StatusPill color="gray">Locked</StatusPill> : <StatusPill color={miniTaskStatusMeta[status].color}>{status}</StatusPill>}
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
