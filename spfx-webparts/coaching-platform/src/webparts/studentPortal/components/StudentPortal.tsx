import * as React from 'react';
import { useState, useEffect } from 'react';
import type { IStudentPortalProps } from './IStudentPortalProps';
import { useAppState } from '../state/AppStateContext';
import NavShell from '../navigation/NavShell';
import { Route } from '../navigation/types';
import HomePage from './pages/HomePage';
import JourneyPage from './pages/JourneyPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import TopicDetailPage from './pages/TopicDetailPage';
import TopicTestAttemptPage from './pages/TopicTestAttemptPage';
import ModuleTestAttemptPage from './pages/ModuleTestAttemptPage';
import CodingPage from './pages/CodingPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import AssessmentAttemptPage from './pages/AssessmentAttemptPage';
import ProjectPage from './pages/ProjectPage';
import PerformancePage from './pages/PerformancePage';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import { useStudent, useCourseMeta } from '../hooks';

export const StudentPortalShell: React.FC<IStudentPortalProps & { onOpenAdmin?: () => void }> = ({ userDisplayName, onOpenAdmin }) => {
  const { studentId, courseId } = useAppState();
  const { data: student } = useStudent(studentId);
  const { data: courseMeta } = useCourseMeta(courseId);
  const [route, setRoute] = useState<Route>({ view: 'home' });
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    if (student && student.onboardingComplete === false) {
      setOnboarding(true);
    }
  }, [student]);

  if (onboarding) {
    return <OnboardingPage studentId={studentId} onComplete={() => setOnboarding(false)} />;
  }

  const renderPage = (): React.ReactElement | null => {
    switch (route.view) {
      case 'home':
        return <HomePage userDisplayName={userDisplayName} onNavigate={setRoute} />;
      case 'journey':
        return <JourneyPage onNavigate={setRoute} />;
      case 'moduleDetail':
        return <ModuleDetailPage moduleId={route.moduleId} onNavigate={setRoute} />;
      case 'topicDetail':
        return <TopicDetailPage moduleId={route.moduleId} topicId={route.topicId} onNavigate={setRoute} />;
      case 'topicTestAttempt':
        return <TopicTestAttemptPage moduleId={route.moduleId} topicId={route.topicId} onNavigate={setRoute} />;
      case 'moduleTestAttempt':
        return <ModuleTestAttemptPage moduleId={route.moduleId} onNavigate={setRoute} />;
      case 'coding':
        return <CodingPage onNavigate={setRoute} />;
      case 'challengeDetail':
        return <ChallengeDetailPage questionId={route.questionId} onNavigate={setRoute} />;
      case 'tasks':
        return <TasksPage onNavigate={setRoute} />;
      case 'taskDetail':
        return <TaskDetailPage taskId={route.taskId} onNavigate={setRoute} />;
      case 'assessmentDetail':
        return <AssessmentDetailPage assessmentId={route.assessmentId} onNavigate={setRoute} />;
      case 'assessmentAttempt':
        return <AssessmentAttemptPage assessmentId={route.assessmentId} onNavigate={setRoute} />;
      case 'project':
        return <ProjectPage />;
      case 'performance':
        return <PerformancePage onNavigate={setRoute} />;
      case 'certificates':
        return <CertificatesPage />;
      case 'profile':
        return (
          <ProfilePage
            userDisplayName={userDisplayName}
            onRestartOnboarding={
              onOpenAdmin || student?.onboardingComplete === false
                ? () => setOnboarding(true)
                : undefined
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <NavShell route={route} onNavigate={setRoute} userDisplayName={userDisplayName} courseTitle={courseMeta?.title || 'Coaching Platform'} onOpenAdmin={onOpenAdmin}>
      {renderPage()}
    </NavShell>
  );
};
