import React from 'react';
import { HelpCircle } from 'lucide-react';
import { formatCurrency } from '../Shared/Badge';

export const KPICard = ({ title, value, subtitle, icon: Icon, isCurrency = false, isPercent = false, tooltip, color = 'blue' }) => {
  const colorStyles = {
    blue: 'from-brand-500/10 to-brand-500/5 text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/10 to-brand-500/5 text-purple-400 border-purple-500/20',
    rose: 'from-rose-500/10 to-pink-500/5 text-rose-400 border-rose-500/20',
    indigo: 'from-brand-500/10 to-cyan-500/5 text-brand-400 border-brand-500/20',
  };

  const formattedValue = isCurrency 
    ? formatCurrency(value)
    : isPercent 
      ? `${value}%`
      : value?.toLocaleString?.() ?? value ?? 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorStyles[color] || colorStyles.blue} bg-surface-900 border p-6 transition-all hover:border-surface-700 shadow-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-400">
            <span>{title}</span>
            {tooltip && (
              <div className="group relative inline-block">
                <HelpCircle className="w-3.5 h-3.5 text-surface-400 hover:text-surface-300 cursor-help" />
                <div className="absolute left-1/2 -transurface-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 p-2 bg-surface-800 border border-surface-700 text-[11px] font-normal normal-case text-surface-200 rounded-lg shadow-xl z-50 pointer-events-none">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 text-2xl font-extrabold text-surface-100 tracking-tight">
            {formattedValue}
          </div>
          {subtitle && (
            <div className="mt-1 text-xs font-medium text-surface-400">
              {subtitle}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-surface-800/80 border border-surface-700/60 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
