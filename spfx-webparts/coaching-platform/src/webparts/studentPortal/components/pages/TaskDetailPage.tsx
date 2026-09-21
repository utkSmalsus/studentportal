import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, ProgressBar, PrimaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
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
  const task = getMiniTaskById(taskId);
  const [githubUrl, setGithubUrl] = useState(task?.submission?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(task?.submission?.liveUrl || '');
  const [notes, setNotes] = useState(task?.submission?.notes || '');
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (!task) return <EmptyState title="Task not found" />;

  const showForm = needsSubmission(task.status) && !justSubmitted;

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'tasks' })}>Back to Mini Tasks</BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
        <StatusPill color={miniTaskStatusMeta[task.status].color}>{justSubmitted ? 'Submitted' : task.status}</StatusPill>
      </div>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
        <StatusPill color={difficultyColor[task.difficulty]}>{task.difficulty}</StatusPill>
        <span>Estimated time: {task.estimatedDuration}</span>
      </div>

      <Divider />

      <Eyebrow>Objective</Eyebrow>
      <p className="text-sm text-gray-700">{task.objective}</p>

      <Divider />

      <Eyebrow>Requirements</Eyebrow>
      <ul className="space-y-1">
        {task.requirements.map((r) => (
          <li key={r.label} className={`text-sm flex items-center gap-2 ${r.done ? 'text-gray-800' : 'text-gray-400'}`}>
            <span className={r.done ? 'text-emerald-600' : 'text-gray-300'}>{r.done ? '✓' : '○'}</span>
            {r.label}
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

      <Divider />

      {showForm ? (
        <>
          <Eyebrow>Submission</Eyebrow>
          <div className="space-y-3 max-w-lg">
            <Field label="GitHub Repository" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/you/project" />
            <Field label="Live URL" value={liveUrl} onChange={setLiveUrl} placeholder="https://your-app.example.com" />
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full mt-1 border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <PrimaryButton className="mt-4" onClick={() => setJustSubmitted(true)} disabled={!githubUrl}>
            Submit for Review
          </PrimaryButton>
        </>
      ) : (
        <>
          <Eyebrow>Submission</Eyebrow>
          <div className="text-sm space-y-1">
            {task.submission?.githubUrl && (
              <div>
                <span className="text-gray-400">GitHub: </span>
                <a href={task.submission.githubUrl} className="text-blue-600 hover:underline">
                  {task.submission.githubUrl}
                </a>
              </div>
            )}
            {task.submission?.liveUrl && (
              <div>
                <span className="text-gray-400">Live: </span>
                <a href={task.submission.liveUrl} className="text-blue-600 hover:underline">
                  {task.submission.liveUrl}
                </a>
              </div>
            )}
            {!task.submission && <p className="text-sm text-gray-400">Awaiting instructor review.</p>}
          </div>
        </>
      )}

      {task.evaluation && (
        <>
          <Divider />
          <Eyebrow>Evaluation</Eyebrow>
          <div className="space-y-2.5 max-w-lg">
            {task.evaluation.criteria.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.label}</span>
                  <span className="text-gray-500">
                    {c.score} / {c.maxScore}
                  </span>
                </div>
                <ProgressBar percent={(c.score / c.maxScore) * 100} color="blue" />
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>
                {task.evaluation.criteria.reduce((s, c) => s + c.score, 0)} /{' '}
                {task.evaluation.criteria.reduce((s, c) => s + c.maxScore, 0)}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-1">Feedback</div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{task.evaluation.feedback}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailPage;
