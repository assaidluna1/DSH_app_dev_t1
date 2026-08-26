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
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ currentPath, onNavigate, onClose }) => {
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
    <aside className="w-64 bg-surface-900 border-r border-surface-800/80 flex flex-col fixed inset-y-0 left-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-800/80 bg-surface-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-base text-surface-100 tracking-tight">TechDist</span>
          <span className="text-xs font-semibold text-brand-400 ml-1.5 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">CRM</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
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
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-surface-800/80 bg-surface-950/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-surface-200 truncate">{user?.nombre || 'Usuario'}</p>
              <div className="flex items-center gap-1 text-[11px] text-surface-400 capitalize">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{user?.rol || 'vendedor'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
