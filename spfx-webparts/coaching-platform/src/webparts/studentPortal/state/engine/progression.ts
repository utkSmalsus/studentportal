// Generic locking/progression rules. Nothing here knows what "MERN" or "React" is —
// it only knows ModuleDef/TopicDef shapes, so the exact same functions drive an
// SPFx/SharePoint course later with zero changes. This is the one place that decides
// whether something is locked, current or complete — pages never compute that
// themselves.
//
// Gate chain per module: Topic -> Topic Test -> Daily Coding (gate) -> next Topic ->
// ... -> all Topics done -> Module Test -> Assessment -> Module Complete -> next
// Module unlocked.
import { ModuleDef, Course, TopicDef, CodingQuestionDef } from '../../data/types';
import { StudentProgressState, PracticeStatus, TopicProgressEntry } from '../types';
import { miniTasks, assessments, majorProject, moduleTests, codingQuestions } from '../../data/mockData';

export function getPracticeStatus(module: ModuleDef, practiceId: string, progress: StudentProgressState): PracticeStatus {
  if (progress.practiceStatus[practiceId] === 'completed') return 'completed';
  const firstIncomplete = module.practice.find((p) => progress.practiceStatus[p.id] !== 'completed');
  return firstIncomplete?.id === practiceId ? 'current' : 'upcoming';
}

export function isPracticeComplete(practiceId: string, progress: StudentProgressState): boolean {
  return progress.practiceStatus[practiceId] === 'completed';
}

export function isMiniTaskComplete(taskId: string, progress: StudentProgressState): boolean {
  return progress.miniTasks[taskId]?.status === 'Passed';
}

export function isAssessmentComplete(assessmentId: string, progress: StudentProgressState): boolean {
  return !!progress.assessments[assessmentId]?.attempts.some((a) => a.passed);
}

export type AssessmentUiStatus = 'not-started' | 'passed' | 'failed';

export function assessmentUiStatus(assessmentId: string, progress: StudentProgressState): AssessmentUiStatus {
  const entry = progress.assessments[assessmentId];
  if (!entry || entry.attempts.length === 0) return 'not-started';
  return entry.attempts.some((a) => a.passed) ? 'passed' : 'failed';
}

// ---- Daily Coding gate ------------------------------------------------------------
// Daily Coding stays its own nav item/experience, but today's scheduled challenge is
// also a hard prerequisite for advancing through the course journey.

export function todaysCodingQuestion(progress: StudentProgressState): CodingQuestionDef | undefined {
  return codingQuestions.find((q) => q.day === progress.codingCurrentDay);
}

export function isDailyCodingGateSatisfied(progress: StudentProgressState): boolean {
  const today = todaysCodingQuestion(progress);
  if (!today) return true;
  return !!progress.coding[today.id]?.attempts.some((a) => a.passed);
}

// ---- Topics ------------------------------------------------------------------------

export function isTopicTestPassed(topicId: string, progress: StudentProgressState): boolean {
  return !!progress.topics[topicId]?.testAttempts.some((a) => a.passed);
}

export const isTopicCompleted = isTopicTestPassed;

export function getTopicProgress(topicId: string, progress: StudentProgressState): TopicProgressEntry {
  return progress.topics[topicId] || { contentViewed: false, testAttempts: [] };
}

// A topic is unlocked once every topic before it (in module order) has a passed
// test. The daily coding gate blocks ADVANCING past a completed topic, not opening
// the first not-yet-done one, so a student can always see what's next.
export function isTopicUnlocked(module: ModuleDef, topicId: string, progress: StudentProgressState): boolean {
  const index = module.topics.findIndex((t) => t.id === topicId);
  if (index <= 0) return true;
  return module.topics.slice(0, index).every((t) => isTopicTestPassed(t.id, progress));
}

export type TopicUiStatus = 'locked' | 'completed' | 'current' | 'upcoming';

export function getTopicStatus(module: ModuleDef, topicId: string, progress: StudentProgressState): TopicUiStatus {
  if (isTopicTestPassed(topicId, progress)) return 'completed';
  if (!isTopicUnlocked(module, topicId, progress)) return 'locked';
  const firstOpen = module.topics.find((t) => !isTopicTestPassed(t.id, progress));
  return firstOpen?.id === topicId ? 'current' : 'upcoming';
}

// Can the student open this topic's detail page at all?
export function canOpenTopic(module: ModuleDef, topicId: string, progress: StudentProgressState): boolean {
  return isTopicUnlocked(module, topicId, progress);
}

// Can the student attempt/re-attempt this topic's test?
export function canCompleteTopic(module: ModuleDef, topicId: string, progress: StudentProgressState): boolean {
  return isTopicUnlocked(module, topicId, progress);
}

// Once a topic's test is passed, can the student move to the next topic yet, or is
// today's Daily Coding challenge blocking them?
export function canAdvanceFromTopic(topicId: string, progress: StudentProgressState): boolean {
  return isTopicTestPassed(topicId, progress) && isDailyCodingGateSatisfied(progress);
}

export function canAdvanceToNextTopic(topicId: string, progress: StudentProgressState): boolean {
  return canAdvanceFromTopic(topicId, progress);
}

export function areAllTopicsComplete(module: ModuleDef, progress: StudentProgressState): boolean {
  return module.topics.every((t) => isTopicTestPassed(t.id, progress));
}

// ---- Module Test ---------------------------------------------------------------

export function isModuleTestPassed(moduleTestId: string, progress: StudentProgressState): boolean {
  return !!progress.moduleTests[moduleTestId]?.attempts.some((a) => a.passed);
}

export function canStartModuleTest(module: ModuleDef, progress: StudentProgressState): boolean {
  if (!module.moduleTestId) return false;
  return areAllTopicsComplete(module, progress) && isDailyCodingGateSatisfied(progress);
}

// ---- Assessment ------------------------------------------------------------------
// Gated by the Module Test when the module has one; otherwise falls back to "all
// topics complete", same as before Module Tests existed.

export function canStartAssessment(module: ModuleDef, progress: StudentProgressState): boolean {
  if (module.moduleTestId) return isModuleTestPassed(module.moduleTestId, progress);
  return areAllTopicsComplete(module, progress) && isDailyCodingGateSatisfied(progress);
}

export const isAssessmentUnlocked = canStartAssessment;

// Human-readable reason a locked topic/module test/assessment isn't available yet —
// used everywhere the UI needs to explain a lock, not just show a padlock icon.
export function getLockReason(module: ModuleDef, target: 'topic' | 'moduleTest' | 'assessment', progress: StudentProgressState, topic?: TopicDef): string {
  if (target === 'topic' && topic) {
    const index = module.topics.findIndex((t) => t.id === topic.id);
    const prev = module.topics[index - 1];
    if (prev && !isTopicTestPassed(prev.id, progress)) return `Pass the "${prev.title}" topic test to continue.`;
    if (prev && !isDailyCodingGateSatisfied(progress)) return 'Complete today\'s Daily Coding challenge before continuing your learning journey.';
    return `Complete the earlier topics in ${module.title} first.`;
  }
  if (target === 'moduleTest') {
    if (!areAllTopicsComplete(module, progress)) return `Complete all ${module.title} topics to unlock the Module Test.`;
    if (!isDailyCodingGateSatisfied(progress)) return 'Complete today\'s Daily Coding challenge before continuing your learning journey.';
    return 'Module Test is locked.';
  }
  // assessment
  if (module.moduleTestId) return `Pass the Module Test to unlock the Assessment.`;
  if (!areAllTopicsComplete(module, progress)) return `Complete all ${module.title} topics to unlock the Assessment.`;
  return 'Complete today\'s Daily Coding challenge before continuing your learning journey.';
}

export function assessmentLockedReason(module: ModuleDef, progress: StudentProgressState): string {
  return getLockReason(module, 'assessment', progress);
}

// ---- Modules -----------------------------------------------------------------------

export type ModuleStatus = 'locked' | 'completed' | 'current' | 'upcoming';

export function isModuleComplete(module: ModuleDef, progress: StudentProgressState): boolean {
  // The capstone's completion isn't Topics/Practice/Task/Assessment — it's every
  // project milestone being done. This is the one place that distinction lives;
  // everything else about the capstone module (locking, display) flows through
  // the same generic functions as any other module.
  if (module.id === majorProject.moduleId) {
    return majorProject.milestones.every((m) => progress.project.milestoneStatus[m.id] === 'completed');
  }
  const topicsDone = areAllTopicsComplete(module, progress);
  const practiceDone = module.practice.every((p) => isPracticeComplete(p.id, progress));
  const taskDone = !module.miniTaskId || isMiniTaskComplete(module.miniTaskId, progress);
  const moduleTestDone = !module.moduleTestId || isModuleTestPassed(module.moduleTestId, progress);
  const assessmentDone = !module.assessmentId || isAssessmentComplete(module.assessmentId, progress);
  return topicsDone && practiceDone && taskDone && moduleTestDone && assessmentDone;
}

export function isModuleUnlocked(module: ModuleDef, allModules: ModuleDef[], progress: StudentProgressState): boolean {
  if (!module.prerequisiteModuleId) return true;
  const prereq = allModules.find((m) => m.id === module.prerequisiteModuleId);
  return prereq ? isModuleComplete(prereq, progress) : true;
}

export function getModuleStatus(module: ModuleDef, allModules: ModuleDef[], progress: StudentProgressState): ModuleStatus {
  if (!isModuleUnlocked(module, allModules, progress)) return 'locked';
  if (isModuleComplete(module, progress)) return 'completed';
  return 'current';
}

// Human-readable reason a locked module isn't available yet.
export function lockedReason(module: ModuleDef, allModules: ModuleDef[]): string {
  const prereq = allModules.find((m) => m.id === module.prerequisiteModuleId);
  return prereq ? `Complete "${prereq.title}" to unlock ${module.title}.` : `${module.title} is locked.`;
}

export function moduleProgressPercent(module: ModuleDef, progress: StudentProgressState): number {
  if (module.id === majorProject.moduleId) {
    const done = majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length;
    return Math.round((done / majorProject.milestones.length) * 100);
  }
  const topicsTotal = module.topics.length;
  const practiceTotal = module.practice.length;
  const extras = (module.miniTaskId ? 1 : 0) + (module.moduleTestId ? 1 : 0) + (module.assessmentId ? 1 : 0);
  const total = topicsTotal + practiceTotal + extras || 1;
  const topicsDone = module.topics.filter((t) => isTopicTestPassed(t.id, progress)).length;
  const practiceDone = module.practice.filter((p) => isPracticeComplete(p.id, progress)).length;
  const taskDone = module.miniTaskId && isMiniTaskComplete(module.miniTaskId, progress) ? 1 : 0;
  const moduleTestDone = module.moduleTestId && isModuleTestPassed(module.moduleTestId, progress) ? 1 : 0;
  const assessmentDone = module.assessmentId && isAssessmentComplete(module.assessmentId, progress) ? 1 : 0;
  return Math.round(((topicsDone + practiceDone + taskDone + moduleTestDone + assessmentDone) / total) * 100);
}

export function courseOverallProgress(course: Course, allModules: ModuleDef[], progress: StudentProgressState): number {
  const modules = course.moduleOrder.map((id) => allModules.find((m) => m.id === id)).filter((m): m is ModuleDef => !!m);
  if (modules.length === 0) return 0;
  const perModule = modules.map((m) => moduleProgressPercent(m, progress) / 100);
  return Math.round((perModule.reduce((s, p) => s + p, 0) / perModule.length) * 100);
}

// The single module the student is actively working on: the first module, in
// course order, that is unlocked and not yet complete.
export function currentModule(course: Course, allModules: ModuleDef[], progress: StudentProgressState): ModuleDef | undefined {
  for (const id of course.moduleOrder) {
    const m = allModules.find((mod) => mod.id === id);
    if (!m) continue;
    if (getModuleStatus(m, allModules, progress) === 'current') return m;
  }
  return undefined;
}

export interface NextAction {
  kind: 'topic' | 'dailyGate' | 'practice' | 'miniTask' | 'moduleTest' | 'assessment' | 'moduleComplete';
  title: string;
  meta: string;
  topicId?: string;
}

// What the student should do next INSIDE their current module — generic across any
// course, since it only looks at topic/practice/task/moduleTest/assessment
// completion. Daily Coding is checked first among the "advance" gates: a passed
// topic that's blocked from advancing surfaces as a dailyGate action, not silently
// skipped.
export function nextModuleAction(module: ModuleDef, progress: StudentProgressState): NextAction | undefined {
  const nextTopic = module.topics.find((t) => !isTopicTestPassed(t.id, progress));
  if (nextTopic) {
    const index = module.topics.findIndex((t) => t.id === nextTopic.id);
    const prevTopic = module.topics[index - 1];
    if (prevTopic && !isDailyCodingGateSatisfied(progress)) {
      return { kind: 'dailyGate', title: 'Daily Coding Required', meta: "Complete today's coding challenge to continue" };
    }
    return { kind: 'topic', title: nextTopic.title, meta: `~${nextTopic.estimatedMinutes} min`, topicId: nextTopic.id };
  }

  if (!isDailyCodingGateSatisfied(progress) && module.topics.length > 0) {
    return { kind: 'dailyGate', title: 'Daily Coding Required', meta: "Complete today's coding challenge to continue" };
  }

  const nextPractice = module.practice.find((p) => !isPracticeComplete(p.id, progress));
  if (nextPractice) return { kind: 'practice', title: nextPractice.title, meta: `~${nextPractice.estimatedMinutes} min` };

  if (module.miniTaskId) {
    const task = miniTasks.find((t) => t.id === module.miniTaskId);
    const entry = progress.miniTasks[module.miniTaskId];
    if (task && entry?.status !== 'Passed') {
      return { kind: 'miniTask', title: task.title, meta: entry?.status || 'Not Started' };
    }
  }

  if (module.moduleTestId) {
    const test = moduleTests.find((t) => t.id === module.moduleTestId);
    if (test && !isModuleTestPassed(module.moduleTestId, progress)) {
      return { kind: 'moduleTest', title: test.title, meta: `${test.questions.length} questions` };
    }
  }

  if (module.assessmentId) {
    const assessment = assessments.find((a) => a.id === module.assessmentId);
    if (assessment && !isAssessmentComplete(module.assessmentId, progress)) {
      return { kind: 'assessment', title: assessment.title, meta: `${assessment.questions.length} questions` };
    }
  }

  return { kind: 'moduleComplete', title: module.title, meta: 'Module complete' };
}
