// The top-level switch between the Student experience and the Admin Panel.
// Both share ONE AppStateProvider so an admin action (e.g. manually evaluating
// the live demo student's mini task) is immediately visible in the student UI,
// and so "Preview as Student" reflects real, live progress — not a snapshot.
import * as React from 'react';
import { useState } from 'react';
import type { IStudentPortalProps } from './IStudentPortalProps';
import { AppStateProvider } from '../state/AppStateContext';
import { StudentPortalShell } from './StudentPortal';
import AdminApp from '../admin/AdminApp';
import MentorApp from '../mentor/MentorApp';
import * as rosterRepo from '../admin/repository/rosterRepository';
import { getActiveCourseId } from '../admin/repository/courseRepository';

type Mode = 'student' | 'admin' | 'mentor';

const AppRootShell: React.FC<IStudentPortalProps> = ({ userDisplayName, ...rest }) => {
  const [mode, setMode] = useState<Mode>('student');

  const handlePreviewAsStudent = (courseId: string): void => {
    if (courseId !== getActiveCourseId()) {
      const liveStudent = rosterRepo.listStudents().find((s) => s.isLiveDemoStudent);
      if (liveStudent) {
        const today = new Date().toISOString().slice(0, 10);
        rosterRepo.enrollStudent({ studentId: liveStudent.id, courseId, startDate: today, expectedCompletion: today });
      }
    }
    setMode('student');
  };

  if (mode === 'admin') {
    return (
      <AdminApp
        userDisplayName={userDisplayName}
        onExitAdmin={() => setMode('student')}
        onPreviewAsStudent={handlePreviewAsStudent}
        onOpenMentorPortal={() => setMode('mentor')}
      />
    );
  }

  if (mode === 'mentor') {
    return <MentorApp onExitMentor={() => setMode('admin')} />;
  }

  return <StudentPortalShell userDisplayName={userDisplayName} {...rest} onOpenAdmin={() => setMode('admin')} />;
};

const AppRoot: React.FC<IStudentPortalProps> = (props) => (
  <AppStateProvider>
    <AppRootShell {...props} />
  </AppStateProvider>
);

export default AppRoot;
