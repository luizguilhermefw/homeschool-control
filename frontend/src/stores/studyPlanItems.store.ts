import { defineStore } from 'pinia';
import { ref } from 'vue';
import { studyPlanItemsService } from '../services/studyPlanItems.service';

export const useStudyPlanItemsStore = defineStore('studyPlanItems', () => {
  const items = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchItems(studyPlanId: string) {
    loading.value = true;
    error.value = null;
    try {
      items.value = await studyPlanItemsService.findAll(studyPlanId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar itens do plano';
    } finally {
      loading.value = false;
    }
  }

  async function addItem(data: { studyPlanId: string; subjectId: string; title: string; description?: string; sequenceOrder: number; estimatedMinutes?: number }) {
    loading.value = true;
    try {
      const newItem = await studyPlanItemsService.create(data);
      items.value.push(newItem);
      // Reordena localmente só por segurança
      items.value.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar item do plano';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeItem(id: string) {
    try {
      await studyPlanItemsService.remove(id);
      items.value = items.value.filter(i => i.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover item do plano';
    }
  }

  return { items, loading, error, fetchItems, addItem, removeItem };
});
