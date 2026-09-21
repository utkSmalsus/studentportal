// Color is semantic, not decorative: green = done, blue = active now,
// amber = needs your attention, red = failed, gray = not available yet.
export type SemanticColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

export const colorClasses: Record<SemanticColor, { text: string; bg: string; dot: string; border: string }> = {
  green: { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  blue: { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-600', border: 'border-blue-200' },
  amber: { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200' },
  red: { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', border: 'border-red-200' },
  gray: { text: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-300', border: 'border-gray-200' },
};

export const moduleStatusMeta: Record<string, { label: string; icon: string; color: SemanticColor }> = {
  completed: { label: 'Complete', icon: '✓', color: 'green' },
  current: { label: 'In Progress', icon: '●', color: 'blue' },
  upcoming: { label: 'Upcoming', icon: '○', color: 'gray' },
  locked: { label: 'Locked', icon: '○', color: 'gray' },
  failed: { label: 'Failed', icon: '✗', color: 'red' },
};

export const miniTaskStatusMeta: Record<string, { color: SemanticColor }> = {
  'Not Started': { color: 'gray' },
  'In Progress': { color: 'blue' },
  Submitted: { color: 'blue' },
  'Under Review': { color: 'amber' },
  'Changes Requested': { color: 'amber' },
  Resubmitted: { color: 'blue' },
  Passed: { color: 'green' },
};

export const assessmentStatusMeta: Record<string, { label: string; color: SemanticColor }> = {
  'not-started': { label: 'Not Started', color: 'gray' },
  'in-progress': { label: 'In Progress', color: 'blue' },
  passed: { label: 'Passed', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
};

export const codingStatusMeta: Record<string, { label: string; color: SemanticColor }> = {
  solved: { label: 'Solved', color: 'green' },
  failed: { label: 'Attempted', color: 'amber' },
  missed: { label: 'Missed', color: 'gray' },
  pending: { label: 'Upcoming', color: 'gray' },
  today: { label: "Today's Challenge", color: 'blue' },
};

export const difficultyColor: Record<string, SemanticColor> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};
