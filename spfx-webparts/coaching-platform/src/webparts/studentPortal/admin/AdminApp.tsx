import * as React from 'react';
import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { AdminRoute } from './navigation/types';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseEditPage from './pages/CourseEditPage';
import CurriculumBuilderPage from './pages/CurriculumBuilderPage';
import QuestionBankPage from './pages/QuestionBankPage';
import DailyCodingAdminPage from './pages/DailyCodingAdminPage';
import MiniTasksAdminPage from './pages/MiniTasksAdminPage';
import AssessmentsAdminPage from './pages/AssessmentsAdminPage';
import MajorProjectAdminPage from './pages/MajorProjectAdminPage';
import StudentsPage from './pages/StudentsPage';
import BatchesPage from './pages/BatchesPage';
import MentorsAdminPage from './pages/MentorsAdminPage';
import EnrollmentsPage from './pages/EnrollmentsPage';
import EvaluationQueuePage from './pages/EvaluationQueuePage';
import ReportsPage from './pages/ReportsPage';
import CertificatesAdminPage from './pages/CertificatesAdminPage';
import NotificationsAdminPage from './pages/NotificationsAdminPage';
import SettingsPage from './pages/SettingsPage';
import { useAdminStoreVersion } from './hooks';

const AdminApp: React.FC<{ userDisplayName: string; onExitAdmin: () => void; onPreviewAsStudent: (courseId: string) => void; onOpenMentorPortal: () => void }> = ({
  userDisplayName,
  onExitAdmin,
  onPreviewAsStudent,
  onOpenMentorPortal,
}) => {
  useAdminStoreVersion();
  const [route, setRoute] = useState<AdminRoute>({ view: 'dashboard' });

  const renderPage = (): React.ReactElement | null => {
    switch (route.view) {
      case 'dashboard':
        return <AdminDashboardPage onNavigate={setRoute} />;
      case 'courses':
        return <CoursesPage onNavigate={setRoute} />;
      case 'courseEdit':
        return <CourseEditPage courseId={route.courseId} onNavigate={setRoute} onPreviewAsStudent={onPreviewAsStudent} />;
      case 'curriculum':
        return <CurriculumBuilderPage courseId={route.courseId} onNavigate={setRoute} onPreviewAsStudent={onPreviewAsStudent} />;
      case 'questionBank':
        return <QuestionBankPage />;
      case 'dailyCoding':
        return <DailyCodingAdminPage />;
      case 'practiceLibrary':
        return <DailyCodingAdminPage />;
      case 'miniTasks':
        return <MiniTasksAdminPage />;
      case 'assessments':
        return <AssessmentsAdminPage />;
      case 'majorProject':
        return <MajorProjectAdminPage />;
      case 'students':
        return <StudentsPage />;
      case 'batches':
        return <BatchesPage />;
      case 'mentors':
        return <MentorsAdminPage />;
      case 'enrollments':
        return <EnrollmentsPage />;
      case 'evaluationQueue':
        return <EvaluationQueuePage />;
      case 'courseAnalytics':
      case 'studentProgress':
      case 'reports':
        return <ReportsPage />;
      case 'certificates':
        return <CertificatesAdminPage />;
      case 'notifications':
        return <NotificationsAdminPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout route={route} onNavigate={setRoute} userDisplayName={userDisplayName} onExitAdmin={onExitAdmin} onOpenMentorPortal={onOpenMentorPortal}>
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminApp;
