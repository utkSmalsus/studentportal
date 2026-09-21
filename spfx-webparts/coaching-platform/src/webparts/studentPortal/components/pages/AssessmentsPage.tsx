import * as React from 'react';
import { Card, Badge } from '../../ui/Primitives';
import { assessments } from '../../data/mockData';

const statusMeta: Record<string, { label: string; color: 'green' | 'red' | 'gray' | 'blue' }> = {
  passed: { label: 'Passed', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
  'not-started': { label: 'Not Started', color: 'gray' },
  'in-progress': { label: 'In Progress', color: 'blue' },
};

const AssessmentsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
      <p className="text-gray-500">MCQ, true/false and coding assessments for each module</p>
    </div>

    <div className="space-y-3">
      {assessments.map((a) => (
        <Card key={a.id} className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{a.title}</h3>
            <div className="text-xs text-gray-500 mt-1">
              {a.totalMarks} marks · pass at {a.passingMarks} · {a.timeLimitMinutes} min · attempt {a.attemptsUsed}/{a.attemptsAllowed}
            </div>
            {a.bestScore !== undefined && (
              <div className="text-sm mt-1 text-gray-700">
                Best score: <span className="font-medium">{a.bestScore}/{a.totalMarks}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statusMeta[a.status].color}>{statusMeta[a.status].label}</Badge>
            {a.status === 'not-started' && (
              <button className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Start
              </button>
            )}
            {a.status === 'failed' && a.attemptsUsed < a.attemptsAllowed && (
              <button className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Retake
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default AssessmentsPage;
