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
    <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-surface-300">
          <thead className="bg-surface-950/70 text-[11px] uppercase tracking-wider text-surface-400 border-b border-surface-800">
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
          <tbody className="divide-y divide-surface-800/60">
            {oportunidades.map((opp) => (
              <tr
                key={opp.id}
                onClick={() => onSelectOpportunity?.(opp.id)}
                className="hover:bg-surface-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 font-semibold text-surface-100 group-hover:text-brand-400 transition-colors max-w-xs truncate">
                  {opp.nombre}
                </td>
                <td className="py-3.5 px-4 text-surface-300">
                  {opp.cliente?.nombre || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <StageBadge etapa={opp.etapa} />
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-surface-100">
                  {formatCurrency(opp.valor_estimado_usd)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="font-semibold text-brand-400">{Math.round(opp.probabilidad)}%</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <PriorityBadge prioridad={opp.prioridad} />
                </td>
                <td className="py-3.5 px-4 text-surface-400 font-mono text-[11px]">
                  {opp.fecha_cierre_estimada || 'Sin fecha'}
                </td>
                <td className="py-3.5 px-4 text-surface-300">
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
                      className="p-1.5 text-surface-400 hover:text-brand-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditOpportunity?.(opp)}
                      title="Editar"
                      className="p-1.5 text-surface-400 hover:text-amber-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteOpportunity?.(opp.id)}
                      title="Eliminar"
                      className="p-1.5 text-surface-400 hover:text-rose-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {oportunidades.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-surface-500 font-medium">
                  No se encontraron oportunidades con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view — visible only on small screens */}
      <div className="md:hidden divide-y divide-surface-800/60 flex-1 overflow-y-auto">
        {oportunidades.length === 0 ? (
          <div className="py-12 text-center text-surface-500 font-medium text-sm">
            No se encontraron oportunidades
          </div>
        ) : (
          oportunidades.map((opp) => (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity?.(opp.id)}
              className="p-4 hover:bg-surface-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm text-surface-100 line-clamp-2 flex-1">{opp.nombre}</h4>
                <StageBadge etapa={opp.etapa} />
              </div>
              <p className="text-xs text-surface-400 mb-2">{opp.cliente?.nombre || 'Sin cliente'}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-surface-100">{formatCurrency(opp.valor_estimado_usd)}</span>
                <span className="text-brand-400 font-semibold">{Math.round(opp.probabilidad)}%</span>
                <PriorityBadge prioridad={opp.prioridad} />
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-800/60 text-[10px] text-surface-500">
                <span>{opp.fecha_cierre_estimada || 'Sin fecha'}</span>
                <span>{opp.propietario?.nombre || '—'}</span>
              </div>
              {/* Actions — stopPropagation to avoid triggering detail */}
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface-800/40" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onSelectOpportunity?.(opp.id)} className="flex-1 py-1.5 text-xs text-brand-400 hover:bg-surface-800 rounded-lg">Ver</button>
                <button onClick={() => onEditOpportunity?.(opp)} className="flex-1 py-1.5 text-xs text-amber-400 hover:bg-surface-800 rounded-lg">Editar</button>
                <button onClick={() => onDeleteOpportunity?.(opp.id)} className="flex-1 py-1.5 text-xs text-rose-400 hover:bg-surface-800 rounded-lg">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-950/60 px-6 py-4 border-t border-surface-800 flex items-center justify-between">
        <span className="text-xs text-surface-400">
          Mostrando {oportunidades.length} de {total} oportunidades
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-surface-300 px-2">
            Página {page} de {pages || 1}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
