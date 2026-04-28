<template>
  <div class="activities-container">
    <header class="page-header">
      <div>
        <h1>Diário de Execução</h1>
        <p class="subtitle">Registre o progresso e adicione anotações</p>
      </div>
      <div class="date-selector">
        <input type="date" v-model="selectedDate" @change="fetchActivities" />
      </div>
    </header>

    <div class="main-content">
      <!-- Formulário Simplificado (Esquerda) -->
      <aside class="sidebar-form">
        <div class="form-card">
          <h3>Nova Atividade Manual</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Estudante</label>
              <select v-model="form.studentId" required @change="loadStudentPlans">
                <option disabled value="">Selecione...</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div class="form-group" v-if="form.studentId">
              <label>Vincular a um Plano (Opcional)</label>
              <select v-model="form.studyPlanItemId">
                <option value="">Atividade Livre / Sem vínculo</option>
                <option v-for="item in availablePlanItems" :key="item.id" :value="item.id">
                  {{ item.title }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>O que foi feito?</label>
              <input v-model="form.title" type="text" required placeholder="Ex: Leitura do capítulo 3" />
            </div>

            <button type="submit" class="btn-primary full-width" :disabled="store.loading">
              + Adicionar ao Dia
            </button>
          </form>
        </div>
      </aside>

      <!-- Lista de To-Dos (Direita) -->
      <section class="activities-list">
        <div v-if="store.loading" class="loading">Carregando...</div>
        
        <div v-else-if="store.activities.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Lista vazia</h3>
          <p>Adicione atividades usando o formulário ao lado.</p>
        </div>

        <div v-else class="list-grid">
          <div 
            v-for="act in store.activities" 
            :key="act.id" 
            class="todo-card" 
            :class="{ 'is-done': act.status === 'DONE' }"
          >
            <div class="todo-main">
              <input 
                type="checkbox" 
                class="todo-checkbox"
                :checked="act.status === 'DONE'"
                @change="toggleStatus(act)"
              />
              <div class="todo-info">
                <h4>{{ act.title }}</h4>
                <div class="todo-meta">
                  <span v-if="act.student" class="meta-tag student">{{ act.student.name }}</span>
                  <span v-if="act.studyPlanItem" class="meta-tag plan">📍 {{ act.studyPlanItem.title }}</span>
                </div>
              </div>
            </div>

            <!-- Campos extras visíveis apenas quando feito ou se já tiver conteúdo -->
            <div class="todo-extras" v-if="act.status === 'DONE' || act.notes || act.realMinutes">
              <div class="input-group">
                <span title="Duração em minutos">⏱️</span>
                <input 
                  type="number" 
                  placeholder="Min" 
                  class="mini-input"
                  :value="act.realMinutes"
                  @change="updateMinutes(act, $event)"
                />
              </div>
              <div class="input-group notes-group">
                <span title="Anotações">📝</span>
                <input 
                  type="text" 
                  placeholder="Como foi o desempenho?" 
                  class="full-input"
                  :value="act.notes"
                  @change="updateNotes(act, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useActivitiesStore } from '../stores/activities.store';
import { api } from '../services/api';

const store = useActivitiesStore();
const today = new Date().toISOString().split('T')[0];
const selectedDate = ref(today);

const students = ref<any[]>([]);
const availablePlanItems = ref<any[]>([]);

const form = ref({
  studentId: '',
  studyPlanItemId: '',
  title: '',
});

onMounted(async () => {
  students.value = (await api.get('/students')).data;
  fetchActivities();
});

const fetchActivities = () => {
  store.fetchActivities(undefined, selectedDate.value);
};

const loadStudentPlans = async () => {
  if (!form.value.studentId) return;
  form.value.studyPlanItemId = '';
  try {
    const plans = (await api.get('/study-plans', { params: { studentId: form.value.studentId } })).data;
    if (plans.length > 0) {
      const items = (await api.get('/study-plan-items', { params: { studyPlanId: plans[0].id } })).data;
      availablePlanItems.value = items;
    } else {
      availablePlanItems.value = [];
    }
  } catch (e) {
    console.error("Erro ao buscar planos", e);
  }
};

const handleSubmit = async () => {
  const executionDate = new Date(selectedDate.value).toISOString();
  const payload: any = {
    studentId: form.value.studentId,
    title: form.value.title,
    executionDate,
    status: 'TODO'
  };
  
  if (form.value.studyPlanItemId) payload.studyPlanItemId = form.value.studyPlanItemId;

  const success = await store.addActivity(payload);
  if (success) {
    form.value.title = '';
  }
};

const toggleStatus = async (act: any) => {
  const newStatus = act.status === 'DONE' ? 'TODO' : 'DONE';
  await store.updateActivity(act.id, { status: newStatus });
};

const updateMinutes = async (act: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value ? parseInt(target.value) : null;
  if (val !== act.realMinutes) {
    await store.updateActivity(act.id, { realMinutes: val });
  }
};

const updateNotes = async (act: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value !== act.notes) {
    await store.updateActivity(act.id, { notes: target.value });
  }
};
</script>

<style scoped>
.activities-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
h1 { font-size: 2rem; margin: 0; color: #1f2937; }
.subtitle { margin: 0.2rem 0 0; color: #6b7280; font-size: 1rem; }
.date-selector input { padding: 0.75rem; border-radius: 8px; border: 1px solid #d1d5db; font-weight: 500; font-size: 1rem; }

.main-content { display: flex; gap: 2rem; align-items: flex-start; }
.sidebar-form { width: 300px; flex-shrink: 0; }
.activities-list { flex: 1; }

@media (max-width: 768px) {
  .main-content { flex-direction: column; }
  .sidebar-form { width: 100%; }
}

.form-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; }
.form-card h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #374151; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #4b5563; }
input, select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }
.full-width { width: 100%; margin-top: 0.5rem; }
.btn-primary { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #4338ca; }

.list-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.todo-card { background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; }
.todo-card:hover { border-color: #d1d5db; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.todo-main { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; }
.todo-checkbox { margin-top: 0.2rem; width: 1.25rem; height: 1.25rem; accent-color: #10b981; cursor: pointer; }

.todo-info { flex: 1; }
.todo-info h4 { margin: 0 0 0.4rem; font-size: 1.1rem; color: #1f2937; }
.todo-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.meta-tag { font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 500; }
.meta-tag.student { background: #f3f4f6; color: #4b5563; }
.meta-tag.plan { background: #e0e7ff; color: #3730a3; }

.todo-card.is-done .todo-main { background: #f9fafb; opacity: 0.8; }
.todo-card.is-done h4 { text-decoration: line-through; color: #6b7280; }

.todo-extras { display: flex; gap: 1rem; padding: 0.75rem 1rem; background: #f9fafb; border-top: 1px dashed #e5e7eb; align-items: center; }
.input-group { display: flex; align-items: center; gap: 0.5rem; }
.input-group span { filter: grayscale(1); opacity: 0.7; }
.notes-group { flex: 1; }
.mini-input { width: 70px; padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 4px; background: white; }
.full-input { flex: 1; padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 0.9rem; }
.mini-input:focus, .full-input:focus { border-color: #4f46e5; outline: none; }

.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px dashed #d1d5db; color: #6b7280; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-state h3 { margin: 0 0 0.5rem; color: #374151; }
.empty-state p { margin: 0; }
</style>
