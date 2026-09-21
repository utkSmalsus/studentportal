import * as React from 'react';

export type PageKey = 'dashboard' | 'journey' | 'coding' | 'tasks' | 'assessments' | 'project' | 'certificates' | 'profile';

const items: { key: PageKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'journey', label: 'Journey', icon: '🧭' },
  { key: 'coding', label: 'Daily Coding', icon: '💻' },
  { key: 'tasks', label: 'Mini Tasks', icon: '📝' },
  { key: 'assessments', label: 'Assessments', icon: '📋' },
  { key: 'project', label: 'Major Project', icon: '🚀' },
  { key: 'certificates', label: 'Certificates', icon: '🏅' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

const Sidebar: React.FC<{ active: PageKey; onSelect: (key: PageKey) => void }> = ({ active, onSelect }) => (
  <nav className="w-52 shrink-0 border-r border-gray-100 pr-3">
    <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-100">
      <span className="text-lg">🎓</span>
      <span className="font-semibold text-gray-900 text-sm">Student Portal</span>
    </div>
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.key}>
          <button
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              active === item.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default Sidebar;
