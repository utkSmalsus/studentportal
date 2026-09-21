import * as React from 'react';
import { colorClasses, SemanticColor } from './statusMeta';
import { CheckIcon, LockIcon } from './icons';

// ---- Layout / structure ----

export const Card: React.FC<{ className?: string; children: React.ReactNode; padded?: boolean }> = ({
  className = '',
  children,
  padded = true,
}) => <div className={`bg-white border border-slate-200 rounded-xl ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>{children}</div>;

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
    <div>
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">{eyebrow}</div>}
      <h1 className="text-[28px] leading-tight font-bold text-slate-900">{title}</h1>
      {subtitle && <div className="text-slate-500 mt-1.5">{subtitle}</div>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode; className?: string }> = ({
  children,
  action,
  className = '',
}) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{children}</h2>
    {action}
  </div>
);

export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => <hr className={`border-slate-100 my-8 ${className}`} />;

// ---- Buttons ----

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className = '',
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className = '',
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// ---- Status ----

export const StatusPill: React.FC<{ color: SemanticColor; children: React.ReactNode; className?: string }> = ({ color, children, className = '' }) => {
  const c = colorClasses[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {children}
    </span>
  );
};

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{children}</span>
);

export const ProgressBar: React.FC<{ percent: number; color?: SemanticColor; heightClass?: string; trackClass?: string }> = ({
  percent,
  color = 'blue',
  heightClass = 'h-2',
  trackClass = 'bg-slate-100',
}) => (
  <div className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden`}>
    <div
      className={`${heightClass} ${colorClasses[color].dot} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

// ---- Metrics ----

export const MetricTile: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; accentColor?: SemanticColor }> = ({
  label,
  value,
  icon,
  accentColor = 'blue',
}) => {
  const c = colorClasses[accentColor];
  return (
    <div className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex-1 min-w-[160px]">
      {icon && <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>{icon}</div>}
      <div className="min-w-0">
        <div className="text-lg font-bold text-slate-900 leading-tight truncate">{value}</div>
        <div className="text-xs text-slate-500 truncate">{label}</div>
      </div>
    </div>
  );
};

// ---- States ----

export const EmptyState: React.FC<{ title: string; description?: string; icon?: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="text-center py-14 px-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
    {icon && <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">{icon}</div>}
    <div className="text-sm font-semibold text-slate-700">{title}</div>
    {description && <div className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">{description}</div>}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-2.5 text-sm text-slate-400 py-8 justify-center">
    <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
    {label}
  </div>
);

// ---- Step rows (lessons/practice) ----

export const StepRow: React.FC<{
  title: string;
  meta?: string;
  status: 'completed' | 'current' | 'upcoming';
  onComplete?: () => void;
}> = ({ title, meta, status, onComplete }) => {
  const isCurrent = status === 'current';
  const isDone = status === 'completed';
  return (
    <div
      className={`flex items-center gap-3.5 py-3 px-3.5 rounded-lg ${
        isCurrent ? 'bg-indigo-50/60 border border-indigo-100' : 'border border-transparent'
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
          isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {isDone ? <CheckIcon className="w-3.5 h-3.5" /> : isCurrent ? '▶' : ''}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-800'}`}>{title}</div>
        {meta && <div className="text-xs text-slate-400 mt-0.5">{meta}</div>}
      </div>
      {isCurrent && onComplete && (
        <SecondaryButton onClick={onComplete} className="text-xs px-3 py-1.5 shrink-0">
          Mark Complete
        </SecondaryButton>
      )}
    </div>
  );
};

// ---- Phase stepper: Learn -> Practice -> Mini Task -> Assessment ----

export type PhaseState = 'done' | 'current' | 'upcoming' | 'skip';

export const PhaseStepper: React.FC<{ phases: { label: string; state: PhaseState }[] }> = ({ phases }) => {
  const visible = phases.filter((p) => p.state !== 'skip');
  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {visible.map((p, i) => (
        <React.Fragment key={p.label}>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                p.state === 'done'
                  ? 'bg-emerald-500 text-white'
                  : p.state === 'current'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {p.state === 'done' ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${p.state === 'current' ? 'text-slate-900' : p.state === 'done' ? 'text-slate-600' : 'text-slate-400'}`}>
              {p.label}
            </span>
          </div>
          {i < visible.length - 1 && <span className="w-8 sm:w-12 h-px bg-slate-200 mx-2" />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ---- Stage timeline (Foundation -> ... -> Capstone), used on Home + Journey ----

export interface StageInfo {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  percent: number;
}

export const StageTimeline: React.FC<{ stages: StageInfo[]; compact?: boolean }> = ({ stages }) => (
  <ol className="relative">
    {stages.map((s, i) => {
      const isLast = i === stages.length - 1;
      const dotColor =
        s.status === 'completed' ? 'bg-emerald-500' : s.status === 'current' ? 'bg-indigo-600' : s.status === 'locked' ? 'bg-slate-200' : 'bg-slate-300';
      const lineColor = s.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-150';
      return (
        <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
          {!isLast && <span className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${lineColor}`} style={{ backgroundColor: s.status === 'completed' ? undefined : '#e5e7eb' }} />}
          <span
            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${dotColor} ${
              s.status === 'current' ? 'ring-4 ring-indigo-100' : ''
            }`}
          >
            {s.status === 'completed' ? (
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            ) : s.status === 'locked' ? (
              <LockIcon className="w-3 h-3 text-slate-400" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${s.status === 'current' ? 'bg-white' : 'bg-white'}`} />
            )}
          </span>
          <div className="flex-1 pt-0.5 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-sm font-semibold ${
                  s.status === 'current' ? 'text-slate-900' : s.status === 'locked' ? 'text-slate-400' : 'text-slate-700'
                }`}
              >
                {s.label}
              </span>
              <span className="text-xs text-slate-400 shrink-0">
                {s.status === 'locked' ? 'Locked' : s.status === 'completed' ? 'Complete' : `${s.percent}%`}
              </span>
            </div>
            {s.status !== 'locked' && (
              <div className="mt-1.5 max-w-xs">
                <ProgressBar percent={s.percent} color={s.status === 'completed' ? 'green' : 'blue'} heightClass="h-1.5" />
              </div>
            )}
          </div>
        </li>
      );
    })}
  </ol>
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
    <div className="space-y-3">
      {criteria.map((c) => (
        <div key={c.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-700 font-medium">{c.label}</span>
            <span className="text-slate-500">
              {c.score} / {c.maxScore}
            </span>
          </div>
          <ProgressBar percent={(c.score / c.maxScore) * 100} color={barColor} />
        </div>
      ))}
      <div className="flex justify-between text-sm font-bold pt-3 border-t border-slate-100 text-slate-900">
        <span>Total</span>
        <span>
          {totalScore} / {totalMax}
        </span>
      </div>
    </div>
  );
};

export const BackLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-sm text-slate-500 hover:text-slate-900 mb-5 inline-flex items-center gap-1.5 font-medium transition">
    <span aria-hidden>&larr;</span> {children}
  </button>
);
