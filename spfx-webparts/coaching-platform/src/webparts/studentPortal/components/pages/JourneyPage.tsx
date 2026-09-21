import * as React from 'react';
import { Card } from '../../ui/Primitives';
import { journeyStatusMeta } from '../../ui/statusMeta';
import { journey, courseTitle } from '../../data/mockData';

const itemTypeLabel: Record<string, string> = {
  topic: 'Topic',
  assessment: 'Assessment',
  miniTask: 'Mini Task',
  project: 'Major Project',
};

const JourneyPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Learning Journey</h1>
      <p className="text-gray-500">{courseTitle}</p>
    </div>

    <Card>
      <ol className="relative border-l-2 border-gray-200 ml-3">
        {journey.map((item) => {
          const meta = journeyStatusMeta[item.status];
          return (
            <li key={item.id} className="mb-6 ml-6 last:mb-0">
              <span
                className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] ${meta.dot}`}
              >
                {item.status === 'completed' ? meta.icon : ''}
              </span>
              <div
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  item.status === 'current' ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-400">{itemTypeLabel[item.itemType]}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Est. {item.estimatedDuration}</div>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: undefined }}>
                  <span>{meta.icon}</span>
                  <span
                    className={
                      item.status === 'completed'
                        ? 'text-emerald-600'
                        : item.status === 'current'
                        ? 'text-blue-600'
                        : item.status === 'failed'
                        ? 'text-red-600'
                        : item.status === 'pendingEvaluation' || item.status === 'resubmissionRequired'
                        ? 'text-amber-600'
                        : 'text-gray-400'
                    }
                  >
                    {meta.label}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  </div>
);

export default JourneyPage;
