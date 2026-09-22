import * as React from 'react';
import { useState } from 'react';
import { AdminRoute, AdminTopLevelView, adminTopLevelFor } from './navigation/types';
import {
  ChartIcon, BookIcon, LayersIcon, CalendarIcon, CodeIcon, ClipboardIcon, RocketIcon, RocketIcon as ProjectIcon,
  UsersIcon, BuildingIcon, AwardIcon, BellIcon, SettingsIcon, MenuIcon, CloseIcon, ArrowLeftIcon,
} from '../ui/icons';

interface NavItem {
  view: AdminTopLevelView;
  label: string;
  route: AdminRoute;
  icon: React.FC<{ className?: string }>;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  { label: 'Overview', items: [{ view: 'dashboard', label: 'Dashboard', route: { view: 'dashboard' }, icon: ChartIcon }] },
  { label: 'Course Management', items: [{ view: 'courses', label: 'Courses', route: { view: 'courses' }, icon: BookIcon }] },
  {
    label: 'Content',
    items: [
      { view: 'questionBank', label: 'Question Bank', route: { view: 'questionBank' }, icon: LayersIcon },
      { view: 'dailyCoding', label: 'Daily Coding', route: { view: 'dailyCoding' }, icon: CodeIcon },
      { view: 'miniTasks', label: 'Mini Tasks', route: { view: 'miniTasks' }, icon: ClipboardIcon },
      { view: 'assessments', label: 'Assessments', route: { view: 'assessments' }, icon: ClipboardIcon },
      { view: 'majorProject', label: 'Major Projects', route: { view: 'majorProject' }, icon: ProjectIcon },
    ],
  },
  {
    label: 'Students',
    items: [
      { view: 'students', label: 'Students', route: { view: 'students' }, icon: UsersIcon },
      { view: 'batches', label: 'Batches', route: { view: 'batches' }, icon: BuildingIcon },
      { view: 'mentors', label: 'Mentors', route: { view: 'mentors' }, icon: UsersIcon },
      { view: 'enrollments', label: 'Enrollments', route: { view: 'enrollments' }, icon: CalendarIcon },
    ],
  },
  { label: 'Evaluation', items: [{ view: 'evaluationQueue', label: 'Evaluation Queue', route: { view: 'evaluationQueue' }, icon: ClipboardIcon }] },
  { label: 'Analytics', items: [{ view: 'reports', label: 'Reports', route: { view: 'reports' }, icon: RocketIcon }] },
  {
    label: 'System',
    items: [
      { view: 'certificates', label: 'Certificates', route: { view: 'certificates' }, icon: AwardIcon },
      { view: 'notifications', label: 'Notifications', route: { view: 'notifications' }, icon: BellIcon },
      { view: 'settings', label: 'Settings', route: { view: 'settings' }, icon: SettingsIcon },
    ],
  },
];

const AdminLayout: React.FC<{
  route: AdminRoute;
  onNavigate: (r: AdminRoute) => void;
  userDisplayName: string;
  onExitAdmin: () => void;
  onOpenMentorPortal: () => void;
  children: React.ReactNode;
}> = ({ route, onNavigate, userDisplayName, onExitAdmin, onOpenMentorPortal, children }) => {
  const active = adminTopLevelFor(route);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (r: AdminRoute): void => {
    onNavigate(r);
    setMobileOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-[720px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white lg:hidden">
        <span className="text-[15px] font-bold text-slate-900">Admin Panel</span>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-slate-600 border border-slate-200 rounded-md p-1.5" aria-expanded={mobileOpen}>
          {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex lg:min-h-[720px]">
        <nav
          className={`w-full lg:w-[248px] shrink-0 bg-slate-900 flex-col ${mobileOpen ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="hidden lg:flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-[15px] font-bold text-white">Admin Panel</span>
          </div>
          <div className="px-3 pt-4 lg:pt-5">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-indigo-300 hover:bg-white/5 mb-1.5"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Back to Student View
            </button>
            <button
              onClick={onOpenMentorPortal}
              className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-emerald-300 hover:bg-white/5 mb-3"
            >
              <UsersIcon className="w-4 h-4" /> Mentor Portal
            </button>
          </div>
          <div className="flex-1 overflow-auto px-3">
            {groups.map((group, gi) => (
              <div key={gi} className="mb-6">
                <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-slate-500">{group.label}</div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = active === item.view;
                    const Icon = item.icon;
                    return (
                      <li key={item.view}>
                        <button
                          onClick={() => navigate(item.route)}
                          className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-[13.5px] transition ${
                            isActive ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-300 hover:bg-white/5 font-medium'
                          }`}
                        >
                          <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-4 border-t border-white/10">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userDisplayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{userDisplayName.split(' ')[0]}</div>
              <div className="text-[11px] text-slate-400 truncate">Administrator</div>
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

export default AdminLayout;
