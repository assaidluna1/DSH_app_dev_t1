import api from './client';

export const actividadesApi = {
  list: async (params = {}) => {
    const response = await api.get('/actividades/', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/actividades/', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/actividades/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/actividades/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/actividades/${id}`);
    return response.data;
  },
};
