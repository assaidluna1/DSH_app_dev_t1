import api from './client';

export const clientesApi = {
  list: async (params = {}) => {
    const response = await api.get('/clientes/', { params });
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/clientes/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
  getStats: async (id) => {
    const response = await api.get(`/clientes/${id}/stats`);
    return response.data;
  },
};

export const contactosApi = {
  list: async (params = {}) => {
    const response = await api.get('/contactos/', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/contactos/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/contactos/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contactos/${id}`);
    return response.data;
  },
};

export const productosApi = {
  list: async (params = {}) => {
    const response = await api.get('/productos/', { params });
    return response.data;
  },
};

export const fabricantesApi = {
  list: async () => {
    const response = await api.get('/fabricantes/');
    return response.data;
  },
};
