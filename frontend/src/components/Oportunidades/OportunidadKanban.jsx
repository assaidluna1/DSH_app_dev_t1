import React from 'react';
import { PriorityBadge, formatCurrency, stageColors, stageLabels } from '../Shared/Badge';
import { Calendar, User, ArrowRight, DollarSign } from 'lucide-react';

const KANBAN_STAGES = [
  { key: 'prospeccion', label: 'Prospección' },
  { key: 'calificacion', label: 'Calificación' },
  { key: 'propuesta_tecnica', label: 'Propuesta Técnica' },
  { key: 'propuesta_comercial', label: 'Propuesta Comercial' },
  { key: 'negociacion', label: 'Negociación' },
  { key: 'ganado', label: 'Ganado' },
  { key: 'perdido', label: 'Perdido' },
];

export const OportunidadKanban = ({ oportunidades = [], onSelectOpportunity, onMoveStage }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {KANBAN_STAGES.map((col) => {
        const colOpps = oportunidades.filter((o) => o.etapa === col.key);
        const colTotal = colOpps.reduce((sum, o) => sum + (parseFloat(o.valor_estimado_usd) || 0), 0);

        return (
          <div
            key={col.key}
            className="w-80 shrink-0 bg-surface-900/90 border border-surface-800 rounded-2xl flex flex-col max-h-[calc(100vh-14rem)] shadow-xl"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-surface-800 bg-surface-950/40 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-surface-100">{col.label}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-surface-800 text-surface-300 border border-surface-700">
                  {colOpps.length}
                </span>
              </div>
              <div className="mt-1.5 text-xs font-semibold text-brand-400">
                {formatCurrency(colTotal)}
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1">
              {colOpps.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp.id)}
                  className="bg-surface-850 hover:bg-surface-800 border border-surface-750 hover:border-surface-600 rounded-xl p-4 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-surface-100 group-hover:text-brand-400 transition-colors line-clamp-2">
                      {opp.nombre}
                    </h4>
                    <PriorityBadge prioridad={opp.prioridad} />
                  </div>

                  <p className="text-xs font-medium text-surface-400 mb-3 truncate">
                    {opp.cliente?.nombre || 'Cliente sin asignar'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-800/80">
                    <span className="font-bold text-surface-100">
                      {formatCurrency(opp.valor_estimado_usd)}
                    </span>
                    <span className="text-brand-400 font-semibold">
                      {Math.round(opp.probabilidad)}% prob.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-surface-400 mt-2.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-surface-500" />
                      <span>{opp.fecha_cierre_estimada || 'Sin fecha'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-surface-300">
                      <div className="w-4 h-4 rounded-full bg-brand-600/30 text-brand-400 text-[9px] font-bold flex items-center justify-center">
                        {opp.propietario?.nombre?.charAt(0) || 'V'}
                      </div>
                      <span className="truncate max-w-[80px]">{opp.propietario?.nombre?.split(' ')[0] || 'Vendedor'}</span>
                    </div>
                  </div>

                  {/* Stage mover selector */}
                  <div 
                    className="mt-3 pt-2 border-t border-surface-800/60 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] uppercase text-surface-400 font-semibold">Mover a:</span>
                    <select
                      value={opp.etapa}
                      onChange={(e) => onMoveStage(opp.id, e.target.value)}
                      className="bg-surface-900 border border-surface-700 text-[11px] text-surface-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500"
                    >
                      {KANBAN_STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {colOpps.length === 0 && (
                <div className="h-28 flex items-center justify-center border-2 border-dashed border-surface-800/80 rounded-xl text-xs text-surface-400 font-medium">
                  Sin oportunidades
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
