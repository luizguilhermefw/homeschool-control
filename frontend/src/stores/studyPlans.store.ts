import { defineStore } from 'pinia';
import { ref } from 'vue';
import { studyPlansService } from '../services/studyPlans.service';

export const useStudyPlansStore = defineStore('studyPlans', () => {
  const studyPlans = ref<any[]>([]);
  const currentPlan = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStudyPlans(studentId?: string) {
    loading.value = true;
    error.value = null;
    try {
      studyPlans.value = await studyPlansService.findAll(studentId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar planos de estudo';
    } finally {
      loading.value = false;
    }
  }

  async function fetchStudyPlan(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentPlan.value = await studyPlansService.findOne(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar o plano de estudo';
    } finally {
      loading.value = false;
    }
  }

  async function addStudyPlan(data: { name: string; description?: string; studentId: string; academicYearId: string }) {
    loading.value = true;
    try {
      const newPlan = await studyPlansService.create(data);
      studyPlans.value.unshift(newPlan);
      return newPlan;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar plano de estudo';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function removeStudyPlan(id: string) {
    try {
      await studyPlansService.remove(id);
      studyPlans.value = studyPlans.value.filter(p => p.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover plano de estudo';
    }
  }

  return { studyPlans, currentPlan, loading, error, fetchStudyPlans, fetchStudyPlan, addStudyPlan, removeStudyPlan };
});
