import api from './client';

export const dashboardApi = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
  getPipelinePorEtapa: async () => {
    const response = await api.get('/dashboard/pipeline-por-etapa');
    return response.data;
  },
  getPipelinePorVendedor: async () => {
    const response = await api.get('/dashboard/pipeline-por-vendedor');
    return response.data;
  },
  getPipelinePorFabricante: async () => {
    const response = await api.get('/dashboard/pipeline-por-fabricante');
    return response.data;
  },
  getTopOportunidades: async (limit = 10) => {
    const response = await api.get('/dashboard/top-oportunidades', {
      params: { limit },
    });
    return response.data;
  },
  getForecast: async (periodo = 'mes') => {
    const response = await api.get('/dashboard/forecast', {
      params: { periodo },
    });
    return response.data;
  },
  getActividadReciente: async (dias = 7, limit = 20) => {
    const response = await api.get('/dashboard/actividad-reciente', {
      params: { dias, limit },
    });
    return response.data;
  },
  getWinLossTrend: async (meses = 6) => {
    const response = await api.get('/dashboard/win-loss-trend', {
      params: { meses },
    });
    return response.data;
  },
};
