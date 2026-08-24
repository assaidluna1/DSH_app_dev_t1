import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Layers, 
  Building2, 
  Users, 
  Activity, 
  LogOut, 
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pipeline', label: 'Pipeline Kanban', icon: KanbanSquare },
    { path: '/oportunidades', label: 'Oportunidades', icon: Layers },
    { path: '/clientes', label: 'Clientes', icon: Building2 },
    { path: '/contactos', label: 'Contactos', icon: Users },
    { path: '/actividades', label: 'Actividades', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col fixed inset-y-0 left-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-100 tracking-tight">TechDist</span>
          <span className="text-xs font-semibold text-blue-400 ml-1.5 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">CRM</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navegación Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.nombre || 'Usuario'}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 capitalize">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{user?.rol || 'vendedor'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
