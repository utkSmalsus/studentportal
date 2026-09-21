import * as React from 'react';

// A small hand-built icon set (stroke-based, 20x20, currentColor) — avoids pulling
// in an icon library dependency for what a dozen inline SVGs cover fine.
export type IconProps = { className?: string };
const base = 'w-[18px] h-[18px]';
const wrap = (path: React.ReactNode, className?: string): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className || base}>
    {path}
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" /></>, className);
export const MapIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M8 4 3 6v14l5-2 8 2 5-2V4l-5 2-8-2Z" /><path d="M8 4v14M16 6v14" /></>, className);
export const CodeIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="m9 8-4 4 4 4" /><path d="m15 8 4 4-4 4" /></>, className);
export const ClipboardIcon: React.FC<IconProps> = ({ className }) => wrap(<><rect x="6" y="4" width="12" height="17" rx="1.5" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="m9 12 2 2 4-4" /></>, className);
export const RocketIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M12 2c3 1.5 5 5 5 9-1 1-2.5 2-5 2s-4-1-5-2c0-4 2-7.5 5-9Z" /><circle cx="12" cy="10" r="1.5" /><path d="M9 15c-2 1-3 3-3 6 3 0 5-1 6-3M15 15c2 1 3 3 3 6-3 0-5-1-6-3" /></>, className);
export const ChartIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M4 20V10M12 20V4M20 20v-6" /></>, className);
export const AwardIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="12" cy="8" r="5" /><path d="m8.5 12.5-1.5 8 5-2.5 5 2.5-1.5-8" /></>, className);
export const UserIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-4 4-5.5 7-5.5s5.5 1.5 7 5.5" /></>, className);
export const MenuIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M4 6h16M4 12h16M4 18h16" />, className);
export const CloseIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="m5 5 14 14M19 5 5 19" />, className);
export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="m9 5 7 7-7 7" />, className);
export const CheckIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="m5 12 5 5 9-10" />, className);
export const LockIcon: React.FC<IconProps> = ({ className }) => wrap(<><rect x="5" y="10" width="14" height="10" rx="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>, className);
export const FlameIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1-1-2-1-3 2 1 3 4 3 6a5 5 0 0 1-10 0c0-5 3-6 5-11Z" />, className);
export const ClockIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>, className);
export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M5 12h13M13 6l6 6-6 6" />, className);
export const AlertIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M10.3 3.9 2.5 18a1.5 1.5 0 0 0 1.3 2.2h16.4a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" /><path d="M12 9.5v4M12 17h.01" /></>, className);
export const GithubIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.2a3.2 3.2 0 0 0-.9-2.4c2.7-.3 5.4-1.4 5.4-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1 -.3-3.4 1.3a11.4 11.4 0 0 0-6.2 0C6.1 2.9 5.1 3.2 5.1 3.2a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.7 9.6c0 4.6 2.7 5.7 5.4 6a3.2 3.2 0 0 0-.9 2.4V21" />, className);
export const BookIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></>, className);
export const UsersIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.9-3.4 3-5 6-5s5.1 1.6 6 5" /><circle cx="17.5" cy="8.5" r="2.4" /><path d="M15 20c.6-2.4 1.8-3.7 3.5-4" /></>, className);
export const SettingsIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></>, className);
export const BellIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>, className);
export const CalendarIcon: React.FC<IconProps> = ({ className }) => wrap(<><rect x="3.5" y="5" width="17" height="15.5" rx="1.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>, className);
export const LayersIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></>, className);
export const BuildingIcon: React.FC<IconProps> = ({ className }) => wrap(<><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h1M8 11h1M8 15h1M15 7h1M15 11h1M15 15h1M9 21v-4h6v4" /></>, className);
export const PlusIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M12 5v14M5 12h14" />, className);
export const SearchIcon: React.FC<IconProps> = ({ className }) => wrap(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, className);
export const TrashIcon: React.FC<IconProps> = ({ className }) => wrap(<><path d="M4 7h16" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /><path d="M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7" /></>, className);
export const CopyIcon: React.FC<IconProps> = ({ className }) => wrap(<><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" /></>, className);
export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => wrap(<path d="M19 12H6M11 6l-6 6 6 6" />, className);
