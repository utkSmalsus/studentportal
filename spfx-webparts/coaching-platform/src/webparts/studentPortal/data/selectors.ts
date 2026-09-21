// Every derived number the UI shows is computed here, once, from the raw records —
// so "8/10 tasks complete" and "82% success rate" can never drift out of sync with
// the actual mini task / coding question records they summarize.
import { modules, miniTasks, assessments, codingQuestions, majorProject } from './mockData';
import { Assessment, CodingQuestion, CourseModule, MiniTask, SkillRating } from './types';

export function getModuleById(id: string): CourseModule | undefined {
  return modules.find((m) => m.id === id);
}

export function getMiniTaskById(id: string): MiniTask | undefined {
  return miniTasks.find((t) => t.id === id);
}

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}

export function getCodingQuestionById(id: string): CodingQuestion | undefined {
  return codingQuestions.find((q) => q.id === id);
}

export function courseOverallProgress(): number {
  const total = modules.length;
  const sum = modules.reduce((s, m) => s + m.progressPercent, 0);
  return Math.round(sum / total);
}

export function miniTaskStats(): { total: number; completed: number; underReview: number; changesRequested: number } {
  const completed = miniTasks.filter((t) => t.status === 'Passed').length;
  const underReview = miniTasks.filter((t) => t.status === 'Under Review' || t.status === 'Submitted' || t.status === 'Resubmitted').length;
  const changesRequested = miniTasks.filter((t) => t.status === 'Changes Requested').length;
  return { total: miniTasks.length, completed, underReview, changesRequested };
}

export function assessmentStats(): { total: number; completed: number; averagePercent: number } {
  const attempted = assessments.filter((a) => a.attempts.length > 0);
  const avg = attempted.length
    ? Math.round(attempted.reduce((s, a) => s + a.attempts[a.attempts.length - 1].scorePercent, 0) / attempted.length)
    : 0;
  return { total: assessments.length, completed: attempted.length, averagePercent: avg };
}

export function codingStats(): { attempted: number; solved: number; successRate: number } {
  const attempted = codingQuestions.filter((q) => q.status === 'solved' || q.status === 'failed');
  const solved = codingQuestions.filter((q) => q.status === 'solved').length;
  const successRate = attempted.length ? Math.round((solved / attempted.length) * 100) : 0;
  return { attempted: attempted.length, solved, successRate };
}

export function skillRatings(): SkillRating[] {
  const level = (moduleId: string): 'Strong' | 'Developing' | 'Not Started' => {
    const m = getModuleById(moduleId);
    if (!m) return 'Not Started';
    if (m.status === 'completed') return 'Strong';
    if (m.status === 'current') return 'Developing';
    return 'Not Started';
  };
  return [
    { label: 'HTML', level: level('html') },
    { label: 'CSS', level: level('css') },
    { label: 'JavaScript', level: level('js-advanced') },
    { label: 'React', level: level('react-hooks') },
    { label: 'Node.js', level: level('node') },
  ];
}

export function currentModule(): CourseModule {
  const current = modules.find((m) => m.status === 'current');
  return current || modules[0];
}

export function nextIncompleteStep(m: CourseModule): { kind: 'learn' | 'practice'; title: string } | undefined {
  const learnStep = m.learn.find((s) => s.status !== 'completed');
  if (learnStep) return { kind: 'learn', title: learnStep.title };
  const practiceStep = m.practice.find((s) => s.status !== 'completed');
  if (practiceStep) return { kind: 'practice', title: practiceStep.title };
  return undefined;
}

export { modules, miniTasks, assessments, codingQuestions, majorProject };
