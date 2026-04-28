import { api } from './api';

export interface Student {
  id: string;
  name: string;
  dateOfBirth?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentPayload {
  name: string;
  dateOfBirth?: string;
}

export const studentsService = {
  async list() {
    const { data } = await api.get<Student[]>('/students');
    return data;
  },

  async create(payload: CreateStudentPayload) {
    const { data } = await api.post<Student>('/students', payload);
    return data;
  },
};
