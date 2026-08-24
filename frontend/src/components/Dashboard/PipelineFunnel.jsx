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
import { stageLabels, formatCurrency } from '../Shared/Badge';

export const PipelineFunnel = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: stageLabels[item.etapa] || item.etapa,
    rawEtapa: item.etapa,
    count: item.count,
    valor: item.valor_total_usd,
    ponderado: item.valor_ponderado_usd,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-100">{label}</p>
          <p className="text-blue-400">Oportunidades: <span className="font-semibold text-slate-200">{d.count}</span></p>
          <p className="text-emerald-400">Valor Total: <span className="font-semibold text-slate-200">{formatCurrency(d.valor)}</span></p>
          <p className="text-indigo-400">Valor Ponderado: <span className="font-semibold text-slate-200">{formatCurrency(d.ponderado)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">Embudo de Pipeline por Etapa</h3>
          <p className="text-xs text-slate-400 mt-0.5">Volumen y valor comercial en cada fase del ciclo</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              fontSize={11}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#cbd5e1" 
              fontSize={11} 
              width={120} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Valor Total USD" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
