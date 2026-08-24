import React from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistema Operativo</span>
        </div>

        {/* User Mini Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200 leading-none">{user?.nombre}</p>
            <p className="text-[11px] text-slate-400 mt-1">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300">
            <UserIcon className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
