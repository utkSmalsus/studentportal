import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { Eyebrow, ProgressBar, StatusPill } from '../../ui/Primitives';
import { moduleStatusMeta, assessmentStatusMeta } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { course, moduleDefs, getMiniTaskById, getAssessmentById } from '../../data/selectors';
import { ModuleDef, ModuleGroup } from '../../data/types';

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];

const PhaseTick: React.FC<{ label: string; done: boolean; active: boolean }> = ({ label, done, active }) => (
  <span className={done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-gray-400'}>
    {done ? '✓' : active ? '●' : '○'} {label}
  </span>
);

const PhaseTickInline: React.FC<{ label: string; done: boolean }> = ({ label, done }) => (
  <span className={done ? 'text-emerald-600' : 'text-amber-600'}>
    {done ? '✓' : '○'} {label}
  </span>
);

const ModuleRow: React.FC<{
  module: ModuleDef;
  isExpanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onOpenTask: (taskId: string) => void;
  onOpenAssessment: (assessmentId: string) => void;
}> = ({ module, isExpanded, onToggle, onOpen, onOpenTask, onOpenAssessment }) => {
  const { state: progress } = useAppState();
  const status = progression.getModuleStatus(module, moduleDefs, progress);
  const meta = moduleStatusMeta[status];
  const isLocked = status === 'locked';
  const percent = progression.moduleProgressPercent(module, progress);

  const learnDone = module.learn.length > 0 && module.learn.every((l) => progression.isLessonComplete(l.id, progress));
  const learnActive = !learnDone && module.learn.length > 0;
  const practiceDone = module.practice.length > 0 && module.practice.every((p) => progression.isPracticeComplete(p.id, progress));
  const practiceActive = !practiceDone && learnDone;

  const task = module.miniTaskId ? getMiniTaskById(module.miniTaskId) : undefined;
  const taskStatus = task ? progress.miniTasks[task.id]?.status || 'Not Started' : undefined;
  const assessment = module.assessmentId ? getAssessmentById(module.assessmentId) : undefined;

  return (
    <div className="py-3">
      <button onClick={onToggle} disabled={isLocked} className="w-full flex items-center gap-3 text-left disabled:cursor-not-allowed">
        <span className={`font-semibold w-4 text-center ${isLocked ? 'text-gray-300' : ''}`}>{meta.icon}</span>
        <span className={`flex-1 font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{module.title}</span>
        {!isLocked && (
          <span className="w-32">
            <ProgressBar percent={percent} color={meta.color === 'red' ? 'red' : meta.color} />
          </span>
        )}
        <StatusPill color={meta.color}>{meta.label}</StatusPill>
      </button>

      {isLocked && (
        <div className="pl-7 pt-1 text-xs text-gray-400">{progression.lockedReason(module, moduleDefs)}</div>
      )}

      {isExpanded && !isLocked && (
        <div className="pl-7 pt-3 pb-1">
          <div className="text-sm text-gray-500 mb-2">Progress {percent}%</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {module.learn.length > 0 && <PhaseTick label="Learn" done={learnDone} active={learnActive} />}
            {module.practice.length > 0 && <PhaseTick label="Practice" done={practiceDone} active={practiceActive} />}
            {task && taskStatus && (
              <button onClick={() => onOpenTask(task.id)} className="hover:underline">
                <PhaseTickInline done={taskStatus === 'Passed'} label={`Mini Task (${taskStatus})`} />
              </button>
            )}
            {assessment && (
              <button onClick={() => onOpenAssessment(assessment.id)} className="hover:underline">
                <PhaseTickInline done={progression.isAssessmentComplete(assessment.id, progress)} label={`Assessment (${assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].label})`} />
              </button>
            )}
          </div>
          <button onClick={onOpen} className="text-sm text-blue-600 hover:underline mt-3">
            Open module &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

const JourneyPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(moduleDefs.filter((m) => progression.getModuleStatus(m, moduleDefs, progress) === 'current').map((m) => m.id))
  );

  const toggle = (id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{course.title}</h1>
      <p className="text-gray-500 mt-1">Your complete learning journey, from first line of HTML to final project.</p>

      <div className="mt-8 space-y-8">
        {GROUP_ORDER.map((group) => {
          const groupModules = moduleDefs.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;
          return (
            <div key={group}>
              <Eyebrow>{group}</Eyebrow>
              <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {groupModules.map((m) => (
                  <ModuleRow
                    key={m.id}
                    module={m}
                    isExpanded={expanded.has(m.id)}
                    onToggle={() => toggle(m.id)}
                    onOpen={() => onNavigate({ view: 'moduleDetail', moduleId: m.id })}
                    onOpenTask={(taskId) => onNavigate({ view: 'taskDetail', taskId })}
                    onOpenAssessment={(assessmentId) => onNavigate({ view: 'assessmentDetail', assessmentId })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPage;
