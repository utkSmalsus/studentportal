import * as React from 'react';
import { useState, useEffect } from 'react';
import MentorLayout from './MentorLayout';
import { MentorRoute } from './navigation/types';
import MentorDashboardPage from './pages/MentorDashboardPage';
import MyStudentsPage from './pages/MyStudentsPage';
import MyBatchesPage from './pages/MyBatchesPage';
import MentorReviewPage from './pages/MentorReviewPage';
import GithubActivityPage from './pages/GithubActivityPage';
import MentorStudentDetailPage from './pages/MentorStudentDetailPage';
import MentorProfilePage from './pages/MentorProfilePage';
import { LoadingState } from '../ui/Primitives';
import { useMentors, useCurrentUserRole } from '../hooks';

interface MentorAppProps {
  onExitMentor?: () => void;
  defaultMentorId?: string;
  isAdmin?: boolean;
}

const MentorApp: React.FC<MentorAppProps> = ({
  onExitMentor,
  defaultMentorId,
  isAdmin: propIsAdmin,
}) => {
  const { data: roleContext } = useCurrentUserRole();
  const isAdmin = propIsAdmin ?? !!roleContext?.isAdmin;
  const lockedMentorId = defaultMentorId || roleContext?.mentorId;

  const { data: mentors = [], isLoading } = useMentors();
  const [mentorId, setMentorId] = useState<string>(lockedMentorId || '');
  const [route, setRoute] = useState<MentorRoute>({ view: 'dashboard' });

  useEffect(() => {
    if (lockedMentorId) {
      setMentorId(lockedMentorId);
    } else if (!mentorId && mentors.length > 0) {
      setMentorId(mentors[0].id);
    }
  }, [lockedMentorId, mentors, mentorId]);

  if (isLoading) {
    return <LoadingState label="Loading mentor portal..." />;
  }

  const renderPage = (): React.ReactElement | null => {
    if (!mentorId) return null;
    switch (route.view) {
      case 'dashboard':
        return <MentorDashboardPage mentorId={mentorId} onNavigate={setRoute} />;
      case 'myStudents':
        return <MyStudentsPage mentorId={mentorId} onNavigate={setRoute} />;
      case 'studentDetail':
        return <MentorStudentDetailPage mentorId={mentorId} studentId={route.studentId} onNavigate={setRoute} />;
      case 'myBatches':
        return <MyBatchesPage mentorId={mentorId} />;
      case 'review':
        return <MentorReviewPage mentorId={mentorId} />;
      case 'studentActivity':
      case 'githubActivity':
        return <GithubActivityPage mentorId={mentorId} />;
      case 'profile':
        return <MentorProfilePage mentorId={mentorId} />;
      default:
        return null;
    }
  };

  return (
    <MentorLayout
      route={route}
      onNavigate={setRoute}
      mentorId={mentorId}
      onChangeMentor={isAdmin ? setMentorId : () => {}}
      allowMentorSwitch={isAdmin}
      onExitMentor={onExitMentor}
    >
      {renderPage()}
    </MentorLayout>
  );
};

export default MentorApp;
