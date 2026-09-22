import * as React from 'react';
import { PageHeader } from '../../ui/Primitives';
import { AdminTable, AdminColumn } from '../../admin/ui/AdminPrimitives';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as githubRepo from '../../admin/repository/githubRepository';
import { GitHubActivityItem } from '../../admin/types';

const ACTION_LABEL: Record<GitHubActivityItem['action'], string> = {
  push: 'Pushed a commit', commit: 'Committed', create_branch: 'Created a branch', open_pr: 'Opened a Pull Request', merge_pr: 'Merged a Pull Request',
};

const GithubActivityPage: React.FC<{ mentorId: string }> = ({ mentorId }) => {
  const students = mentorRepo.getStudentsForMentor(mentorId);
  const activity = githubRepo.listRecentActivity(students.map((s) => s.id), 50);

  const columns: AdminColumn<GitHubActivityItem>[] = [
    { key: 'student', label: 'Student', render: (a) => students.find((s) => s.id === a.studentId)?.name || '—' },
    { key: 'repo', label: 'Repository', render: (a) => a.repositoryName },
    { key: 'action', label: 'Action', render: (a) => ACTION_LABEL[a.action] },
    { key: 'branch', label: 'Branch', render: (a) => a.branch || '—' },
    { key: 'ref', label: 'Commit / PR', render: (a) => a.sha || (a.prNumber ? `#${a.prNumber}` : '—') },
    { key: 'time', label: 'Time', render: (a) => new Date(a.createdAt).toLocaleString() },
  ];

  return (
    <div>
      <PageHeader eyebrow="Activity" title="GitHub Activity" subtitle="Evidence of work across your students — not a completion signal by itself." />
      <AdminTable columns={columns} rows={activity} rowKey={(a) => a.id} emptyLabel="No GitHub activity recorded yet." />
    </div>
  );
};

export default GithubActivityPage;
