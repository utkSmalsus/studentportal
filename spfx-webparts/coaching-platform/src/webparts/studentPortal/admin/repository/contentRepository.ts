// CRUD for the content entities that sit alongside topics: Module Tests,
// Assessments, Daily Coding challenges, Mini Tasks and the Major Project.
import { state, commit } from './store';
import { ModuleTestDef, AssessmentDef, CodingQuestionDef, MiniTaskDef, MajorProjectDef, MilestoneDef, TopicTestQuestionDef, AssessmentQuestionDef } from '../../data/types';
import { CourseContent } from '../types';

function content(courseId: string): CourseContent | undefined {
  return state.courses[courseId];
}

// ---- Module Tests ----

export function createModuleTest(courseId: string, moduleId: string, input: { title: string; timeLimitMinutes: number; passingScorePercent: number; attemptsAllowed: number }): ModuleTestDef | undefined {
  const c = content(courseId);
  const m = c?.moduleDefs.find((mm) => mm.id === moduleId);
  if (!c || !m) return undefined;
  const test: ModuleTestDef = { id: `${moduleId}-moduletest`, moduleId, questions: [], ...input };
  c.moduleTests.push(test);
  m.moduleTestId = test.id;
  commit(courseId);
  return test;
}

export function updateModuleTest(courseId: string, testId: string, patch: Partial<Omit<ModuleTestDef, 'id' | 'moduleId'>>): void {
  const test = content(courseId)?.moduleTests.find((t) => t.id === testId);
  if (!test) return;
  Object.assign(test, patch);
  commit(courseId);
}

export function deleteModuleTest(courseId: string, testId: string): void {
  const c = content(courseId);
  if (!c) return;
  const test = c.moduleTests.find((t) => t.id === testId);
  c.moduleTests = c.moduleTests.filter((t) => t.id !== testId);
  const m = c.moduleDefs.find((mm) => mm.id === test?.moduleId);
  if (m) m.moduleTestId = undefined;
  commit(courseId);
}

export function addQuestionToModuleTest(courseId: string, testId: string, q: Omit<TopicTestQuestionDef, 'id'>): void {
  const test = content(courseId)?.moduleTests.find((t) => t.id === testId);
  if (!test) return;
  test.questions.push({ ...q, id: `${testId}-q${test.questions.length + 1}-${Date.now().toString(36)}` });
  commit(courseId);
}

export function removeQuestionFromModuleTest(courseId: string, testId: string, questionId: string): void {
  const test = content(courseId)?.moduleTests.find((t) => t.id === testId);
  if (!test) return;
  test.questions = test.questions.filter((q) => q.id !== questionId);
  commit(courseId);
}

// ---- Assessments ----

export function createAssessment(courseId: string, moduleId: string, input: { title: string; topics: string[]; timeLimitMinutes: number; passingScorePercent: number; attemptsAllowed: number }): AssessmentDef | undefined {
  const c = content(courseId);
  const m = c?.moduleDefs.find((mm) => mm.id === moduleId);
  if (!c || !m) return undefined;
  const assessment: AssessmentDef = { id: `${moduleId}-assessment`, moduleId, questions: [], ...input };
  c.assessments.push(assessment);
  m.assessmentId = assessment.id;
  commit(courseId);
  return assessment;
}

export function updateAssessment(courseId: string, assessmentId: string, patch: Partial<Omit<AssessmentDef, 'id' | 'moduleId'>>): void {
  const a = content(courseId)?.assessments.find((aa) => aa.id === assessmentId);
  if (!a) return;
  Object.assign(a, patch);
  commit(courseId);
}

export function deleteAssessment(courseId: string, assessmentId: string): void {
  const c = content(courseId);
  if (!c) return;
  const a = c.assessments.find((aa) => aa.id === assessmentId);
  c.assessments = c.assessments.filter((aa) => aa.id !== assessmentId);
  const m = c.moduleDefs.find((mm) => mm.id === a?.moduleId);
  if (m) m.assessmentId = undefined;
  commit(courseId);
}

export function addQuestionToAssessment(courseId: string, assessmentId: string, q: Omit<AssessmentQuestionDef, 'id'>): void {
  const a = content(courseId)?.assessments.find((aa) => aa.id === assessmentId);
  if (!a) return;
  a.questions.push({ ...q, id: `${assessmentId}-q${a.questions.length + 1}-${Date.now().toString(36)}` });
  commit(courseId);
}

export function removeQuestionFromAssessment(courseId: string, assessmentId: string, questionId: string): void {
  const a = content(courseId)?.assessments.find((aa) => aa.id === assessmentId);
  if (!a) return;
  a.questions = a.questions.filter((q) => q.id !== questionId);
  commit(courseId);
}

// ---- Daily Coding ----

export function createCodingQuestion(courseId: string, input: Omit<CodingQuestionDef, 'id'>): CodingQuestionDef | undefined {
  const c = content(courseId);
  if (!c) return undefined;
  const q: CodingQuestionDef = { ...input, id: `dc-${Date.now().toString(36)}` };
  c.codingQuestions.push(q);
  c.codingQuestions.sort((a, b) => a.day - b.day);
  commit(courseId);
  return q;
}

export function updateCodingQuestion(courseId: string, id: string, patch: Partial<Omit<CodingQuestionDef, 'id'>>): void {
  const c = content(courseId);
  const q = c?.codingQuestions.find((qq) => qq.id === id);
  if (!c || !q) return;
  Object.assign(q, patch);
  c.codingQuestions.sort((a, b) => a.day - b.day);
  commit(courseId);
}

export function deleteCodingQuestion(courseId: string, id: string): void {
  const c = content(courseId);
  if (!c) return;
  c.codingQuestions = c.codingQuestions.filter((q) => q.id !== id);
  commit(courseId);
}

export function duplicateCodingQuestion(courseId: string, id: string): CodingQuestionDef | undefined {
  const c = content(courseId);
  const q = c?.codingQuestions.find((qq) => qq.id === id);
  if (!c || !q) return undefined;
  const copy: CodingQuestionDef = { ...JSON.parse(JSON.stringify(q)), id: `dc-${Date.now().toString(36)}`, day: q.day + 1, title: `${q.title} (Copy)` };
  c.codingQuestions.push(copy);
  c.codingQuestions.sort((a, b) => a.day - b.day);
  commit(courseId);
  return copy;
}

// ---- Mini Tasks ----

export function createMiniTask(courseId: string, input: Omit<MiniTaskDef, 'id'>): MiniTaskDef | undefined {
  const c = content(courseId);
  if (!c) return undefined;
  const task: MiniTaskDef = { ...input, id: `task-${Date.now().toString(36)}` };
  c.miniTasks.push(task);
  const m = c.moduleDefs.find((mm) => mm.id === input.moduleId);
  if (m && !m.miniTaskId) m.miniTaskId = task.id;
  commit(courseId);
  return task;
}

export function updateMiniTask(courseId: string, id: string, patch: Partial<Omit<MiniTaskDef, 'id'>>): void {
  const c = content(courseId);
  const task = c?.miniTasks.find((t) => t.id === id);
  if (!c || !task) return;
  Object.assign(task, patch);
  commit(courseId);
}

export function deleteMiniTask(courseId: string, id: string): void {
  const c = content(courseId);
  if (!c) return;
  c.miniTasks = c.miniTasks.filter((t) => t.id !== id);
  c.moduleDefs.forEach((m) => {
    if (m.miniTaskId === id) m.miniTaskId = undefined;
  });
  commit(courseId);
}

// ---- Major Project ----

export function updateMajorProject(courseId: string, patch: Partial<Omit<MajorProjectDef, 'milestones'>>): void {
  const c = content(courseId);
  if (!c) return;
  Object.assign(c.majorProject, patch);
  commit(courseId);
}

export function addMilestone(courseId: string, milestone: Omit<MilestoneDef, 'id'>): void {
  const c = content(courseId);
  if (!c) return;
  c.majorProject.milestones.push({ ...milestone, id: `m-${Date.now().toString(36)}` });
  commit(courseId);
}

export function updateMilestone(courseId: string, milestoneId: string, patch: Partial<Omit<MilestoneDef, 'id'>>): void {
  const c = content(courseId);
  const milestone = c?.majorProject.milestones.find((m) => m.id === milestoneId);
  if (!c || !milestone) return;
  Object.assign(milestone, patch);
  commit(courseId);
}

export function deleteMilestone(courseId: string, milestoneId: string): void {
  const c = content(courseId);
  if (!c) return;
  c.majorProject.milestones = c.majorProject.milestones.filter((m) => m.id !== milestoneId);
  commit(courseId);
}

export function reorderMilestone(courseId: string, milestoneId: string, direction: 'up' | 'down'): void {
  const c = content(courseId);
  if (!c) return;
  const list = c.majorProject.milestones;
  const index = list.findIndex((m) => m.id === milestoneId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  commit(courseId);
}
