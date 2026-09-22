// Cross-course relationship guards. Every repository that lets an admin point
// one entity at another (a question at a topic, a mini task at a module, …)
// routes the check through here instead of re-deriving it inline — this is
// what prevents "Course A's module attached to Course B's assessment" even
// though the UI already scopes its dropdowns per course.
import { state } from './store';

export class CrossCourseError extends Error {}

export function assertModuleBelongsToCourse(courseId: string, moduleId: string): void {
  const course = state.courses[courseId];
  const module = course?.moduleDefs.find((m) => m.id === moduleId);
  if (!module) throw new CrossCourseError(`Module "${moduleId}" does not belong to course "${courseId}".`);
}

export function assertTopicBelongsToModule(courseId: string, moduleId: string, topicId: string): void {
  const course = state.courses[courseId];
  const module = course?.moduleDefs.find((m) => m.id === moduleId);
  const topic = module?.topics.find((t) => t.id === topicId);
  if (!topic) throw new CrossCourseError(`Topic "${topicId}" does not belong to module "${moduleId}" in course "${courseId}".`);
}

export function assertCourseExists(courseId: string): void {
  if (!state.courses[courseId]) throw new CrossCourseError(`Course "${courseId}" does not exist.`);
}

export function assertMentorExists(mentorId: string): void {
  if (!state.mentors.some((m) => m.id === mentorId)) throw new CrossCourseError(`Mentor "${mentorId}" does not exist.`);
}

export function assertStudentExists(studentId: string): void {
  if (!state.students.some((s) => s.id === studentId)) throw new CrossCourseError(`Student "${studentId}" does not exist.`);
}

// A student must have an enrollment record for a course before a progress
// record can exist for it — progress never gets created "just in case".
export function assertStudentEnrolledInCourse(studentId: string, courseId: string): void {
  const enrolled = state.enrollments.some((e) => e.studentId === studentId && e.courseId === courseId);
  if (!enrolled) throw new CrossCourseError(`Student "${studentId}" is not enrolled in course "${courseId}".`);
}
