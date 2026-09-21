import * as React from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, PrimaryButton, StatusPill, EmptyState, Tag } from '../../ui/Primitives';
import { assessmentStatusMeta } from '../../ui/statusMeta';
import { ClockIcon, ClipboardIcon, CheckIcon, AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { getAssessmentById, getModuleById } from '../../data/selectors';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 text-center">
    <div className="font-bold text-slate-900">{value}</div>
    <div className="text-slate-400 text-xs mt-0.5">{label}</div>
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
        <h1 className="text-2xl font-bold text-slate-400">{a.title}</h1>
        <div className="mt-6">
          <EmptyState title="This assessment is locked" description={progression.assessmentLockedReason(module, progress)} icon={<ClockIcon className="w-5 h-5" />} />
        </div>
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

      <div className="flex items-center gap-3 mb-1">
        <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <ClipboardIcon className="w-5 h-5" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">{a.title}</h1>
      </div>

      <div className="flex gap-2 flex-wrap mt-4 mb-6">
        {a.topics.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Questions" value={String(a.questions.length)} />
        <Stat label="Time Limit" value={`${a.timeLimitMinutes} min`} />
        <Stat label="Passing Score" value={`${a.passingScorePercent}%`} />
        <Stat label="Attempts" value={`${attempts.length} / ${a.attemptsAllowed}`} />
      </div>

      {attempted ? (
        <Card>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-24 h-24 rounded-full border-[6px] border-slate-100 flex items-center justify-center relative shrink-0">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${latest.passed ? '#10b981' : '#f59e0b'} ${bestScore}%, transparent 0)`,
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))',
                }}
              />
              <span className="text-xl font-bold text-slate-900 relative">{bestScore}%</span>
            </div>
            <div>
              <StatusPill color={meta.color} className="text-sm px-3 py-1.5">
                {meta.label}
              </StatusPill>
              <div className="text-sm text-slate-400 mt-2">Best score across {attempts.length} attempt{attempts.length > 1 ? 's' : ''}</div>
            </div>
          </div>

          {(latest.strongTopics.length > 0 || latest.weakTopics.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-7">
              {latest.strongTopics.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-2 flex items-center gap-1.5">
                    <CheckIcon className="w-3.5 h-3.5" /> Strong Areas
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {latest.strongTopics.map((s) => (
                      <li key={s} className="text-slate-700">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {latest.weakTopics.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2 flex items-center gap-1.5">
                    <AlertIcon className="w-3.5 h-3.5" /> Needs Improvement
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {latest.weakTopics.map((s) => (
                      <li key={s} className="text-slate-700">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 pt-6 border-t border-slate-100">
            <SectionTitle>Attempt History</SectionTitle>
            <div className="space-y-2">
              {attempts.map((att) => (
                <div key={att.attemptNo} className="flex justify-between text-sm">
                  <span className="text-slate-500">Attempt {att.attemptNo}</span>
                  <span className={`font-semibold ${att.passed ? 'text-emerald-600' : 'text-slate-900'}`}>{att.scorePercent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {latest.passed && module && (
              <PrimaryButton onClick={() => onNavigate({ view: 'moduleDetail', moduleId: module.id })}>Continue Journey</PrimaryButton>
            )}
            {canRetake && <PrimaryButton onClick={() => onNavigate({ view: 'assessmentAttempt', assessmentId: a.id })}>Retake Assessment</PrimaryButton>}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-10">
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            You&apos;ll have {a.timeLimitMinutes} minutes to answer {a.questions.length} questions. You need {a.passingScorePercent}% to pass.
          </p>
          <PrimaryButton onClick={() => onNavigate({ view: 'assessmentAttempt', assessmentId: a.id })}>Start Assessment</PrimaryButton>
        </Card>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
