import { api } from './api';

export const studyPlanItemsService = {
  async findAll(studyPlanId: string) {
    const response = await api.get('/study-plan-items', { params: { studyPlanId } });
    return response.data;
  },

  async create(data: { studyPlanId: string; subjectId: string; title: string; description?: string; sequenceOrder: number; estimatedMinutes?: number }) {
    const response = await api.post('/study-plan-items', data);
    return response.data;
  },

  async update(id: string, data: { title?: string; description?: string; sequenceOrder?: number; estimatedMinutes?: number }) {
    const response = await api.patch(`/study-plan-items/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/study-plan-items/${id}`);
    return response.data;
  }
};
