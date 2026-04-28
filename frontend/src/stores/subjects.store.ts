import { defineStore } from 'pinia';
import { ref } from 'vue';
import { subjectsService } from '../services/subjects.service';

export const useSubjectsStore = defineStore('subjects', () => {
  const subjects = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSubjects() {
    loading.value = true;
    error.value = null;
    try {
      subjects.value = await subjectsService.findAll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar disciplinas';
    } finally {
      loading.value = false;
    }
  }

  async function addSubject(data: { name: string; color?: string }) {
    loading.value = true;
    try {
      const newSubject = await subjectsService.create(data);
      subjects.value.unshift(newSubject);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar disciplina';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeSubject(id: string) {
    try {
      await subjectsService.remove(id);
      subjects.value = subjects.value.filter(s => s.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover disciplina';
    }
  }

  return { subjects, loading, error, fetchSubjects, addSubject, removeSubject };
});
