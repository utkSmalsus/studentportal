import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, PrimaryButton, StatusPill, EmptyState, LoadingState, EvaluationRubric } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import { getMiniTaskById } from '../../data/selectors';

const needsSubmission = (status: string): boolean =>
  status === 'Not Started' || status === 'In Progress' || status === 'Changes Requested';

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string }> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full mt-1 border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  </div>
);

const TaskDetailPage: React.FC<{ taskId: string; onNavigate: (r: Route) => void }> = ({ taskId, onNavigate }) => {
  const { state: progress, submitMiniTask } = useAppState();
  const task = getMiniTaskById(taskId);
  const entry = progress.miniTasks[taskId];
  const latestVersion = entry?.versions[entry.versions.length - 1];

  const [githubUrl, setGithubUrl] = useState(latestVersion?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(latestVersion?.liveUrl || '');
  const [notes, setNotes] = useState('');

  if (!task) return <EmptyState title="Task not found" />;
  const status = entry?.status || 'Not Started';
  const showForm = needsSubmission(status);

  const handleSubmit = (): void => {
    submitMiniTask(taskId, githubUrl, liveUrl, notes);
    setNotes('');
  };

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'tasks' })}>Back to Mini Tasks</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
        <StatusPill color={miniTaskStatusMeta[status].color}>{status}</StatusPill>
      </div>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
        <StatusPill color={difficultyColor[task.difficulty]}>{task.difficulty}</StatusPill>
        <span>Estimated time: {task.estimatedDuration}</span>
        <span>· Due {task.deadline}</span>
      </div>

      <Divider />

      <Eyebrow>Objective</Eyebrow>
      <p className="text-sm text-gray-700">{task.objective}</p>

      <Divider />

      <Eyebrow>Requirements</Eyebrow>
      <ul className="space-y-1">
        {task.requirements.map((r) => (
          <li key={r} className="text-sm text-gray-800 flex items-center gap-2">
            <span className="text-gray-300">&bull;</span>
            {r}
          </li>
        ))}
      </ul>

      <Divider />

      <Eyebrow>Skills</Eyebrow>
      <div className="flex gap-2 flex-wrap">
        {task.skills.map((s) => (
          <StatusPill key={s} color="gray">
            {s}
          </StatusPill>
        ))}
      </div>

      {task.resources.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Resources</Eyebrow>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-0.5">
            {task.resources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      )}

      <Divider />

      {showForm ? (
        <>
          <Eyebrow>{status === 'Changes Requested' ? 'Fix & Resubmit' : 'Submission'}</Eyebrow>
          <div className="space-y-3 max-w-lg">
            <Field label="GitHub Repository" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/you/project" />
            <Field label="Live URL" value={liveUrl} onChange={setLiveUrl} placeholder="https://your-app.example.com" />
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={status === 'Changes Requested' ? 'What did you change to address the feedback?' : ''}
                className="w-full mt-1 border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <PrimaryButton className="mt-4" onClick={handleSubmit} disabled={!githubUrl}>
            {status === 'Changes Requested' ? 'Resubmit for Review' : 'Submit for Review'}
          </PrimaryButton>
        </>
      ) : (
        <>
          <Eyebrow>Submission</Eyebrow>
          {latestVersion ? (
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-400">GitHub: </span>
                <a href={latestVersion.githubUrl} className="text-blue-600 hover:underline">
                  {latestVersion.githubUrl}
                </a>
              </div>
              {latestVersion.liveUrl && (
                <div>
                  <span className="text-gray-400">Live: </span>
                  <a href={latestVersion.liveUrl} className="text-blue-600 hover:underline">
                    {latestVersion.liveUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Awaiting instructor review.</p>
          )}
        </>
      )}

      {entry && entry.versions.length > 0 && (
        <>
          <Divider />
          <Eyebrow>Evaluation</Eyebrow>
          <div className="space-y-6">
            {entry.versions.map((v) => (
              <div key={v.version}>
                {entry.versions.length > 1 && <div className="text-xs font-medium text-gray-400 mb-2">Version {v.version}</div>}
                {v.evaluation ? (
                  <>
                    <EvaluationRubric criteria={v.evaluation.criteria} />
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Instructor Feedback</div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{v.evaluation.feedback}</p>
                    </div>
                    {v.evaluation.outcome === 'Changes Requested' && v.version === entry.versions.length && (
                      <div className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 inline-block">
                        Changes required before this can be approved — see the form above.
                      </div>
                    )}
                  </>
                ) : (
                  <LoadingState label="Instructor is reviewing this submission…" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailPage;
