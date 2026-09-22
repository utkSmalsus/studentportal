import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextArea } from '../ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import * as rosterRepo from '../repository/rosterRepository';
import * as courseRepo from '../repository/courseRepository';
import * as submissionRepo from '../repository/submissionRepository';
import * as projectSubmissionRepo from '../repository/projectSubmissionRepository';
import { EvaluationStatus } from '../types';

const statusColor: Record<EvaluationStatus, SemanticColor> = { 'Under Review': 'amber', 'Changes Requested': 'amber', Passed: 'green' };

interface QueueRow {
  id: string;
  kind: 'miniTask' | 'project';
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  submittedAt: string;
  status: EvaluationStatus;
  attempt: number;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
  taskId?: string;
}

const EvaluationQueuePage: React.FC = () => {
  const students = rosterRepo.listStudents();
  const courses = courseRepo.listCourses();
  const [tab, setTab] = useState<'miniTask' | 'project'>('miniTask');
  const [open, setOpen] = useState<QueueRow | undefined>();
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  // Every student's own course, not "the currently active one" — a submission
  // from a student enrolled in a different course is scored against ITS
  // content, never accidentally against whatever course an admin has open.
  const miniTaskRows: QueueRow[] = students.reduce<QueueRow[]>((rows, s) => {
    const content = courseRepo.getCourseContent(s.courseId);
    return rows.concat(submissionRepo.listPendingSubmissions([s.id], s.courseId).map((sub) => ({
      id: sub.id,
      kind: 'miniTask' as const,
      studentId: sub.studentId,
      courseId: sub.courseId,
      studentName: s.name,
      courseTitle: courses.find((c) => c.id === s.courseId)?.title || '',
      moduleTitle: content?.moduleDefs.find((m) => m.id === sub.moduleId)?.title || '',
      title: content?.miniTasks.find((t) => t.id === sub.taskId)?.title || sub.taskId,
      submittedAt: sub.submittedAt,
      status: sub.status as EvaluationStatus,
      attempt: sub.attempt,
      githubUrl: sub.repositoryName ? `https://github.com/${sub.repositoryName}` : undefined,
      liveUrl: sub.liveUrl,
      notes: sub.notes,
      taskId: sub.taskId,
    })));
  }, []);

  const projectRows: QueueRow[] = students.reduce<QueueRow[]>((rows, s) => {
    const content = courseRepo.getCourseContent(s.courseId);
    const submission = projectSubmissionRepo.getProjectSubmission(s.id, s.courseId);
    if (!content || !submission || ['Under Review', 'Submitted', 'Resubmitted'].indexOf(submission.status) === -1) return rows;
    return rows.concat([
      {
        id: submission.id,
        kind: 'project' as const,
        studentId: submission.studentId,
        courseId: submission.courseId,
        studentName: s.name,
        courseTitle: courses.find((c) => c.id === s.courseId)?.title || '',
        moduleTitle: content.moduleDefs.find((m) => m.id === content.majorProject.moduleId)?.title || content.majorProject.title,
        title: content.majorProject.title,
        submittedAt: submission.submittedAt,
        status: submission.status as EvaluationStatus,
        attempt: submission.attempt,
        githubUrl: submission.repositoryName ? `https://github.com/${submission.repositoryName}` : undefined,
        liveUrl: submission.liveUrl,
      },
    ]);
  }, []);

  const rows = tab === 'miniTask' ? miniTaskRows : projectRows;

  const columns: AdminColumn<QueueRow>[] = [
    { key: 'student', label: 'Student', render: (r) => r.studentName },
    { key: 'course', label: 'Course', render: (r) => r.courseTitle },
    { key: 'module', label: 'Module', render: (r) => r.moduleTitle },
    { key: 'title', label: tab === 'miniTask' ? 'Task' : 'Project', render: (r) => r.title },
    { key: 'submitted', label: 'Submitted', render: (r) => new Date(r.submittedAt).toLocaleDateString() },
    { key: 'attempt', label: 'Attempt', render: (r) => r.attempt },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge color={statusColor[r.status]}>{r.status}</StatusBadge> },
  ];

  const openRow = (row: QueueRow): void => {
    setOpen(row);
    setFeedback('');
    setScores({});
  };

  const openTaskDef = open?.kind === 'miniTask' && open.taskId ? courseRepo.getCourseContent(open.courseId)?.miniTasks.find((t) => t.id === open.taskId) : undefined;
  const openEvaluationCriteria = openTaskDef
    ? openTaskDef.evaluationCriteriaTemplate
    : open?.kind === 'project'
    ? courseRepo.getCourseContent(open.courseId)?.majorProject.evaluationCriteriaTemplate
    : undefined;

  const submitOutcome = (outcome: EvaluationStatus): void => {
    if (!open) return;
    const criteria = (openEvaluationCriteria || []).map((c) => ({ label: c.label, score: scores[c.label] ?? Math.round(c.maxScore * 0.8), maxScore: c.maxScore }));
    const resolvedOutcome = outcome === 'Passed' ? 'Passed' : 'Changes Requested';
    if (open.kind === 'miniTask' && open.taskId) {
      submissionRepo.evaluateSubmission(open.studentId, open.courseId, open.taskId, open.attempt, { criteria, feedback, outcome: resolvedOutcome });
    } else {
      projectSubmissionRepo.evaluateProjectSubmission(open.studentId, open.courseId, open.attempt, { criteria, feedback, outcome: resolvedOutcome });
    }
    setOpen(undefined);
  };

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
        {open && (
          <div className="space-y-5">
            <Card>
              <SectionTitle>Submission</SectionTitle>
              <div className="text-sm space-y-1.5">
                {open.githubUrl && (
                  <div>
                    <span className="text-slate-400">GitHub: </span>
                    <a href={open.githubUrl} className="text-indigo-600 font-medium hover:underline">
                      {open.githubUrl}
                    </a>
                  </div>
                )}
                {open.liveUrl && (
                  <div>
                    <span className="text-slate-400">Live: </span>
                    <a href={open.liveUrl} className="text-indigo-600 font-medium hover:underline">
                      {open.liveUrl}
                    </a>
                  </div>
                )}
                {open.notes && (
                  <div>
                    <span className="text-slate-400">Notes: </span>
                    {open.notes}
                  </div>
                )}
              </div>
            </Card>

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
                      />
                      <span className="text-xs text-slate-400 w-10">/ {c.maxScore}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <FormField label="Overall Feedback">
              <TextArea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did they do well? What needs to change?" />
            </FormField>

            <div className="flex items-center gap-2">
              <SecondaryButton onClick={() => submitOutcome('Changes Requested')} disabled={!feedback.trim()}>
                Request Changes
              </SecondaryButton>
              <PrimaryButton onClick={() => submitOutcome('Passed')}>Mark Passed</PrimaryButton>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EvaluationQueuePage;
