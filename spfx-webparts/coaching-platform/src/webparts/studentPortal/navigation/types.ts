export type Route =
  | { view: 'home' }
  | { view: 'journey' }
  | { view: 'moduleDetail'; moduleId: string }
  | { view: 'coding' }
  | { view: 'challengeDetail'; questionId: string }
  | { view: 'tasks' }
  | { view: 'taskDetail'; taskId: string }
  | { view: 'assessmentDetail'; assessmentId: string }
  | { view: 'assessmentAttempt'; assessmentId: string }
  | { view: 'project' }
  | { view: 'performance' }
  | { view: 'certificates' }
  | { view: 'profile' };

export type TopLevelView = 'home' | 'journey' | 'coding' | 'tasks' | 'project' | 'performance' | 'certificates' | 'profile';

// Detail views highlight their parent's nav entry, so the sidebar never shows
// nothing selected while the student is inside a module/task/challenge/assessment.
export function topLevelFor(route: Route): TopLevelView {
  switch (route.view) {
    case 'moduleDetail':
      return 'journey';
    case 'challengeDetail':
      return 'coding';
    case 'taskDetail':
      return 'tasks';
    case 'assessmentDetail':
    case 'assessmentAttempt':
      return 'journey';
    default:
      return route.view;
  }
}
