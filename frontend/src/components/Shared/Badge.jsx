import React from 'react';

export const stageLabels = {
  prospeccion: 'Prospección',
  calificacion: 'Calificación',
  propuesta_tecnica: 'Propuesta Técnica',
  propuesta_comercial: 'Propuesta Comercial',
  negociacion: 'Negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
};

export const stageColors = {
  prospeccion: 'bg-surface-700/60 text-surface-300 border-surface-600',
  calificacion: 'bg-brand-900/50 text-brand-300 border-brand-700/60',
  propuesta_tecnica: 'bg-amber-900/50 text-amber-300 border-amber-700/60',
  propuesta_comercial: 'bg-orange-900/50 text-orange-300 border-orange-700/60',
  negociacion: 'bg-purple-900/50 text-purple-300 border-purple-700/60',
  ganado: 'bg-emerald-900/50 text-emerald-300 border-emerald-600/60',
  perdido: 'bg-rose-900/50 text-rose-300 border-rose-700/60',
};

export const priorityColors = {
  alta: 'bg-rose-900/40 text-rose-300 border-rose-700/50',
  media: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  baja: 'bg-surface-800 text-surface-300 border-surface-700',
};

export const formatCurrency = (val) => {
  const num = parseFloat(val) || 0;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
};

export const StageBadge = ({ etapa }) => {
  const label = stageLabels[etapa] || etapa;
  const style = stageColors[etapa] || 'bg-surface-800 text-surface-300 border-surface-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
};

export const PriorityBadge = ({ prioridad }) => {
  const label = prioridad ? prioridad.toUpperCase() : 'MEDIA';
  const style = priorityColors[prioridad?.toLowerCase()] || priorityColors.media;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider border ${style}`}>
      {label}
    </span>
  );
};
