import * as React from 'react';
import { useEffect } from 'react';
import { Route } from '../../navigation/types';
import { BackLink, Card, SectionTitle, StatusPill, PrimaryButton, SecondaryButton, EmptyState } from '../../ui/Primitives';
import { ClockIcon, LockIcon, CheckIcon, AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { getModuleById, getTopicById, getTopicTestByTopicId } from '../../data/selectors';

const VideoEmbed: React.FC<{ youtubeVideoId?: string }> = ({ youtubeVideoId }) =>
  youtubeVideoId ? (
    <div className="relative w-full rounded-lg overflow-hidden bg-slate-900" style={{ paddingTop: '56.25%' }}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
        title="Topic video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  ) : (
    <div className="relative w-full rounded-lg bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
        <ClockIcon className="w-6 h-6" />
        <span className="text-sm font-medium mt-2">Video coming soon</span>
      </div>
    </div>
  );

const TopicDetailPage: React.FC<{ moduleId: string; topicId: string; onNavigate: (r: Route) => void }> = ({ moduleId, topicId, onNavigate }) => {
  const { state: progress, markTopicViewed } = useAppState();
  const m = getModuleById(moduleId);
  const topic = m ? getTopicById(moduleId, topicId) : undefined;
  const test = getTopicTestByTopicId(topicId);

  useEffect(() => {
    if (topic) markTopicViewed(topicId);
  }, [topicId]);

  if (!m || !topic) return <EmptyState title="Topic not found" />;

  if (!progression.canOpenTopic(m, topicId, progress)) {
    return (
      <div>
        <BackLink onClick={() => onNavigate({ view: 'moduleDetail', moduleId })}>Back to {m.title}</BackLink>
        <EmptyState
          title="This topic is locked"
          description={progression.getLockReason(m, 'topic', progress, topic)}
          icon={<LockIcon className="w-5 h-5" />}
        />
      </div>
    );
  }

  const rules = progression.getModuleRules(m);
  const testPassed = progression.isTopicTestPassed(topicId, progress);
  const attempts = progression.getTopicProgress(topicId, progress).testAttempts;
  const lastAttempt = attempts[attempts.length - 1];
  const dailyGateOk = !rules.requireDailyCoding || progression.isDailyCodingGateSatisfied(progress);
  const topicComplete = progression.isTopicCompleted(m, topicId, progress);
  const index = m.topics.findIndex((t) => t.id === topicId);
  const nextTopic = m.topics[index + 1];

  return (
    <div>
      <BackLink onClick={() => onNavigate({ view: 'moduleDetail', moduleId })}>Back to {m.title}</BackLink>

      <div className="flex items-center gap-2.5 mb-1">
        <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
        {topicComplete && <StatusPill color="green">Completed</StatusPill>}
      </div>
      <p className="text-slate-500 mb-6 flex items-center gap-1.5">
        <ClockIcon className="w-3.5 h-3.5" /> ~{topic.estimatedMinutes} min
      </p>

      <Card className="mb-6" padded={false}>
        <div className="p-4 sm:p-5">
          <VideoEmbed youtubeVideoId={topic.youtubeVideoId} />
        </div>
      </Card>

      <Card className="mb-6">
        <SectionTitle>What You&apos;ll Learn</SectionTitle>
        <ul className="text-sm text-slate-600 space-y-1.5">
          {topic.content.whatYoullLearn.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1.5">&bull;</span>
              {p}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-6">
        <SectionTitle>Key Concepts</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {topic.content.keyConcepts.map((c) => (
            <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {c}
            </span>
          ))}
        </div>
      </Card>

      {topic.content.examples.length > 0 && (
        <Card className="mb-6">
          <SectionTitle>Example</SectionTitle>
          <ul className="text-sm text-slate-600 space-y-2">
            {topic.content.examples.map((e) => (
              <li key={e} className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                {e}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {topic.content.notes.length > 0 && (
        <Card className="mb-6">
          <SectionTitle>Notes</SectionTitle>
          <ul className="text-sm text-slate-600 space-y-1.5">
            {topic.content.notes.map((n) => (
              <li key={n} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1.5">&bull;</span>
                {n}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {topic.content.resources.length > 0 && (
        <Card className="mb-6">
          <SectionTitle>Resources</SectionTitle>
          <ul className="text-sm text-slate-600 space-y-1">
            {topic.content.resources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <SectionTitle
          action={!rules.requireTopicTest && <span className="text-xs font-medium text-slate-400">Optional for this module</span>}
        >
          Topic Test
        </SectionTitle>
        {test ? (
          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-slate-600">
                {test.questions.length} questions &middot; {test.passingScorePercent}% to pass
                {lastAttempt && <span className="block text-xs text-slate-400 mt-0.5">Last attempt: {lastAttempt.scorePercent}%</span>}
              </div>
              {testPassed ? (
                <StatusPill color="green">Passed</StatusPill>
              ) : (
                <PrimaryButton onClick={() => onNavigate({ view: 'topicTestAttempt', moduleId, topicId })}>
                  {lastAttempt ? 'Retake Topic Test' : 'Start Topic Test'}
                </PrimaryButton>
              )}
            </div>

            {topicComplete && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                {!dailyGateOk ? (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <AlertIcon className="w-[18px] h-[18px] text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Daily Coding Required</div>
                      <p className="text-sm text-amber-700 mt-0.5">Complete today&apos;s coding challenge before continuing your learning journey.</p>
                      <SecondaryButton className="mt-2.5" onClick={() => onNavigate({ view: 'coding' })}>
                        Go to Daily Coding &rarr;
                      </SecondaryButton>
                    </div>
                  </div>
                ) : nextTopic ? (
                  <PrimaryButton onClick={() => onNavigate({ view: 'topicDetail', moduleId, topicId: nextTopic.id })}>
                    Continue to Next Topic <CheckIcon className="w-4 h-4" />
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => onNavigate({ view: 'moduleDetail', moduleId })}>
                    All Topics Complete — Back to Module
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No test configured for this topic yet.</p>
        )}
      </Card>
    </div>
  );
};

export default TopicDetailPage;
