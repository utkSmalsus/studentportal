// A small convenience layer over progressRepository + courseRepository for
// pages (mostly Mentor/Admin) that need to compute progression-engine values
// — overall %, current module, module status — for a student OTHER than the
// one live student AppStateContext binds to. Always resolves that student's
// OWN course content (never "whichever course is active"), which is what
// keeps a student's SPFx progress from being scored against MERN's modules.
import { StudentProgress } from '../../state/types';
import { CourseContent } from '../types';
import * as courseRepository from './courseRepository';
import * as progressRepository from './progressRepository';
import * as progression from '../../state/engine/progression';

export interface StudentProgressView {
  progress: StudentProgress;
  content: CourseContent;
  overallPercent: number;
  currentModuleTitle: string;
}

export function getStudentProgressView(studentId: string, courseId: string): StudentProgressView | undefined {
  const content = courseRepository.getCourseContent(courseId);
  if (!content) return undefined;
  const progress = progressRepository.getOrCreateProgress(studentId, courseId);
  const overallPercent = progression.courseOverallProgress(content.course, content.moduleDefs, progress);
  const current = progression.currentModule(content.course, content.moduleDefs, progress);
  return { progress, content, overallPercent, currentModuleTitle: current?.title || 'Complete' };
}
