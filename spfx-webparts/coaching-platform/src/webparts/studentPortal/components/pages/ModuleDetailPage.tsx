import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, StatusPill, StepRow, EmptyState } from '../../ui/Primitives';
import { moduleStatusMeta, miniTaskStatusMeta, assessmentStatusMeta } from '../../ui/statusMeta';
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
        <h1 className="text-2xl font-semibold text-gray-400">{m.title}</h1>
        <EmptyState title="This module is locked" description={progression.lockedReason(m, moduleDefs)} />
      </div>
    );
  }

  const miniTask = m.miniTaskId ? getMiniTaskById(m.miniTaskId) : undefined;
  const assessment = m.assessmentId ? getAssessmentById(m.assessmentId) : undefined;
  const meta = moduleStatusMeta[status];
  const assessmentUnlocked = progression.isAssessmentUnlocked(m, progress);

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{m.title}</h1>
        <StatusPill color={meta.color}>{meta.label}</StatusPill>
      </div>
      <p className="text-sm text-gray-400 mt-1">Progress {progression.moduleProgressPercent(m, progress)}% · Est. {m.estimatedDuration}</p>

      <div className="mt-5">
        <Eyebrow>What you&apos;ll learn</Eyebrow>
      </div>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        {m.whatYoullLearn.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      {m.learn.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Learn</Eyebrow>
          <div>
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
        </>
      )}

      {m.practice.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Practice</Eyebrow>
          <div>
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
        </>
      )}

      {miniTask && (
        <>
          <Divider />
          <Eyebrow>Practical Task</Eyebrow>
          <button
            onClick={() => onNavigate({ view: 'taskDetail', taskId: miniTask.id })}
            className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
          >
            <span className="text-sm text-gray-800">{miniTask.title}</span>
            <StatusPill color={miniTaskStatusMeta[progress.miniTasks[miniTask.id]?.status || 'Not Started'].color}>
              {progress.miniTasks[miniTask.id]?.status || 'Not Started'}
            </StatusPill>
          </button>
        </>
      )}

      {assessment && (
        <>
          <Divider />
          <Eyebrow>Assessment</Eyebrow>
          {assessmentUnlocked ? (
            <button
              onClick={() => onNavigate({ view: 'assessmentDetail', assessmentId: assessment.id })}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
            >
              <span className="text-sm text-gray-800">{assessment.title}</span>
              <StatusPill color={assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].color}>
                {assessmentStatusMeta[progression.assessmentUiStatus(assessment.id, progress)].label}
              </StatusPill>
            </button>
          ) : (
            <div className="flex items-center justify-between py-2 opacity-60">
              <span className="text-sm text-gray-500">{assessment.title}</span>
              <StatusPill color="gray">Locked</StatusPill>
            </div>
          )}
          {!assessmentUnlocked && <p className="text-xs text-gray-400 mt-1">{progression.assessmentLockedReason(m, progress)}</p>}
        </>
      )}
    </div>
  );
};

export default ModuleDetailPage;
