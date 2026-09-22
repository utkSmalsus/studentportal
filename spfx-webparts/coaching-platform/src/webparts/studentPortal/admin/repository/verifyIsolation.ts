// A runnable self-check for the multi-student isolation guarantees this
// domain model exists to provide (studentId + courseId scoping). Framework-
// free — no React, no SPFx — so it can run against the real repository layer
// in any JS environment. Not wired into the app UI; call runIsolationChecks()
// from a scratch script or the browser console when touching this layer.
//
// Each exported check function snapshots the store before running and
// restores it afterward (see withStateSnapshot below) — it still exercises
// the real repository layer end to end (create/enroll/dispatch/evaluate all
// really happen), but the demo's actual courses/students/progress are back
// exactly as they were once the function returns, even if the checks fail
// partway through. Safe to run against a live dev session's localStorage.
import { state as storeState, clone, commit } from './store';
import * as courseRepo from './courseRepository';
import * as rosterRepo from './rosterRepository';
import * as mentorRepo from './mentorRepository';
import * as progressRepository from './progressRepository';
import * as submissionRepo from './submissionRepository';
import * as projectSubmissionRepo from './projectSubmissionRepository';

export interface CheckResult {
  name: string;
  passed: boolean;
  detail?: string;
}

function check(name: string, condition: boolean, detail?: string): CheckResult {
  return { name, passed: condition, detail };
}

function withStateSnapshot<T>(run: () => T): T {
  const snapshot = clone(storeState);
  try {
    return run();
  } finally {
    Object.keys(storeState).forEach((key) => delete (storeState as unknown as Record<string, unknown>)[key]);
    Object.assign(storeState, snapshot);
    commit();
  }
}

export function runIsolationChecks(): { passed: boolean; results: CheckResult[] } {
  return withStateSnapshot(() => runIsolationChecksImpl());
}

function runIsolationChecksImpl(): { passed: boolean; results: CheckResult[] } {
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

// Scenarios A-G from the Major Project resubmission/evaluation lifecycle spec
// — a second, independent course/roster setup so it never interacts with
// runIsolationChecks()'s state.
export function runProjectResubmissionChecks(): { passed: boolean; results: CheckResult[] } {
  return withStateSnapshot(() => runProjectResubmissionChecksImpl());
}

function runProjectResubmissionChecksImpl(): { passed: boolean; results: CheckResult[] } {
  const results: CheckResult[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const courseP = courseRepo.createCourse({ title: 'Project Check Course P', code: 'PRJ-P' }).id;
  const courseQ = courseRepo.createCourse({ title: 'Project Check Course Q', code: 'PRJ-Q' }).id;
  // Distinct Major Project content per course (mirrors MERN vs SPFx having
  // their own capstones) — proves ProjectPage's course-scoped lookup actually
  // matters, not just that two empty projects happen to look identical.
  courseRepo.getCourseContent(courseP)!.majorProject.title = 'P Capstone Project';
  courseRepo.getCourseContent(courseQ)!.majorProject.title = 'Q Capstone Project';
  const studentP1 = rosterRepo.createStudent({ name: 'Project Student P1', email: 'prj-p1@example.com', courseId: courseP, enrollmentDate: today, status: 'active' });
  const studentQ1 = rosterRepo.createStudent({ name: 'Project Student Q1', email: 'prj-q1@example.com', courseId: courseQ, enrollmentDate: today, status: 'active' });
  rosterRepo.enrollStudent({ studentId: studentP1.id, courseId: courseP, startDate: today, expectedCompletion: today });
  rosterRepo.enrollStudent({ studentId: studentQ1.id, courseId: courseQ, startDate: today, expectedCompletion: today });

  // Scenario A: no submission yet, then submit — status becomes Under Review.
  const before = progressRepository.getOrCreateProgress(studentP1.id, courseP);
  results.push(check('Scenario A: no submission yet starts as Not Started', before.project.status === 'Not Started' && before.project.versions.length === 0));
  progressRepository.dispatch(studentP1.id, courseP, {
    type: 'SUBMIT_PROJECT', githubUrl: 'https://github.com/p1/capstone', liveUrl: 'https://p1-capstone.example.com', documentationUrl: '',
    github: { repositoryName: 'p1/capstone', branch: 'main', commitSha: 'abc1234' },
  });
  const afterSubmit = progressRepository.getProgress(studentP1.id, courseP)!;
  results.push(check(
    'Scenario A: submitting moves status to Under Review with attempt 1',
    afterSubmit.project.status === 'Under Review' && afterSubmit.project.versions.length === 1 && afterSubmit.project.versions[0].version === 1 && afterSubmit.project.versions[0].githubUrl === 'https://github.com/p1/capstone'
  ));

  // Scenario B: mentor sees the structured evidence and evaluates Passed.
  const pendingForP1 = projectSubmissionRepo.listPendingProjectSubmissions([studentP1.id], courseP);
  const submissionSeenByMentor = pendingForP1[0];
  results.push(check(
    'Scenario B: mentor queue exposes repository/branch/commit/live evidence',
    submissionSeenByMentor?.repositoryName === 'p1/capstone' && submissionSeenByMentor?.branch === 'main' && submissionSeenByMentor?.commitSha === 'abc1234' && submissionSeenByMentor?.liveUrl === 'https://p1-capstone.example.com'
  ));
  projectSubmissionRepo.evaluateProjectSubmission(studentP1.id, courseP, 1, { criteria: [{ label: 'Code Quality', score: 9, maxScore: 10 }], feedback: 'Excellent work.', outcome: 'Passed' });
  const afterPass = progressRepository.getProgress(studentP1.id, courseP)!;
  results.push(check(
    'Scenario B: evaluating Passed marks the latest submission Passed',
    afterPass.project.status === 'Passed' && afterPass.project.versions[0].evaluation?.outcome === 'Passed'
  ));

  // Scenario C: a second student's submission gets Changes Requested — they
  // must see feedback, score and be able to resubmit.
  progressRepository.dispatch(studentQ1.id, courseQ, {
    type: 'SUBMIT_PROJECT', githubUrl: 'https://github.com/q1/capstone', liveUrl: '', documentationUrl: '',
    github: { repositoryName: 'q1/capstone', branch: 'main', commitSha: 'c1c1c1c' },
  });
  projectSubmissionRepo.evaluateProjectSubmission(studentQ1.id, courseQ, 1, { criteria: [{ label: 'Code Quality', score: 4, maxScore: 10 }], feedback: 'Needs error handling.', outcome: 'Changes Requested' });
  const afterChangesRequested = progressRepository.getProgress(studentQ1.id, courseQ)!;
  results.push(check(
    'Scenario C: evaluating Changes Requested surfaces feedback, score and the submitted commit SHA, and allows resubmission',
    afterChangesRequested.project.status === 'Changes Requested' &&
      afterChangesRequested.project.versions[0].evaluation?.feedback === 'Needs error handling.' &&
      afterChangesRequested.project.versions[0].evaluation?.criteria[0].score === 4 &&
      afterChangesRequested.project.versions[0].commitSha === 'c1c1c1c'
  ));

  // Scenario D: student resubmits with a NEW commit SHA — attempt 1 -> 2, old
  // version (and its commitSha) preserved, status back to Under Review.
  progressRepository.dispatch(studentQ1.id, courseQ, {
    type: 'SUBMIT_PROJECT', githubUrl: 'https://github.com/q1/capstone', liveUrl: '', documentationUrl: '',
    github: { repositoryName: 'q1/capstone', branch: 'fix/error-handling', commitSha: 'd2d2d2d' },
  });
  const afterResubmit = progressRepository.getProgress(studentQ1.id, courseQ)!;
  results.push(check(
    'Scenario D: resubmission increments the attempt, keeps the old version\'s commitSha, and returns to Under Review',
    afterResubmit.project.status === 'Under Review' &&
      afterResubmit.project.versions.length === 2 &&
      afterResubmit.project.versions[0].version === 1 &&
      afterResubmit.project.versions[0].commitSha === 'c1c1c1c' &&
      afterResubmit.project.versions[0].evaluation?.outcome === 'Changes Requested' &&
      afterResubmit.project.versions[1].version === 2 &&
      afterResubmit.project.versions[1].branch === 'fix/error-handling' &&
      afterResubmit.project.versions[1].commitSha === 'd2d2d2d'
  ));

  // Scenario E: mentor evaluates attempt 2 — attempt 1 stays exactly as it was.
  const attempt1Before = { ...afterResubmit.project.versions[0] };
  projectSubmissionRepo.evaluateProjectSubmission(studentQ1.id, courseQ, 2, { criteria: [{ label: 'Code Quality', score: 9, maxScore: 10 }], feedback: 'Fixed, nice work.', outcome: 'Passed' });
  const afterSecondEval = progressRepository.getProgress(studentQ1.id, courseQ)!;
  results.push(check(
    'Scenario E: evaluating attempt 2 never modifies attempt 1',
    JSON.stringify(afterSecondEval.project.versions[0]) === JSON.stringify(attempt1Before) &&
      afterSecondEval.project.versions[1].evaluation?.outcome === 'Passed' &&
      afterSecondEval.project.status === 'Passed'
  ));

  // Scenario F: a student from another course submitting must never appear in
  // the first course's pending queue.
  progressRepository.dispatch(studentP1.id, courseP, {
    type: 'SUBMIT_PROJECT', githubUrl: 'https://github.com/p1/capstone-v2', liveUrl: '', documentationUrl: '', github: { repositoryName: 'p1/capstone-v2' },
  });
  const courseQPending = projectSubmissionRepo.listPendingProjectSubmissions([studentQ1.id], courseQ);
  const courseAPendingLeak = projectSubmissionRepo.listPendingProjectSubmissions([studentP1.id], courseP).some((s) => s.studentId === studentQ1.id);
  results.push(check(
    'Scenario F: a submission from another course never appears in a different course\'s queue',
    !courseAPendingLeak && courseQPending.every((s) => s.courseId === courseQ)
  ));

  // Scenario G: a legacy submission with only githubUrl/liveUrl/documentationUrl
  // (no repositoryName/branch/commitSha/pullRequestUrl) still renders without
  // throwing, and the missing structured fields come back undefined.
  const legacyProgress = progressRepository.getProgress(studentP1.id, courseP)!;
  legacyProgress.project.versions.push({ version: 3, githubUrl: 'https://github.com/p1/legacy', liveUrl: '', documentationUrl: '', submittedAt: new Date().toISOString() });
  legacyProgress.project.status = 'Under Review';
  const legacySubmission = projectSubmissionRepo.getProjectSubmission(studentP1.id, courseP);
  results.push(check(
    'Scenario G: a legacy submission missing structured GitHub fields still reads back correctly',
    legacySubmission?.attempt === 3 &&
      legacySubmission?.repositoryName === undefined &&
      legacySubmission?.branch === undefined &&
      legacySubmission?.commitSha === undefined &&
      legacySubmission?.pullRequestUrl === undefined &&
      legacyProgress.project.versions[2].githubUrl === 'https://github.com/p1/legacy'
  ));

  // Scenarios 8/9: each student's course-scoped content lookup (what
  // ProjectPage now does via courseRepo.getCourseContent(courseId) instead of
  // the mirrored data/selectors) returns THEIR OWN course's Major Project.
  const pContent = courseRepo.getCourseContent(courseP);
  const qContent = courseRepo.getCourseContent(courseQ);
  results.push(check(
    'Scenario 8/9: each course\'s content lookup returns its own Major Project, never the other\'s',
    pContent?.majorProject.title === 'P Capstone Project' && qContent?.majorProject.title === 'Q Capstone Project'
  ));

  return { passed: results.every((r) => r.passed), results };
}

// Section 13's checklist items not already covered above: D (task content
// stays course-scoped), the Mini Task equivalent of G/H (resubmission
// preserves the prior attempt, evaluating one attempt never touches
// another), and F (evaluating a submission in one course never mutates a
// different course's data at all, not just "doesn't appear in its queue").
export function runMiniTaskCourseIsolationChecks(): { passed: boolean; results: CheckResult[] } {
  return withStateSnapshot(() => runMiniTaskCourseIsolationChecksImpl());
}

function runMiniTaskCourseIsolationChecksImpl(): { passed: boolean; results: CheckResult[] } {
  const results: CheckResult[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const courseX = courseRepo.createCourse({ title: 'Task Check Course X', code: 'TSK-X' }).id;
  const courseY = courseRepo.createCourse({ title: 'Task Check Course Y', code: 'TSK-Y' }).id;
  [courseX, courseY].forEach((courseId) => {
    const content = courseRepo.getCourseContent(courseId)!;
    content.moduleDefs.push({ id: `${courseId}-m1`, courseId, title: `${courseId} Module 1`, description: '', order: 1, topics: [], practice: [], miniTaskId: `${courseId}-task-1` } as unknown as import('../../data/types').ModuleDef);
    content.course.moduleOrder.push(`${courseId}-m1`);
    content.miniTasks.push({
      id: `${courseId}-task-1`, courseId, moduleId: `${courseId}-m1`, title: `${courseId} Task`, objective: '', requirements: [], resources: [], skills: [],
      difficulty: 'Beginner', estimatedDuration: '', deadline: '', githubRequired: false, pullRequestRequired: false, evaluationCriteriaTemplate: [{ label: 'Quality', maxScore: 10 }],
    } as unknown as import('../../data/types').MiniTaskDef);
  });

  const studentX1 = rosterRepo.createStudent({ name: 'Task Student X1', email: 'tsk-x1@example.com', courseId: courseX, enrollmentDate: today, status: 'active' });
  const studentY1 = rosterRepo.createStudent({ name: 'Task Student Y1', email: 'tsk-y1@example.com', courseId: courseY, enrollmentDate: today, status: 'active' });
  rosterRepo.enrollStudent({ studentId: studentX1.id, courseId: courseX, startDate: today, expectedCompletion: today });
  rosterRepo.enrollStudent({ studentId: studentY1.id, courseId: courseY, startDate: today, expectedCompletion: today });

  // D: task content is course-scoped — each course's own content lookup only
  // ever contains its own task, never the other course's.
  const xContent = courseRepo.getCourseContent(courseX);
  const yContent = courseRepo.getCourseContent(courseY);
  results.push(check(
    'Section 13.D: mini task content stays scoped to its own course',
    xContent?.miniTasks.some((t) => t.id === `${courseX}-task-1`) === true &&
      xContent?.miniTasks.some((t) => t.id === `${courseY}-task-1`) === false &&
      yContent?.miniTasks.some((t) => t.id === `${courseY}-task-1`) === true
  ));

  // G/H for Mini Tasks: submit, get Changes Requested, resubmit — attempt 1
  // preserved untouched, attempt 2 is new and independently evaluable.
  progressRepository.dispatch(studentX1.id, courseX, { type: 'SUBMIT_MINI_TASK', taskId: `${courseX}-task-1`, githubUrl: 'https://github.com/x1/repo', liveUrl: '', notes: 'v1' });
  submissionRepo.evaluateSubmission(studentX1.id, courseX, `${courseX}-task-1`, 1, { criteria: [{ label: 'Quality', score: 5, maxScore: 10 }], feedback: 'Needs work', outcome: 'Changes Requested' });
  progressRepository.dispatch(studentX1.id, courseX, { type: 'SUBMIT_MINI_TASK', taskId: `${courseX}-task-1`, githubUrl: 'https://github.com/x1/repo-v2', liveUrl: '', notes: 'v2' });
  const attempt1BeforeSecondEval = { ...progressRepository.getProgress(studentX1.id, courseX)!.miniTasks[`${courseX}-task-1`].versions[0] };
  submissionRepo.evaluateSubmission(studentX1.id, courseX, `${courseX}-task-1`, 2, { criteria: [{ label: 'Quality', score: 9, maxScore: 10 }], feedback: 'Great fix', outcome: 'Passed' });
  const xEntryAfter = progressRepository.getProgress(studentX1.id, courseX)!.miniTasks[`${courseX}-task-1`];
  results.push(check(
    'Section 13.G/H: mini task resubmission preserves attempt 1, and evaluating attempt 2 never modifies it',
    xEntryAfter.versions.length === 2 &&
      JSON.stringify(xEntryAfter.versions[0]) === JSON.stringify(attempt1BeforeSecondEval) &&
      xEntryAfter.versions[1].evaluation?.outcome === 'Passed' &&
      xEntryAfter.status === 'Passed'
  ));

  // F: evaluating a submission in course X never mutates course Y's data at
  // all — not just "doesn't show up in Y's queue" (already covered
  // elsewhere), but the actual stored record is untouched.
  progressRepository.dispatch(studentY1.id, courseY, { type: 'SUBMIT_MINI_TASK', taskId: `${courseY}-task-1`, githubUrl: 'https://github.com/y1/repo', liveUrl: '', notes: '' });
  const yBeforeXEval = JSON.stringify(progressRepository.getProgress(studentY1.id, courseY));
  submissionRepo.evaluateSubmission(studentX1.id, courseX, `${courseX}-task-1`, 2, { criteria: [{ label: 'Quality', score: 10, maxScore: 10 }], feedback: 'Re-scored', outcome: 'Passed' });
  const yAfterXEval = JSON.stringify(progressRepository.getProgress(studentY1.id, courseY));
  results.push(check('Section 13.F: evaluating a submission in one course never mutates another course\'s data', yBeforeXEval === yAfterXEval));

  return { passed: results.every((r) => r.passed), results };
}
