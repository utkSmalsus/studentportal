// Curriculum Builder CRUD: modules and topics within a course. This is the
// centerpiece repository — it's what the Curriculum Builder page drives.
import { state, commit } from './store';
import { ModuleDef, TopicDef, ModuleGroup, ProgressionRules, TopicTestDef } from '../../data/types';
import { CourseContent } from '../types';

function content(courseId: string): CourseContent | undefined {
  return state.courses[courseId];
}

export function getModule(courseId: string, moduleId: string): ModuleDef | undefined {
  return content(courseId)?.moduleDefs.find((m) => m.id === moduleId);
}

export function createModule(courseId: string, input: { title: string; group: ModuleGroup; estimatedDuration: string; prerequisiteModuleId?: string }): ModuleDef | undefined {
  const c = content(courseId);
  if (!c) return undefined;
  const id = `${courseId}-mod-${Date.now().toString(36)}`;
  const module: ModuleDef = {
    id,
    courseId,
    title: input.title,
    group: input.group,
    estimatedDuration: input.estimatedDuration,
    whatYoullLearn: [],
    topics: [],
    practice: [],
    prerequisiteModuleId: input.prerequisiteModuleId,
    progressionRules: { ...c.meta.defaultProgressionRules },
  };
  c.moduleDefs.push(module);
  c.course.moduleOrder.push(id);
  commit(courseId);
  return module;
}

export function updateModule(courseId: string, moduleId: string, patch: Partial<Omit<ModuleDef, 'id' | 'topics' | 'practice'>>): void {
  const m = getModule(courseId, moduleId);
  if (!m) return;
  Object.assign(m, patch);
  commit(courseId);
}

export function setModuleProgressionRules(courseId: string, moduleId: string, rules: ProgressionRules): void {
  const m = getModule(courseId, moduleId);
  if (!m) return;
  m.progressionRules = rules;
  commit(courseId);
}

export function deleteModule(courseId: string, moduleId: string): void {
  const c = content(courseId);
  if (!c) return;
  c.moduleDefs = c.moduleDefs.filter((m) => m.id !== moduleId);
  c.course.moduleOrder = c.course.moduleOrder.filter((id) => id !== moduleId);
  c.moduleDefs.forEach((m) => {
    if (m.prerequisiteModuleId === moduleId) m.prerequisiteModuleId = undefined;
  });
  commit(courseId);
}

export function duplicateModule(courseId: string, moduleId: string): ModuleDef | undefined {
  const c = content(courseId);
  const source = getModule(courseId, moduleId);
  if (!c || !source) return undefined;
  const suffix = Date.now().toString(36);
  const newId = `${source.id}-copy-${suffix}`;
  const copy: ModuleDef = JSON.parse(JSON.stringify(source));
  copy.id = newId;
  copy.title = `${source.title} (Copy)`;
  copy.topics.forEach((t, i) => {
    const oldTestId = t.testId;
    t.id = `${newId}-t${i + 1}`;
    t.moduleId = newId;
    const test = c.topicTests.find((tt) => tt.id === oldTestId);
    if (test) {
      const newTest: TopicTestDef = JSON.parse(JSON.stringify(test));
      newTest.id = `${t.id}-test`;
      newTest.topicId = t.id;
      c.topicTests.push(newTest);
      t.testId = newTest.id;
    }
  });
  copy.moduleTestId = undefined;
  copy.assessmentId = undefined;
  copy.miniTaskId = undefined;
  const index = c.moduleDefs.findIndex((m) => m.id === moduleId);
  c.moduleDefs.splice(index + 1, 0, copy);
  const orderIndex = c.course.moduleOrder.indexOf(moduleId);
  c.course.moduleOrder.splice(orderIndex + 1, 0, newId);
  commit(courseId);
  return copy;
}

export function reorderModule(courseId: string, moduleId: string, direction: 'up' | 'down'): void {
  const c = content(courseId);
  if (!c) return;
  const order = c.course.moduleOrder;
  const index = order.indexOf(moduleId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= order.length) return;
  [order[index], order[target]] = [order[target], order[index]];
  commit(courseId);
}

// ---- Topics ----

export function createTopic(courseId: string, moduleId: string, input: { title: string; estimatedMinutes: number }): TopicDef | undefined {
  const c = content(courseId);
  const m = getModule(courseId, moduleId);
  if (!c || !m) return undefined;
  const id = `${moduleId}-t${m.topics.length + 1}-${Date.now().toString(36)}`;
  const test: TopicTestDef = {
    id: `${id}-test`,
    courseId,
    moduleId,
    topicId: id,
    passingScorePercent: 70,
    questions: [],
  };
  const topic: TopicDef = {
    id,
    courseId,
    moduleId,
    title: input.title,
    estimatedMinutes: input.estimatedMinutes,
    content: { whatYoullLearn: [], keyConcepts: [], examples: [], notes: [], resources: [] },
    testId: test.id,
  };
  c.topicTests.push(test);
  m.topics.push(topic);
  commit(courseId);
  return topic;
}

export function updateTopic(courseId: string, moduleId: string, topicId: string, patch: Partial<Omit<TopicDef, 'id' | 'moduleId' | 'testId'>>): void {
  const m = getModule(courseId, moduleId);
  const t = m?.topics.find((tt) => tt.id === topicId);
  if (!t) return;
  Object.assign(t, patch);
  commit(courseId);
}

export function deleteTopic(courseId: string, moduleId: string, topicId: string): void {
  const c = content(courseId);
  const m = getModule(courseId, moduleId);
  if (!c || !m) return;
  const t = m.topics.find((tt) => tt.id === topicId);
  m.topics = m.topics.filter((tt) => tt.id !== topicId);
  if (t) c.topicTests = c.topicTests.filter((tt) => tt.id !== t.testId);
  commit(courseId);
}

export function reorderTopic(courseId: string, moduleId: string, topicId: string, direction: 'up' | 'down'): void {
  const m = getModule(courseId, moduleId);
  if (!m) return;
  const index = m.topics.findIndex((t) => t.id === topicId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= m.topics.length) return;
  [m.topics[index], m.topics[target]] = [m.topics[target], m.topics[index]];
  commit(courseId);
}

export function getTopicTest(courseId: string, testId: string): TopicTestDef | undefined {
  return content(courseId)?.topicTests.find((t) => t.id === testId);
}

export function updateTopicTest(courseId: string, testId: string, patch: Partial<Omit<TopicTestDef, 'id' | 'topicId'>>): void {
  const test = getTopicTest(courseId, testId);
  if (!test) return;
  Object.assign(test, patch);
  commit(courseId);
}
