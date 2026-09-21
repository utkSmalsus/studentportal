import * as React from 'react';
import { useState } from 'react';
import { Route, TopLevelView, topLevelFor } from './types';

interface NavItem {
  view: TopLevelView;
  label: string;
  route: Route;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  { label: '', items: [{ view: 'home', label: 'Home', route: { view: 'home' } }] },
  { label: 'Learning', items: [{ view: 'journey', label: 'Course Journey', route: { view: 'journey' } }] },
  { label: 'Practice', items: [{ view: 'coding', label: 'Daily Coding', route: { view: 'coding' } }] },
  {
    label: 'Work',
    items: [
      { view: 'tasks', label: 'Mini Tasks', route: { view: 'tasks' } },
      { view: 'project', label: 'Major Project', route: { view: 'project' } },
    ],
  },
  {
    label: 'Progress',
    items: [
      { view: 'performance', label: 'Performance', route: { view: 'performance' } },
      { view: 'certificates', label: 'Certificates', route: { view: 'certificates' } },
    ],
  },
  { label: 'Account', items: [{ view: 'profile', label: 'Profile', route: { view: 'profile' } }] },
];

const NavShell: React.FC<{ route: Route; onNavigate: (r: Route) => void; children: React.ReactNode }> = ({
  route,
  onNavigate,
  children,
}) => {
  const active = topLevelFor(route);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (r: Route): void => {
    onNavigate(r);
    setMobileOpen(false);
  };

  const navList = (
    <>
      {groups.map((group, gi) => (
        <div key={gi} className="mb-5">
          {group.label && <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group.label}</div>}
          <ul>
            {group.items.map((item) => (
              <li key={item.view}>
                <button
                  onClick={() => navigate(item.route)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition ${
                    active === item.view ? 'bg-gray-900 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className="font-sans text-gray-900 bg-white min-h-[640px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:hidden">
        <span className="text-sm font-semibold text-gray-900">Student Portal</span>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-sm font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <nav className={`w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 py-4 px-4 md:py-6 ${mobileOpen ? 'block' : 'hidden md:block'}`}>
          <div className="hidden md:block px-2 pb-6 mb-2 text-sm font-semibold text-gray-900">Student Portal</div>
          {navList}
        </nav>
        <main className="flex-1 px-5 md:px-8 py-6 md:py-7 overflow-auto max-w-4xl">{children}</main>
      </div>
    </div>
  );
};

export default NavShell;
