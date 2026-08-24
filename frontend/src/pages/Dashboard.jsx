import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { KPICard } from '../components/Dashboard/KPICard';
import { PipelineFunnel } from '../components/Dashboard/PipelineFunnel';
import { ForecastChart } from '../components/Dashboard/ForecastChart';
import { TopOportunidades } from '../components/Dashboard/TopOportunidades';
import { PipelineByRep } from '../components/Dashboard/PipelineByRep';
import { WinLossChart } from '../components/Dashboard/WinLossChart';
import { Modal } from '../components/Shared/Modal';
import { OportunidadDetail } from '../components/Oportunidades/OportunidadDetail';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { 
  DollarSign, 
  Layers, 
  Award, 
  Percent, 
  TrendingUp, 
  Clock, 
  RefreshCw 
} from 'lucide-react';

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [pipelineEtapa, setPipelineEtapa] = useState([]);
  const [pipelineRep, setPipelineRep] = useState([]);
  const [topOpps, setTopOpps] = useState([]);
  const [winLoss, setWinLoss] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [periodoForecast, setPeriodoForecast] = useState('mes');
  const [loading, setLoading] = useState(true);

  // Selected opportunity for detail modal
  const [selectedOppId, setSelectedOppId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sum, etapas, reps, top, wl, fc] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getPipelinePorEtapa(),
        dashboardApi.getPipelinePorVendedor(),
        dashboardApi.getTopOportunidades(10),
        dashboardApi.getWinLossTrend(6),
        dashboardApi.getForecast(periodoForecast),
      ]);

      setSummary(sum);
      setPipelineEtapa(etapas);
      setPipelineRep(reps);
      setTopOpps(top);
      setWinLoss(wl);
      setForecast(fc);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePeriodoChange = async (newPeriodo) => {
    setPeriodoForecast(newPeriodo);
    try {
      const fc = await dashboardApi.getForecast(newPeriodo);
      setForecast(fc);
    } catch (err) {
      console.error('Error changing forecast period:', err);
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner message="Cargando métricas ejecutivas..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Resumen Ejecutivo</h2>
          <p className="text-xs text-slate-400 mt-1">Visibilidad integral del embudo comercial y cumplimiento de metas</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* 1. ROW OF 6 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Pipeline Total"
          value={summary?.pipeline_total_usd}
          isCurrency
          icon={DollarSign}
          color="blue"
          subtitle="Oportunidades activas"
        />
        <KPICard
          title="Pipeline Ponderado"
          value={summary?.pipeline_ponderado_usd}
          isCurrency
          icon={TrendingUp}
          color="purple"
          tooltip="Suma del valor estimado ajustado por el porcentaje de probabilidad de cada etapa."
          subtitle="Ajustado por probabilidad"
        />
        <KPICard
          title="Oportunidades Abiertas"
          value={summary?.oportunidades_abiertas}
          icon={Layers}
          color="indigo"
          subtitle="En proceso de venta"
        />
        <KPICard
          title="Ganadas Este Mes"
          value={summary?.oportunidades_ganadas_mes}
          icon={Award}
          color="emerald"
          subtitle={summary?.valor_ganado_mes_usd ? `$${(summary.valor_ganado_mes_usd / 1000).toFixed(1)}k USD cerrados` : 'Cierres efectivos'}
        />
        <KPICard
          title="Win Rate del Mes"
          value={summary?.win_rate_mes}
          isPercent
          icon={Percent}
          color="amber"
          subtitle="Ganadas vs cerradas"
        />
        <KPICard
          title="Ticket Promedio"
          value={summary?.ticket_promedio_usd}
          isCurrency
          icon={Clock}
          color="rose"
          subtitle={`Velocidad: ${summary?.velocidad_promedio_dias || 0} días`}
        />
      </div>

      {/* 2. CHARTS ROW 1: Pipeline Funnel & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineFunnel data={pipelineEtapa} />
        <ForecastChart
          forecastData={forecast}
          periodo={periodoForecast}
          onPeriodoChange={handlePeriodoChange}
        />
      </div>

      {/* 3. TOP 10 OPPORTUNITIES TABLE */}
      <TopOportunidades
        data={topOpps}
        onSelectOpportunity={(id) => setSelectedOppId(id)}
      />

      {/* 4. CHARTS ROW 2: Rep Performance & Win/Loss Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineByRep data={pipelineRep} />
        <WinLossChart data={winLoss} />
      </div>

      {/* Opportunity Detail Modal */}
      <Modal
        isOpen={!!selectedOppId}
        onClose={() => setSelectedOppId(null)}
        title="Detalle de Oportunidad Comercial"
        maxWidth="max-w-3xl"
      >
        {selectedOppId && (
          <OportunidadDetail
            oportunidadId={selectedOppId}
            onClose={() => setSelectedOppId(null)}
            onUpdated={fetchDashboardData}
          />
        )}
      </Modal>
    </div>
  );
};
