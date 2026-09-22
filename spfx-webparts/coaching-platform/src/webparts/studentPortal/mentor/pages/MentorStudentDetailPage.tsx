import * as React from 'react';
import { MentorRoute } from '../navigation/types';
import { BackLink, Card, SectionTitle, StatusPill, EmptyState } from '../../ui/Primitives';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as courseRepo from '../../admin/repository/courseRepository';
import * as githubRepo from '../../admin/repository/githubRepository';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs as activeModuleDefs, course as activeCourse, getMiniTaskById, getAssessmentById } from '../../data/selectors';

const MentorStudentDetailPage: React.FC<{ mentorId: string; studentId: string; onNavigate: (r: MentorRoute) => void }> = ({ mentorId, studentId, onNavigate }) => {
  const { state: liveProgress } = useAppState();
  const student = mentorRepo.getStudentsForMentor(mentorId).find((s) => s.id === studentId);
  const courses = courseRepo.listCourses();

  if (!student) return <EmptyState title="Student not found or not assigned to you" />;

  const isLive = !!student.isLiveDemoStudent;
  const connection = githubRepo.getConnection(studentId);
  const repoLink = githubRepo.getRepositoryLink(studentId, student.courseId);
  const snapshot = repoLink ? githubRepo.getRepository(repoLink.owner, repoLink.repositoryName.split('/')[1]) : undefined;
  const activity = githubRepo.listActivityForStudent(studentId);

  const overallProgress = isLive ? progression.courseOverallProgress(activeCourse, activeModuleDefs, liveProgress) : 0;
  const current = isLive ? progression.currentModule(activeCourse, activeModuleDefs, liveProgress) : undefined;

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'myStudents' })}>My Students</BackLink>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">{student.name.charAt(0)}</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-500">
            {student.email} &middot; {courses.find((c) => c.id === student.courseId)?.title}
          </p>
        </div>
        <StatusPill color={student.status === 'active' ? 'green' : student.status === 'paused' ? 'amber' : 'gray'} className="ml-auto">
          {student.status}
        </StatusPill>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle>Progress</SectionTitle>
            {isLive ? (
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-slate-400">Overall Progress</dt><dd className="text-lg font-bold text-slate-900">{overallProgress}%</dd></div>
                <div><dt className="text-slate-400">Current Module</dt><dd className="text-lg font-bold text-slate-900">{current?.title || 'Complete'}</dd></div>
                <div><dt className="text-slate-400">Coding Streak</dt><dd className="text-lg font-bold text-slate-900">{liveProgress.codingStreak.current} days</dd></div>
                <div><dt className="text-slate-400">Mini Tasks Passed</dt><dd className="text-lg font-bold text-slate-900">{Object.keys(liveProgress.miniTasks).filter((id) => liveProgress.miniTasks[id].status === 'Passed').length}</dd></div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">No live progress session for this roster student in this environment.</p>
            )}
          </Card>

          {isLive && (
            <Card>
              <SectionTitle>Journey</SectionTitle>
              <ul className="space-y-1.5">
                {activeCourse.moduleOrder.map((id) => {
                  const m = activeModuleDefs.find((mm) => mm.id === id);
                  if (!m) return null;
                  const status = progression.getModuleStatus(m, activeModuleDefs, liveProgress);
                  const color = status === 'completed' ? 'green' : status === 'current' ? 'blue' : 'gray';
                  return (
                    <li key={id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-700">{m.title}</span>
                      <StatusPill color={color}>{status}</StatusPill>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {isLive && (
            <Card>
              <SectionTitle>Mini Tasks</SectionTitle>
              <ul className="space-y-2 text-sm">
                {Object.keys(liveProgress.miniTasks).map((taskId) => {
                  const task = getMiniTaskById(taskId);
                  const entry = liveProgress.miniTasks[taskId];
                  if (!task || entry.status === 'Not Started') return null;
                  const latest = entry.versions[entry.versions.length - 1];
                  return (
                    <li key={taskId} className="flex items-center justify-between">
                      <span className="text-slate-700">{task.title}</span>
                      <span className="flex items-center gap-2">
                        {latest?.evaluation && <span className="text-slate-400">{latest.evaluation.criteria.reduce((s, c) => s + c.score, 0)} pts</span>}
                        <StatusPill color={entry.status === 'Passed' ? 'green' : entry.status === 'Changes Requested' ? 'amber' : 'blue'}>{entry.status}</StatusPill>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {isLive && (
            <Card>
              <SectionTitle>Assessments</SectionTitle>
              <ul className="space-y-2 text-sm">
                {Object.keys(liveProgress.assessments).map((assessmentId) => {
                  const assessment = getAssessmentById(assessmentId);
                  const entry = liveProgress.assessments[assessmentId];
                  if (!assessment || entry.attempts.length === 0) return null;
                  const latest = entry.attempts[entry.attempts.length - 1];
                  return (
                    <li key={assessmentId} className="flex items-center justify-between">
                      <span className="text-slate-700">{assessment.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-400">{latest.scorePercent}%</span>
                        <StatusPill color={latest.passed ? 'green' : 'amber'}>{latest.passed ? 'Passed' : 'Not yet passed'}</StatusPill>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>GitHub</SectionTitle>
            {connection ? (
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <StatusPill color="green">Connected</StatusPill>
                  <span className="text-slate-700 font-medium">{connection.username}</span>
                </div>
                {repoLink && (
                  <div>
                    <div className="text-slate-400 text-xs">Repository</div>
                    <a href={`https://github.com/${repoLink.repositoryName}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline">
                      {repoLink.repositoryName}
                    </a>
                  </div>
                )}
                {snapshot && (
                  <>
                    <div className="text-slate-500">{snapshot.commits.length} commits &middot; {snapshot.pullRequests.filter((p) => p.status === 'open').length} open PRs</div>
                    <div className="text-xs text-slate-400">
                      Last push: {snapshot.commits.length > 0 ? new Date(snapshot.commits[snapshot.commits.length - 1].date).toLocaleString() : '—'}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not connected.</p>
            )}
          </Card>

          {snapshot && (
            <Card>
              <SectionTitle>Recent Commits</SectionTitle>
              <ul className="space-y-2.5 text-sm">
                {snapshot.commits.slice(-5).reverse().map((c) => (
                  <li key={c.sha}>
                    <a href={c.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-indigo-600 hover:underline">
                      {c.sha}
                    </a>
                    <div className="text-slate-700">{c.message}</div>
                    <div className="text-xs text-slate-400">{c.branch} &middot; {new Date(c.date).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {snapshot && snapshot.pullRequests.length > 0 && (
            <Card>
              <SectionTitle>Pull Requests</SectionTitle>
              <ul className="space-y-2 text-sm">
                {snapshot.pullRequests.map((pr) => (
                  <li key={pr.number} className="flex items-center justify-between">
                    <a href={pr.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                      #{pr.number} {pr.title}
                    </a>
                    <StatusPill color={pr.status === 'open' ? 'blue' : pr.status === 'merged' ? 'green' : 'gray'}>{pr.status}</StatusPill>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <SectionTitle>Activity Timeline</SectionTitle>
            {activity.length === 0 && (isLive ? liveProgress.notifications.length === 0 : true) ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="text-slate-600">
                    GitHub: {a.action} {a.branch ? `on ${a.branch}` : ''} — {new Date(a.createdAt).toLocaleDateString()}
                  </li>
                ))}
                {isLive &&
                  liveProgress.notifications.slice(0, 6).map((n) => (
                    <li key={n.id} className="text-slate-600">
                      {n.message} — {new Date(n.date).toLocaleDateString()}
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorStudentDetailPage;
