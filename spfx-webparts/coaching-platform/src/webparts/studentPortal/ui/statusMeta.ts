import { JourneyItemStatus, SubmissionStatus } from '../data/types';

export const journeyStatusMeta: Record<JourneyItemStatus, { label: string; icon: string; dot: string; badge: 'green' | 'blue' | 'gray' | 'amber' | 'red' }> = {
  completed: { label: 'Completed', icon: '✓', dot: 'bg-emerald-500', badge: 'green' },
  current: { label: 'Currently Learning', icon: '●', dot: 'bg-blue-600', badge: 'blue' },
  locked: { label: 'Locked', icon: '🔒', dot: 'bg-gray-300', badge: 'gray' },
  failed: { label: 'Failed', icon: '✗', dot: 'bg-red-500', badge: 'red' },
  pendingEvaluation: { label: 'Pending Evaluation', icon: '⏳', dot: 'bg-amber-400', badge: 'amber' },
  resubmissionRequired: { label: 'Resubmission Required', icon: '↻', dot: 'bg-amber-500', badge: 'amber' },
};

export const submissionStatusBadge: Record<SubmissionStatus, 'green' | 'blue' | 'gray' | 'amber' | 'red'> = {
  Submitted: 'blue',
  'Under Review': 'amber',
  Passed: 'green',
  Failed: 'red',
  'Changes Requested': 'amber',
  Completed: 'green',
};
