import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../Shared/Badge';

export const PipelineByRep = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-surface-900 border border-surface-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-surface-100">{label}</p>
          <p className="text-brand-400">Oportunidades: <span className="font-semibold text-surface-200">{d.count}</span></p>
          <p className="text-emerald-400">Pipeline Total: <span className="font-semibold text-surface-200">{formatCurrency(d.valor_total_usd)}</span></p>
          <p className="text-amber-400">Win Rate: <span className="font-semibold text-surface-200">{d.win_rate}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-surface-100">Pipeline por Vendedor</h3>
          <p className="text-xs text-surface-400 mt-0.5">Distribución comercial por ejecutivo de cuenta</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              fontSize={11}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
            />
            <YAxis 
              dataKey="vendedor" 
              type="category" 
              stroke="#cbd5e1" 
              fontSize={11} 
              width={100} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor_total_usd" fill="#6366f1" radius={[0, 6, 6, 0]} name="Pipeline Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
