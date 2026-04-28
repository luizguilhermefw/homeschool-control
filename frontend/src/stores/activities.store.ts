import { defineStore } from 'pinia';
import { ref } from 'vue';
import { activitiesService } from '../services/activities.service';

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<any[]>([]);
  const isFetching = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  
  // Rastreia itens específicos sendo salvos { 'uuid': true }
  const savingItems = ref<Record<string, boolean>>({});

  async function fetchActivities(studentId?: string, date?: string) {
    isFetching.value = true;
    error.value = null;
    try {
      activities.value = await activitiesService.findAll(studentId, date);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar atividades';
    } finally {
      isFetching.value = false;
    }
  }

  async function addActivity(data: { studentId: string; studyPlanItemId?: string; title: string; executionDate: string; realMinutes?: number; status?: string; notes?: string }) {
    isSaving.value = true;
    error.value = null;
    try {
      const newActivity = await activitiesService.create(data);
      activities.value.unshift(newActivity);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar atividade';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateActivity(id: string, data: any) {
    const index = activities.value.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    // Backup para reversão
    const backup = { ...activities.value[index] };
    
    // Atualização Otimista UI
    activities.value[index] = { ...activities.value[index], ...data };
    savingItems.value[id] = true;
    error.value = null;

    try {
      const updated = await activitiesService.update(id, data);
      activities.value[index] = updated; // Confirma com os dados reais da API
      return true;
    } catch (err: any) {
      // Reverte
      activities.value[index] = backup;
      error.value = err.response?.data?.message || 'Erro ao atualizar atividade';
      return false;
    } finally {
      savingItems.value[id] = false;
    }
  }

  return { activities, isFetching, isSaving, error, savingItems, fetchActivities, addActivity, updateActivity };
});
