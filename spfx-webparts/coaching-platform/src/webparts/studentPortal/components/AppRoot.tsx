import * as React from 'react';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { IStudentPortalProps } from './IStudentPortalProps';
import { AppStateProvider } from '../state/AppStateContext';
import { StudentPortalShell } from './StudentPortal';
import AdminApp from '../admin/AdminApp';
import MentorApp from '../mentor/MentorApp';
import { useStudents, useEnrollStudent, useCurrentUserRole } from '../hooks';
import { ensureSharePointSchema } from '../services/spSchemaService';
import { syncFromSharePoint } from '../admin/repository/store';
import { LoadingState } from '../ui/Primitives';
import { AccessDeniedState } from '../ui/AccessDeniedState';

type Mode = 'student' | 'admin' | 'mentor';
type PureView = 'none' | 'student' | 'mentor' | 'unassigned';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface AppRootShellProps extends IStudentPortalProps {
  isAdmin: boolean;
  isMentor: boolean;
  isStudent: boolean;
  activeRole: 'admin' | 'mentor' | 'student' | 'unassigned';
  mentorId?: string;
  previewStudentId: string;
  onSelectPreviewStudentId: (id: string) => void;
}

const AppRootShell: React.FC<AppRootShellProps> = ({
  userDisplayName,
  isAdmin,
  isMentor,
  mentorId,
  previewStudentId,
  onSelectPreviewStudentId,
  ...rest
}) => {
  const initialMode: Mode = isAdmin ? 'admin' : isMentor ? 'mentor' : 'student';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pureView, setPureView] = useState<PureView>('none');
  const { data: students = [] } = useStudents();
  const enrollStudentMutation = useEnrollStudent();

  const handlePreviewAsStudent = (courseId: string): void => {
    const liveStudent =
      students.find((s) => s.id === previewStudentId) ||
      students.find((s) => s.isLiveDemoStudent) ||
      students[0];
    if (liveStudent && liveStudent.courseId !== courseId) {
      const today = new Date().toISOString().slice(0, 10);
      enrollStudentMutation.mutate({
        studentId: liveStudent.id,
        courseId,
        startDate: today,
        expectedCompletion: today,
      });
    }
    setMode('student');
  };

  // Floating Return Pill when an Admin is testing Pure Persona views
  const renderFloatingReturnPill = (label: string): React.ReactElement => (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => setPureView('none')}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-2xl hover:bg-slate-800 border border-slate-700 transition"
        title="Click to exit pure simulation and restore Admin controls"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Emulating {label} &bull; Return to Admin</span>
        <span className="text-slate-400 font-bold ml-0.5">&times;</span>
      </button>
    </div>
  );

  // Floating Admin Persona Switcher Bar (only visible to Admins when pureView is 'none')
  const renderAdminPersonaBar = (): React.ReactElement | null => {
    if (!isAdmin || pureView !== 'none') return null;

    return (
      <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3 border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Admin Mode:</span>
          <span className="text-slate-400">Viewing as</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setMode('admin')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                mode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin Portal
            </button>
            <button
              onClick={() => setMode('mentor')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                mode === 'mentor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Mentor Portal
            </button>
            <button
              onClick={() => setMode('student')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                mode === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Student Portal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'student' && students.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Preview Student:</span>
              <select
                value={previewStudentId}
                onChange={(e) => onSelectPreviewStudentId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.courseId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Strict Emulation Mode Dropdown */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700">
            <span className="text-slate-400 font-medium">Pure View:</span>
            <select
              value={pureView}
              onChange={(e) => setPureView(e.target.value as PureView)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="none">None (Admin Controls On)</option>
              <option value="student">Pure Student View</option>
              <option value="mentor">Pure Mentor View</option>
              <option value="unassigned">Unassigned / Not Enrolled</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // Strict Emulation Renders (Opt-in by Admin)
  // -------------------------------------------------------------
  if (pureView === 'unassigned') {
    return (
      <div className="h-screen w-full overflow-y-auto bg-slate-50 font-sans text-slate-900">
        <AccessDeniedState
          userDisplayName={userDisplayName}
          userEmail={rest.userEmail}
        />
        {renderFloatingReturnPill('Unenrolled View')}
      </div>
    );
  }

  if (pureView === 'student') {
    return (
      <div className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
        <StudentPortalShell
          userDisplayName={userDisplayName}
          {...rest}
          onOpenAdmin={undefined}
        />
        {renderFloatingReturnPill('Student View')}
      </div>
    );
  }

  if (pureView === 'mentor') {
    return (
      <div className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
        <MentorApp
          defaultMentorId={mentorId}
          isAdmin={false}
          onExitMentor={undefined}
        />
        {renderFloatingReturnPill('Mentor View')}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Standard Admin & Authenticated User Renders (pureView === 'none')
  // -------------------------------------------------------------
  let activeContent: React.ReactNode;
  if (mode === 'admin' && isAdmin) {
    activeContent = (
      <AdminApp
        userDisplayName={userDisplayName}
        onExitAdmin={() => setMode('student')}
        onPreviewAsStudent={handlePreviewAsStudent}
        onOpenMentorPortal={() => setMode('mentor')}
      />
    );
  } else if (mode === 'mentor' && (isMentor || isAdmin)) {
    activeContent = (
      <MentorApp
        onExitMentor={isAdmin ? () => setMode('admin') : undefined}
        defaultMentorId={mentorId}
        isAdmin={isAdmin}
      />
    );
  } else {
    activeContent = (
      <StudentPortalShell
        userDisplayName={userDisplayName}
        {...rest}
        onOpenAdmin={isAdmin ? () => setMode('admin') : undefined}
      />
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {renderAdminPersonaBar()}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        {activeContent}
      </div>
    </div>
  );
};

const AppRootContent: React.FC<IStudentPortalProps> = (props) => {
  const {
    data: roleContext,
    isLoading: isRoleLoading,
    refetch: refetchRole,
  } = useCurrentUserRole(
    props.userEmail,
    props.userLoginName,
    props.userDisplayName
  );
  const { data: students = [] } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    // Asynchronously ensures SharePoint lists (ERP_*) exist on the site and syncs content
    ensureSharePointSchema().then(async () => {
      await syncFromSharePoint();
      queryClient.invalidateQueries();
    });
  }, []);

  if (isRoleLoading || !roleContext) {
    return <LoadingState label="Verifying access and permissions..." />;
  }

  // Access Denied / Enrollment Pending guard for real unassigned users
  if (roleContext.activeRole === 'unassigned') {
    return (
      <AccessDeniedState
        userDisplayName={props.userDisplayName}
        userEmail={props.userEmail || roleContext.email}
        onRetry={() => {
          refetchRole();
        }}
      />
    );
  }

  // Resolve active student ID:
  // 1. If Admin has selected a specific preview student, use that
  // 2. Otherwise use studentId from roleContext
  // 3. Fallback to matched student record by email
  const matchedStudent =
    (props.userEmail &&
      students.find(
        (s) => s.email?.toLowerCase() === props.userEmail?.toLowerCase()
      )) ||
    (roleContext.studentId &&
      students.find((s) => s.id === roleContext.studentId)) ||
    students.find((s) => s.isLiveDemoStudent) ||
    students[0];

  const effectiveStudentId =
    (roleContext.isAdmin && selectedStudentId) ||
    roleContext.studentId ||
    matchedStudent?.id ||
    'student-demo';

  return (
    <AppStateProvider studentId={effectiveStudentId}>
      <AppRootShell
        {...props}
        isAdmin={roleContext.isAdmin}
        isMentor={roleContext.isMentor}
        isStudent={roleContext.isStudent}
        activeRole={roleContext.activeRole}
        mentorId={roleContext.mentorId}
        previewStudentId={effectiveStudentId}
        onSelectPreviewStudentId={setSelectedStudentId}
      />
    </AppStateProvider>
  );
};

const AppRoot: React.FC<IStudentPortalProps> = (props) => (
  <QueryClientProvider client={queryClient}>
    <AppRootContent {...props} />
  </QueryClientProvider>
);

export default AppRoot;
