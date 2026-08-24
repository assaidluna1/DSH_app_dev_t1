import api from './client';

export const oportunidadesApi = {
  list: async (params = {}) => {
    const response = await api.get('/oportunidades/', { params });
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/oportunidades/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/oportunidades/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/oportunidades/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/oportunidades/${id}`);
    return response.data;
  },
  updateEtapa: async (id, etapa, motivo_perdida = null) => {
    const response = await api.patch(`/oportunidades/${id}/etapa`, {
      etapa,
      motivo_perdida,
    });
    return response.data;
  },
  getActividades: async (id) => {
    const response = await api.get(`/oportunidades/${id}/actividades`);
    return response.data;
  },
  createActividad: async (id, data) => {
    const response = await api.post(`/oportunidades/${id}/actividades`, data);
    return response.data;
  },
  getNotas: async (id) => {
    const response = await api.get(`/oportunidades/${id}/notas`);
    return response.data;
  },
  createNota: async (id, contenido) => {
    const response = await api.post(`/oportunidades/${id}/notas`, { contenido });
    return response.data;
  },
  getProductos: async (id) => {
    const response = await api.get(`/oportunidades/${id}/productos`);
    return response.data;
  },
  addProducto: async (id, data) => {
    const response = await api.post(`/oportunidades/${id}/productos`, data);
    return response.data;
  },
  removeProducto: async (id, productoId) => {
    const response = await api.delete(`/oportunidades/${id}/productos/${productoId}`);
    return response.data;
  },
};
