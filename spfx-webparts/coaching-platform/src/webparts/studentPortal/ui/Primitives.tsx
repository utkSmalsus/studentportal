import * as React from 'react';
import { colorClasses, SemanticColor } from './statusMeta';

// A section of the page — a subtle border, not a floating card. Used sparingly:
// most of the page should be plain typography and whitespace, per the "avoid
// excessive cards" direction. Reach for this only when content genuinely needs
// a visual boundary (a form, a rubric, a list of records).
export const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`border border-gray-200 rounded-lg p-5 ${className}`}>{children}</div>
);

export const Divider: React.FC = () => <hr className="border-gray-100 my-6" />;

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</div>
);

export const StatusPill: React.FC<{ color: SemanticColor; children: React.ReactNode }> = ({ color, children }) => {
  const c = colorClasses[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {children}
    </span>
  );
};

export const ProgressBar: React.FC<{ percent: number; color?: SemanticColor; heightClass?: string }> = ({
  percent,
  color = 'blue',
  heightClass = 'h-2',
}) => (
  <div className={`w-full ${heightClass} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`${heightClass} ${colorClasses[color].dot} rounded-full transition-all`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = '', ...rest }) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className = '', ...rest }) => (
  <button
    className={`inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
    <div className="text-sm font-medium text-gray-600">{title}</div>
    {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
  </div>
);

// A single checklist row inside a Learn/Practice list. When the row is the one
// currently in progress, it can carry a "Mark Complete" action — that's the actual
// state-changing control, distinct from the row itself being clickable.
export const StepRow: React.FC<{
  title: string;
  meta?: string;
  status: 'completed' | 'current' | 'upcoming';
  onComplete?: () => void;
}> = ({ title, meta, status, onComplete }) => {
  const icon = status === 'completed' ? '✓' : status === 'current' ? '●' : '○';
  const color: SemanticColor = status === 'completed' ? 'green' : status === 'current' ? 'blue' : 'gray';
  const c = colorClasses[color];
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`w-4 text-center font-medium ${c.text}`}>{icon}</span>
      <div className="flex-1">
        <div className={status === 'upcoming' ? 'text-gray-400 text-sm' : 'text-gray-800 text-sm'}>{title}</div>
        {meta && <div className="text-xs text-gray-400">{meta}</div>}
      </div>
      {status === 'current' && onComplete && (
        <SecondaryButton onClick={onComplete} className="text-xs px-3 py-1.5">
          Mark Complete
        </SecondaryButton>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
    <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
    {label}
  </div>
);

export interface RubricCriterion {
  label: string;
  score: number;
  maxScore: number;
}

export const EvaluationRubric: React.FC<{ criteria: RubricCriterion[]; barColor?: SemanticColor }> = ({ criteria, barColor = 'blue' }) => {
  const totalScore = criteria.reduce((s, c) => s + c.score, 0);
  const totalMax = criteria.reduce((s, c) => s + c.maxScore, 0);
  return (
    <div className="space-y-2.5">
      {criteria.map((c) => (
        <div key={c.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{c.label}</span>
            <span className="text-gray-500">
              {c.score} / {c.maxScore}
            </span>
          </div>
          <ProgressBar percent={(c.score / c.maxScore) * 100} color={barColor} />
        </div>
      ))}
      <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
        <span>Total</span>
        <span>
          {totalScore} / {totalMax}
        </span>
      </div>
    </div>
  );
};

export const BackLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center gap-1">
    <span>&larr;</span> {children}
  </button>
);
