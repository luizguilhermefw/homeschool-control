<template>
  <div class="plan-details-container">
    <header class="page-header" v-if="planStore.currentPlan">
      <div class="header-main">
        <button @click="router.push('/study-plans')" class="btn-back">← Voltar aos Planos</button>
        <h1>{{ planStore.currentPlan.name }}</h1>
        <div class="plan-tags">
          <span class="tag"><i class="icon">👤</i> {{ planStore.currentPlan.student?.name }}</span>
          <span class="tag"><i class="icon">📅</i> {{ planStore.currentPlan.academicYear?.name }}</span>
        </div>
      </div>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Cancelar' : '+ Adicionar Item' }}
      </button>
    </header>

    <div v-if="showForm" class="form-card animate-fade-in">
      <h3>Novo Passo na Trilha</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Disciplina</label>
            <select v-model="form.subjectId" required>
              <option disabled value="">Selecione...</option>
              <option v-for="sub in subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
            </select>
          </div>
          <div class="form-group flex-2">
            <label>Título (O que será estudado?)</label>
            <input v-model="form.title" type="text" required placeholder="Ex: Frações Equivalentes" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ordem (Sequência)</label>
            <input v-model.number="form.sequenceOrder" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Tempo Estimado (min)</label>
            <input v-model.number="form.estimatedMinutes" type="number" min="1" placeholder="Ex: 45" />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="itemsStore.loading">Salvar Item</button>
        </div>
      </form>
    </div>

    <div v-if="itemsStore.loading" class="loading">Carregando trilha...</div>

    <div v-else-if="itemsStore.items.length === 0 && !showForm" class="empty-state">
      <div class="empty-icon">🛤️</div>
      <h3>O plano está vazio</h3>
      <p>Adicione os tópicos ou capítulos que deverão ser estudados.</p>
      <button @click="showForm = true" class="btn-outline mt-3">Adicionar Primeiro Tópico</button>
    </div>

    <div v-else class="timeline-list">
      <div 
        v-for="item in itemsStore.items" 
        :key="item.id" 
        class="timeline-item"
      >
        <div class="timeline-marker" :style="{ backgroundColor: item.subject?.color || '#9ca3af' }">
          {{ item.sequenceOrder }}
        </div>
        <div class="timeline-content">
          <div class="item-header">
            <span class="subject-badge" :style="{ color: item.subject?.color || '#6b7280', borderColor: item.subject?.color || '#e5e7eb' }">
              {{ item.subject?.name }}
            </span>
            <button @click="handleRemove(item.id)" class="btn-icon danger" title="Remover item">🗑️</button>
          </div>
          <h3 class="item-title">{{ item.title }}</h3>
          <p class="item-meta" v-if="item.estimatedMinutes">⏱️ ~{{ item.estimatedMinutes }} min</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStudyPlansStore } from '../stores/studyPlans.store';
import { useStudyPlanItemsStore } from '../stores/studyPlanItems.store';
import { api } from '../services/api';

const route = useRoute();
const router = useRouter();
const planStore = useStudyPlansStore();
const itemsStore = useStudyPlanItemsStore();

const planId = route.params.id as string;
const showForm = ref(false);
const subjects = ref<any[]>([]);

const form = ref({ subjectId: '', title: '', sequenceOrder: 1, estimatedMinutes: null as number | null });

onMounted(async () => {
  await planStore.fetchStudyPlan(planId);
  await itemsStore.fetchItems(planId);
  subjects.value = (await api.get('/subjects')).data;
  
  if (itemsStore.items.length > 0) {
    const maxOrder = Math.max(...itemsStore.items.map(i => i.sequenceOrder));
    form.value.sequenceOrder = maxOrder + 1;
  }
});

const handleSubmit = async () => {
  const payload: any = {
    studyPlanId: planId,
    subjectId: form.value.subjectId,
    title: form.value.title,
    sequenceOrder: form.value.sequenceOrder
  };
  
  if (form.value.estimatedMinutes) payload.estimatedMinutes = form.value.estimatedMinutes;

  const success = await itemsStore.addItem(payload);
  
  if (success) {
    showForm.value = false;
    form.value.title = '';
    form.value.estimatedMinutes = null;
    form.value.sequenceOrder++;
  }
};

const handleRemove = async (id: string) => {
  if (confirm('Remover este tópico da trilha?')) {
    await itemsStore.removeItem(id);
  }
};
</script>

<style scoped>
.plan-details-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
.btn-back { background: none; border: none; color: #4b5563; cursor: pointer; font-weight: 500; margin-bottom: 0.5rem; padding: 0; font-size: 0.9rem; }
.btn-back:hover { color: #1f2937; text-decoration: underline; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.header-main h1 { font-size: 2rem; margin: 0.5rem 0; color: #1f2937; }
.plan-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { font-size: 0.8rem; background: #f3f4f6; color: #4b5563; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 500; }

.form-card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.form-card h3 { margin: 0 0 1rem; font-size: 1.2rem; color: #374151; }
.form-group { margin-bottom: 1rem; flex: 1; }
.flex-2 { flex: 2; }
.form-row { display: flex; gap: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #4b5563; }
input, select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }

.btn-primary { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #4338ca; }
.btn-outline { background: transparent; color: #4f46e5; border: 2px solid #4f46e5; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #e0e7ff; }

.timeline-list { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 1rem; }
.timeline-list::before { content: ''; position: absolute; left: 2.25rem; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }

.timeline-item { display: flex; gap: 1.5rem; position: relative; padding-bottom: 1.5rem; }
.timeline-marker { width: 2.5rem; height: 2.5rem; border-radius: 50%; color: white; font-weight: bold; display: flex; align-items: center; justify-content: center; z-index: 1; border: 4px solid #f9fafb; flex-shrink: 0; font-size: 1.1rem; }
.timeline-content { flex: 1; background: white; padding: 1.25rem; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.subject-badge { font-size: 0.75rem; font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 12px; border: 1px solid; background: #fff; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.4; transition: opacity 0.2s; padding: 0; }
.btn-icon:hover { opacity: 1; }
.btn-icon.danger:hover { filter: grayscale(0); }

.item-title { margin: 0 0 0.5rem 0; font-size: 1.15rem; color: #1f2937; }
.item-meta { margin: 0; font-size: 0.85rem; color: #6b7280; font-weight: 500; }

.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px dashed #d1d5db; color: #6b7280; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.8; }
.empty-state h3 { margin: 0 0 0.5rem; color: #374151; font-size: 1.2rem; }
.empty-state p { margin: 0; }
.mt-3 { margin-top: 1.5rem; }
</style>
