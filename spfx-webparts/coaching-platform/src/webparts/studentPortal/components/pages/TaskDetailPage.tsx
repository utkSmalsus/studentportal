import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, PrimaryButton, StatusPill, EmptyState, LoadingState, EvaluationRubric, Tag, PhaseStepper, PhaseState } from '../../ui/Primitives';
import { miniTaskStatusMeta, difficultyColor } from '../../ui/statusMeta';
import { AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import { getMiniTaskById } from '../../data/selectors';
import { MiniTaskProgressEntry } from '../../state/types';
import * as githubRepo from '../../admin/repository/githubRepository';

const LIVE_STUDENT_ID = 'student-demo';

const needsSubmission = (status: string): boolean =>
  status === 'Not Started' || status === 'In Progress' || status === 'Changes Requested';

function lifecycleSteps(entry: MiniTaskProgressEntry | undefined): { label: string; state: PhaseState }[] {
  const status = entry?.status || 'Not Started';
  const hadChangesRequested = !!entry?.versions.some((v) => v.evaluation?.outcome === 'Changes Requested');

  if (!hadChangesRequested) {
    const order = ['Not Started', 'In Progress', 'Submitted', 'Under Review', 'Passed'];
    const idx = order.indexOf(status === 'Resubmitted' ? 'Submitted' : status);
    return order.map((label, i) => ({ label, state: i < idx ? 'done' : i === idx ? 'current' : 'upcoming' }));
  }

  const order = ['Submitted', 'Changes Requested', 'Resubmitted', 'Under Review', 'Passed'];
  const idx = status === 'Under Review' ? 3 : status === 'Passed' ? 4 : order.indexOf(status);
  return order.map((label, i) => ({ label, state: i < idx ? 'done' : i === idx ? 'current' : 'upcoming' }));
}

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string }> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full mt-1.5 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
    />
  </div>
);

const TaskDetailPage: React.FC<{ taskId: string; onNavigate: (r: Route) => void }> = ({ taskId, onNavigate }) => {
  const { state: progress, submitMiniTask } = useAppState();
  const task = getMiniTaskById(taskId);
  const entry = progress.miniTasks[taskId];
  const latestVersion = entry?.versions[entry.versions.length - 1];

  const repoLink = task ? githubRepo.getRepositoryLink(LIVE_STUDENT_ID, task.courseId) : undefined;

  const [githubUrl, setGithubUrl] = useState(latestVersion?.githubUrl || '');
  const [branch, setBranch] = useState(latestVersion?.githubBranch || task?.githubBranch || '');
  const [pullRequestUrl, setPullRequestUrl] = useState(latestVersion?.githubPullRequestUrl || '');
  const [liveUrl, setLiveUrl] = useState(latestVersion?.liveUrl || '');
  const [notes, setNotes] = useState('');

  if (!task) return <EmptyState title="Task not found" />;
  const status = entry?.status || 'Not Started';
  const showForm = needsSubmission(status);
  const isChangesRequested = status === 'Changes Requested';
  const effectiveGithubUrl = repoLink ? `https://github.com/${repoLink.repositoryName}` : githubUrl;
  const canSubmit = task.githubRequired ? !!repoLink || !!githubUrl : true;

  const handleSubmit = (): void => {
    submitMiniTask(taskId, effectiveGithubUrl, liveUrl, notes, {
      repositoryName: repoLink?.repositoryName,
      branch: branch || undefined,
      pullRequestUrl: pullRequestUrl || undefined,
    });
    if (repoLink) {
      githubRepo.recordActivity(LIVE_STUDENT_ID, task.courseId, repoLink.repositoryName, 'push', { branch: branch || undefined, message: `Submit "${task.title}"` });
    }
    setNotes('');
  };

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'tasks' })}>Mini Tasks</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusPill color={difficultyColor[task.difficulty]}>{task.difficulty}</StatusPill>
            <span className="text-sm text-slate-400">
              Est. {task.estimatedDuration} &middot; Due {task.deadline}
            </span>
          </div>
        </div>
        <StatusPill color={miniTaskStatusMeta[status].color} className="text-sm px-3 py-1.5">
          {status}
        </StatusPill>
      </div>

      <Card className="my-6">
        <PhaseStepper phases={lifecycleSteps(entry)} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle>Objective</SectionTitle>
            <p className="text-sm text-slate-700">{task.objective}</p>
          </Card>

          <Card>
            <SectionTitle>Requirements</SectionTitle>
            <ul className="space-y-1.5">
              {task.requirements.map((r) => (
                <li key={r} className="text-sm text-slate-800 flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          {isChangesRequested && latestVersion?.evaluation && (
            <Card className="!border-amber-200 !bg-amber-50/40">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertIcon className="w-4.5 h-4.5" />
                </span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-amber-600 mb-1">Changes Required</div>
                  <p className="text-sm text-slate-700">{latestVersion.evaluation.feedback}</p>
                </div>
              </div>
            </Card>
          )}

          {showForm ? (
            <Card>
              <SectionTitle>{isChangesRequested ? 'Fix & Resubmit' : 'Submission'}</SectionTitle>
              {task.githubRequired && !repoLink && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mb-3.5">
                  <AlertIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    This task requires a GitHub submission. Connect your GitHub account and training repository from your Profile to submit without pasting a URL.
                  </p>
                </div>
              )}
              <div className="space-y-3.5 max-w-lg">
                {repoLink ? (
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Repository</label>
                    <div className="w-full mt-1.5 border border-slate-200 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-700">{repoLink.repositoryName}</div>
                  </div>
                ) : (
                  <Field label="GitHub Repository" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/you/project" />
                )}
                <Field label="Branch" value={branch} onChange={setBranch} placeholder="feature/react-todo" />
                {task.pullRequestRequired && <Field label="Pull Request URL" value={pullRequestUrl} onChange={setPullRequestUrl} placeholder="https://github.com/you/project/pull/1" />}
                <Field label="Live URL" value={liveUrl} onChange={setLiveUrl} placeholder="https://your-app.example.com" />
                <div>
                  <label className="text-sm font-semibold text-slate-700">Additional Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={isChangesRequested ? 'What did you change to address the feedback?' : ''}
                    className="w-full mt-1.5 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                </div>
              </div>
              <PrimaryButton className="mt-4" onClick={handleSubmit} disabled={!canSubmit}>
                {isChangesRequested ? 'Resubmit for Review' : 'Submit for Review'}
              </PrimaryButton>
            </Card>
          ) : (
            <Card>
              <SectionTitle>Submission</SectionTitle>
              {latestVersion ? (
                <div className="text-sm space-y-1.5">
                  <div>
                    <span className="text-slate-400">GitHub: </span>
                    <a href={latestVersion.githubUrl} className="text-indigo-600 font-medium hover:underline">
                      {latestVersion.githubUrl}
                    </a>
                  </div>
                  {latestVersion.liveUrl && (
                    <div>
                      <span className="text-slate-400">Live: </span>
                      <a href={latestVersion.liveUrl} className="text-indigo-600 font-medium hover:underline">
                        {latestVersion.liveUrl}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Awaiting instructor review.</p>
              )}
            </Card>
          )}

          {entry && entry.versions.length > 0 && (
            <Card>
              <SectionTitle>Evaluation</SectionTitle>
              <div className="space-y-6">
                {entry.versions.map((v) => (
                  <div key={v.version}>
                    {entry.versions.length > 1 && <div className="text-xs font-bold text-slate-400 mb-2.5">Version {v.version}</div>}
                    {v.evaluation ? (
                      <>
                        <EvaluationRubric criteria={v.evaluation.criteria} />
                        <div className="mt-3.5">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Instructor Feedback</div>
                          <p className="text-sm text-slate-700 whitespace-pre-line">{v.evaluation.feedback}</p>
                        </div>
                      </>
                    ) : (
                      <LoadingState label="Instructor is reviewing this submission…" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Skills</SectionTitle>
            <div className="flex gap-2 flex-wrap">
              {task.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Card>

          {task.resources.length > 0 && (
            <Card>
              <SectionTitle>Resources</SectionTitle>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {task.resources.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
