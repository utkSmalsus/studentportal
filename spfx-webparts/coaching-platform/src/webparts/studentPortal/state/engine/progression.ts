// Generic locking/progression rules. Nothing here knows what "MERN" or "React" is —
// it only knows ModuleDef/LessonDef shapes, so the exact same functions drive an
// SPFx/SharePoint course later with zero changes. This is the one place that decides
// whether something is locked, current or complete — pages never compute that
// themselves.
import { ModuleDef, Course } from '../../data/types';
import { StudentProgressState, LessonStatus, PracticeStatus } from '../types';
import { miniTasks, assessments, majorProject } from '../../data/mockData';

// "current" is never stored — it's always the first not-yet-completed item in the
// module's own order. That's what makes the next lesson/practice automatically
// become actionable the moment the previous one is marked complete, with no
// separate "advance to next step" action needed anywhere.
export function getLessonStatus(module: ModuleDef, lessonId: string, progress: StudentProgressState): LessonStatus {
  if (progress.lessonStatus[lessonId] === 'completed') return 'completed';
  const firstIncomplete = module.learn.find((l) => progress.lessonStatus[l.id] !== 'completed');
  return firstIncomplete?.id === lessonId ? 'current' : 'upcoming';
}

export function getPracticeStatus(module: ModuleDef, practiceId: string, progress: StudentProgressState): PracticeStatus {
  if (progress.practiceStatus[practiceId] === 'completed') return 'completed';
  const firstIncomplete = module.practice.find((p) => progress.practiceStatus[p.id] !== 'completed');
  return firstIncomplete?.id === practiceId ? 'current' : 'upcoming';
}

export type ModuleStatus = 'locked' | 'completed' | 'current' | 'upcoming';

export function isLessonComplete(lessonId: string, progress: StudentProgressState): boolean {
  return progress.lessonStatus[lessonId] === 'completed';
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

export function isModuleComplete(module: ModuleDef, progress: StudentProgressState): boolean {
  // The capstone's completion isn't Learn/Practice/Task/Assessment — it's every
  // project milestone being done. This is the one place that distinction lives;
  // everything else about the capstone module (locking, display) flows through
  // the same generic functions as any other module.
  if (module.id === majorProject.moduleId) {
    return majorProject.milestones.every((m) => progress.project.milestoneStatus[m.id] === 'completed');
  }
  const learnDone = module.learn.every((l) => isLessonComplete(l.id, progress));
  const practiceDone = module.practice.every((p) => isPracticeComplete(p.id, progress));
  const taskDone = !module.miniTaskId || isMiniTaskComplete(module.miniTaskId, progress);
  const assessmentDone = !module.assessmentId || isAssessmentComplete(module.assessmentId, progress);
  return learnDone && practiceDone && taskDone && assessmentDone;
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

// Human-readable reason a locked module/task/assessment isn't available yet —
// used everywhere the UI needs to explain a lock, not just show a padlock icon.
export function lockedReason(module: ModuleDef, allModules: ModuleDef[]): string {
  const prereq = allModules.find((m) => m.id === module.prerequisiteModuleId);
  return prereq ? `Complete "${prereq.title}" to unlock ${module.title}.` : `${module.title} is locked.`;
}

export function isAssessmentUnlocked(module: ModuleDef, progress: StudentProgressState): boolean {
  const learnDone = module.learn.every((l) => isLessonComplete(l.id, progress));
  const practiceDone = module.practice.every((p) => isPracticeComplete(p.id, progress));
  return learnDone && practiceDone;
}

export function assessmentLockedReason(module: ModuleDef, progress: StudentProgressState): string {
  const learnDone = module.learn.every((l) => isLessonComplete(l.id, progress));
  if (!learnDone) return `Finish the Learn section of ${module.title} to unlock this assessment.`;
  return `Finish the Practice section of ${module.title} to unlock this assessment.`;
}

export function moduleProgressPercent(module: ModuleDef, progress: StudentProgressState): number {
  if (module.id === majorProject.moduleId) {
    const done = majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length;
    return Math.round((done / majorProject.milestones.length) * 100);
  }
  const learnTotal = module.learn.length;
  const practiceTotal = module.practice.length;
  const extras = (module.miniTaskId ? 1 : 0) + (module.assessmentId ? 1 : 0);
  const total = learnTotal + practiceTotal + extras || 1;
  const learnDone = module.learn.filter((l) => isLessonComplete(l.id, progress)).length;
  const practiceDone = module.practice.filter((p) => isPracticeComplete(p.id, progress)).length;
  const taskDone = module.miniTaskId && isMiniTaskComplete(module.miniTaskId, progress) ? 1 : 0;
  const assessmentDone = module.assessmentId && isAssessmentComplete(module.assessmentId, progress) ? 1 : 0;
  return Math.round(((learnDone + practiceDone + taskDone + assessmentDone) / total) * 100);
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
  kind: 'learn' | 'practice' | 'miniTask' | 'assessment' | 'moduleComplete';
  title: string;
  meta: string;
}

// What the student should do next INSIDE their current module — generic across
// any course, since it only looks at learn/practice/task/assessment completion.
export function nextModuleAction(module: ModuleDef, progress: StudentProgressState): NextAction | undefined {
  const nextLesson = module.learn.find((l) => !isLessonComplete(l.id, progress));
  if (nextLesson) return { kind: 'learn', title: nextLesson.title, meta: `~${nextLesson.estimatedMinutes} min` };

  const nextPractice = module.practice.find((p) => !isPracticeComplete(p.id, progress));
  if (nextPractice) return { kind: 'practice', title: nextPractice.title, meta: `~${nextPractice.estimatedMinutes} min` };

  if (module.miniTaskId) {
    const task = miniTasks.find((t) => t.id === module.miniTaskId);
    const entry = progress.miniTasks[module.miniTaskId];
    if (task && entry?.status !== 'Passed') {
      return { kind: 'miniTask', title: task.title, meta: entry?.status || 'Not Started' };
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
