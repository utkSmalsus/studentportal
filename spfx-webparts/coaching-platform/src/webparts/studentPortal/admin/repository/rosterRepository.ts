// Batches, Students, Enrollments and the (non-live) roster evaluation queue.
//
// Only ONE student in this demo has a real, live progress state — the one
// driving AppStateContext (see state/AppStateContext.tsx), flagged
// `isLiveDemoStudent` on its StudentRecord. Every other roster row is
// realistic seed data with no backing student session (this SPFx demo has no
// multi-user login), so their "evaluation" actions update their own static
// record here rather than a live app-state. Evaluating the live demo
// student's mini tasks goes through AppStateContext directly (see
// EvaluationQueuePage), not through this file, so that it is genuinely live.
import { state, commit } from './store';
import { Batch, StudentRecord, Enrollment, RosterEvaluationItem, EvaluationStatus } from '../types';

export function listBatches(): Batch[] {
  return state.batches;
}

export function createBatch(input: Omit<Batch, 'id'>): Batch {
  const batch: Batch = { ...input, id: `batch-${Date.now().toString(36)}` };
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
  const enrollment: Enrollment = { ...input, id: `enroll-${Date.now().toString(36)}`, status: 'active' };
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
  const student: StudentRecord = { ...input, id: `student-${Date.now().toString(36)}` };
  state.students.push(student);
  commit();
  return student;
}

// ---- Roster (non-live) evaluation queue ----

export function listRosterEvaluations(): RosterEvaluationItem[] {
  return state.rosterEvaluations;
}

export function submitRosterEvaluation(itemId: string, outcome: EvaluationStatus, feedback: string): void {
  const item = state.rosterEvaluations.find((r) => r.id === itemId);
  if (!item) return;
  item.status = outcome;
  item.feedback = feedback;
  commit();
}
