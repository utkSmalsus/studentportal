import * as React from 'react';
import { MentorRoute } from '../navigation/types';
import { PageHeader, Card, SectionTitle, MetricTile } from '../../ui/Primitives';
import { UsersIcon, BuildingIcon, ClipboardIcon, AlertIcon } from '../../ui/icons';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as courseRepo from '../../admin/repository/courseRepository';
import * as githubRepo from '../../admin/repository/githubRepository';

const MentorDashboardPage: React.FC<{ mentorId: string; onNavigate: (r: MentorRoute) => void }> = ({ mentorId, onNavigate }) => {
  const students = mentorRepo.getStudentsForMentor(mentorId);
  const batches = mentorRepo.getBatchesForMentor(mentorId);
  const pending = mentorRepo.getPendingEvaluationsForMentor(mentorId);
  const courses = courseRepo.listCourses();

  const behind = students.filter((s) => s.status === 'paused');
  const liveStudent = students.find((s) => s.isLiveDemoStudent);
  const liveActivity = liveStudent ? githubRepo.listActivityForStudent(liveStudent.id).slice(0, 5) : [];

  return (
    <div>
      <PageHeader eyebrow="Mentor" title="Dashboard" subtitle="What needs your attention today." />

      <div className="flex flex-wrap gap-3 mb-8">
        <MetricTile label="My Students" value={students.length} icon={<UsersIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="My Batches" value={batches.length} icon={<BuildingIcon className="w-[18px] h-[18px]" />} accentColor="blue" />
        <MetricTile label="Pending Reviews" value={pending.length} icon={<ClipboardIcon className="w-[18px] h-[18px]" />} accentColor="amber" />
        <MetricTile label="Students Need Attention" value={behind.length} icon={<AlertIcon className="w-[18px] h-[18px]" />} accentColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle action={<button onClick={() => onNavigate({ view: 'review' })} className="text-xs font-semibold text-indigo-600 hover:underline">View all</button>}>
              Pending Reviews
            </SectionTitle>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing waiting on you right now.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-2">Student</th>
                    <th className="py-2">Task</th>
                    <th className="py-2">Course</th>
                    <th className="py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2">{students.find((s) => s.id === p.studentId)?.name}</td>
                      <td className="py-2">{p.title}</td>
                      <td className="py-2">{courses.find((c) => c.id === p.courseId)?.title}</td>
                      <td className="py-2 text-slate-400">{new Date(p.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card>
            <SectionTitle>Students Falling Behind</SectionTitle>
            {behind.length === 0 ? (
              <p className="text-sm text-slate-400">Everyone is on track.</p>
            ) : (
              <ul className="space-y-2.5">
                {behind.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <button onClick={() => onNavigate({ view: 'studentDetail', studentId: s.id })} className="font-medium text-slate-800 hover:underline">
                      {s.name}
                    </button>
                    <span className="text-amber-600 font-medium">Paused</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <SectionTitle>Recent GitHub Activity</SectionTitle>
            {liveActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {liveActivity.map((a) => (
                  <li key={a.id}>
                    <div className="font-medium text-slate-800">
                      {liveStudent?.name} {a.action === 'push' ? 'pushed a commit' : a.action === 'open_pr' ? 'opened a Pull Request' : a.action}
                    </div>
                    <div className="text-xs text-slate-400">
                      {a.repositoryName} {a.branch && `· ${a.branch}`} · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="mt-6">
            <SectionTitle>My Batches</SectionTitle>
            <ul className="space-y-2 text-sm">
              {batches.map((b) => (
                <li key={b.id} className="text-slate-700 font-medium">
                  {b.name}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardPage;
