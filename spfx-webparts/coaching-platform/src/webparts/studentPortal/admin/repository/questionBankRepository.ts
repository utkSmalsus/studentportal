// Central Question Bank: create/search/reuse questions across Topic Tests,
// Module Tests and Assessments. See admin/types.ts for why picking a bank
// question COPIES a snapshot into the target test rather than referencing it live.
import { state, commit } from './store';
import { BankQuestion, bankQuestionToTestQuestion } from '../types';
import { Difficulty, TopicTestQuestionDef, AssessmentQuestionDef } from '../../data/types';
import * as curriculum from './curriculumRepository';

export function listQuestions(courseId: string): BankQuestion[] {
  return state.questionBank.filter((q) => q.courseId === courseId);
}

export interface QuestionFilter {
  courseId?: string;
  moduleId?: string;
  topicId?: string;
  difficulty?: Difficulty;
  tag?: string;
  search?: string;
}

export function searchQuestions(filter: QuestionFilter): BankQuestion[] {
  return state.questionBank.filter((q) => {
    if (filter.courseId && q.courseId !== filter.courseId) return false;
    if (filter.moduleId && q.moduleId !== filter.moduleId) return false;
    if (filter.topicId && q.topicId !== filter.topicId) return false;
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
    if (filter.tag && q.tags.indexOf(filter.tag) === -1) return false;
    if (filter.search && !q.text.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });
}

export function createQuestion(input: Omit<BankQuestion, 'id'>): BankQuestion {
  const q: BankQuestion = { ...input, id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
  state.questionBank.push(q);
  commit(input.courseId);
  return q;
}

export function updateQuestion(id: string, patch: Partial<Omit<BankQuestion, 'id'>>): void {
  const q = state.questionBank.find((qq) => qq.id === id);
  if (!q) return;
  Object.assign(q, patch);
  commit(q.courseId);
}

export function deleteQuestion(id: string): void {
  const q = state.questionBank.find((qq) => qq.id === id);
  state.questionBank = state.questionBank.filter((qq) => qq.id !== id);
  if (q) commit(q.courseId);
}

// Copies a bank question's current text/options into a Topic Test's question list.
export function addBankQuestionToTopicTest(courseId: string, testId: string, bankQuestionId: string): void {
  const bank = state.questionBank.find((q) => q.id === bankQuestionId);
  const test = curriculum.getTopicTest(courseId, testId);
  if (!bank || !test) return;
  const snapshot: TopicTestQuestionDef = { ...bankQuestionToTestQuestion(bank), id: `${testId}-${bank.id}` };
  test.questions.push(snapshot);
  commit(courseId);
}

export function addBankQuestionToAssessment(courseId: string, assessmentId: string, bankQuestionId: string, topic: string): void {
  const c = state.courses[courseId];
  const bank = state.questionBank.find((q) => q.id === bankQuestionId);
  const assessment = c?.assessments.find((a) => a.id === assessmentId);
  if (!bank || !assessment) return;
  const snapshot: AssessmentQuestionDef = { ...bankQuestionToTestQuestion(bank), id: `${assessmentId}-${bank.id}`, topic };
  assessment.questions.push(snapshot);
  commit(courseId);
}
