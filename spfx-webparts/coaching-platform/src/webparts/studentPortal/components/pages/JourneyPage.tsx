import * as React from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, ProgressBar, StatusPill } from '../../ui/Primitives';
import { CheckIcon, LockIcon, ChevronRightIcon, ClipboardIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { course, moduleDefs, getMiniTaskById, getAssessmentById, getModuleTestById } from '../../data/selectors';
import { ModuleDef, ModuleGroup } from '../../data/types';
import { StudentProgressState } from '../../state/types';

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];
const GROUP_NUMBER: Record<ModuleGroup, string> = {
  Foundation: '01',
  Programming: '02',
  Frontend: '03',
  Backend: '04',
  'Full Stack': '05',
  Capstone: '06',
};
const GROUP_TAGLINE: Record<ModuleGroup, string> = {
  Foundation: 'Structure the web with HTML and style it with CSS.',
  Programming: 'Learn JavaScript from the ground up to advanced patterns.',
  Frontend: 'Build interactive UIs with React and its ecosystem.',
  Backend: 'Build servers, APIs and databases with Node.js.',
  'Full Stack': 'Connect frontend and backend into a shipped application.',
  Capstone: 'Bring every skill together into one real project.',
};

const GateChip: React.FC<{ label: string; passed: boolean; locked?: boolean }> = ({ label, passed, locked }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${
      passed ? 'bg-emerald-50 text-emerald-700' : locked ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700'
    }`}
  >
    {passed && <CheckIcon className="w-3 h-3" />}
    {locked && <LockIcon className="w-2.5 h-2.5" />}
    {label}
  </span>
);

const ModuleNode: React.FC<{
  module: ModuleDef;
  moduleNumber: number;
  progress: StudentProgressState;
  onOpen: () => void;
}> = ({ module, moduleNumber, progress, onOpen }) => {
  const status = progression.getModuleStatus(module, moduleDefs, progress);
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isDone = status === 'completed';
  const percent = progression.moduleProgressPercent(module, progress);

  const topicsDone = module.topics.filter((t) => progression.isTopicTestPassed(t.id, progress)).length;
  const task = module.miniTaskId ? getMiniTaskById(module.miniTaskId) : undefined;
  const taskStatus = task ? progress.miniTasks[task.id]?.status || 'Not Started' : undefined;
  const moduleTest = module.moduleTestId ? getModuleTestById(module.moduleTestId) : undefined;
  const moduleTestPassed = module.moduleTestId ? progression.isModuleTestPassed(module.moduleTestId, progress) : false;
  const assessment = module.assessmentId ? getAssessmentById(module.assessmentId) : undefined;
  const assessmentPassed = module.assessmentId ? progression.isAssessmentComplete(module.assessmentId, progress) : false;

  const dotColor = isDone ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-600' : isLocked ? 'bg-slate-200' : 'bg-slate-300';

  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-150" style={{ backgroundColor: '#e5e7eb' }} />
      <span
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${dotColor} ${
          isCurrent ? 'ring-4 ring-indigo-100' : ''
        }`}
      >
        {isDone ? <CheckIcon className="w-4 h-4" /> : isLocked ? <LockIcon className="w-3.5 h-3.5 text-slate-400" /> : moduleNumber}
      </span>

      <div className="flex-1 min-w-0">
        {isCurrent ? (
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 shadow-sm p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">Current Module</div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
              <StatusPill color="blue">In Progress</StatusPill>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              {module.group} &middot; Est. {module.estimatedDuration}
            </p>
            <div className="max-w-sm mb-3">
              <ProgressBar percent={percent} heightClass="h-2" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {module.topics.length > 0 && <GateChip label={`Topics ${topicsDone}/${module.topics.length}`} passed={topicsDone === module.topics.length} />}
              {moduleTest && <GateChip label="Module Test" passed={moduleTestPassed} locked={!progression.canStartModuleTest(module, progress) && !moduleTestPassed} />}
              {assessment && <GateChip label="Assessment" passed={assessmentPassed} locked={!progression.canStartAssessment(module, progress) && !assessmentPassed} />}
              {task && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                  <ClipboardIcon className="w-3 h-3" /> {taskStatus}
                </span>
              )}
            </div>
            <button onClick={onOpen} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline">
              Continue Module <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpen}
            disabled={isLocked}
            className={`w-full text-left rounded-xl border px-5 py-4 transition ${
              isLocked ? 'border-slate-200 bg-slate-50/60 opacity-70 cursor-not-allowed' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[15px] font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{module.title}</span>
                  {isDone && <StatusPill color="green">Complete</StatusPill>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {module.group} &middot; Est. {module.estimatedDuration}
                </p>

                {isLocked ? (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <LockIcon className="w-3 h-3 shrink-0" /> {progression.lockedReason(module, moduleDefs)}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {module.topics.length > 0 && <GateChip label={`Topics ${topicsDone}/${module.topics.length}`} passed={topicsDone === module.topics.length} />}
                    {moduleTest && <GateChip label="Module Test" passed={moduleTestPassed} />}
                    {assessment && <GateChip label="Assessment" passed={assessmentPassed} />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!isLocked && <span className="text-sm font-bold text-slate-400">{percent}%</span>}
                <ChevronRightIcon className={`w-4 h-4 shrink-0 ${isLocked ? 'text-slate-300' : 'text-slate-400'}`} />
              </div>
            </div>
          </button>
        )}
      </div>
    </li>
  );
};

const JourneyPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();
  const completedCount = moduleDefs.filter((m) => progression.getModuleStatus(m, moduleDefs, progress) === 'completed').length;
  const overallPercent = progression.courseOverallProgress(course, moduleDefs, progress);
  const current = progression.currentModule(course, moduleDefs, progress);
  const currentIndex = current ? course.moduleOrder.indexOf(current.id) : -1;
  const next = currentIndex >= 0 ? moduleDefs.find((m) => m.id === course.moduleOrder[currentIndex + 1]) : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Your Learning Journey"
        title={course.title}
        subtitle={
          <span>
            {completedCount} of {moduleDefs.length} modules completed
            {current && (
              <>
                {' '}
                &middot; Current: <span className="text-slate-700 font-semibold">{current.title}</span>
              </>
            )}
            {next && (
              <>
                {' '}
                &middot; Next: <span className="text-slate-700 font-semibold">{next.title}</span>
              </>
            )}
          </span>
        }
      />

      <Card className="mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-slate-700">Overall Course Progress</span>
          <span className="font-bold text-slate-900">{overallPercent}%</span>
        </div>
        <ProgressBar percent={overallPercent} heightClass="h-2.5" />
      </Card>

      <div className="space-y-12">
        {GROUP_ORDER.map((group) => {
          const groupModules = moduleDefs.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;
          return (
            <div key={group}>
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="text-xs font-bold text-indigo-400">{GROUP_NUMBER[group]}</span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group}</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4 ml-[26px]">{GROUP_TAGLINE[group]}</p>
              <ol className="relative">
                {groupModules.map((m, i) => (
                  <ModuleNode
                    key={m.id}
                    module={m}
                    moduleNumber={i + 1}
                    progress={progress}
                    onOpen={() => onNavigate({ view: 'moduleDetail', moduleId: m.id })}
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPage;
