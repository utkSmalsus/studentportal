import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, ProgressBar, PrimaryButton, SecondaryButton, EmptyState, Tag } from '../../ui/Primitives';
import { CheckIcon, LockIcon, RocketIcon, ClockIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { majorProject, moduleDefs, getModuleById } from '../../data/selectors';

const TextField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1.5 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
    />
  </div>
);

const ProjectPage: React.FC = () => {
  const { state: progress, advanceMilestone, submitProject } = useAppState();
  const capstone = getModuleById(majorProject.moduleId);
  const isLocked = capstone ? !progression.isModuleUnlocked(capstone, moduleDefs, progress) : true;

  const [expandedMilestone, setExpandedMilestone] = useState<string | undefined>();
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');

  if (isLocked && capstone) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-400">Major Project</h1>
        <div className="mt-6">
          <EmptyState
            title="Your capstone unlocks once Frontend is complete"
            description={progression.lockedReason(capstone, moduleDefs)}
            icon={<LockIcon className="w-5 h-5" />}
          />
        </div>
      </div>
    );
  }

  const completedCount = majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length;
  const progressPercent = Math.round((completedCount / majorProject.milestones.length) * 100);
  const currentMilestone = majorProject.milestones.find((m) => progress.project.milestoneStatus[m.id] === 'current');
  const allMilestonesDone = completedCount === majorProject.milestones.length;
  const latestSubmission = progress.project.versions[progress.project.versions.length - 1];

  return (
    <div>
      <PageHeader
        eyebrow="Capstone Project"
        title={majorProject.title}
        subtitle={majorProject.description}
        action={
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{progressPercent}%</div>
            <div className="text-xs text-slate-400">complete</div>
          </div>
        }
      />

      <Card className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-slate-700">Overall Progress</span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5" /> {majorProject.deadlineInDays} days remaining
          </span>
        </div>
        <ProgressBar percent={progressPercent} heightClass="h-2.5" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <SectionTitle>Milestones</SectionTitle>
            <ol className="relative">
              {majorProject.milestones.map((m, i) => {
                const status = progress.project.milestoneStatus[m.id] || 'upcoming';
                const isExpanded = expandedMilestone === m.id;
                const isLast = i === majorProject.milestones.length - 1;
                const next = majorProject.milestones[i + 1];
                const dotColor = status === 'completed' ? 'bg-emerald-500' : status === 'current' ? 'bg-indigo-600' : 'bg-slate-200';

                return (
                  <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-150" style={{ backgroundColor: '#e2e8f0' }} />}
                    <span className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${dotColor} ${status === 'current' ? 'ring-4 ring-indigo-100' : ''}`}>
                      {status === 'completed' ? (
                        <CheckIcon className="w-3.5 h-3.5 text-white" />
                      ) : status === 'upcoming' ? (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? undefined : m.id)}
                        disabled={status === 'upcoming'}
                        className="text-left disabled:cursor-not-allowed"
                      >
                        <span className={`text-[15px] font-semibold ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>{m.title}</span>
                        {status === 'current' && <span className="ml-2 text-xs font-semibold text-indigo-600">In Progress</span>}
                      </button>

                      {isExpanded && status !== 'upcoming' && (
                        <div className="mt-3 text-sm bg-slate-50 rounded-lg border border-slate-200 p-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Objectives</div>
                          <ul className="list-disc pl-5 text-slate-700 space-y-0.5 mb-3.5">
                            {m.objectives.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Deliverables</div>
                          <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                            {m.deliverables.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                          {status === 'current' && (
                            <SecondaryButton className="mt-3.5 text-xs px-3.5 py-2" onClick={() => advanceMilestone(m.id, next?.id)}>
                              Mark Milestone Complete
                            </SecondaryButton>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          {currentMilestone && (
            <Card className="!border-indigo-200 !bg-indigo-50/40">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <RocketIcon className="w-4 h-4" />
                </span>
                <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">Current Milestone</div>
              </div>
              <div className="text-[15px] font-bold text-slate-900">{currentMilestone.title}</div>
              <button onClick={() => setExpandedMilestone(currentMilestone.id)} className="text-sm font-semibold text-indigo-600 hover:underline mt-2">
                View objectives &amp; deliverables &rarr;
              </button>
            </Card>
          )}

          <Card>
            <SectionTitle>Evaluation Criteria</SectionTitle>
            <div className="space-y-2.5">
              {majorProject.evaluationCriteriaTemplate.map((c) => (
                <div key={c.label} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.label}</span>
                  <span className="text-slate-400">/ {c.maxScore}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 pt-3 mt-3 border-t border-slate-100">Scored by your instructor after final submission.</p>
          </Card>
        </div>
      </div>

      {allMilestonesDone && (
        <Card className="mt-6">
          <SectionTitle>Final Submission</SectionTitle>
          {latestSubmission ? (
            <div className="text-sm space-y-1.5">
              <div>
                <span className="text-slate-400">GitHub: </span>
                <a href={latestSubmission.githubUrl} className="text-indigo-600 font-medium hover:underline">
                  {latestSubmission.githubUrl}
                </a>
              </div>
              {latestSubmission.liveUrl && (
                <div>
                  <span className="text-slate-400">Live: </span>
                  <a href={latestSubmission.liveUrl} className="text-indigo-600 font-medium hover:underline">
                    {latestSubmission.liveUrl}
                  </a>
                </div>
              )}
              {latestSubmission.evaluation ? (
                <Tag>{latestSubmission.evaluation.outcome === 'Passed' ? 'Passed final review' : 'Changes requested'}</Tag>
              ) : (
                <Tag>Awaiting instructor evaluation</Tag>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 max-w-lg">
              <TextField label="GitHub Repository" value={githubUrl} onChange={setGithubUrl} />
              <TextField label="Live URL" value={liveUrl} onChange={setLiveUrl} />
              <TextField label="Documentation" value={docsUrl} onChange={setDocsUrl} />
              <PrimaryButton onClick={() => submitProject(githubUrl, liveUrl, docsUrl)} disabled={!githubUrl}>
                Submit Project
              </PrimaryButton>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProjectPage;
