import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, PrimaryButton, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextArea } from '../ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import { EvaluationStatus } from '../types';
import { useEvaluationQueue, useEvaluateSubmission, useEvaluateProjectSubmission, useCourseContent, useProjectSubmissions, EvaluationQueueItem } from '../../hooks';

const statusColor: Record<EvaluationStatus, SemanticColor> = { 'Under Review': 'amber', 'Changes Requested': 'amber', Passed: 'green' };

interface EvaluationDrawerContentProps {
  item: EvaluationQueueItem;
  onClose: () => void;
}

const EvaluationDrawerContent: React.FC<EvaluationDrawerContentProps> = ({ item, onClose }) => {
  const { data: content, isLoading: isContentLoading } = useCourseContent(item.courseId);
  const { data: projectSubmissions } = useProjectSubmissions(item.kind === 'project' ? item.studentId : '', item.courseId);
  const { mutate: evaluateMiniTask, isLoading: isEvaluatingMiniTask } = useEvaluateSubmission();
  const { mutate: evaluateProject, isLoading: isEvaluatingProject } = useEvaluateProjectSubmission();

  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const isSaving = isEvaluatingMiniTask || isEvaluatingProject;

  const openTaskDef = item.kind === 'miniTask' && item.taskId ? content?.miniTasks.find((t) => t.id === item.taskId) : undefined;
  const previousAttempt =
    item.kind === 'project' && item.attempt > 1
      ? projectSubmissions?.find((s) => s.attempt === item.attempt - 1)
      : undefined;
  const openEvaluationCriteria = openTaskDef
    ? openTaskDef.evaluationCriteriaTemplate
    : item.kind === 'project'
    ? content?.majorProject.evaluationCriteriaTemplate
    : undefined;

  const submitOutcome = (outcome: EvaluationStatus): void => {
    const criteria = (openEvaluationCriteria || []).map((c) => ({
      label: c.label,
      score: scores[c.label] ?? Math.round(c.maxScore * 0.8),
      maxScore: c.maxScore,
    }));
    const resolvedOutcome = outcome === 'Passed' ? 'Passed' : 'Changes Requested';

    if (item.kind === 'miniTask' && item.taskId) {
      evaluateMiniTask(
        { studentId: item.studentId, courseId: item.courseId, taskId: item.taskId, attempt: item.attempt, input: { criteria, feedback, outcome: resolvedOutcome } },
        { onSuccess: onClose }
      );
    } else {
      evaluateProject(
        { studentId: item.studentId, courseId: item.courseId, attempt: item.attempt, input: { criteria, feedback, outcome: resolvedOutcome } },
        { onSuccess: onClose }
      );
    }
  };

  if (isContentLoading) {
    return <LoadingState label="Loading details..." />;
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle>Submission</SectionTitle>
        <div className="text-sm space-y-1.5">
          {item.githubUrl && (
            <div>
              <span className="text-slate-400">Repository: </span>
              <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                {item.githubUrl}
              </a>
            </div>
          )}
          {item.branch && (
            <div>
              <span className="text-slate-400">Branch: </span>
              {item.branch}
            </div>
          )}
          {item.commitSha && (
            <div>
              <span className="text-slate-400">Commit: </span>
              <span className="font-mono text-xs">{item.commitSha}</span>
            </div>
          )}
          {item.pullRequestUrl && (
            <div>
              <span className="text-slate-400">Pull Request: </span>
              <a href={item.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                {item.pullRequestUrl}
              </a>
            </div>
          )}
          {item.liveUrl && (
            <div>
              <span className="text-slate-400">Live: </span>
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                {item.liveUrl}
              </a>
            </div>
          )}
          {item.documentationUrl && (
            <div>
              <span className="text-slate-400">Documentation: </span>
              <a href={item.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline">
                {item.documentationUrl}
              </a>
            </div>
          )}
          {item.notes && (
            <div>
              <span className="text-slate-400">Notes: </span>
              {item.notes}
            </div>
          )}
        </div>
      </Card>

      {previousAttempt?.evaluation && (
        <Card>
          <SectionTitle>Previous Attempt (#{previousAttempt.attempt})</SectionTitle>
          <p className="text-sm text-amber-700 mb-2">{previousAttempt.evaluation.outcome === 'Changes Requested' ? 'Changes were requested:' : 'Previously passed, but a new attempt was submitted:'}</p>
          <p className="text-sm text-slate-700">{previousAttempt.evaluation.feedback}</p>
        </Card>
      )}

      {openEvaluationCriteria && (
        <Card>
          <SectionTitle>Scorecard</SectionTitle>
          <div className="space-y-3">
            {openEvaluationCriteria.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{c.label}</span>
                <input
                  type="number"
                  min={0}
                  max={c.maxScore}
                  value={scores[c.label] ?? Math.round(c.maxScore * 0.8)}
                  onChange={(e) => setScores({ ...scores, [c.label]: Number(e.target.value) })}
                  className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-right"
                  disabled={isSaving}
                />
                <span className="text-xs text-slate-400 w-10">/ {c.maxScore}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <FormField label="Overall Feedback">
        <TextArea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did they do well? What needs to change?" disabled={isSaving} />
      </FormField>

      <div className="flex items-center gap-2">
        <SecondaryButton onClick={() => submitOutcome('Changes Requested')} disabled={!feedback.trim() || isSaving}>
          Request Changes
        </SecondaryButton>
        <PrimaryButton onClick={() => submitOutcome('Passed')} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Mark Passed'}
        </PrimaryButton>
      </div>
    </div>
  );
};

const EvaluationQueuePage: React.FC = () => {
  const { data: queue, isLoading } = useEvaluationQueue();
  const [tab, setTab] = useState<'miniTask' | 'project'>('miniTask');
  const [open, setOpen] = useState<EvaluationQueueItem | undefined>();

  const rows = (tab === 'miniTask' ? queue?.miniTasks : queue?.projects) || [];

  const columns: AdminColumn<EvaluationQueueItem>[] = [
    { key: 'student', label: 'Student', render: (r) => r.studentName },
    { key: 'course', label: 'Course', render: (r) => r.courseTitle },
    { key: 'module', label: 'Module', render: (r) => r.moduleTitle },
    { key: 'title', label: tab === 'miniTask' ? 'Task' : 'Project', render: (r) => r.title },
    { key: 'submitted', label: 'Submitted', render: (r) => new Date(r.submittedAt).toLocaleDateString() },
    { key: 'attempt', label: 'Attempt', render: (r) => r.attempt },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge color={statusColor[r.status]}>{r.status}</StatusBadge> },
  ];

  const openRow = (row: EvaluationQueueItem): void => {
    setOpen(row);
  };

  if (isLoading) {
    return <LoadingState label="Loading evaluation queue..." />;
  }

  return (
    <div>
      <PageHeader eyebrow="Evaluation" title="Evaluation Queue" subtitle="Review and score student submissions. Outcomes update the student's progress immediately." />

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {(['miniTask', 'project'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t === 'miniTask' ? 'Mini Tasks' : 'Major Projects'}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={openRow} emptyLabel="Nothing pending review." />

      <Drawer open={!!open} title={open?.title || ''} subtitle={open ? `${open.studentName} · Attempt ${open.attempt}` : ''} wide onClose={() => setOpen(undefined)}>
        {open && <EvaluationDrawerContent item={open} onClose={() => setOpen(undefined)} />}
      </Drawer>
    </div>
  );
};

export default EvaluationQueuePage;
