import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Divider, Eyebrow, PrimaryButton, StatusPill, EmptyState } from '../../ui/Primitives';
import { assessmentStatusMeta } from '../../ui/statusMeta';
import { getAssessmentById } from '../../data/selectors';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="font-semibold text-gray-900">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const AssessmentDetailPage: React.FC<{ assessmentId: string; onNavigate: (r: Route) => void }> = ({ assessmentId, onNavigate }) => {
  const a = getAssessmentById(assessmentId);
  if (!a) return <EmptyState title="Assessment not found" />;

  const bestScore = a.attempts.length ? Math.max(...a.attempts.map((att) => att.scorePercent)) : undefined;
  const meta = assessmentStatusMeta[a.status];
  const attempted = a.attempts.length > 0;

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'journey' })}>Back to Journey</BackLink>

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
        <Stat label="Questions" value={String(a.totalQuestions)} />
        <Stat label="Time Limit" value={`${a.timeLimitMinutes} min`} />
        <Stat label="Passing Score" value={`${a.passingScorePercent}%`} />
        <Stat label="Attempts" value={`${a.attempts.length} / ${a.attemptsAllowed}`} />
      </div>

      {attempted ? (
        <>
          <Divider />
          <div className="text-3xl font-semibold text-gray-900">{bestScore}%</div>
          <StatusPill color={meta.color}>{meta.label}</StatusPill>

          {(a.strongAreas.length > 0 || a.needsImprovement.length > 0) && (
            <div className="grid grid-cols-2 gap-6 mt-5">
              {a.strongAreas.length > 0 && (
                <div>
                  <Eyebrow>Strong Areas</Eyebrow>
                  <ul className="space-y-1 text-sm">
                    {a.strongAreas.map((s) => (
                      <li key={s} className="text-emerald-600">
                        {'✓'} {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {a.needsImprovement.length > 0 && (
                <div>
                  <Eyebrow>Needs Improvement</Eyebrow>
                  <ul className="space-y-1 text-sm">
                    {a.needsImprovement.map((s) => (
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
            {a.attempts.map((att) => (
              <div key={att.attemptNo} className="flex justify-between text-sm">
                <span className="text-gray-600">Attempt {att.attemptNo}</span>
                <span className="font-medium text-gray-900">{att.scorePercent}%</span>
              </div>
            ))}
          </div>

          {a.status === 'failed' && a.attempts.length < a.attemptsAllowed && (
            <PrimaryButton className="mt-5">Retake Assessment</PrimaryButton>
          )}
        </>
      ) : (
        <PrimaryButton className="mt-6">Start Assessment</PrimaryButton>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
