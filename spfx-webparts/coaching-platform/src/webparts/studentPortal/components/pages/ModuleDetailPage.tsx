import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, StatusPill, StepRow, EmptyState } from '../../ui/Primitives';
import { moduleStatusMeta, miniTaskStatusMeta, assessmentStatusMeta } from '../../ui/statusMeta';
import { getModuleById, getMiniTaskById, getAssessmentById } from '../../data/selectors';

const ModuleDetailPage: React.FC<{ moduleId: string; onNavigate: (r: Route) => void }> = ({ moduleId, onNavigate }) => {
  const m = getModuleById(moduleId);
  if (!m) return <EmptyState title="Module not found" />;

  if (m.status === 'locked') {
    const prereq = m.prerequisiteModuleId ? getModuleById(m.prerequisiteModuleId) : undefined;
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>
        <h1 className="text-2xl font-semibold text-gray-400">{m.title}</h1>
        <EmptyState
          title="This module is locked"
          description={prereq ? `Complete "${prereq.title}" to unlock ${m.title}.` : 'Complete the previous module to unlock this one.'}
        />
      </div>
    );
  }

  const miniTask = m.miniTaskId ? getMiniTaskById(m.miniTaskId) : undefined;
  const assessment = m.assessmentId ? getAssessmentById(m.assessmentId) : undefined;
  const meta = moduleStatusMeta[m.status];

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{m.title}</h1>
        <StatusPill color={meta.color}>{meta.label}</StatusPill>
      </div>

      <div className="mt-5">
        <Eyebrow>What you&apos;ll learn</Eyebrow>
      </div>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        {m.whatYoullLearn.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <Divider />

      <Eyebrow>Learn</Eyebrow>
      <div>
        {m.learn.length === 0 ? (
          <EmptyState title="No lessons in this module" />
        ) : (
          m.learn.map((step) => <StepRow key={step.id} title={step.title} status={step.status} />)
        )}
      </div>

      <Divider />

      <Eyebrow>Practice</Eyebrow>
      <div>
        {m.practice.length === 0 ? (
          <EmptyState title="No exercises in this module" />
        ) : (
          m.practice.map((step) => <StepRow key={step.id} title={step.title} status={step.status} />)
        )}
      </div>

      {miniTask && (
        <>
          <Divider />
          <Eyebrow>Practical Task</Eyebrow>
          <button
            onClick={() => onNavigate({ view: 'taskDetail', taskId: miniTask.id })}
            className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
          >
            <span className="text-sm text-gray-800">{miniTask.title}</span>
            <StatusPill color={miniTaskStatusMeta[miniTask.status].color}>{miniTask.status}</StatusPill>
          </button>
        </>
      )}

      {assessment && (
        <>
          <Divider />
          <Eyebrow>Assessment</Eyebrow>
          <button
            onClick={() => onNavigate({ view: 'assessmentDetail', assessmentId: assessment.id })}
            className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
          >
            <span className="text-sm text-gray-800">{assessment.title}</span>
            <StatusPill color={assessmentStatusMeta[assessment.status].color}>{assessmentStatusMeta[assessment.status].label}</StatusPill>
          </button>
        </>
      )}
    </div>
  );
};

export default ModuleDetailPage;
