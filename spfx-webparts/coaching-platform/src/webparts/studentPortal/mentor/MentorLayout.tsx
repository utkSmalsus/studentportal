import * as React from 'react';
import { useState } from 'react';
import { MentorRoute, MentorTopLevelView, mentorTopLevelFor } from './navigation/types';
import { ChartIcon, UsersIcon, BuildingIcon, ClipboardIcon, CodeIcon, UserIcon, MenuIcon, CloseIcon, ArrowLeftIcon } from '../ui/icons';
import * as mentorRepo from '../admin/repository/mentorRepository';

interface NavItem {
  view: MentorTopLevelView;
  label: string;
  route: MentorRoute;
  icon: React.FC<{ className?: string }>;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  { label: 'Overview', items: [{ view: 'dashboard', label: 'Dashboard', route: { view: 'dashboard' }, icon: ChartIcon }] },
  {
    label: 'Students',
    items: [
      { view: 'myStudents', label: 'My Students', route: { view: 'myStudents' }, icon: UsersIcon },
      { view: 'myBatches', label: 'My Batches', route: { view: 'myBatches' }, icon: BuildingIcon },
    ],
  },
  { label: 'Review', items: [{ view: 'review', label: 'Review Queue', route: { view: 'review' }, icon: ClipboardIcon }] },
  { label: 'Activity', items: [{ view: 'githubActivity', label: 'GitHub Activity', route: { view: 'githubActivity' }, icon: CodeIcon }] },
  { label: 'Account', items: [{ view: 'profile', label: 'Profile', route: { view: 'profile' }, icon: UserIcon }] },
];

const MentorLayout: React.FC<{
  route: MentorRoute;
  onNavigate: (r: MentorRoute) => void;
  mentorId: string;
  onChangeMentor: (id: string) => void;
  onExitMentor: () => void;
  children: React.ReactNode;
}> = ({ route, onNavigate, mentorId, onChangeMentor, onExitMentor, children }) => {
  const active = mentorTopLevelFor(route);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mentors = mentorRepo.listMentors();
  const mentor = mentorRepo.getMentor(mentorId);

  const navigate = (r: MentorRoute): void => {
    onNavigate(r);
    setMobileOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-[720px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white lg:hidden">
        <span className="text-[15px] font-bold text-slate-900">Mentor Portal</span>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-slate-600 border border-slate-200 rounded-md p-1.5" aria-expanded={mobileOpen}>
          {mobileOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex lg:min-h-[720px]">
        <nav className={`w-full lg:w-[248px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-col ${mobileOpen ? 'flex' : 'hidden lg:flex'}`}>
          <div className="hidden lg:flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="text-[15px] font-bold text-slate-900">Mentor Portal</span>
          </div>

          <div className="px-3 pt-4">
            <button onClick={onExitMentor} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-slate-500 hover:bg-slate-100 mb-2">
              <ArrowLeftIcon className="w-4 h-4" /> Back to Student View
            </button>
            {mentors.length > 1 && (
              <select
                value={mentorId}
                onChange={(e) => onChangeMentor(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 mb-2 bg-slate-50"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex-1 overflow-auto px-3 pt-1">
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
                            isActive ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 font-medium'
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
          </div>

          <div className="hidden lg:flex items-center gap-2.5 px-4 py-4 border-t border-slate-100">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {mentor?.name.charAt(0) || 'M'}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{mentor?.name || 'Mentor'}</div>
              <div className="text-[11px] text-slate-400 truncate">{mentor?.specialization || 'Mentor'}</div>
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

export default MentorLayout;
