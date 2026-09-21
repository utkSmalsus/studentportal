import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, PrimaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { assessmentStatusMeta } from '../../ui/statusMeta';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { getAssessmentById, getModuleById } from '../../data/selectors';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="font-semibold text-gray-900">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const AssessmentDetailPage: React.FC<{ assessmentId: string; onNavigate: (r: Route) => void }> = ({ assessmentId, onNavigate }) => {
  const { state: progress } = useAppState();
  const a = getAssessmentById(assessmentId);
  if (!a) return <EmptyState title="Assessment not found" />;

  const module = getModuleById(a.moduleId);
  const unlocked = module ? progression.isAssessmentUnlocked(module, progress) : true;

  if (!unlocked && module) {
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'moduleDetail', moduleId: module.id })}>Back to {module.title}</BackLink>
        <h1 className="text-2xl font-semibold text-gray-400">{a.title}</h1>
        <EmptyState title="This assessment is locked" description={progression.assessmentLockedReason(module, progress)} />
      </div>
    );
  }

  const entry = progress.assessments[a.id];
  const attempts = entry?.attempts || [];
  const bestScore = attempts.length ? Math.max(...attempts.map((att) => att.scorePercent)) : undefined;
  const latest = attempts[attempts.length - 1];
  const status = progression.assessmentUiStatus(a.id, progress);
  const meta = assessmentStatusMeta[status];
  const attempted = attempts.length > 0;
  const canRetake = attempted && !latest.passed && attempts.length < a.attemptsAllowed;

  return (
    <div>
      <BackLink onClick={() => onNavigate(module ? { view: 'moduleDetail', moduleId: module.id } : { view: 'journey' })}>
        Back to {module ? module.title : 'Journey'}
      </BackLink>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{a.title}</h1>
        <StatusPill color={meta.color}>{meta.label}</StatusPill>
      </div>

      <Divider />

      <Eyebrow>Topics Covered</Eyebrow>
      <div className="flex gap-2 flex-wrap">
        {a.topics.map((t) => (
          <StatusPill key={t} color="gray">
            {t}
          </StatusPill>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
        <Stat label="Questions" value={String(a.questions.length)} />
        <Stat label="Time Limit" value={`${a.timeLimitMinutes} min`} />
        <Stat label="Passing Score" value={`${a.passingScorePercent}%`} />
        <Stat label="Attempts" value={`${attempts.length} / ${a.attemptsAllowed}`} />
      </div>

      {attempted ? (
        <>
          <Divider />
          <div className="text-3xl font-semibold text-gray-900">{bestScore}%</div>
          <StatusPill color={meta.color}>{meta.label}</StatusPill>

          {(latest.strongTopics.length > 0 || latest.weakTopics.length > 0) && (
            <div className="grid grid-cols-2 gap-6 mt-5">
              {latest.strongTopics.length > 0 && (
                <div>
                  <Eyebrow>Strong Areas</Eyebrow>
                  <ul className="space-y-1 text-sm">
                    {latest.strongTopics.map((s) => (
                      <li key={s} className="text-emerald-600">
                        {'✓'} {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {latest.weakTopics.length > 0 && (
                <div>
                  <Eyebrow>Needs Improvement</Eyebrow>
                  <ul className="space-y-1 text-sm">
                    {latest.weakTopics.map((s) => (
                      <li key={s} className="text-amber-600">
                        {'⚠'} {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Divider />
          <Eyebrow>Attempt History</Eyebrow>
          <div className="space-y-1.5">
            {attempts.map((att) => (
              <div key={att.attemptNo} className="flex justify-between text-sm">
                <span className="text-gray-600">Attempt {att.attemptNo}</span>
                <span className={`font-medium ${att.passed ? 'text-emerald-600' : 'text-gray-900'}`}>{att.scorePercent}%</span>
              </div>
            ))}
          </div>

          {latest.passed && module && (
            <PrimaryButton className="mt-5" onClick={() => onNavigate({ view: 'moduleDetail', moduleId: module.id })}>
              Continue Journey
            </PrimaryButton>
          )}
          {canRetake && (
            <PrimaryButton className="mt-5" onClick={() => onNavigate({ view: 'assessmentAttempt', assessmentId: a.id })}>
              Retake Assessment
            </PrimaryButton>
          )}
        </>
      ) : (
        <PrimaryButton className="mt-6" onClick={() => onNavigate({ view: 'assessmentAttempt', assessmentId: a.id })}>
          Start Assessment
        </PrimaryButton>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
