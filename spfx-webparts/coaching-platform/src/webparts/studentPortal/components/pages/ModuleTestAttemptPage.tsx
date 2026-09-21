import * as React from 'react';
import { Route } from '../../navigation/types';
import { EmptyState } from '../../ui/Primitives';
import { useAppState } from '../../state/AppStateContext';
import { getModuleById, getModuleTestById } from '../../data/selectors';
import QuizAttemptPage from './QuizAttemptPage';

const ModuleTestAttemptPage: React.FC<{ moduleId: string; onNavigate: (r: Route) => void }> = ({ moduleId, onNavigate }) => {
  const { submitModuleTest } = useAppState();
  const m = getModuleById(moduleId);
  const test = m?.moduleTestId ? getModuleTestById(m.moduleTestId) : undefined;
  if (!m || !test) return <EmptyState title="Module test not found" />;

  return (
    <QuizAttemptPage
      title={test.title}
      questions={test.questions}
      passingScorePercent={test.passingScorePercent}
      onFinish={(answers) => submitModuleTest(moduleId, test.id, answers)}
      onExit={() => onNavigate({ view: 'moduleDetail', moduleId })}
      onContinue={() => onNavigate({ view: 'moduleDetail', moduleId })}
      continueLabel="Back to Module"
    />
  );
};

export default ModuleTestAttemptPage;
