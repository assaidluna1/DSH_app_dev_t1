import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../Shared/Badge';

export const ForecastChart = ({ forecastData, periodo, onPeriodoChange }) => {
  const chartData = [
    {
      name: `Periodo (${periodo.toUpperCase()})`,
      pipeline: forecastData?.pipeline_en_periodo || 0,
      ponderado: forecastData?.forecast_ponderado || 0,
      ganado: forecastData?.ganado_a_la_fecha || 0,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-100 mb-1">Forecast Comercial</p>
          <p className="text-blue-400">Pipeline en Periodo: <span className="font-semibold text-slate-200">{formatCurrency(payload[0]?.value)}</span></p>
          <p className="text-purple-400">Forecast Ponderado: <span className="font-semibold text-slate-200">{formatCurrency(payload[1]?.value)}</span></p>
          <p className="text-emerald-400">Ganado a la Fecha: <span className="font-semibold text-slate-200">{formatCurrency(payload[2]?.value)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Forecast de Ventas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Comparativo de pipeline, ponderado y ganado</p>
        </div>
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['mes', 'trimestre', 'año'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodoChange(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                periodo === p
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="pipeline" name="Pipeline Periodo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ponderado" name="Forecast Ponderado" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ganado" name="Ganado a la Fecha" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
