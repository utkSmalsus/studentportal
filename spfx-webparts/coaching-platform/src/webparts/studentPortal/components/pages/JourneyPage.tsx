import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, ProgressBar, StatusPill, SecondaryButton, PhaseStepper, PhaseState } from '../../ui/Primitives';
import { assessmentStatusMeta } from '../../ui/statusMeta';
import { CheckIcon, LockIcon, ChevronRightIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { course, moduleDefs, getMiniTaskById, getAssessmentById } from '../../data/selectors';
import { ModuleDef, ModuleGroup } from '../../data/types';

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];
const GROUP_NUMBER: Record<ModuleGroup, string> = {
  Foundation: '01',
  Programming: '02',
  Frontend: '03',
  Backend: '04',
  'Full Stack': '05',
  Capstone: '06',
};

const ModuleCard: React.FC<{
  module: ModuleDef;
  isExpanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onOpenTask: (taskId: string) => void;
  onOpenAssessment: (assessmentId: string) => void;
}> = ({ module, isExpanded, onToggle, onOpen, onOpenTask, onOpenAssessment }) => {
  const { state: progress } = useAppState();
  const status = progression.getModuleStatus(module, moduleDefs, progress);
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const percent = progression.moduleProgressPercent(module, progress);

  const learnDone = module.learn.length > 0 && module.learn.every((l) => progression.isLessonComplete(l.id, progress));
  const practiceDone = module.practice.length > 0 && module.practice.every((p) => progression.isPracticeComplete(p.id, progress));

  const task = module.miniTaskId ? getMiniTaskById(module.miniTaskId) : undefined;
  const taskStatus = task ? progress.miniTasks[task.id]?.status || 'Not Started' : undefined;
  const assessment = module.assessmentId ? getAssessmentById(module.assessmentId) : undefined;

  const phases: { label: string; state: PhaseState }[] = [
    { label: 'Learn', state: module.learn.length === 0 ? 'skip' : learnDone ? 'done' : 'current' },
    { label: 'Practice', state: module.practice.length === 0 ? 'skip' : practiceDone ? 'done' : learnDone ? 'current' : 'upcoming' },
    { label: 'Mini Task', state: !task ? 'skip' : taskStatus === 'Passed' ? 'done' : learnDone && practiceDone ? 'current' : 'upcoming' },
    { label: 'Assessment', state: !assessment ? 'skip' : progression.isAssessmentComplete(assessment.id, progress) ? 'done' : 'upcoming' },
  ];

  if (isLocked) {
    return (
      <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/60 opacity-70">
        <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
          <LockIcon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-500">{module.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{progression.lockedReason(module, moduleDefs)}</div>
        </div>
        <StatusPill color="gray">Locked</StatusPill>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden transition ${isCurrent ? 'border-indigo-200 shadow-sm shadow-indigo-100' : 'border-slate-200'}`}>
      <button onClick={onToggle} className={`w-full flex items-center gap-4 px-5 py-4 text-left ${isCurrent ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}>
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
            status === 'completed' ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {status === 'completed' ? <CheckIcon className="w-4 h-4" /> : status === 'current' ? '●' : ''}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-slate-900">{module.title}</span>
            {isCurrent && <StatusPill color="blue">In Progress</StatusPill>}
            {status === 'completed' && <StatusPill color="green">Complete</StatusPill>}
          </div>
          <div className="mt-2 max-w-xs">
            <ProgressBar percent={percent} color={status === 'completed' ? 'green' : 'blue'} heightClass="h-1.5" />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-400 shrink-0">{percent}%</span>
        <ChevronRightIcon className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-5 py-4 border-t border-slate-100 bg-white">
          <PhaseStepper phases={phases} />

          <div className="flex flex-wrap gap-2 mt-4">
            {task && taskStatus && (
              <button
                onClick={() => onOpenTask(task.id)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Mini Task: {taskStatus}
              </button>
            )}
            {assessment && (
              <button
                onClick={() => onOpenAssessment(assessment.id)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Assessment: {assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].label}
              </button>
            )}
          </div>

          <SecondaryButton onClick={onOpen} className="mt-4 text-[13px] px-4 py-2">
            {isCurrent ? 'Continue Module' : 'Open Module'} <ChevronRightIcon className="w-3.5 h-3.5" />
          </SecondaryButton>
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

  const completedCount = moduleDefs.filter((m) => progression.getModuleStatus(m, moduleDefs, progress) === 'completed').length;

  return (
    <div>
      <PageHeader
        eyebrow="Your Learning Journey"
        title={course.title}
        subtitle={
          <div className="flex items-center gap-3">
            <span>
              {completedCount} / {moduleDefs.length} modules completed
            </span>
          </div>
        }
      />

      <Card className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-slate-700">Overall Progress</span>
          <span className="font-bold text-slate-900">{Math.round((completedCount / moduleDefs.length) * 100)}%</span>
        </div>
        <ProgressBar percent={(completedCount / moduleDefs.length) * 100} heightClass="h-2.5" />
      </Card>

      <div className="space-y-10">
        {GROUP_ORDER.map((group) => {
          const groupModules = moduleDefs.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;
          return (
            <div key={group}>
              <div className="flex items-baseline gap-2.5 mb-3.5">
                <span className="text-xs font-bold text-indigo-400">{GROUP_NUMBER[group]}</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group}</h2>
              </div>
              <div className="space-y-3">
                {groupModules.map((m) => (
                  <ModuleCard
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
