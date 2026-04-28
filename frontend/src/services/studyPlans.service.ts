import { api } from './api';

export const studyPlansService = {
  async findAll(studentId?: string) {
    const params = studentId ? { studentId } : {};
    const response = await api.get('/study-plans', { params });
    return response.data;
  },

  async findOne(id: string) {
    const response = await api.get(`/study-plans/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string; studentId: string; academicYearId: string }) {
    const response = await api.post('/study-plans', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const response = await api.patch(`/study-plans/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/study-plans/${id}`);
    return response.data;
  }
};
