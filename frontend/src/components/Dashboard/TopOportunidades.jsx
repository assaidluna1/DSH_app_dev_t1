import React from 'react';
import { StageBadge, formatCurrency } from '../Shared/Badge';
import { ChevronRight } from 'lucide-react';

export const TopOportunidades = ({ data = [], onSelectOpportunity }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Top 10 Oportunidades</h3>
          <p className="text-xs text-slate-400 mt-0.5">Operaciones de mayor impacto financiero en el pipeline</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 font-semibold">Oportunidad</th>
              <th className="py-3 px-3 font-semibold">Cliente</th>
              <th className="py-3 px-3 font-semibold">Etapa</th>
              <th className="py-3 px-3 font-semibold text-right">Valor USD</th>
              <th className="py-3 px-3 font-semibold text-center">Prob.</th>
              <th className="py-3 px-3 font-semibold">Cierre Est.</th>
              <th className="py-3 px-3 font-semibold">Propietario</th>
              <th className="py-3 px-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((opp) => (
              <tr
                key={opp.id}
                onClick={() => onSelectOpportunity?.(opp.id)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-3 font-medium text-slate-100 group-hover:text-blue-400 transition-colors">
                  {opp.nombre}
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {opp.cliente?.nombre || '—'}
                </td>
                <td className="py-3 px-3">
                  <StageBadge etapa={opp.etapa} />
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-100">
                  {formatCurrency(opp.valor_estimado_usd)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="font-semibold text-blue-400">{Math.round(opp.probabilidad)}%</span>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                  {opp.fecha_cierre_estimada || 'Sin fecha'}
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {opp.propietario?.nombre || '—'}
                </td>
                <td className="py-3 px-2 text-center text-slate-500 group-hover:text-slate-200">
                  <ChevronRight className="w-4 h-4 inline" />
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No hay oportunidades registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
