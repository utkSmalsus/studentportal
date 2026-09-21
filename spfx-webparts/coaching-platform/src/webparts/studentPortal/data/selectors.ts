// Derived values combining content definitions (this file's imports) with live
// progress state (passed in by callers via useAppState()). Every number the UI
// shows is computed here once — nothing is hand-typed twice, so it can't drift.
import { moduleDefs, course, miniTasks, assessments, codingQuestions, majorProject, topicTests, moduleTests } from './mockData';
import { ModuleDef, MiniTaskDef, AssessmentDef, CodingQuestionDef, TopicDef, TopicTestDef, ModuleTestDef } from './types';
import { StudentProgressState } from '../state/types';
import * as progression from '../state/engine/progression';

export { moduleDefs, course, miniTasks, assessments, codingQuestions, majorProject, topicTests, moduleTests };

export function getTopicById(moduleId: string, topicId: string): TopicDef | undefined {
  return getModuleById(moduleId)?.topics.find((t) => t.id === topicId);
}

export function getTopicTestByTopicId(topicId: string): TopicTestDef | undefined {
  return topicTests.find((t) => t.topicId === topicId);
}

export function getModuleTestById(moduleTestId: string): ModuleTestDef | undefined {
  return moduleTests.find((t) => t.id === moduleTestId);
}

export type SkillLevel = 'Strong' | 'Developing' | 'Not Started';
export interface SkillRating {
  label: string;
  level: SkillLevel;
}

export function getModuleById(id: string): ModuleDef | undefined {
  return moduleDefs.find((m) => m.id === id);
}

export function getMiniTaskById(id: string): MiniTaskDef | undefined {
  return miniTasks.find((t) => t.id === id);
}

export function getAssessmentById(id: string): AssessmentDef | undefined {
  return assessments.find((a) => a.id === id);
}

export function getCodingQuestionById(id: string): CodingQuestionDef | undefined {
  return codingQuestions.find((q) => q.id === id);
}

export function courseOverallProgress(progress: StudentProgressState): number {
  return progression.courseOverallProgress(course, moduleDefs, progress);
}

export function miniTaskStats(progress: StudentProgressState): { total: number; completed: number; underReview: number; changesRequested: number } {
  const entries = miniTasks.map((t) => progress.miniTasks[t.id]?.status || 'Not Started');
  return {
    total: miniTasks.length,
    completed: entries.filter((s) => s === 'Passed').length,
    underReview: entries.filter((s) => s === 'Under Review' || s === 'Submitted' || s === 'Resubmitted').length,
    changesRequested: entries.filter((s) => s === 'Changes Requested').length,
  };
}

export function assessmentStats(progress: StudentProgressState): { total: number; completed: number; averagePercent: number } {
  const attempted = assessments.filter((a) => (progress.assessments[a.id]?.attempts.length || 0) > 0);
  const avg = attempted.length
    ? Math.round(
        attempted.reduce((sum, a) => {
          const entry = progress.assessments[a.id];
          const latest = entry.attempts[entry.attempts.length - 1];
          return sum + latest.scorePercent;
        }, 0) / attempted.length
      )
    : 0;
  return { total: assessments.length, completed: attempted.length, averagePercent: avg };
}

export function codingStats(progress: StudentProgressState): { attempted: number; solved: number; successRate: number } {
  const attemptedQuestions = codingQuestions.filter((q) => (progress.coding[q.id]?.attempts.length || 0) > 0);
  const solved = codingQuestions.filter((q) => progress.coding[q.id]?.attempts.some((a) => a.passed)).length;
  const successRate = attemptedQuestions.length ? Math.round((solved / attemptedQuestions.length) * 100) : 0;
  return { attempted: attemptedQuestions.length, solved, successRate };
}

const SKILL_MODULE_IDS: { label: string; moduleId: string }[] = [
  { label: 'HTML', moduleId: 'html' },
  { label: 'CSS', moduleId: 'css' },
  { label: 'JavaScript', moduleId: 'js-advanced' },
  { label: 'React', moduleId: 'react-hooks' },
  { label: 'Node.js', moduleId: 'node' },
  { label: 'MongoDB', moduleId: 'mongodb' },
];

export interface RecommendedFocus {
  topic: string;
  assessmentTitle: string;
  suggestedQuestions: CodingQuestionDef[];
}

// Generic across any course: looks at the most recent assessment attempt that has
// a weak topic, and cross-references the (also generic) daily coding bank for
// questions tagged with that topic. No assessment- or course-specific logic here.
export function recommendedFocus(progress: StudentProgressState): RecommendedFocus | undefined {
  let latest: { date: string; weakTopics: string[]; assessmentTitle: string } | undefined;
  assessments.forEach((a) => {
    const entry = progress.assessments[a.id];
    if (!entry || entry.attempts.length === 0) return;
    const last = entry.attempts[entry.attempts.length - 1];
    if (last.weakTopics.length === 0) return;
    if (!latest || new Date(last.date).getTime() > new Date(latest.date).getTime()) {
      latest = { date: last.date, weakTopics: last.weakTopics, assessmentTitle: a.title };
    }
  });
  if (!latest) return undefined;

  const topic = latest.weakTopics[0];
  const topicLower = topic.toLowerCase();
  const suggestedQuestions = codingQuestions
    .filter((q) => q.topic.toLowerCase().includes(topicLower) || q.tags.some((t) => topicLower.includes(t.toLowerCase()) || t.toLowerCase().includes(topicLower)))
    .slice(0, 3);

  return { topic, assessmentTitle: latest.assessmentTitle, suggestedQuestions };
}

export function skillRatings(progress: StudentProgressState): SkillRating[] {
  return SKILL_MODULE_IDS.map(({ label, moduleId }) => {
    const module = getModuleById(moduleId);
    if (!module) return { label, level: 'Not Started' };
    const status = progression.getModuleStatus(module, moduleDefs, progress);
    const level: SkillLevel = status === 'completed' ? 'Strong' : status === 'current' ? 'Developing' : 'Not Started';
    return { label, level };
  });
}
