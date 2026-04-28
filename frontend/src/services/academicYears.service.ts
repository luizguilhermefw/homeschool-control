import { api } from './api';

export const academicYearsService = {
  async findAll() {
    const response = await api.get('/academic-years');
    return response.data;
  },

  async create(data: { name: string; startDate: string; endDate: string }) {
    const response = await api.post('/academic-years', data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  }
};
