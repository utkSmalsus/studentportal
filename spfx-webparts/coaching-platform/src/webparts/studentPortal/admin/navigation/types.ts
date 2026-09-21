export type AdminRoute =
  | { view: 'dashboard' }
  | { view: 'courses' }
  | { view: 'courseEdit'; courseId: string }
  | { view: 'curriculum'; courseId: string }
  | { view: 'questionBank' }
  | { view: 'dailyCoding' }
  | { view: 'practiceLibrary' }
  | { view: 'miniTasks' }
  | { view: 'assessments' }
  | { view: 'majorProject' }
  | { view: 'students' }
  | { view: 'batches' }
  | { view: 'enrollments' }
  | { view: 'evaluationQueue' }
  | { view: 'courseAnalytics' }
  | { view: 'studentProgress' }
  | { view: 'reports' }
  | { view: 'certificates' }
  | { view: 'notifications' }
  | { view: 'settings' };

export type AdminTopLevelView =
  | 'dashboard'
  | 'courses'
  | 'questionBank'
  | 'dailyCoding'
  | 'practiceLibrary'
  | 'miniTasks'
  | 'assessments'
  | 'majorProject'
  | 'students'
  | 'batches'
  | 'enrollments'
  | 'evaluationQueue'
  | 'courseAnalytics'
  | 'studentProgress'
  | 'reports'
  | 'certificates'
  | 'notifications'
  | 'settings';

export function adminTopLevelFor(route: AdminRoute): AdminTopLevelView {
  switch (route.view) {
    case 'courseEdit':
    case 'curriculum':
      return 'courses';
    default:
      return route.view;
  }
}
