import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../Shared/Badge';

export const WinLossChart = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-100">Mes: {label}</p>
          <p className="text-emerald-400">Ganadas: <span className="font-semibold text-slate-200">{d.ganadas}</span></p>
          <p className="text-rose-400">Perdidas: <span className="font-semibold text-slate-200">{d.perdidas}</span></p>
          <p className="text-blue-400">Ingresos Ganados: <span className="font-semibold text-slate-200">{formatCurrency(d.valor_ganado_usd)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Tendencia Ganadas vs Perdidas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Histórico de efectividad en los últimos 6 meses</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="ganadas" 
              name="Ganadas" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10b981' }} 
            />
            <Line 
              type="monotone" 
              dataKey="perdidas" 
              name="Perdidas" 
              stroke="#f43f5e" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f43f5e' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
