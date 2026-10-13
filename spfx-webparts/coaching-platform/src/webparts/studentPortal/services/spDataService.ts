import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import { getSP, isSPInitialized } from './pnpjsConfig';
import { SP_LISTS, SP_DOC_LIBS } from './spSchemaService';
import {
  CourseContent,
  StudentRecord,
  Batch,
  Mentor,
  Enrollment,
  CertificateConfig,
} from '../admin/types';
import { StudentProgress } from '../state/types';

// -------------------------------------------------------------
// Courses
// -------------------------------------------------------------

export async function fetchCoursesFromSP(): Promise<Record<string, CourseContent> | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.COURSES).items.select('Id', 'CourseId', 'ContentJSON')();
    if (!items || items.length === 0) return undefined;

    const map: Record<string, CourseContent> = {};
    for (const item of items) {
      if (item.CourseId && item.ContentJSON) {
        try {
          map[item.CourseId] = JSON.parse(item.ContentJSON);
        } catch {
          // parse fallback
        }
      }
    }
    return Object.keys(map).length > 0 ? map : undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch courses from SharePoint, using local fallback:', err);
    return undefined;
  }
}

export async function saveCourseToSP(course: CourseContent): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.COURSES);
    const existing = await list.items.filter(`CourseId eq '${course.meta.id}'`).select('Id').top(1)();

    const payload = {
      Title: course.meta.title,
      CourseId: course.meta.id,
      CourseCode: course.meta.code,
      Category: course.meta.category,
      Difficulty: course.meta.difficulty,
      Status: course.meta.status,
      MetaJSON: JSON.stringify(course.meta),
      ContentJSON: JSON.stringify(course),
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save course to SharePoint:', err);
  }
}

export async function deleteCourseFromSP(courseId: string): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.COURSES);
    const existing = await list.items.filter(`CourseId eq '${courseId}'`).select('Id').top(1)();
    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).delete();
    }
  } catch (err) {
    console.warn('[spDataService] Failed to delete course from SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Students
// -------------------------------------------------------------

export async function fetchStudentsFromSP(): Promise<StudentRecord[] | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.STUDENTS).items.select('Id', 'StudentId', 'StudentJSON')();
    if (!items || items.length === 0) return undefined;

    const list: StudentRecord[] = [];
    for (const item of items) {
      if (item.StudentJSON) {
        try {
          list.push(JSON.parse(item.StudentJSON));
        } catch {
          // fallback
        }
      }
    }
    return list.length > 0 ? list : undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch students from SharePoint:', err);
    return undefined;
  }
}

export async function saveStudentToSP(student: StudentRecord): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.STUDENTS);
    const existing = await list.items.filter(`StudentId eq '${student.id}'`).select('Id').top(1)();

    const payload = {
      Title: student.name,
      StudentId: student.id,
      Email: student.email,
      Phone: student.phone || '',
      CourseId: student.courseId,
      BatchId: student.batchId || '',
      Status: student.status,
      OnboardingComplete: student.onboardingComplete ?? true,
      StudentJSON: JSON.stringify(student),
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save student to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Batches
// -------------------------------------------------------------

export async function fetchBatchesFromSP(): Promise<Batch[] | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.BATCHES).items.select('Id', 'BatchId', 'BatchJSON')();
    if (!items || items.length === 0) return undefined;

    const list: Batch[] = [];
    for (const item of items) {
      if (item.BatchJSON) {
        try {
          list.push(JSON.parse(item.BatchJSON));
        } catch {
          // fallback
        }
      }
    }
    return list.length > 0 ? list : undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch batches from SharePoint:', err);
    return undefined;
  }
}

export async function saveBatchToSP(batch: Batch): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.BATCHES);
    const existing = await list.items.filter(`BatchId eq '${batch.id}'`).select('Id').top(1)();

    const payload = {
      Title: batch.name,
      BatchId: batch.id,
      CourseId: batch.courseId,
      StartDate: batch.startDate,
      EndDate: batch.endDate,
      Status: batch.status,
      PrimaryMentorId: batch.primaryMentorId || '',
      BatchJSON: JSON.stringify(batch),
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save batch to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Mentors
// -------------------------------------------------------------

export async function fetchMentorsFromSP(): Promise<Mentor[] | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.MENTORS).items.select('Id', 'MentorId', 'MentorJSON')();
    if (!items || items.length === 0) return undefined;

    const list: Mentor[] = [];
    for (const item of items) {
      if (item.MentorJSON) {
        try {
          list.push(JSON.parse(item.MentorJSON));
        } catch {
          // fallback
        }
      }
    }
    return list.length > 0 ? list : undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch mentors from SharePoint:', err);
    return undefined;
  }
}

export async function saveMentorToSP(mentor: Mentor): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.MENTORS);
    const existing = await list.items.filter(`MentorId eq '${mentor.id}'`).select('Id').top(1)();

    const payload = {
      Title: mentor.name,
      MentorId: mentor.id,
      Email: mentor.email,
      Specialization: mentor.specialization,
      Status: mentor.status,
      MentorJSON: JSON.stringify(mentor),
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save mentor to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Enrollments
// -------------------------------------------------------------

export async function fetchEnrollmentsFromSP(): Promise<Enrollment[] | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.ENROLLMENTS).items.select('Id', 'EnrollmentId', 'StudentId', 'CourseId', 'BatchId', 'StartDate', 'ExpectedCompletion', 'Status')();
    if (!items || items.length === 0) return undefined;

    return items.map((i) => ({
      id: i.EnrollmentId || `enroll-${i.Id}`,
      studentId: i.StudentId,
      courseId: i.CourseId,
      batchId: i.BatchId,
      startDate: i.StartDate,
      expectedCompletion: i.ExpectedCompletion,
      status: i.Status || 'active',
    }));
  } catch (err) {
    console.warn('[spDataService] Failed to fetch enrollments from SharePoint:', err);
    return undefined;
  }
}

export async function saveEnrollmentToSP(enrollment: Enrollment): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.ENROLLMENTS);
    const existing = await list.items.filter(`EnrollmentId eq '${enrollment.id}'`).select('Id').top(1)();

    const payload = {
      Title: `Enrollment: ${enrollment.studentId}`,
      EnrollmentId: enrollment.id,
      StudentId: enrollment.studentId,
      CourseId: enrollment.courseId,
      BatchId: enrollment.batchId || '',
      StartDate: enrollment.startDate,
      ExpectedCompletion: enrollment.expectedCompletion,
      Status: enrollment.status,
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save enrollment to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Student Progress
// -------------------------------------------------------------

export async function fetchStudentProgressFromSP(studentId: string, courseId: string): Promise<StudentProgress | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const key = `${studentId}::${courseId}`;
    const items = await sp.web.lists.getByTitle(SP_LISTS.STUDENT_PROGRESS).items.filter(`CompositeKey eq '${key}'`).select('Id', 'ProgressJSON').top(1)();

    if (items.length > 0 && items[0].ProgressJSON) {
      return JSON.parse(items[0].ProgressJSON);
    }
    return undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch progress from SharePoint:', err);
    return undefined;
  }
}

export async function saveStudentProgressToSP(record: StudentProgress): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const key = `${record.studentId}::${record.courseId}`;
    const list = sp.web.lists.getByTitle(SP_LISTS.STUDENT_PROGRESS);
    const items = await list.items.filter(`CompositeKey eq '${key}'`).select('Id').top(1)();

    const payload = {
      Title: key,
      CompositeKey: key,
      StudentId: record.studentId,
      CourseId: record.courseId,
      ProgressJSON: JSON.stringify(record),
    };

    if (items.length > 0) {
      await list.items.getById(items[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save progress to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Certificates & Settings
// -------------------------------------------------------------

export async function fetchCertificatesFromSP(): Promise<CertificateConfig[] | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(SP_LISTS.SETTINGS).items.filter("ConfigType eq 'certificate'").select('Id', 'ConfigJSON')();
    if (!items || items.length === 0) return undefined;

    const list: CertificateConfig[] = [];
    for (const item of items) {
      if (item.ConfigJSON) {
        try {
          list.push(JSON.parse(item.ConfigJSON));
        } catch {
          // fallback
        }
      }
    }
    return list.length > 0 ? list : undefined;
  } catch (err) {
    console.warn('[spDataService] Failed to fetch certificates from SharePoint:', err);
    return undefined;
  }
}

export async function saveCertificateToSP(cert: CertificateConfig): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    const list = sp.web.lists.getByTitle(SP_LISTS.SETTINGS);
    const existing = await list.items.filter(`ConfigKey eq '${cert.courseId}' and ConfigType eq 'certificate'`).select('Id').top(1)();

    const payload = {
      Title: `cert_${cert.courseId}`,
      ConfigKey: cert.courseId,
      ConfigType: 'certificate',
      ConfigJSON: JSON.stringify(cert),
    };

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  } catch (err) {
    console.warn('[spDataService] Failed to save certificate to SharePoint:', err);
  }
}

// -------------------------------------------------------------
// Document Library (ERP_Submissions_Docs) File Management
// -------------------------------------------------------------

export interface SPUploadResult {
  fileName: string;
  serverRelativeUrl: string;
}

export async function uploadSubmissionFileToSP(
  file: File,
  subFolder?: string
): Promise<SPUploadResult | undefined> {
  if (!isSPInitialized()) return undefined;
  try {
    const sp = getSP();
    const lib = sp.web.lists.getByTitle(SP_DOC_LIBS.SUBMISSIONS_DOCS);
    const rootFolder = lib.rootFolder;

    let targetFolder = rootFolder;
    if (subFolder) {
      targetFolder = rootFolder.folders.getByUrl(subFolder);
    }

    const res = await targetFolder.files.addUsingPath(file.name, file, { Overwrite: true });
    return {
      fileName: file.name,
      serverRelativeUrl: res.data.ServerRelativeUrl,
    };
  } catch (err) {
    console.warn('[spDataService] Failed to upload submission file to SharePoint:', err);
    return undefined;
  }
}

export async function deleteSubmissionFileFromSP(serverRelativeUrl: string): Promise<void> {
  if (!isSPInitialized()) return;
  try {
    const sp = getSP();
    await sp.web.getFileByServerRelativePath(serverRelativeUrl).delete();
  } catch (err) {
    console.warn('[spDataService] Failed to delete file from SharePoint:', err);
  }
}

