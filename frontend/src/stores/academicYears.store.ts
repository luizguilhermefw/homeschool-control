import { defineStore } from 'pinia';
import { ref } from 'vue';
import { academicYearsService } from '../services/academicYears.service';

export const useAcademicYearsStore = defineStore('academicYears', () => {
  const academicYears = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAcademicYears() {
    loading.value = true;
    error.value = null;
    try {
      academicYears.value = await academicYearsService.findAll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar anos letivos';
    } finally {
      loading.value = false;
    }
  }

  async function addAcademicYear(data: { name: string; startDate: string; endDate: string }) {
    loading.value = true;
    try {
      const newYear = await academicYearsService.create(data);
      academicYears.value.unshift(newYear);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar ano letivo';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeAcademicYear(id: string) {
    try {
      await academicYearsService.remove(id);
      academicYears.value = academicYears.value.filter(y => y.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover ano letivo';
    }
  }

  return { academicYears, loading, error, fetchAcademicYears, addAcademicYear, removeAcademicYear };
});
