import * as React from 'react';
import { useEffect } from 'react';
import { SemanticColor, colorClasses } from '../../ui/statusMeta';
import { CloseIcon } from '../../ui/icons';

// ---- Table ----

export interface AdminColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function AdminTable<T>({ columns, rows, rowKey, onRowClick, emptyLabel = 'No records yet.' }: {
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}): React.ReactElement {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            {columns.map((col) => (
              <th key={col.key} className={`text-left font-semibold text-slate-500 text-xs uppercase tracking-wide px-4 py-3 ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400 text-sm">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-slate-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-slate-700 ${col.className || ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---- Status badge ----

export const StatusBadge: React.FC<{ color: SemanticColor; children: React.ReactNode }> = ({ color, children }) => {
  const c = colorClasses[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {children}
    </span>
  );
};

// ---- Drawer (slide-over panel for create/edit forms) ----

export const Drawer: React.FC<{ open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`relative h-full bg-white shadow-2xl flex flex-col ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}>
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 shrink-0">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

// ---- Confirm dialog ----

export const ConfirmDialog: React.FC<{ open: boolean; title: string; description?: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Form primitives ----

export const FormSection: React.FC<{ title?: string; description?: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {title && <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>}
    {description && <p className="text-xs text-slate-400 mb-3">{description}</p>}
    <div className="space-y-4">{children}</div>
  </div>
);

export const FormField: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="text-sm font-semibold text-slate-700 block mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputClass = 'w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400';

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...rest }) => (
  <input className={`${inputClass} ${className}`} {...rest} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...rest }) => (
  <textarea className={`${inputClass} ${className}`} {...rest} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({ className = '', children, ...rest }) => (
  <select className={`${inputClass} bg-white ${className}`} {...rest}>
    {children}
  </select>
);

export const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }> = ({ label, checked, onChange, hint }) => (
  <label className="flex items-start gap-2.5 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
    <span>
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </span>
  </label>
);

export const EmptyRowsState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="text-center py-14 px-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
    <div className="text-sm font-semibold text-slate-700">{title}</div>
    {description && <div className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">{description}</div>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
