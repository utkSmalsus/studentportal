import * as React from 'react';
import { useState } from 'react';
import { Route } from '../../navigation/types';
import { Eyebrow, ProgressBar, StatusPill } from '../../ui/Primitives';
import { moduleStatusMeta } from '../../ui/statusMeta';
import { course, modules } from '../../data/mockData';
import { CourseModule, ModuleGroup } from '../../data/types';

const GROUP_ORDER: ModuleGroup[] = ['Foundation', 'Programming', 'Frontend', 'Backend', 'Full Stack', 'Capstone'];

const PhaseTick: React.FC<{ label: string; done: boolean; active: boolean }> = ({ label, done, active }) => (
  <span className={done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-gray-400'}>
    {done ? '✓' : active ? '●' : '○'} {label}
  </span>
);

const ModuleRow: React.FC<{ module: CourseModule; isExpanded: boolean; onToggle: () => void; onOpen: () => void }> = ({
  module,
  isExpanded,
  onToggle,
  onOpen,
}) => {
  const meta = moduleStatusMeta[module.status];
  const isLocked = module.status === 'locked';

  return (
    <div className="py-3">
      <button onClick={onToggle} disabled={isLocked} className="w-full flex items-center gap-3 text-left disabled:cursor-not-allowed">
        <span className={`font-semibold w-4 text-center ${isLocked ? 'text-gray-300' : ''}`}>{meta.icon}</span>
        <span className={`flex-1 font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{module.title}</span>
        {!isLocked && (
          <span className="w-32">
            <ProgressBar percent={module.progressPercent} color={meta.color === 'red' ? 'red' : meta.color} />
          </span>
        )}
        <StatusPill color={meta.color}>{meta.label}</StatusPill>
      </button>

      {isExpanded && !isLocked && (
        <div className="pl-7 pt-3 pb-1">
          <div className="text-sm text-gray-500 mb-2">Progress {module.progressPercent}%</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <PhaseTick label="Learn" done={module.learn.every((s) => s.status === 'completed') && module.learn.length > 0} active={module.learn.some((s) => s.status === 'current')} />
            <PhaseTick label="Practice" done={module.practice.every((s) => s.status === 'completed') && module.practice.length > 0} active={module.practice.some((s) => s.status === 'current')} />
            {module.miniTaskId && <PhaseTick label="Mini Task" done={module.status === 'completed'} active={false} />}
            {module.assessmentId && <PhaseTick label="Assessment" done={module.status === 'completed'} active={false} />}
          </div>
          <button onClick={onOpen} className="text-sm text-blue-600 hover:underline mt-3">
            Open module &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

const JourneyPage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(modules.filter((m) => m.status === 'current').map((m) => m.id)));

  const toggle = (id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{course.title}</h1>
      <p className="text-gray-500 mt-1">Your complete learning journey, from first line of HTML to final project.</p>

      <div className="mt-8 space-y-8">
        {GROUP_ORDER.map((group) => {
          const groupModules = modules.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;
          return (
            <div key={group}>
              <Eyebrow>{group}</Eyebrow>
              <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {groupModules.map((m) => (
                  <ModuleRow
                    key={m.id}
                    module={m}
                    isExpanded={expanded.has(m.id)}
                    onToggle={() => toggle(m.id)}
                    onOpen={() => onNavigate({ view: 'moduleDetail', moduleId: m.id })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPage;
