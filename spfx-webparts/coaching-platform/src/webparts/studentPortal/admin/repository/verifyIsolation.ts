// A runnable self-check for the multi-student isolation guarantees this
// domain model exists to provide (studentId + courseId scoping). Framework-
// free — no React, no SPFx — so it can run against the real repository layer
// in any JS environment. Not wired into the app UI; call runIsolationChecks()
// from a scratch script or the browser console when touching this layer.
//
// ponytail: this asserts against the shared in-memory `state` singleton
// (admin/repository/store.ts), so it creates real students/courses/progress
// as a side effect — run it against a throwaway store (e.g. a fresh
// localStorage/Node process), never against production data.
import * as courseRepo from './courseRepository';
import * as rosterRepo from './rosterRepository';
import * as mentorRepo from './mentorRepository';
import * as progressRepository from './progressRepository';
import * as submissionRepo from './submissionRepository';

export interface CheckResult {
  name: string;
  passed: boolean;
  detail?: string;
}

function check(name: string, condition: boolean, detail?: string): CheckResult {
  return { name, passed: condition, detail };
}

export function runIsolationChecks(): { passed: boolean; results: CheckResult[] } {
  const results: CheckResult[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const courseA = courseRepo.createCourse({ title: 'Isolation Check Course A', code: 'ISO-A' }).id;
  const courseB = courseRepo.createCourse({ title: 'Isolation Check Course B', code: 'ISO-B' }).id;
  // Give both courses one real module/topic/mini task/assessment so dispatch
  // has real content to act on — an empty course silently no-ops every action.
  [courseA, courseB].forEach((courseId) => {
    const content = courseRepo.getCourseContent(courseId)!;
    content.moduleDefs.push({
      id: `${courseId}-m1`, courseId, title: 'Module 1', description: '', order: 1,
      topics: [{ id: `${courseId}-m1-t1`, courseId, moduleId: `${courseId}-m1`, title: 'Topic 1', order: 1, contentBlocks: [], testId: `${courseId}-m1-t1-test` }],
      practice: [], prerequisiteModuleId: undefined, moduleTestId: undefined, assessmentId: undefined, miniTaskId: `${courseId}-task-1`,
    } as unknown as import('../../data/types').ModuleDef);
    content.course.moduleOrder.push(`${courseId}-m1`);
    content.topicTests.push({ id: `${courseId}-m1-t1-test`, courseId, moduleId: `${courseId}-m1`, topicId: `${courseId}-m1-t1`, questions: [], passingScorePercent: 60 });
    content.miniTasks.push({
      id: `${courseId}-task-1`, courseId, moduleId: `${courseId}-m1`, title: 'Task 1', objective: '', requirements: [], resources: [], skills: [],
      difficulty: 'Beginner', estimatedDuration: '', deadline: '', githubRequired: false, pullRequestRequired: false,
      evaluationCriteriaTemplate: [{ label: 'Quality', maxScore: 10 }],
    } as unknown as import('../../data/types').MiniTaskDef);
  });

  const studentA1 = rosterRepo.createStudent({ name: 'Iso Student A1', email: 'iso-a1@example.com', courseId: courseA, enrollmentDate: today, status: 'active' });
  const studentA2 = rosterRepo.createStudent({ name: 'Iso Student A2', email: 'iso-a2@example.com', courseId: courseA, enrollmentDate: today, status: 'active' });
  const studentB1 = rosterRepo.createStudent({ name: 'Iso Student B1', email: 'iso-b1@example.com', courseId: courseB, enrollmentDate: today, status: 'active' });
  rosterRepo.enrollStudent({ studentId: studentA1.id, courseId: courseA, startDate: today, expectedCompletion: today });
  rosterRepo.enrollStudent({ studentId: studentA2.id, courseId: courseA, startDate: today, expectedCompletion: today });
  rosterRepo.enrollStudent({ studentId: studentB1.id, courseId: courseB, startDate: today, expectedCompletion: today });

  const batch = rosterRepo.createBatch({ name: 'Isolation Check Batch', courseId: courseA, startDate: today, endDate: today, scheduleDays: [], scheduleTime: '', mentorIds: [], primaryMentorId: undefined, status: 'active' });
  const mentor = mentorRepo.createMentor({ name: 'Iso Mentor', email: 'iso-mentor@example.com', status: 'active', joiningDate: today });
  mentorRepo.assignMentorsToBatch(batch.id, [mentor.id], mentor.id);
  rosterRepo.updateStudent(studentA1.id, { batchId: batch.id });
  rosterRepo.updateStudent(studentA2.id, { batchId: batch.id });

  // Scenario 1: Student A completes a topic in course A; Student A2 (same
  // course) must not see it completed.
  progressRepository.dispatch(studentA1.id, courseA, { type: 'MARK_TOPIC_VIEWED', topicId: `${courseA}-m1-t1` });
  const a1Progress = progressRepository.getProgress(studentA1.id, courseA);
  const a2Progress = progressRepository.getProgress(studentA2.id, courseA);
  results.push(check(
    'Scenario 1: topic completion does not leak to another student in the same course',
    !!a1Progress?.topics[`${courseA}-m1-t1`]?.contentViewed && !a2Progress?.topics[`${courseA}-m1-t1`]?.contentViewed
  ));

  // Scenario 2: two students submit the same task id — both submissions exist
  // independently.
  progressRepository.dispatch(studentA1.id, courseA, { type: 'SUBMIT_MINI_TASK', taskId: `${courseA}-task-1`, githubUrl: 'https://github.com/a1/repo', liveUrl: '', notes: '' });
  progressRepository.dispatch(studentA2.id, courseA, { type: 'SUBMIT_MINI_TASK', taskId: `${courseA}-task-1`, githubUrl: 'https://github.com/a2/repo', liveUrl: '', notes: '' });
  const subA1 = submissionRepo.getSubmission(studentA1.id, courseA, `${courseA}-task-1`, 1);
  const subA2 = submissionRepo.getSubmission(studentA2.id, courseA, `${courseA}-task-1`, 1);
  results.push(check(
    'Scenario 2: two students\' submissions of the same task both persist independently',
    subA1?.repositoryName === undefined && subA1?.studentId === studentA1.id && subA2?.studentId === studentA2.id && subA1?.id !== subA2?.id
  ));

  // Scenario 3: mentor evaluates Student A1's mini task; only A1's progress changes.
  submissionRepo.evaluateSubmission(studentA1.id, courseA, `${courseA}-task-1`, 1, { criteria: [{ label: 'Quality', score: 9, maxScore: 10 }], feedback: 'Great work', outcome: 'Passed' });
  const a1After = progressRepository.getProgress(studentA1.id, courseA);
  const a2After = progressRepository.getProgress(studentA2.id, courseA);
  results.push(check(
    'Scenario 3: evaluating one student\'s submission only changes that student\'s progress',
    a1After?.miniTasks[`${courseA}-task-1`]?.status === 'Passed' && a2After?.miniTasks[`${courseA}-task-1`]?.status === 'Under Review'
  ));

  // Scenario 4: Student A1 also enrolls in course B — course B starts with its
  // own, separate progress (course A's topic completion does not carry over).
  rosterRepo.enrollStudent({ studentId: studentA1.id, courseId: courseB, startDate: today, expectedCompletion: today });
  const a1InCourseB = progressRepository.getOrCreateProgress(studentA1.id, courseB);
  results.push(check(
    'Scenario 4: the same student\'s progress in a second course starts independent of the first',
    !a1InCourseB.topics[`${courseA}-m1-t1`] && Object.keys(a1InCourseB.miniTasks).length === 0
  ));

  // Re-enroll A1 back into course A so scenario 5 sees them there, matching
  // the batch/mentor assignment set up above — enrollStudent resets batchId
  // to whatever is passed (or clears it), so the batch must be re-passed here.
  rosterRepo.enrollStudent({ studentId: studentA1.id, courseId: courseA, batchId: batch.id, startDate: today, expectedCompletion: today });

  // Scenario 5: mentor's dashboard aggregates both of their students; opening
  // one student never surfaces the other's data.
  const mentorsStudents = mentorRepo.getStudentsForMentor(mentor.id);
  const seesBoth = mentorsStudents.some((s) => s.id === studentA1.id) && mentorsStudents.some((s) => s.id === studentA2.id);
  const a1View = progressRepository.getProgress(studentA1.id, courseA);
  const a2View = progressRepository.getProgress(studentA2.id, courseA);
  results.push(check(
    'Scenario 5: mentor dashboard aggregates all assigned students, each with their own progress record',
    seesBoth && a1View?.id !== a2View?.id && a1View?.miniTasks[`${courseA}-task-1`]?.status !== a2View?.miniTasks[`${courseA}-task-1`]?.status
  ));

  // Scenario 6: admin reports for course A only ever include course A's
  // students/content, never course B's — verified by construction: every
  // lookup below is parameterized by courseId, so asking for course B here
  // must exclude every course-A student.
  const courseBProgress = progressRepository.getProgressForCourse(courseB);
  results.push(check(
    'Scenario 6: switching the reports course selector only returns that course\'s progress records',
    courseBProgress.every((p) => p.courseId === courseB) && !courseBProgress.some((p) => p.studentId === studentA2.id)
  ));

  return { passed: results.every((r) => r.passed), results };
}
