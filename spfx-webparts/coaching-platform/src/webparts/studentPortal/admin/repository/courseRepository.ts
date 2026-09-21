// Course-level CRUD: the top of the admin domain (Courses, Create Course,
// Publish/Unpublish/Archive, Duplicate). See store.ts for how the active
// course's content stays mirrored into the student app's data/mockData.ts.
import { state, commit, clone, buildEmptyCourse } from './store';
import { CourseContent, CourseMeta, CourseStatus, ValidationIssue } from '../types';

export function listCourses(): CourseMeta[] {
  return Object.keys(state.courses).map((id) => state.courses[id].meta);
}

export function getCourseContent(courseId: string): CourseContent | undefined {
  return state.courses[courseId];
}

export function getCourseMeta(courseId: string): CourseMeta | undefined {
  return state.courses[courseId]?.meta;
}

export function getActiveCourseId(): string {
  return state.activeCourseId;
}

function slugify(title: string): string {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'course';
  let id = base;
  let n = 1;
  while (state.courses[id]) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export function createCourse(input: { title: string; code: string; category?: string; difficulty?: CourseMeta['difficulty'] }): CourseMeta {
  const id = slugify(input.title);
  const content = buildEmptyCourse(id, input.title, input.code);
  if (input.category) content.meta.category = input.category;
  if (input.difficulty) content.meta.difficulty = input.difficulty;
  state.courses[id] = content;
  commit();
  return content.meta;
}

export function updateCourseMeta(courseId: string, patch: Partial<Omit<CourseMeta, 'id'>>): void {
  const content = state.courses[courseId];
  if (!content) return;
  Object.assign(content.meta, patch);
  if (patch.title) content.course.title = patch.title;
  commit(courseId);
}

export function duplicateCourse(courseId: string, newTitle: string): CourseMeta | undefined {
  const source = state.courses[courseId];
  if (!source) return undefined;
  const id = slugify(newTitle);
  const copy: CourseContent = clone(source);
  copy.meta.id = id;
  copy.meta.title = newTitle;
  copy.meta.status = 'draft';
  copy.meta.createdDate = new Date().toISOString().slice(0, 10);
  copy.course.id = id;
  copy.course.title = newTitle;
  // Re-id every nested entity so the duplicate never shares mutable identity
  // (and therefore progress) with the source course.
  const idMap: Record<string, string> = {};
  const remap = (oldId: string): string => {
    if (!idMap[oldId]) idMap[oldId] = `${oldId}-copy-${id}`;
    return idMap[oldId];
  };
  copy.course.moduleOrder = copy.course.moduleOrder.map(remap);
  copy.moduleDefs.forEach((m) => {
    const newModuleId = remap(m.id);
    m.topics.forEach((t) => {
      const newTopicId = `${newModuleId}-t${t.id.split('-t')[1] || Math.random().toString(36).slice(2, 6)}`;
      const test = copy.topicTests.find((tt) => tt.id === t.testId);
      if (test) {
        test.id = `${newTopicId}-test`;
        test.topicId = newTopicId;
      }
      t.testId = test ? test.id : t.testId;
      t.id = newTopicId;
      t.moduleId = newModuleId;
    });
    if (m.moduleTestId) {
      const mt = copy.moduleTests.find((tt) => tt.id === m.moduleTestId);
      if (mt) {
        mt.id = `${newModuleId}-moduletest`;
        mt.moduleId = newModuleId;
        m.moduleTestId = mt.id;
      }
    }
    if (m.assessmentId) {
      const a = copy.assessments.find((aa) => aa.id === m.assessmentId);
      if (a) {
        a.id = `${newModuleId}-assessment`;
        a.moduleId = newModuleId;
        m.assessmentId = a.id;
      }
    }
    if (m.miniTaskId) {
      const task = copy.miniTasks.find((tt) => tt.id === m.miniTaskId);
      if (task) {
        task.id = `${newModuleId}-task`;
        task.moduleId = newModuleId;
        m.miniTaskId = task.id;
      }
    }
    if (m.prerequisiteModuleId) m.prerequisiteModuleId = idMap[m.prerequisiteModuleId] || m.prerequisiteModuleId;
    m.id = newModuleId;
  });
  copy.majorProject.moduleId = copy.majorProject.moduleId ? remap(copy.majorProject.moduleId) : copy.majorProject.moduleId;
  state.courses[id] = copy;
  commit();
  return copy.meta;
}

export function validateCourse(courseId: string): ValidationIssue[] {
  const content = state.courses[courseId];
  const issues: ValidationIssue[] = [];
  if (!content) return [{ severity: 'error', message: 'Course not found.' }];
  const { meta, course, moduleDefs } = content;

  if (!meta.title.trim()) issues.push({ severity: 'error', message: 'Course has no title.' });
  if (!meta.code.trim()) issues.push({ severity: 'error', message: 'Course has no course code.' });
  if (moduleDefs.length === 0) issues.push({ severity: 'error', message: 'Course has no modules.' });

  const orderedIds = new Set(course.moduleOrder);
  moduleDefs.forEach((m) => {
    if (!orderedIds.has(m.id)) issues.push({ severity: 'error', message: `Module "${m.title}" is not part of the course timeline order.` });
    if (m.topics.length === 0) issues.push({ severity: 'warning', message: `Module "${m.title}" has no topics.` });
    m.topics.forEach((t) => {
      if (!content.topicTests.some((tt) => tt.id === t.testId)) {
        issues.push({ severity: 'warning', message: `Topic "${t.title}" has no Topic Test.` });
      }
    });
    if (m.moduleTestId && !content.moduleTests.some((mt) => mt.id === m.moduleTestId)) {
      issues.push({ severity: 'error', message: `Module "${m.title}" references a Module Test that does not exist.` });
    }
    if (m.assessmentId && !content.assessments.some((a) => a.id === m.assessmentId)) {
      issues.push({ severity: 'error', message: `Module "${m.title}" references an Assessment that does not exist.` });
    }
    if (m.prerequisiteModuleId && !moduleDefs.some((mm) => mm.id === m.prerequisiteModuleId)) {
      issues.push({ severity: 'error', message: `Module "${m.title}" has a prerequisite that does not exist.` });
    }
  });

  const seenOrder = new Set<string>();
  course.moduleOrder.forEach((id) => {
    if (seenOrder.has(id)) issues.push({ severity: 'error', message: `Module id "${id}" appears more than once in the course order.` });
    seenOrder.add(id);
  });

  return issues;
}

export function publishCourse(courseId: string): { published: boolean; issues: ValidationIssue[] } {
  const issues = validateCourse(courseId);
  const blocking = issues.filter((i) => i.severity === 'error');
  if (blocking.length > 0) return { published: false, issues };
  updateCourseMeta(courseId, { status: 'published' as CourseStatus });
  return { published: true, issues };
}

export function unpublishCourse(courseId: string): void {
  updateCourseMeta(courseId, { status: 'draft' });
}

export function archiveCourse(courseId: string): void {
  updateCourseMeta(courseId, { status: 'archived' });
}

export function deleteCourse(courseId: string): void {
  if (courseId === state.activeCourseId) return;
  delete state.courses[courseId];
  commit();
}
