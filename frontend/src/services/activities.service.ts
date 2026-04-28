import { api } from './api';

export const activitiesService = {
  async findAll(studentId?: string, date?: string) {
    const params: any = {};
    if (studentId) params.studentId = studentId;
    if (date) params.date = date;
    const response = await api.get('/activities', { params });
    return response.data;
  },

  async create(data: { studentId: string; studyPlanItemId?: string; title: string; executionDate: string; realMinutes?: number; status?: string; notes?: string }) {
    const response = await api.post('/activities', data);
    return response.data;
  },

  async update(id: string, data: { title?: string; executionDate?: string; realMinutes?: number; status?: string; notes?: string }) {
    const response = await api.patch(`/activities/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  }
};
