import * as React from 'react';
import { useState } from 'react';
import type { IStudentPortalProps } from './IStudentPortalProps';
import NavShell from '../navigation/NavShell';
import { Route } from '../navigation/types';
import HomePage from './pages/HomePage';
import JourneyPage from './pages/JourneyPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import CodingPage from './pages/CodingPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import ProjectPage from './pages/ProjectPage';
import PerformancePage from './pages/PerformancePage';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';

const StudentPortal: React.FC<IStudentPortalProps> = ({ userDisplayName }) => {
  const [route, setRoute] = useState<Route>({ view: 'home' });

  const renderPage = (): React.ReactElement | null => {
    switch (route.view) {
      case 'home':
        return <HomePage userDisplayName={userDisplayName} onNavigate={setRoute} />;
      case 'journey':
        return <JourneyPage onNavigate={setRoute} />;
      case 'moduleDetail':
        return <ModuleDetailPage moduleId={route.moduleId} onNavigate={setRoute} />;
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
      case 'project':
        return <ProjectPage />;
      case 'performance':
        return <PerformancePage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'profile':
        return <ProfilePage userDisplayName={userDisplayName} />;
      default:
        return null;
    }
  };

  return (
    <NavShell route={route} onNavigate={setRoute}>
      {renderPage()}
    </NavShell>
  );
};

export default StudentPortal;
