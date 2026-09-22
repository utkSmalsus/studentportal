import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, TextArea } from '../../admin/ui/AdminPrimitives';
import { SemanticColor } from '../../ui/statusMeta';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as rosterRepo from '../../admin/repository/rosterRepository';
import * as courseRepo from '../../admin/repository/courseRepository';
import { useAppState } from '../../state/AppStateContext';
import { getModuleById, getMiniTaskById } from '../../data/selectors';
import { EvaluationStatus, RosterEvaluationItem } from '../../admin/types';

const statusColor: Record<EvaluationStatus, SemanticColor> = { 'Under Review': 'amber', 'Changes Requested': 'amber', Passed: 'green' };

interface QueueRow {
  id: string;
  kind: 'miniTask' | 'project';
  studentName: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  submittedAt: string;
  status: EvaluationStatus;
  attempt: number;
  githubUrl?: string;
  githubBranch?: string;
  liveUrl?: string;
  notes?: string;
  isLive: boolean;
  liveTaskId?: string;
  liveVersion?: number;
}

const MentorReviewPage: React.FC<{ mentorId: string }> = ({ mentorId }) => {
  const { state: liveProgress, adminEvaluateMiniTask } = useAppState();
  const myStudents = mentorRepo.getStudentsForMentor(mentorId);
  const courses = courseRepo.listCourses();
  const rosterEvals = rosterRepo.listRosterEvaluations().filter((e) => myStudents.some((s) => s.id === e.studentId));
  const [tab, setTab] = useState<'miniTask' | 'project'>('miniTask');
  const [open, setOpen] = useState<QueueRow | undefined>();
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const liveStudent = myStudents.find((s) => s.isLiveDemoStudent);
  const liveRows: QueueRow[] = liveStudent
    ? Object.keys(liveProgress.miniTasks)
        .map((taskId) => {
          const entry = liveProgress.miniTasks[taskId];
          const task = getMiniTaskById(taskId);
          const latest = entry.versions[entry.versions.length - 1];
          if (!task || !latest || ['Under Review', 'Submitted', 'Resubmitted'].indexOf(entry.status) === -1) return undefined;
          const module = getModuleById(task.moduleId);
          const row: QueueRow = {
            id: `live-${taskId}`, kind: 'miniTask', studentName: liveStudent.name, courseTitle: courses.find((c) => c.id === liveStudent.courseId)?.title || '',
            moduleTitle: module?.title || '', title: task.title, submittedAt: latest.submittedAt, status: 'Under Review', attempt: latest.version,
            githubUrl: latest.githubUrl, githubBranch: latest.githubBranch, liveUrl: latest.liveUrl, notes: latest.notes, isLive: true, liveTaskId: taskId, liveVersion: latest.version,
          };
          return row;
        })
        .filter((r): r is QueueRow => !!r)
    : [];

  const rosterRows: QueueRow[] = rosterEvals.map((e: RosterEvaluationItem) => ({
    id: e.id, kind: e.kind, studentName: myStudents.find((s) => s.id === e.studentId)?.name || 'Unknown', courseTitle: courses.find((c) => c.id === e.courseId)?.title || '',
    moduleTitle: getModuleById(e.moduleId)?.title || e.moduleId, title: e.title, submittedAt: e.submittedAt, status: e.status, attempt: e.attempt,
    githubUrl: e.githubUrl, githubBranch: e.githubBranch, liveUrl: e.liveUrl, notes: e.notes, isLive: false,
  }));

  const rows = [...liveRows, ...rosterRows].filter((r) => r.kind === tab);

  const columns: AdminColumn<QueueRow>[] = [
    { key: 'student', label: 'Student', render: (r) => r.studentName },
    { key: 'course', label: 'Course', render: (r) => r.courseTitle },
    { key: 'module', label: 'Module', render: (r) => r.moduleTitle },
    { key: 'title', label: tab === 'miniTask' ? 'Task' : 'Project', render: (r) => r.title },
    { key: 'submitted', label: 'Submitted', render: (r) => new Date(r.submittedAt).toLocaleDateString() },
    { key: 'github', label: 'GitHub', render: (r) => (r.githubBranch ? r.githubBranch : r.githubUrl ? 'Linked' : '—') },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge color={statusColor[r.status]}>{r.status}</StatusBadge> },
  ];

  const openRow = (row: QueueRow): void => {
    setOpen(row);
    setFeedback('');
    setScores({});
  };

  const submitOutcome = (outcome: EvaluationStatus): void => {
    if (!open) return;
    if (open.isLive && open.liveTaskId && open.liveVersion) {
      const task = getMiniTaskById(open.liveTaskId);
      if (task) {
        const criteria = task.evaluationCriteriaTemplate.map((c) => ({ label: c.label, score: scores[c.label] ?? Math.round(c.maxScore * 0.8), maxScore: c.maxScore }));
        adminEvaluateMiniTask(open.liveTaskId, open.liveVersion, { criteria, feedback, outcome: outcome === 'Passed' ? 'Passed' : 'Changes Requested', evaluatedAt: new Date().toISOString() });
      }
    } else {
      rosterRepo.submitRosterEvaluation(open.id, outcome, feedback);
    }
    setOpen(undefined);
  };

  const openTask = open?.isLive && open.liveTaskId ? getMiniTaskById(open.liveTaskId) : undefined;

  return (
    <div>
      <PageHeader eyebrow="Review" title="Review Queue" subtitle="Mini Tasks and Major Projects submitted by your students." />

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
              <SectionTitle>GitHub &amp; Submission</SectionTitle>
              <div className="text-sm space-y-1.5">
                {open.githubUrl && (
                  <div>
                    <span className="text-slate-400">Repository: </span>
                    <a href={open.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline">
                      {open.githubUrl}
                    </a>
                  </div>
                )}
                {open.githubBranch && (
                  <div>
                    <span className="text-slate-400">Branch: </span>
                    {open.githubBranch}
                  </div>
                )}
                {open.liveUrl && (
                  <div>
                    <span className="text-slate-400">Live: </span>
                    <a href={open.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline">
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
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                Open the repository to review the actual code before scoring — a commit existing is evidence of activity, not completion.
              </p>
            </Card>

            {openTask && (
              <Card>
                <SectionTitle>Scorecard</SectionTitle>
                <div className="space-y-3">
                  {openTask.evaluationCriteriaTemplate.map((c) => (
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

export default MentorReviewPage;
