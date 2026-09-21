import * as React from 'react';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>{children}</div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    {action}
  </div>
);

export const ProgressBar: React.FC<{ percent: number; colorClass?: string; trackClass?: string; heightClass?: string }> = ({
  percent,
  colorClass = 'bg-blue-600',
  trackClass = 'bg-gray-200',
  heightClass = 'h-3',
}) => (
  <div className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden`}>
    <div className={`${heightClass} ${colorClass} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
  </div>
);

export const LabeledProgress: React.FC<{ label: string; percent: number; colorClass?: string }> = ({ label, percent, colorClass }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-medium text-gray-500">{percent}%</span>
    </div>
    <ProgressBar percent={percent} colorClass={colorClass} />
  </div>
);

export const StatTile: React.FC<{ label: string; value: string | number; sublabel?: string; accent?: string }> = ({
  label,
  value,
  sublabel,
  accent = 'text-gray-900',
}) => (
  <div className="flex-1 min-w-[120px] bg-gray-50 rounded-lg p-4">
    <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    {sublabel && <div className="text-xs text-gray-400 mt-1">{sublabel}</div>}
  </div>
);

const badgeColors: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export const Badge: React.FC<{ color?: keyof typeof badgeColors; children: React.ReactNode }> = ({ color = 'gray', children }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[color]}`}>{children}</span>
);
