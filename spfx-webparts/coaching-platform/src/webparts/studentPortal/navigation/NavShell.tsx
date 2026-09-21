import * as React from 'react';
import { useState } from 'react';
import { Route, TopLevelView, topLevelFor } from './types';
import { HomeIcon, MapIcon, CodeIcon, ClipboardIcon, RocketIcon, ChartIcon, AwardIcon, UserIcon, MenuIcon, CloseIcon } from '../ui/icons';

interface NavItem {
  view: TopLevelView;
  label: string;
  route: Route;
  icon: React.FC<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  { label: 'Overview', items: [{ view: 'home', label: 'Home', route: { view: 'home' }, icon: HomeIcon }] },
  { label: 'Learning', items: [{ view: 'journey', label: 'Course Journey', route: { view: 'journey' }, icon: MapIcon }] },
  { label: 'Practice', items: [{ view: 'coding', label: 'Daily Coding', route: { view: 'coding' }, icon: CodeIcon }] },
  {
    label: 'Build',
    items: [
      { view: 'tasks', label: 'Mini Tasks', route: { view: 'tasks' }, icon: ClipboardIcon },
      { view: 'project', label: 'Major Project', route: { view: 'project' }, icon: RocketIcon },
    ],
  },
  {
    label: 'Progress',
    items: [
      { view: 'performance', label: 'Performance', route: { view: 'performance' }, icon: ChartIcon },
      { view: 'certificates', label: 'Certificates', route: { view: 'certificates' }, icon: AwardIcon },
    ],
  },
  { label: 'Account', items: [{ view: 'profile', label: 'Profile', route: { view: 'profile' }, icon: UserIcon }] },
];

const NavShell: React.FC<{
  route: Route;
  onNavigate: (r: Route) => void;
  userDisplayName: string;
  courseTitle: string;
  onOpenAdmin?: () => void;
  children: React.ReactNode;
}> = ({ route, onNavigate, userDisplayName, courseTitle, onOpenAdmin, children }) => {
  const active = topLevelFor(route);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (r: Route): void => {
    onNavigate(r);
    setMobileOpen(false);
  };

  const navList = (
    <>
      {groups.map((group, gi) => (
        <div key={gi} className="mb-6">
          <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">{group.label}</div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = active === item.view;
              const Icon = item.icon;
              return (
                <li key={item.view}>
                  <button
                    onClick={() => navigate(item.route)}
                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-[13.5px] transition ${
                      isActive ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-[720px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white lg:hidden">
        <span className="text-[15px] font-bold text-slate-900">Student Portal</span>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-slate-600 border border-slate-200 rounded-md p-1.5" aria-expanded={mobileOpen}>
          {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex lg:min-h-[720px]">
        <nav
          className={`w-full lg:w-[248px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-col ${
            mobileOpen ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="hidden lg:flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-[15px] font-bold text-slate-900">Student Portal</span>
          </div>
          <div className="flex-1 overflow-auto px-3 pt-4 lg:pt-5">{navList}</div>
          {onOpenAdmin && (
            <div className="px-3 pb-2">
              <button
                onClick={onOpenAdmin}
                className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-500 hover:bg-slate-100"
              >
                <span className="w-[17px] h-[17px] rounded bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">A</span>
                Admin Panel
              </button>
            </div>
          )}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-4 border-t border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userDisplayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{userDisplayName.split(' ')[0]}</div>
              <div className="text-[11px] text-slate-400 truncate">{courseTitle}</div>
            </div>
          </div>
        </nav>
        <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-10 py-7 lg:py-9">
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default NavShell;
