import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';
import '@pnp/sp/items';
import '@pnp/sp/views';
import { getSP, isSPInitialized } from './pnpjsConfig';
import { state as initialStoreState } from '../admin/repository/store';

export const SP_LISTS = {
  COURSES: 'ERP_Courses',
  BATCHES: 'ERP_Batches',
  STUDENTS: 'ERP_Students',
  ENROLLMENTS: 'ERP_Enrollments',
  MENTORS: 'ERP_Mentors',
  SUBMISSIONS: 'ERP_Submissions',
  STUDENT_PROGRESS: 'ERP_StudentProgress',
  QUESTION_BANK: 'ERP_QuestionBank',
  SETTINGS: 'ERP_Settings',
} as const;

export const SP_DOC_LIBS = {
  SUBMISSIONS_DOCS: 'ERP_Submissions_Docs',
} as const;

export type SPListName = typeof SP_LISTS[keyof typeof SP_LISTS];

const SCHEMA_SESSION_KEY = 'erp_sp_schema_verified_v1';
let _provisionPromise: Promise<void> | undefined;

function isSchemaVerifiedInSession(): boolean {
  try {
    return typeof window !== 'undefined' && window.sessionStorage?.getItem(SCHEMA_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function markSchemaVerifiedInSession(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage?.setItem(SCHEMA_SESSION_KEY, 'true');
    }
  } catch {
    // ignore sessionStorage security errors
  }
}

/**
 * Ensures all required SharePoint lists and columns exist.
 * If empty, seeds initial data from seed store.
 * Automatically cleans up duplicate view columns and caches verification per session.
 * Idempotent and safe to run multiple times.
 */
export async function ensureSharePointSchema(force = false): Promise<void> {
  if (!force && isSchemaVerifiedInSession()) {
    return;
  }
  if (_provisionPromise) return _provisionPromise;
  _provisionPromise = (async () => {
    try {
      await doEnsureSharePointSchema();
      markSchemaVerifiedInSession();
    } catch (err) {
      console.warn('[spSchemaService] Error provisioning SharePoint schema:', err);
    } finally {
      _provisionPromise = undefined;
    }
  })();
  return _provisionPromise;
}

async function doEnsureSharePointSchema(): Promise<void> {
  if (!isSPInitialized()) {
    console.warn('[spSchemaService] PnPjs SPFI not initialized yet; skipping schema verification.');
    return;
  }

  const sp = getSP();

  try {
    // 1. Ensure ERP_Courses
    await ensureList(sp, SP_LISTS.COURSES, 'ERP Coaching Platform Courses', [
      { name: 'CourseId', type: 'text' },
      { name: 'CourseCode', type: 'text' },
      { name: 'Category', type: 'text' },
      { name: 'Difficulty', type: 'text' },
      { name: 'Status', type: 'text' },
      { name: 'MetaJSON', type: 'note' },
      { name: 'ContentJSON', type: 'note' },
    ]);

    // 2. Ensure ERP_Batches
    await ensureList(sp, SP_LISTS.BATCHES, 'ERP Coaching Platform Batches', [
      { name: 'BatchId', type: 'text' },
      { name: 'CourseId', type: 'text' },
      { name: 'StartDate', type: 'text' },
      { name: 'EndDate', type: 'text' },
      { name: 'Status', type: 'text' },
      { name: 'PrimaryMentorId', type: 'text' },
      { name: 'BatchJSON', type: 'note' },
    ]);

    // 3. Ensure ERP_Students
    await ensureList(sp, SP_LISTS.STUDENTS, 'ERP Coaching Platform Students', [
      { name: 'StudentId', type: 'text' },
      { name: 'Email', type: 'text' },
      { name: 'Phone', type: 'text' },
      { name: 'CourseId', type: 'text' },
      { name: 'BatchId', type: 'text' },
      { name: 'Status', type: 'text' },
      { name: 'OnboardingComplete', type: 'boolean' },
      { name: 'StudentJSON', type: 'note' },
    ]);

    // 4. Ensure ERP_Enrollments
    await ensureList(sp, SP_LISTS.ENROLLMENTS, 'ERP Coaching Platform Enrollments', [
      { name: 'EnrollmentId', type: 'text' },
      { name: 'StudentId', type: 'text' },
      { name: 'CourseId', type: 'text' },
      { name: 'BatchId', type: 'text' },
      { name: 'StartDate', type: 'text' },
      { name: 'ExpectedCompletion', type: 'text' },
      { name: 'Status', type: 'text' },
    ]);

    // 5. Ensure ERP_Mentors
    await ensureList(sp, SP_LISTS.MENTORS, 'ERP Coaching Platform Mentors', [
      { name: 'MentorId', type: 'text' },
      { name: 'Email', type: 'text' },
      { name: 'Specialization', type: 'text' },
      { name: 'Status', type: 'text' },
      { name: 'MentorJSON', type: 'note' },
    ]);

    // 6. Ensure ERP_Submissions
    await ensureList(sp, SP_LISTS.SUBMISSIONS, 'ERP Coaching Platform Submissions', [
      { name: 'SubmissionId', type: 'text' },
      { name: 'StudentId', type: 'text' },
      { name: 'CourseId', type: 'text' },
      { name: 'RefType', type: 'text' },
      { name: 'RefId', type: 'text' },
      { name: 'Version', type: 'number' },
      { name: 'Status', type: 'text' },
      { name: 'SubmissionJSON', type: 'note' },
    ]);

    // 7. Ensure ERP_StudentProgress
    await ensureList(sp, SP_LISTS.STUDENT_PROGRESS, 'ERP Coaching Platform Student Progress', [
      { name: 'CompositeKey', type: 'text' },
      { name: 'StudentId', type: 'text' },
      { name: 'CourseId', type: 'text' },
      { name: 'ProgressJSON', type: 'note' },
    ]);

    // 8. Ensure ERP_QuestionBank
    await ensureList(sp, SP_LISTS.QUESTION_BANK, 'ERP Coaching Platform Question Bank', [
      { name: 'QuestionId', type: 'text' },
      { name: 'Category', type: 'text' },
      { name: 'Topic', type: 'text' },
      { name: 'Difficulty', type: 'text' },
      { name: 'QuestionJSON', type: 'note' },
    ]);

    // 9. Ensure ERP_Settings
    await ensureList(sp, SP_LISTS.SETTINGS, 'ERP Coaching Platform Settings', [
      { name: 'ConfigKey', type: 'text' },
      { name: 'ConfigType', type: 'text' },
      { name: 'ConfigJSON', type: 'note' },
    ]);

    // 10. Ensure ERP_Submissions_Docs (Document Library for file attachments)
    await ensureDocumentLibrary(sp, SP_DOC_LIBS.SUBMISSIONS_DOCS, 'ERP Coaching Platform Submissions & Attachments');

    // Check if initial seeding is needed
    await seedInitialDataIfEmpty(sp);
  } catch (err) {
    console.warn('[spSchemaService] Error provisioning SharePoint schema:', err);
  }
}

interface FieldDef {
  name: string;
  type: 'text' | 'note' | 'number' | 'boolean';
}

async function ensureList(sp: SPFI, title: string, description: string, fields: FieldDef[]): Promise<void> {
  let list;
  try {
    list = sp.web.lists.getByTitle(title);
    await list.select('Id')();
  } catch {
    // List does not exist, create it
    try {
      await sp.web.lists.add(title, description, 100);
      list = sp.web.lists.getByTitle(title);
    } catch (e) {
      console.warn(`[spSchemaService] Could not create list ${title}:`, e);
      return;
    }
  }

  // 1. Ensure fields exist in schema (addText throws if already exists, safely caught)
  for (const f of fields) {
    try {
      if (f.type === 'text') {
        await list.fields.addText(f.name, { MaxLength: 255 });
      } else if (f.type === 'note') {
        await list.fields.addMultilineText(f.name, { NumberOfLines: 6 });
      } else if (f.type === 'number') {
        await list.fields.addNumber(f.name);
      } else if (f.type === 'boolean') {
        await list.fields.addBoolean(f.name);
      }
    } catch {
      // Field already exists in schema
    }
  }

  // 2. Ensure fields in the default view (All Items) are clean and not duplicated
  try {
    const viewFieldsData = await list.defaultView.fields();
    const currentItems: string[] = (viewFieldsData && Array.isArray(viewFieldsData.Items)) ? viewFieldsData.Items : [];
    const lowerItems = currentItems.map(item => item.toLowerCase());

    // Check if any field name appears more than once in the view
    const hasDuplicates = lowerItems.some((item, idx) => lowerItems.indexOf(item) !== idx);

    if (hasDuplicates) {
      console.log(`[spSchemaService] Cleaning duplicate columns in default view for list '${title}'...`);
      // Reset all view fields to eliminate duplicated entries
      await list.defaultView.fields.removeAll();

      // Restore Title / LinkTitle column first
      const titleCol = currentItems.find(item => item.toLowerCase() === 'linktitle' || item.toLowerCase() === 'title') || 'LinkTitle';
      try {
        await list.defaultView.fields.add(titleCol);
      } catch {
        try {
          await list.defaultView.fields.add('Title');
        } catch {
          // ignore
        }
      }

      // Add each defined custom field exactly once
      for (const f of fields) {
        if (f.name.toLowerCase() !== 'title' && f.name.toLowerCase() !== 'linktitle') {
          try {
            await list.defaultView.fields.add(f.name);
          } catch {
            // ignore
          }
        }
      }
      console.log(`[spSchemaService] Default view for list '${title}' cleaned successfully.`);
    } else {
      // No duplicates: only add fields that aren't already present in the view
      for (const f of fields) {
        if (lowerItems.indexOf(f.name.toLowerCase()) === -1) {
          try {
            await list.defaultView.fields.add(f.name);
          } catch {
            // ignore
          }
        }
      }
    }
  } catch (viewErr) {
    console.warn(`[spSchemaService] Could not synchronize default view fields for ${title}:`, viewErr);
  }
}

async function ensureDocumentLibrary(sp: SPFI, title: string, description: string): Promise<void> {
  try {
    const lib = sp.web.lists.getByTitle(title);
    await lib.select('Id')();
  } catch {
    try {
      // 101 is SharePoint Document Library base template
      await sp.web.lists.add(title, description, 101);
    } catch (e) {
      console.warn(`[spSchemaService] Could not create document library ${title}:`, e);
    }
  }
}

async function seedInitialDataIfEmpty(sp: SPFI): Promise<void> {
  try {
    const existingCourses = await sp.web.lists.getByTitle(SP_LISTS.COURSES).items.select('Id').top(1)();
    if (existingCourses && existingCourses.length > 0) {
      return; // Already seeded
    }

    // Seed Courses from initialStoreState
    for (const courseId of Object.keys(initialStoreState.courses)) {
      const course = initialStoreState.courses[courseId];
      await sp.web.lists.getByTitle(SP_LISTS.COURSES).items.add({
        Title: course.meta.title,
        CourseId: courseId,
        CourseCode: course.meta.code,
        Category: course.meta.category,
        Difficulty: course.meta.difficulty,
        Status: course.meta.status,
        MetaJSON: JSON.stringify(course.meta),
        ContentJSON: JSON.stringify(course),
      });
    }

    // Seed Mentors
    for (const mentor of initialStoreState.mentors) {
      await sp.web.lists.getByTitle(SP_LISTS.MENTORS).items.add({
        Title: mentor.name,
        MentorId: mentor.id,
        Email: mentor.email,
        Specialization: mentor.specialization,
        Status: mentor.status,
        MentorJSON: JSON.stringify(mentor),
      });
    }

    // Seed Batches
    for (const batch of initialStoreState.batches) {
      await sp.web.lists.getByTitle(SP_LISTS.BATCHES).items.add({
        Title: batch.name,
        BatchId: batch.id,
        CourseId: batch.courseId,
        StartDate: batch.startDate,
        EndDate: batch.endDate,
        Status: batch.status,
        PrimaryMentorId: batch.primaryMentorId || '',
        BatchJSON: JSON.stringify(batch),
      });
    }

    // Seed Students
    for (const student of initialStoreState.students) {
      await sp.web.lists.getByTitle(SP_LISTS.STUDENTS).items.add({
        Title: student.name,
        StudentId: student.id,
        Email: student.email,
        Phone: student.phone || '',
        CourseId: student.courseId,
        BatchId: student.batchId || '',
        Status: student.status,
        OnboardingComplete: student.onboardingComplete ?? true,
        StudentJSON: JSON.stringify(student),
      });
    }

    // Seed Enrollments
    for (const enroll of initialStoreState.enrollments) {
      await sp.web.lists.getByTitle(SP_LISTS.ENROLLMENTS).items.add({
        Title: `Enrollment: ${enroll.studentId} in ${enroll.courseId}`,
        EnrollmentId: enroll.id,
        StudentId: enroll.studentId,
        CourseId: enroll.courseId,
        BatchId: enroll.batchId || '',
        StartDate: enroll.startDate,
        ExpectedCompletion: enroll.expectedCompletion,
        Status: enroll.status,
      });
    }

    // Seed Student Progress
    for (const record of initialStoreState.progressRecords) {
      await sp.web.lists.getByTitle(SP_LISTS.STUDENT_PROGRESS).items.add({
        Title: `${record.studentId}::${record.courseId}`,
        CompositeKey: `${record.studentId}::${record.courseId}`,
        StudentId: record.studentId,
        CourseId: record.courseId,
        ProgressJSON: JSON.stringify(record),
      });
    }

    // Seed Settings (Certificates)
    for (const cert of initialStoreState.certificates) {
      await sp.web.lists.getByTitle(SP_LISTS.SETTINGS).items.add({
        Title: `cert_${cert.courseId}`,
        ConfigKey: cert.courseId,
        ConfigType: 'certificate',
        ConfigJSON: JSON.stringify(cert),
      });
    }
  } catch (err) {
    console.warn('[spSchemaService] Error seeding initial SharePoint data:', err);
  }
}
