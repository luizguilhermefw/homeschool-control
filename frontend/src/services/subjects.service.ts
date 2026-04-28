import { api } from './api';

export const subjectsService = {
  async findAll() {
    const response = await api.get('/subjects');
    return response.data;
  },

  async create(data: { name: string; color?: string }) {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  }
};
