// The scoped progress repository: studentId + courseId identifies a student's
// entire learning journey in one course. This — not a single global
// StudentProgressState — is the source of truth for "what has this student
// done". state/AppStateContext.tsx is a thin React adapter over this for the
// current student's own UI actions; admin/mentor code (evaluating another
// student's submission, computing a roster's stats) calls this directly.
import { state, commit, clone } from './store';
import { StudentProgress, StudentProgressState } from '../../state/types';
import { createEmptyProgressState } from '../../state/initialState';
import { progressReducer, ProgressAction, ProgressCourseContent } from '../../state/progressReducer';
import { assertStudentExists, assertStudentEnrolledInCourse } from './validation';
import { getCourseContent } from './courseRepository';

function recordId(studentId: string, courseId: string): string {
  return `${studentId}::${courseId}`;
}

export function getProgress(studentId: string, courseId: string): StudentProgress | undefined {
  return state.progressRecords.find((p) => p.studentId === studentId && p.courseId === courseId);
}

export function createProgress(studentId: string, courseId: string): StudentProgress {
  assertStudentExists(studentId);
  assertStudentEnrolledInCourse(studentId, courseId);
  const existing = getProgress(studentId, courseId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: StudentProgress = { id: recordId(studentId, courseId), studentId, courseId, createdAt: now, updatedAt: now, ...createEmptyProgressState() };
  state.progressRecords.push(record);
  commit();
  return record;
}

// The common entry point: a student opening a course they're enrolled in
// always gets a record, created on first access if one doesn't exist yet
// (mirrors "enrollment initializes progress" without needing every enrollment
// call site to remember to also create one).
export function getOrCreateProgress(studentId: string, courseId: string): StudentProgress {
  return getProgress(studentId, courseId) || createProgress(studentId, courseId);
}

export function updateProgress(studentId: string, courseId: string, updater: (p: StudentProgress) => StudentProgressState): StudentProgress {
  const existing = getOrCreateProgress(studentId, courseId);
  const index = state.progressRecords.findIndex((p) => p.id === existing.id);
  const next: StudentProgress = { ...updater(existing), id: existing.id, studentId, courseId, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
  state.progressRecords[index] = next;
  commit();
  return next;
}

export function getProgressForStudent(studentId: string): StudentProgress[] {
  return state.progressRecords.filter((p) => p.studentId === studentId);
}

export function getProgressForCourse(courseId: string): StudentProgress[] {
  return state.progressRecords.filter((p) => p.courseId === courseId);
}

export function getProgressForStudents(studentIds: string[], courseId: string): StudentProgress[] {
  return state.progressRecords.filter((p) => p.courseId === courseId && studentIds.indexOf(p.studentId) !== -1);
}

function contentFor(courseId: string): ProgressCourseContent {
  const content = getCourseContent(courseId);
  if (!content) throw new Error(`Cannot dispatch a progress action: course "${courseId}" does not exist.`);
  return content;
}

// Applies a progress action to ONE student's ONE course record, using that
// course's own content (never "whichever course happens to be active") for
// scoring/lookups — see state/progressReducer.ts. This is what both the live
// student's own actions AND an admin/mentor acting on someone else's record
// go through, so the two can never drift into different logic.
export function dispatch(studentId: string, courseId: string, action: ProgressAction): StudentProgress {
  const content = contentFor(courseId);
  return updateProgress(studentId, courseId, (p) => progressReducer(p, action, content));
}

// A defensive copy for callers that want to read a snapshot without risking
// accidental mutation of the store's own array entries.
export function snapshotProgress(studentId: string, courseId: string): StudentProgress {
  return clone(getOrCreateProgress(studentId, courseId));
}
