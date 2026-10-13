import { PermissionKind } from '@pnp/sp/security';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';
import '@pnp/sp/security';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSP, isSPInitialized } from './pnpjsConfig';
import { SP_LISTS } from './spSchemaService';

export type AppRole = 'admin' | 'mentor' | 'student' | 'unassigned';

export interface UserRoleContext {
  email: string;
  loginName: string;
  displayName: string;
  isAdmin: boolean;
  isMentor: boolean;
  isStudent: boolean;
  activeRole: AppRole;
  availableRoles: ('admin' | 'mentor' | 'student')[];
  mentorId?: string;
  studentId?: string;
  courseId?: string;
  isDevFallback?: boolean;
}

/**
 * Resolves the role and permissions for the current user.
 * Evaluates SharePoint Site Administrator status, ManageWeb permissions,
 * list records in ERP_Mentors and ERP_Students, with local store fallback for offline/workbench.
 */
export async function resolveCurrentUserRole(
  userEmail?: string,
  loginName?: string,
  displayName?: string
): Promise<UserRoleContext> {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const cleanLogin = (loginName || '').replace(/^i:0#\.f\|membership\|/i, '').trim().toLowerCase();

  // -------------------------------------------------------------
  // Live SharePoint Online Resolution
  // -------------------------------------------------------------
  if (isSPInitialized()) {
    try {
      const sp = getSP();
      let isSiteAdmin = false;
      let hasManageWeb = false;
      let spDisplayName = displayName || '';
      let spEmail = cleanEmail;
      let spLogin = cleanLogin;

      // 1. Fetch SharePoint Current User details
      try {
        const user = await sp.web.currentUser.select('Id', 'Title', 'Email', 'LoginName', 'IsSiteAdmin')();
        isSiteAdmin = !!user.IsSiteAdmin;
        if (user.Title && !spDisplayName) spDisplayName = user.Title;
        if (user.Email && !spEmail) spEmail = user.Email.trim().toLowerCase();
        if (user.LoginName && !spLogin) {
          spLogin = user.LoginName.replace(/^i:0#\.f\|membership\|/i, '').trim().toLowerCase();
        }
      } catch (err) {
        console.warn('[authService] Could not fetch currentUser from SP:', err);
      }

      // 2. Check ManageWeb permission (Site Owners / Full Control)
      try {
        hasManageWeb = await sp.web.currentUserHasPermissions(PermissionKind.ManageWeb);
      } catch {
        // Fallback to isSiteAdmin if permission check is not permitted
      }

      // 3. Check ERP_Settings for admin whitelist
      let isConfigAdmin = false;
      try {
        const adminSetting = await sp.web.lists
          .getByTitle(SP_LISTS.SETTINGS)
          .items.filter("ConfigKey eq 'admin_users' or ConfigType eq 'admin'")
          .select('ConfigJSON')
          .top(1)();

        if (adminSetting.length > 0 && adminSetting[0].ConfigJSON) {
          const parsed = JSON.parse(adminSetting[0].ConfigJSON);
          const adminEmails: string[] = Array.isArray(parsed) ? parsed : parsed.emails || [];
          const lowerList = adminEmails.map((e) => e.toLowerCase());
          if (
            (spEmail && lowerList.indexOf(spEmail) !== -1) ||
            (spLogin && lowerList.indexOf(spLogin) !== -1)
          ) {
            isConfigAdmin = true;
          }
        }
      } catch {
        // ERP_Settings might not have admin_users yet
      }

      const isAdmin = isSiteAdmin || hasManageWeb || isConfigAdmin;

      // 4. Check ERP_Mentors list
      let isMentor = false;
      let mentorId: string | undefined;
      const targetQueryEmail = spEmail || spLogin;

      if (targetQueryEmail) {
        try {
          const filter =
            spEmail && spLogin && spEmail !== spLogin
              ? `Email eq '${spEmail}' or Email eq '${spLogin}'`
              : `Email eq '${targetQueryEmail}'`;

          const mentorItems = await sp.web.lists
            .getByTitle(SP_LISTS.MENTORS)
            .items.filter(filter)
            .select('MentorId', 'Email', 'Status')
            .top(1)();

          if (mentorItems.length > 0 && mentorItems[0].MentorId) {
            isMentor = true;
            mentorId = mentorItems[0].MentorId;
          }
        } catch (err) {
          console.warn('[authService] Error querying ERP_Mentors:', err);
        }
      }

      // 5. Check ERP_Students list
      let isStudent = false;
      let studentId: string | undefined;
      let courseId: string | undefined;

      if (targetQueryEmail) {
        try {
          const filter =
            spEmail && spLogin && spEmail !== spLogin
              ? `Email eq '${spEmail}' or Email eq '${spLogin}'`
              : `Email eq '${targetQueryEmail}'`;

          const studentItems = await sp.web.lists
            .getByTitle(SP_LISTS.STUDENTS)
            .items.filter(filter)
            .select('StudentId', 'Email', 'CourseId', 'Status')
            .top(1)();

          if (studentItems.length > 0 && studentItems[0].StudentId) {
            isStudent = true;
            studentId = studentItems[0].StudentId;
            courseId = studentItems[0].CourseId;
          }
        } catch (err) {
          console.warn('[authService] Error querying ERP_Students:', err);
        }
      }

      // 6. Build Available Roles and Active Default Role
      const availableRoles: ('admin' | 'mentor' | 'student')[] = [];
      if (isAdmin) availableRoles.push('admin');
      if (isMentor) availableRoles.push('mentor');
      if (isStudent) availableRoles.push('student');

      let activeRole: AppRole = 'unassigned';
      if (isAdmin) {
        activeRole = 'admin';
      } else if (isMentor) {
        activeRole = 'mentor';
      } else if (isStudent) {
        activeRole = 'student';
      }

      return {
        email: spEmail,
        loginName: spLogin,
        displayName: spDisplayName || 'User',
        isAdmin,
        isMentor,
        isStudent,
        activeRole,
        availableRoles,
        mentorId,
        studentId,
        courseId,
        isDevFallback: false,
      };
    } catch (err) {
      console.warn('[authService] Live SP role check encountered an error, evaluating local store fallback:', err);
    }
  }

  // -------------------------------------------------------------
  // Offline / Workbench / Local Store Fallback
  // -------------------------------------------------------------
  try {
    const { state: localStore } = await import('../admin/repository/store');

    const matchedStudent = localStore.students.find(
      (s) =>
        (cleanEmail && s.email.toLowerCase() === cleanEmail) ||
        (cleanLogin && s.email.toLowerCase() === cleanLogin)
    );

    const matchedMentor = localStore.mentors.find(
      (m) =>
        (cleanEmail && m.email.toLowerCase() === cleanEmail) ||
        (cleanLogin && m.email.toLowerCase() === cleanLogin)
    );

    // If matching records exist in local store:
    if (matchedStudent || matchedMentor) {
      const isStudent = !!matchedStudent;
      const isMentor = !!matchedMentor;
      const availableRoles: ('admin' | 'mentor' | 'student')[] = [];
      if (isMentor) availableRoles.push('mentor');
      if (isStudent) availableRoles.push('student');

      return {
        email: cleanEmail || cleanLogin,
        loginName: cleanLogin || cleanEmail,
        displayName: displayName || matchedStudent?.name || matchedMentor?.name || 'Local User',
        isAdmin: false,
        isMentor,
        isStudent,
        activeRole: isMentor ? 'mentor' : 'student',
        availableRoles,
        mentorId: matchedMentor?.id,
        studentId: matchedStudent?.id,
        courseId: matchedStudent?.courseId,
        isDevFallback: true,
      };
    }

    // Default for local development environment when running without SP context:
    // Grant Admin capabilities with full persona switching enabled so developers never get locked out.
    const defaultStudent = localStore.students.find((s) => s.isLiveDemoStudent) || localStore.students[0];
    const defaultMentor = localStore.mentors[0];

    return {
      email: cleanEmail || 'admin.demo@coaching.local',
      loginName: cleanLogin || 'admin.demo@coaching.local',
      displayName: displayName || 'Developer / Admin',
      isAdmin: true,
      isMentor: true,
      isStudent: true,
      activeRole: 'admin',
      availableRoles: ['admin', 'mentor', 'student'],
      mentorId: defaultMentor?.id,
      studentId: defaultStudent?.id || 'student-demo',
      courseId: defaultStudent?.courseId,
      isDevFallback: true,
    };
  } catch (fallbackErr) {
    console.error('[authService] Local store fallback error:', fallbackErr);
    return {
      email: cleanEmail,
      loginName: cleanLogin,
      displayName: displayName || 'User',
      isAdmin: false,
      isMentor: false,
      isStudent: false,
      activeRole: 'unassigned',
      availableRoles: [],
      isDevFallback: true,
    };
  }
}
