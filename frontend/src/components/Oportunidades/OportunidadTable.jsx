import React from 'react';
import { StageBadge, PriorityBadge, formatCurrency, stageLabels } from '../Shared/Badge';
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';

export const OportunidadTable = ({
  oportunidades = [],
  total = 0,
  page = 1,
  size = 20,
  pages = 1,
  onPageChange,
  onSelectOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Nombre Oportunidad</th>
              <th className="py-3.5 px-4 font-semibold">Cliente</th>
              <th className="py-3.5 px-4 font-semibold">Etapa</th>
              <th className="py-3.5 px-4 font-semibold text-right">Valor Estimado</th>
              <th className="py-3.5 px-4 font-semibold text-center">Prob.</th>
              <th className="py-3.5 px-4 font-semibold text-center">Prioridad</th>
              <th className="py-3.5 px-4 font-semibold">Fecha Cierre</th>
              <th className="py-3.5 px-4 font-semibold">Propietario</th>
              <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {oportunidades.map((opp) => (
              <tr
                key={opp.id}
                onClick={() => onSelectOpportunity?.(opp.id)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 font-semibold text-slate-100 group-hover:text-blue-400 transition-colors max-w-xs truncate">
                  {opp.nombre}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {opp.cliente?.nombre || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <StageBadge etapa={opp.etapa} />
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                  {formatCurrency(opp.valor_estimado_usd)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="font-semibold text-blue-400">{Math.round(opp.probabilidad)}%</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <PriorityBadge prioridad={opp.prioridad} />
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  {opp.fecha_cierre_estimada || 'Sin fecha'}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {opp.propietario?.nombre || '—'}
                </td>
                <td 
                  className="py-3.5 px-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelectOpportunity?.(opp.id)}
                      title="Ver detalle"
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditOpportunity?.(opp)}
                      title="Editar"
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteOpportunity?.(opp.id)}
                      title="Eliminar"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {oportunidades.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                  No se encontraron oportunidades con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Mostrando {oportunidades.length} de {total} oportunidades
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-300 px-2">
            Página {page} de {pages || 1}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
