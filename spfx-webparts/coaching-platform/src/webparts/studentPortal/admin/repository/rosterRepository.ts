// Batches, Students and Enrollments.
//
// Only ONE student in this demo drives a live, rendered React tree at a time —
// the one flagged `isLiveDemoStudent` on its StudentRecord (this SPFx demo has
// no multi-user login). That flag only matters for session-level concerns like
// "Preview as Student" (components/AppRoot.tsx) and enrollment switching the
// active course mirror (below). It has no bearing on progress DATA: every
// roster student, live or not, has a real StudentProgress record — see
// admin/repository/progressRepository.ts — so admin/mentor analytics never
// need to special-case the live student.
import { state, commit } from './store';
import { Batch, StudentRecord, Enrollment } from '../types';

export function listBatches(): Batch[] {
  return state.batches;
}

export function createBatch(input: Omit<Batch, 'id'>): Batch {
  const batch: Batch = { ...input, id: `batch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
  state.batches.push(batch);
  commit();
  return batch;
}

export function updateBatch(id: string, patch: Partial<Omit<Batch, 'id'>>): void {
  const b = state.batches.find((bb) => bb.id === id);
  if (!b) return;
  Object.assign(b, patch);
  commit();
}

export function archiveBatch(id: string): void {
  updateBatch(id, { status: 'completed' });
}

export function listStudents(): StudentRecord[] {
  return state.students;
}

export function getStudent(id: string): StudentRecord | undefined {
  return state.students.find((s) => s.id === id);
}

export function updateStudent(id: string, patch: Partial<Omit<StudentRecord, 'id'>>): void {
  const s = getStudent(id);
  if (!s) return;
  Object.assign(s, patch);
  commit();
}

export function listEnrollments(): Enrollment[] {
  return state.enrollments;
}

// Enrolling a student creates the enrollment record and points their roster
// record at the new course/batch. If this is the live demo student, it ALSO
// switches the app's active course — which is what actually makes "Student
// sees the new course" true end to end (see store.ts's commit()/sync).
export function enrollStudent(input: { studentId: string; courseId: string; batchId?: string; startDate: string; expectedCompletion: string }): Enrollment {
  const enrollment: Enrollment = { ...input, id: `enroll-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, status: 'active' };
  state.enrollments.push(enrollment);
  const student = getStudent(input.studentId);
  const isLive = !!student?.isLiveDemoStudent;
  if (student) {
    student.courseId = input.courseId;
    student.batchId = input.batchId;
  }
  if (isLive && state.courses[input.courseId]) {
    state.activeCourseId = input.courseId;
  }
  commit();
  return enrollment;
}

export function createStudent(input: Omit<StudentRecord, 'id'>): StudentRecord {
  const student: StudentRecord = { ...input, id: `student-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
  state.students.push(student);
  commit();
  return student;
}
