// Mentor CRUD + the Batch -> Mentor -> Student relationship. Batch assignment
// is the source of truth for which students a mentor can see (section 6/59 of
// the spec) — nothing here duplicates mentor assignment onto individual students.
import { state, commit } from './store';
import { Mentor, MentorStatus, Batch, StudentRecord } from '../types';
import { assertMentorExists } from './validation';
import * as submissionRepository from './submissionRepository';
import * as projectSubmissionRepository from './projectSubmissionRepository';

export function listMentors(): Mentor[] {
  return state.mentors;
}

export function getMentor(id: string): Mentor | undefined {
  return state.mentors.find((m) => m.id === id);
}

export function createMentor(input: Omit<Mentor, 'id'>): Mentor {
  const mentor: Mentor = { ...input, id: `mentor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
  state.mentors.push(mentor);
  commit();
  return mentor;
}

export function updateMentor(id: string, patch: Partial<Omit<Mentor, 'id'>>): void {
  const m = getMentor(id);
  if (!m) return;
  Object.assign(m, patch);
  commit();
}

export function setMentorStatus(id: string, status: MentorStatus): void {
  updateMentor(id, { status });
}

// ---- Batch <-> Mentor ----

export function assignMentorsToBatch(batchId: string, mentorIds: string[], primaryMentorId?: string): void {
  const batch = state.batches.find((b) => b.id === batchId);
  if (!batch) return;
  mentorIds.forEach(assertMentorExists);
  if (primaryMentorId) assertMentorExists(primaryMentorId);
  batch.mentorIds = mentorIds;
  batch.primaryMentorId = primaryMentorId && mentorIds.indexOf(primaryMentorId) !== -1 ? primaryMentorId : mentorIds[0];
  commit();
}

export function getBatchesForMentor(mentorId: string): Batch[] {
  return state.batches.filter((b) => b.mentorIds.indexOf(mentorId) !== -1);
}

// The batch is the source of truth for mentor access — a student "belongs" to
// every mentor assigned to their batch, nothing is duplicated onto the student.
export function getStudentsForMentor(mentorId: string): StudentRecord[] {
  const batchIds = getBatchesForMentor(mentorId).map((b) => b.id);
  return state.students.filter((s) => s.batchId && batchIds.indexOf(s.batchId) !== -1);
}

export function isStudentAssignedToMentor(mentorId: string, studentId: string): boolean {
  return getStudentsForMentor(mentorId).some((s) => s.id === studentId);
}

// Real per-student Mini Task and Major Project submissions — both are now
// scoped to studentId+courseId via submissionRepository/projectSubmissionRepository,
// so this counts genuine pending work, never a mock roster-wide queue.
export function getPendingReviewCountForMentor(mentorId: string): number {
  const myStudents = getStudentsForMentor(mentorId);
  const miniTaskCount = myStudents.reduce((sum, s) => sum + submissionRepository.listPendingSubmissions([s.id], s.courseId).length, 0);
  const projectCount = myStudents.reduce((sum, s) => sum + projectSubmissionRepository.listPendingProjectSubmissions([s.id], s.courseId).length, 0);
  return miniTaskCount + projectCount;
}
