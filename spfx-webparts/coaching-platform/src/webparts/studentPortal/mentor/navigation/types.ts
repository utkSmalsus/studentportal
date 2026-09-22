export type MentorRoute =
  | { view: 'dashboard' }
  | { view: 'myStudents' }
  | { view: 'studentDetail'; studentId: string }
  | { view: 'myBatches' }
  | { view: 'review' }
  | { view: 'studentActivity' }
  | { view: 'githubActivity' }
  | { view: 'profile' };

export type MentorTopLevelView = 'dashboard' | 'myStudents' | 'myBatches' | 'review' | 'studentActivity' | 'githubActivity' | 'profile';

export function mentorTopLevelFor(route: MentorRoute): MentorTopLevelView {
  return route.view === 'studentDetail' ? 'myStudents' : route.view;
}
