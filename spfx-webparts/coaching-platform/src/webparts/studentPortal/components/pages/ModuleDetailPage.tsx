import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, StatusPill, StepRow, EmptyState, ProgressBar, PhaseStepper, PhaseState } from '../../ui/Primitives';
import { moduleStatusMeta, miniTaskStatusMeta, assessmentStatusMeta } from '../../ui/statusMeta';
import { ChevronRightIcon, ClockIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs, getModuleById, getMiniTaskById, getAssessmentById } from '../../data/selectors';

const ModuleDetailPage: React.FC<{ moduleId: string; onNavigate: (r: Route) => void }> = ({ moduleId, onNavigate }) => {
  const { state: progress, completeLesson, completePractice } = useAppState();
  const m = getModuleById(moduleId);
  if (!m) return <EmptyState title="Module not found" />;

  const status = progression.getModuleStatus(m, moduleDefs, progress);

  if (status === 'locked') {
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>
        <h1 className="text-2xl font-bold text-slate-400">{m.title}</h1>
        <div className="mt-6">
          <EmptyState title="This module is locked" description={progression.lockedReason(m, moduleDefs)} />
        </div>
      </div>
    );
  }

  const miniTask = m.miniTaskId ? getMiniTaskById(m.miniTaskId) : undefined;
  const assessment = m.assessmentId ? getAssessmentById(m.assessmentId) : undefined;
  const meta = moduleStatusMeta[status];
  const assessmentUnlocked = progression.isAssessmentUnlocked(m, progress);
  const percent = progression.moduleProgressPercent(m, progress);

  const learnDone = m.learn.length > 0 && m.learn.every((l) => progression.isLessonComplete(l.id, progress));
  const practiceDone = m.practice.length > 0 && m.practice.every((p) => progression.isPracticeComplete(p.id, progress));
  const taskStatus = miniTask ? progress.miniTasks[miniTask.id]?.status || 'Not Started' : undefined;

  const phases: { label: string; state: PhaseState }[] = [
    { label: 'Learn', state: m.learn.length === 0 ? 'skip' : learnDone ? 'done' : 'current' },
    { label: 'Practice', state: m.practice.length === 0 ? 'skip' : practiceDone ? 'done' : learnDone ? 'current' : 'upcoming' },
    { label: 'Mini Task', state: !miniTask ? 'skip' : taskStatus === 'Passed' ? 'done' : learnDone && practiceDone ? 'current' : 'upcoming' },
    { label: 'Assessment', state: !assessment ? 'skip' : progression.isAssessmentComplete(assessment.id, progress) ? 'done' : 'upcoming' },
  ];

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'journey' })}>Course Journey</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">{m.title}</h1>
            <StatusPill color={meta.color}>{meta.label}</StatusPill>
          </div>
          <p className="text-slate-500 mt-1">
            {m.group} Development &middot; {percent}% complete &middot; Est. {m.estimatedDuration}
          </p>
        </div>
      </div>

      <div className="max-w-sm mt-3 mb-7">
        <ProgressBar percent={percent} heightClass="h-2" />
      </div>

      <Card className="mb-7">
        <PhaseStepper phases={phases} />
      </Card>

      <Card className="mb-7">
        <SectionTitle>What You&apos;ll Learn</SectionTitle>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600">
          {m.whatYoullLearn.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1.5">&bull;</span>
              {point}
            </li>
          ))}
        </ul>
      </Card>

      {m.learn.length > 0 && (
        <Card className="mb-7">
          <SectionTitle>Learn</SectionTitle>
          <div className="space-y-1">
            {m.learn.map((step) => (
              <StepRow
                key={step.id}
                title={step.title}
                meta={`~${step.estimatedMinutes} min`}
                status={progression.getLessonStatus(m, step.id, progress)}
                onComplete={() => completeLesson(step.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {m.practice.length > 0 && (
        <Card className="mb-7">
          <SectionTitle>Practice</SectionTitle>
          <div className="space-y-1">
            {m.practice.map((step) => (
              <StepRow
                key={step.id}
                title={step.title}
                meta={step.description}
                status={progression.getPracticeStatus(m, step.id, progress)}
                onComplete={() => completePractice(step.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {miniTask && (
        <Card className="mb-7">
          <SectionTitle>Practical Task</SectionTitle>
          <button
            onClick={() => onNavigate({ view: 'taskDetail', taskId: miniTask.id })}
            className="w-full flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-3 py-2.5 -mx-3"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900">{miniTask.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{miniTask.estimatedDuration}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill color={miniTaskStatusMeta[taskStatus || 'Not Started'].color}>{taskStatus}</StatusPill>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </Card>
      )}

      {assessment && (
        <Card>
          <SectionTitle>Assessment</SectionTitle>
          {assessmentUnlocked ? (
            <button
              onClick={() => onNavigate({ view: 'assessmentDetail', assessmentId: assessment.id })}
              className="w-full flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-3 py-2.5 -mx-3"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{assessment.title}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" /> {assessment.questions.length} questions &middot; {assessment.timeLimitMinutes} min
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill color={assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].color}>
                  {assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].label}
                </StatusPill>
                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-between opacity-60">
              <span className="text-sm font-medium text-slate-500">{assessment.title}</span>
              <StatusPill color="gray">Locked</StatusPill>
            </div>
          )}
          {!assessmentUnlocked && <p className="text-xs text-slate-400 mt-2">{progression.assessmentLockedReason(m, progress)}</p>}
        </Card>
      )}
    </div>
  );
};

export default ModuleDetailPage;
