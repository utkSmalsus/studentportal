import * as React from 'react';
import { useState } from 'react';
import type { IStudentPortalProps } from './IStudentPortalProps';
import Sidebar, { PageKey } from './Sidebar';
import DashboardPage from './pages/DashboardPage';
import JourneyPage from './pages/JourneyPage';
import CodingPage from './pages/CodingPage';
import TasksPage from './pages/TasksPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ProjectPage from './pages/ProjectPage';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';

const StudentPortal: React.FC<IStudentPortalProps> = ({ userDisplayName }) => {
  const [page, setPage] = useState<PageKey>('dashboard');

  return (
    <div className="flex font-sans text-gray-900 bg-white min-h-[600px]">
      <Sidebar active={page} onSelect={setPage} />
      <main className="flex-1 p-6 overflow-auto">
        {page === 'dashboard' && <DashboardPage userDisplayName={userDisplayName} />}
        {page === 'journey' && <JourneyPage />}
        {page === 'coding' && <CodingPage />}
        {page === 'tasks' && <TasksPage />}
        {page === 'assessments' && <AssessmentsPage />}
        {page === 'project' && <ProjectPage />}
        {page === 'certificates' && <CertificatesPage />}
        {page === 'profile' && <ProfilePage userDisplayName={userDisplayName} />}
      </main>
    </div>
  );
};

export default StudentPortal;
