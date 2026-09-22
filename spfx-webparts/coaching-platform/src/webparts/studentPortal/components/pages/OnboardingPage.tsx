import * as React from 'react';
import { useState } from 'react';
import { Card, PrimaryButton, SecondaryButton, ProgressBar, StatusPill } from '../../ui/Primitives';
import * as courseRepo from '../../admin/repository/courseRepository';
import * as rosterRepo from '../../admin/repository/rosterRepository';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as githubRepo from '../../admin/repository/githubRepository';
import { CourseMeta } from '../../admin/types';

const STEPS = ['Personal Information', 'Course & Batch', 'Mentor', 'GitHub', 'Repository', 'Confirmation'];

const StepShell: React.FC<{ step: number; total: number; title: string; children: React.ReactNode; footer: React.ReactNode }> = ({ step, total, title, children, footer }) => (
  <div className="max-w-xl mx-auto py-10">
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>
          Step {step + 1} of {total}
        </span>
        <span>{STEPS[step]}</span>
      </div>
      <ProgressBar percent={((step + 1) / total) * 100} />
    </div>
    <Card>
      <h1 className="text-lg font-bold text-slate-900 mb-5">{title}</h1>
      {children}
    </Card>
    <div className="flex items-center justify-between mt-5">{footer}</div>
  </div>
);

const fieldClass = 'w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400';

const OnboardingPage: React.FC<{ studentId: string; onComplete: () => void }> = ({ studentId, onComplete }) => {
  const student = rosterRepo.getStudent(studentId);
  const publishedCourses = courseRepo.listCourses().filter((c) => c.status === 'published');

  const [step, setStep] = useState(0);
  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [courseId, setCourseId] = useState(student?.courseId || publishedCourses[0]?.id || '');
  const [batchId, setBatchId] = useState(student?.batchId || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [githubUsername, setGithubUsername] = useState('');
  const [repoChoice, setRepoChoice] = useState<'existing' | 'new'>('new');
  const [existingRepo, setExistingRepo] = useState('');
  const [newRepoName, setNewRepoName] = useState('mern-training');

  if (!student) return null;

  const courseMeta: CourseMeta | undefined = courseRepo.getCourseMeta(courseId);
  const githubEnabled = !!courseMeta?.githubSettings.enabled;
  const githubRequired = githubEnabled && courseMeta!.githubSettings.requiredForOnboarding;
  const batches = rosterRepo.listBatches().filter((b) => b.courseId === courseId);
  const selectedBatch = batches.find((b) => b.id === batchId);
  const mentor = selectedBatch?.primaryMentorId ? mentorRepo.getMentor(selectedBatch.primaryMentorId) : undefined;
  const connection = githubRepo.getConnection(studentId);
  const existingRepos = githubRepo.listRepositories(studentId);
  const repoLink = githubRepo.getRepositoryLink(studentId, courseId);

  // Skip the GitHub/Repository steps entirely for a course that doesn't use GitHub.
  const effectiveSteps = githubEnabled ? STEPS : STEPS.filter((s) => s !== 'GitHub' && s !== 'Repository');
  const stepIndex = effectiveSteps.indexOf(STEPS[step]);

  const isSkippable = (i: number): boolean => !githubEnabled && (STEPS[i] === 'GitHub' || STEPS[i] === 'Repository');
  const next = (): void => {
    let s = step + 1;
    for (; isSkippable(s); s += 1) { /* skip GitHub/Repository steps for non-GitHub courses */ }
    setStep(Math.min(STEPS.length - 1, s));
  };
  const back = (): void => {
    let s = step - 1;
    for (; s >= 0 && isSkippable(s); s -= 1) { /* skip GitHub/Repository steps for non-GitHub courses */ }
    setStep(Math.max(0, s));
  };

  const finish = (): void => {
    rosterRepo.updateStudent(studentId, { name, email, phone, courseId, batchId, onboardingComplete: true });
    rosterRepo.enrollStudent({ studentId, courseId, batchId, startDate, expectedCompletion: startDate });
    onComplete();
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-[720px] px-5">
      {step === 0 && (
        <StepShell
          step={stepIndex}
          total={effectiveSteps.length}
          title="Personal Information"
          footer={<div />}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Name</label>
              <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
              <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone</label>
              <input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </StepShell>
      )}

      {step === 0 && (
        <div className="max-w-xl mx-auto flex justify-end -mt-4">
          <PrimaryButton onClick={next} disabled={!name.trim() || !email.trim()}>
            Continue
          </PrimaryButton>
        </div>
      )}

      {step === 1 && (
        <StepShell step={stepIndex} total={effectiveSteps.length} title="Course & Batch" footer={<div />}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Course</label>
              <select className={fieldClass} value={courseId} onChange={(e) => { setCourseId(e.target.value); setBatchId(''); }}>
                {publishedCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Batch</label>
              <select className={fieldClass} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                <option value="">—</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Start Date</label>
              <input className={fieldClass} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
        </StepShell>
      )}
      {step === 1 && (
        <div className="max-w-xl mx-auto flex justify-between -mt-4">
          <SecondaryButton onClick={back}>Back</SecondaryButton>
          <PrimaryButton onClick={next} disabled={!courseId || !batchId}>
            Continue
          </PrimaryButton>
        </div>
      )}

      {step === 2 && (
        <StepShell step={stepIndex} total={effectiveSteps.length} title="Your Mentor" footer={<div />}>
          {mentor ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold">{mentor.name.charAt(0)}</div>
              <div>
                <div className="text-base font-bold text-slate-900">{mentor.name}</div>
                <div className="text-sm text-slate-500">{mentor.specialization}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No mentor assigned to this batch yet — your admin will assign one shortly.</p>
          )}
          <p className="text-xs text-slate-400 mt-4">Your mentor is assigned by your batch — this isn&apos;t something you choose directly.</p>
        </StepShell>
      )}
      {step === 2 && (
        <div className="max-w-xl mx-auto flex justify-between -mt-4">
          <SecondaryButton onClick={back}>Back</SecondaryButton>
          <PrimaryButton onClick={next}>Continue</PrimaryButton>
        </div>
      )}

      {step === 3 && githubEnabled && (
        <>
          <StepShell step={stepIndex} total={effectiveSteps.length} title="Connect GitHub" footer={<div />}>
            <p className="text-sm text-slate-600 mb-4">
              Your course work will be submitted through GitHub so your mentor can review your progress, commits and project work.
            </p>
            {connection ? (
              <div className="flex items-center gap-2">
                <StatusPill color="green">Connected</StatusPill>
                <span className="text-sm font-medium text-slate-800">{connection.username}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input className={fieldClass} value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="Your GitHub username" />
                <PrimaryButton onClick={() => githubRepo.connectAccount(studentId, githubUsername || `${name.toLowerCase().replace(/\s+/g, '-')}`)} disabled={!githubUsername.trim()}>
                  Connect GitHub
                </PrimaryButton>
              </div>
            )}
          </StepShell>
          <div className="max-w-xl mx-auto flex justify-between -mt-4">
            <SecondaryButton onClick={back}>Back</SecondaryButton>
            <PrimaryButton onClick={next} disabled={githubRequired && !connection}>
              Continue
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 4 && githubEnabled && (
        <>
          <StepShell step={stepIndex} total={effectiveSteps.length} title="Training Repository" footer={<div />}>
            {repoLink ? (
              <div className="text-sm">
                <StatusPill color="green">Linked</StatusPill>
                <div className="mt-2 font-medium text-slate-800">{repoLink.repositoryName}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setRepoChoice('new')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${repoChoice === 'new' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}
                  >
                    Create Training Repository
                  </button>
                  <button
                    onClick={() => setRepoChoice('existing')}
                    disabled={existingRepos.length === 0}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-40 ${repoChoice === 'existing' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}
                  >
                    Select Existing Repository
                  </button>
                </div>
                {repoChoice === 'new' ? (
                  <div className="space-y-2">
                    <input className={fieldClass} value={newRepoName} onChange={(e) => setNewRepoName(e.target.value)} />
                    <PrimaryButton onClick={() => githubRepo.createRepository(studentId, courseId, newRepoName)} disabled={!newRepoName.trim()}>
                      Create Repository
                    </PrimaryButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select className={fieldClass} value={existingRepo} onChange={(e) => setExistingRepo(e.target.value)}>
                      <option value="">—</option>
                      {existingRepos.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.owner}/{r.name}
                        </option>
                      ))}
                    </select>
                    <PrimaryButton onClick={() => githubRepo.linkExistingRepository(studentId, courseId, existingRepo)} disabled={!existingRepo}>
                      Link Repository
                    </PrimaryButton>
                  </div>
                )}
              </div>
            )}
          </StepShell>
          <div className="max-w-xl mx-auto flex justify-between -mt-4">
            <SecondaryButton onClick={back}>Back</SecondaryButton>
            <PrimaryButton onClick={next} disabled={courseMeta!.githubSettings.trainingRepositoryRequired && !repoLink}>
              Continue
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <StepShell step={effectiveSteps.length - 1} total={effectiveSteps.length} title="Confirmation" footer={<div />}>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Course</dt><dd className="font-semibold text-slate-900">{courseRepo.getCourseMeta(courseId)?.title}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Batch</dt><dd className="font-semibold text-slate-900">{selectedBatch?.name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Mentor</dt><dd className="font-semibold text-slate-900">{mentor?.name || '—'}</dd></div>
              {githubEnabled && (
                <>
                  <div className="flex justify-between"><dt className="text-slate-400">GitHub Account</dt><dd className="font-semibold text-slate-900">{connection?.username || 'Not connected'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Training Repository</dt><dd className="font-semibold text-slate-900">{repoLink?.repositoryName || '—'}</dd></div>
                </>
              )}
            </dl>
          </StepShell>
          <div className="max-w-xl mx-auto flex justify-between -mt-4">
            <SecondaryButton onClick={back}>Back</SecondaryButton>
            <PrimaryButton onClick={finish}>Complete Onboarding</PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingPage;
