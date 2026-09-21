import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, StatusPill, StepRow, EmptyState, ProgressBar } from '../../ui/Primitives';
import { moduleStatusMeta, miniTaskStatusMeta, assessmentStatusMeta } from '../../ui/statusMeta';
import { ChevronRightIcon, ClockIcon, CheckIcon, LockIcon, AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs, getModuleById, getMiniTaskById, getAssessmentById, getModuleTestById } from '../../data/selectors';

const ModuleDetailPage: React.FC<{ moduleId: string; onNavigate: (r: Route) => void }> = ({ moduleId, onNavigate }) => {
  const { state: progress, completePractice } = useAppState();
  const m = getModuleById(moduleId);
  if (!m) return <EmptyState title="Module not found" />;

  const status = progression.getModuleStatus(m, moduleDefs, progress);

  if (status === 'locked') {
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>
        <h1 className="text-2xl font-bold text-slate-400">{m.title}</h1>
        <div className="mt-6">
          <EmptyState title="This module is locked" description={progression.lockedReason(m, moduleDefs)} icon={<LockIcon className="w-5 h-5" />} />
        </div>
      </div>
    );
  }

  const miniTask = m.miniTaskId ? getMiniTaskById(m.miniTaskId) : undefined;
  const moduleTest = m.moduleTestId ? getModuleTestById(m.moduleTestId) : undefined;
  const assessment = m.assessmentId ? getAssessmentById(m.assessmentId) : undefined;
  const meta = moduleStatusMeta[status];
  const percent = progression.moduleProgressPercent(m, progress);
  const allTopicsDone = progression.areAllTopicsComplete(m, progress);
  const dailyGateOk = progression.isDailyCodingGateSatisfied(progress);

  const taskStatus = miniTask ? progress.miniTasks[miniTask.id]?.status || 'Not Started' : undefined;
  const moduleTestPassed = m.moduleTestId ? progression.isModuleTestPassed(m.moduleTestId, progress) : false;
  const moduleTestUnlocked = moduleTest ? progression.canStartModuleTest(m, progress) : false;
  const assessmentUnlocked = assessment ? progression.canStartAssessment(m, progress) : false;

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

      {m.topics.length > 0 && (
        <Card className="mb-7">
          <SectionTitle>Topics</SectionTitle>
          <div className="space-y-1">
            {m.topics.map((t) => {
              const tStatus = progression.getTopicStatus(m, t.id, progress);
              const isLocked = tStatus === 'locked';
              return (
                <button
                  key={t.id}
                  onClick={() => !isLocked && onNavigate({ view: 'topicDetail', moduleId, topicId: t.id })}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-3.5 py-3 px-3.5 rounded-lg text-left transition ${
                    tStatus === 'current' ? 'bg-indigo-50/60 border border-indigo-100' : 'border border-transparent'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      tStatus === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : tStatus === 'current'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {tStatus === 'completed' ? <CheckIcon className="w-3.5 h-3.5" /> : isLocked ? <LockIcon className="w-3 h-3" /> : tStatus === 'current' ? '▶' : ''}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${tStatus === 'upcoming' || isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" /> ~{t.estimatedMinutes} min
                    </div>
                  </div>
                  {!isLocked && <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" />}
                </button>
              );
            })}
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

      {moduleTest && (
        <Card className="mb-7">
          <SectionTitle>Module Test</SectionTitle>
          {moduleTestPassed ? (
            <div className="flex items-center justify-between opacity-90">
              <span className="text-sm font-semibold text-slate-900">{moduleTest.title}</span>
              <StatusPill color="green">Passed</StatusPill>
            </div>
          ) : moduleTestUnlocked ? (
            <button
              onClick={() => onNavigate({ view: 'moduleTestAttempt', moduleId })}
              className="w-full flex items-center justify-between gap-3 text-left hover:bg-slate-50 rounded-lg px-3 py-2.5 -mx-3"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{moduleTest.title}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" /> {moduleTest.questions.length} questions &middot; {moduleTest.timeLimitMinutes} min
                </div>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between opacity-60">
                <span className="text-sm font-medium text-slate-500">{moduleTest.title}</span>
                <StatusPill color="gray">Locked</StatusPill>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5">
                {!allTopicsDone ? (
                  `Complete all ${m.title} topics to unlock the Module Test.`
                ) : !dailyGateOk ? (
                  <>
                    <AlertIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> Complete today&apos;s Daily Coding challenge before continuing your learning journey.
                  </>
                ) : (
                  'Module Test is locked.'
                )}
              </p>
            </div>
          )}
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
