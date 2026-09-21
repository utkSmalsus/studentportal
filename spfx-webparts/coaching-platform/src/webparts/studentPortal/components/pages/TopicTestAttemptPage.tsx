import * as React from 'react';
import { Route } from '../../navigation/types';
import { EmptyState } from '../../ui/Primitives';
import { useAppState } from '../../state/AppStateContext';
import { getTopicById, getTopicTestByTopicId } from '../../data/selectors';
import QuizAttemptPage from './QuizAttemptPage';

const TopicTestAttemptPage: React.FC<{ moduleId: string; topicId: string; onNavigate: (r: Route) => void }> = ({ moduleId, topicId, onNavigate }) => {
  const { submitTopicTest } = useAppState();
  const topic = getTopicById(moduleId, topicId);
  const test = getTopicTestByTopicId(topicId);
  if (!topic || !test) return <EmptyState title="Topic test not found" />;

  return (
    <QuizAttemptPage
      title={topic.title}
      questions={test.questions}
      passingScorePercent={test.passingScorePercent}
      onFinish={(answers) => submitTopicTest(topicId, answers)}
      onExit={() => onNavigate({ view: 'topicDetail', moduleId, topicId })}
      onContinue={() => onNavigate({ view: 'topicDetail', moduleId, topicId })}
      continueLabel="Continue"
    />
  );
};

export default TopicTestAttemptPage;
