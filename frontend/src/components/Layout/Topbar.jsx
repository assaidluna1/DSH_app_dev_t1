import React from 'react';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = ({ title = 'Dashboard', onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-800/80 fixed top-0 right-0 left-0 lg:left-0 z-20 flex items-center justify-between px-4 md:px-8">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-surface-100 tracking-tight truncate">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Status — hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">Sistema Operativo</span>
        </div>

        {/* User — always visible */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-2 md:border-l md:border-surface-800">
          <span className="text-sm font-semibold text-surface-200 leading-none hidden sm:block">{user?.nombre?.split(' ')[0]}</span>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-surface-800 border border-surface-700/80 flex items-center justify-center text-surface-300 flex-shrink-0">
            <UserIcon className="w-4 h-4 text-brand-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
