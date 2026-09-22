import * as React from 'react';
import { useState } from 'react';
import MentorLayout from './MentorLayout';
import { MentorRoute } from './navigation/types';
import MentorDashboardPage from './pages/MentorDashboardPage';
import MyStudentsPage from './pages/MyStudentsPage';
import MyBatchesPage from './pages/MyBatchesPage';
import MentorReviewPage from './pages/MentorReviewPage';
import GithubActivityPage from './pages/GithubActivityPage';
import MentorStudentDetailPage from './pages/MentorStudentDetailPage';
import MentorProfilePage from './pages/MentorProfilePage';
import { useAdminStoreVersion } from '../admin/hooks';
import * as mentorRepo from '../admin/repository/mentorRepository';

const MentorApp: React.FC<{ onExitMentor: () => void }> = ({ onExitMentor }) => {
  useAdminStoreVersion();
  const mentors = mentorRepo.listMentors();
  const [mentorId, setMentorId] = useState(mentors[0]?.id || '');
  const [route, setRoute] = useState<MentorRoute>({ view: 'dashboard' });

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
    <MentorLayout route={route} onNavigate={setRoute} mentorId={mentorId} onChangeMentor={setMentorId} onExitMentor={onExitMentor}>
      {renderPage()}
    </MentorLayout>
  );
};

export default MentorApp;
