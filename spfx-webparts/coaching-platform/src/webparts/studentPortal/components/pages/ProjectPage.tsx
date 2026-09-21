import * as React from 'react';
import { useState } from 'react';
import { Divider, Eyebrow, ProgressBar, PrimaryButton, SecondaryButton, EmptyState } from '../../ui/Primitives';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { majorProject, moduleDefs, getModuleById } from '../../data/selectors';

const milestoneIcon = (status: string): string => (status === 'completed' ? '✓' : status === 'current' ? '●' : '○');
const milestoneColor = (status: string): string =>
  status === 'completed' ? 'text-emerald-600' : status === 'current' ? 'text-blue-600' : 'text-gray-400';

const TextField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
        <h1 className="text-2xl font-semibold text-gray-400">Major Project</h1>
        <EmptyState title="Your capstone unlocks once Frontend is complete" description={progression.lockedReason(capstone, moduleDefs)} />
      </div>
    );
  }

  const completedCount = majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length;
  const progressPercent = Math.round((completedCount / majorProject.milestones.length) * 100);
  const currentMilestone = majorProject.milestones.find((m) => progress.project.milestoneStatus[m.id] === 'current');
  const allMilestonesDone = completedCount === majorProject.milestones.length;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{majorProject.title}</h1>
      <p className="text-gray-500 mt-1">Course Capstone</p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={progressPercent} color="blue" heightClass="h-2.5" />
        </div>
        <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">Deadline: {majorProject.deadlineInDays} days</p>

      <Divider />

      <Eyebrow>Milestones</Eyebrow>
      <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
        {majorProject.milestones.map((m, i) => {
          const status = progress.project.milestoneStatus[m.id] || 'upcoming';
          const isExpanded = expandedMilestone === m.id;
          const next = majorProject.milestones[i + 1];
          return (
            <div key={m.id} className="py-2.5">
              <button
                onClick={() => setExpandedMilestone(isExpanded ? undefined : m.id)}
                disabled={status === 'upcoming'}
                className="w-full flex items-center gap-3 text-left disabled:cursor-not-allowed"
              >
                <span className={`w-4 text-center font-medium ${milestoneColor(status)}`}>{milestoneIcon(status)}</span>
                <span className={status === 'upcoming' ? 'text-gray-400 text-sm' : 'text-gray-800 text-sm'}>{m.title}</span>
              </button>
              {isExpanded && status !== 'upcoming' && (
                <div className="pl-7 pt-2 pb-1 text-sm">
                  <div className="text-xs text-gray-400 mb-1">Objectives</div>
                  <ul className="list-disc pl-5 text-gray-700 space-y-0.5 mb-3">
                    {m.objectives.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-400 mb-1">Deliverables</div>
                  <ul className="list-disc pl-5 text-gray-700 space-y-0.5">
                    {m.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  {status === 'current' && (
                    <SecondaryButton className="mt-3" onClick={() => advanceMilestone(m.id, next?.id)}>
                      Mark Milestone Complete
                    </SecondaryButton>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentMilestone && (
        <>
          <Divider />
          <Eyebrow>Current Milestone</Eyebrow>
          <div className="text-lg font-medium text-gray-900">{currentMilestone.title}</div>
          <button onClick={() => setExpandedMilestone(currentMilestone.id)} className="text-sm text-blue-600 hover:underline mt-1">
            View objectives &amp; deliverables &rarr;
          </button>
        </>
      )}

      {allMilestonesDone && (
        <>
          <Divider />
          <Eyebrow>Final Submission</Eyebrow>
          {progress.project.submission ? (
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-400">GitHub: </span>
                <a href={progress.project.submission.githubUrl} className="text-blue-600 hover:underline">{progress.project.submission.githubUrl}</a>
              </div>
              {progress.project.submission.liveUrl && (
                <div>
                  <span className="text-gray-400">Live: </span>
                  <a href={progress.project.submission.liveUrl} className="text-blue-600 hover:underline">{progress.project.submission.liveUrl}</a>
                </div>
              )}
              <p className="text-gray-400 mt-3">Submitted — awaiting instructor evaluation.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-lg">
              <TextField label="GitHub Repository" value={githubUrl} onChange={setGithubUrl} />
              <TextField label="Live URL" value={liveUrl} onChange={setLiveUrl} />
              <TextField label="Documentation" value={docsUrl} onChange={setDocsUrl} />
              <PrimaryButton onClick={() => submitProject(githubUrl, liveUrl, docsUrl)} disabled={!githubUrl}>
                Submit Project
              </PrimaryButton>
            </div>
          )}
        </>
      )}

      <Divider />

      <Eyebrow>Evaluation Criteria</Eyebrow>
      <div className="space-y-2.5 max-w-lg">
        {majorProject.evaluationCriteriaTemplate.map((c) => (
          <div key={c.label} className="flex justify-between text-sm">
            <span className="text-gray-700">{c.label}</span>
            <span className="text-gray-400">out of {c.maxScore}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-1">Scored by your instructor after final submission.</p>
      </div>
    </div>
  );
};

export default ProjectPage;
