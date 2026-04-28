<template>
  <div class="dashboard-container">
    <header class="dash-header">
      <div>
        <h2>Olá, {{ authStore.user?.name }}! 👋</h2>
        <p v-if="authStore.tenant" class="subtitle">Família {{ authStore.tenant.name }}</p>
      </div>
      <div class="date-badge">📅 {{ todayFormatted }}</div>
    </header>

    <!-- Feedback de Sucesso -->
    <transition name="fade">
      <div v-if="successMessage" class="toast-success">
        {{ successMessage }}
      </div>
    </transition>

    <!-- Missão do Dia -->
    <div class="mission-banner" v-if="store.activities.length === 0 && !showQuickAdd">
      <h4>🎯 Sua missão de hoje:</h4>
      <p>Começar com a primeira atividade</p>
    </div>

    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-header">
          <h3>Progresso do Dia</h3>
          <span class="progress-text" v-if="store.activities.length > 0">
            <strong>{{ completedActivities.length }}</strong> concluídas de <strong>{{ store.activities.length }}</strong> planejadas
          </span>
          <span class="progress-text" v-else>
            Você ainda não começou hoje
          </span>
        </div>
        <div class="progress-bar" v-if="store.activities.length > 0">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="activities-section">
      <div class="section-header">
        <h3>Atividades de Hoje</h3>
        <button v-if="store.activities.length > 0 && !showQuickAdd" @click="openQuickAdd" class="btn-primary-sm btn-hover-anim">
          + Criar atividade de hoje
        </button>
      </div>

      <!-- Quick Add Inline Form -->
      <transition name="slide-fade">
        <div v-if="showQuickAdd" class="quick-add-card">
          <h4>Nova Atividade Rápida</h4>
          <form @submit.prevent="handleQuickAdd" class="quick-add-form">
            <select v-model="quickForm.studentId" required class="qa-input">
              <option disabled value="">Selecione o Estudante...</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <input 
              ref="titleInputRef"
              v-model="quickForm.title" 
              type="text" 
              required 
              placeholder="O que vamos fazer? Ex: Leitura" 
              class="qa-input qa-flex" 
            />
            <div class="qa-actions">
              <button type="button" @click="showQuickAdd = false" class="btn-text">Cancelar</button>
              <button type="submit" class="btn-primary btn-click-anim" :disabled="store.isSaving">Salvar</button>
            </div>
          </form>
        </div>
      </transition>

      <div v-if="store.isFetching" class="loading">Buscando atividades do dia...</div>
      
      <!-- Empty State -->
      <div v-else-if="store.activities.length === 0 && !showQuickAdd" class="empty-state">
        <div class="empty-icon">🚀</div>
        <h3>Hoje ainda não há atividades planejadas. Que tal começar o dia criando a primeira?</h3>
        
        <button @click="openQuickAdd" class="btn-primary btn-lg mt-3 pulse-anim btn-click-anim">
          🚀 Começar meu dia
        </button>
        <p class="empty-hint">Você pode registrar estudos livres ou atividades do seu plano</p>
      </div>

      <!-- Lista Simples -->
      <transition-group name="list" tag="div" class="todo-list" v-else>
        <label 
          v-for="act in store.activities" 
          :key="act.id" 
          class="todo-item" 
          :class="{ 'is-done': act.status === 'DONE', 'is-saving': store.savingItems?.[act.id] }"
        >
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              :checked="act.status === 'DONE'" 
              @change="toggleStatus(act)"
              class="todo-checkbox"
              :disabled="store.savingItems?.[act.id]"
            />
            <span class="checkmark"></span>
          </div>
          <div class="todo-content">
            <span class="todo-title">{{ act.title }}</span>
            <span v-if="act.student" class="todo-student">👤 {{ act.student.name }}</span>
          </div>
          <div v-if="store.savingItems?.[act.id]" class="saving-indicator">
            Salvando...
          </div>
        </label>
      </transition-group>

      <!-- Placeholder Sugestões Futuras -->
      <div v-if="store.activities.length === 0 && !showQuickAdd" class="suggestions-placeholder">
        <h4>💡 Sugestões para hoje</h4>
        <div class="suggestion-card-empty">
          <p>Em breve o sistema sugerirá o próximo passo do seu plano de estudos automaticamente.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useActivitiesStore } from '../stores/activities.store';
import { api } from '../services/api';

const authStore = useAuthStore();
const store = useActivitiesStore();

const today = new Date();
const todayIso = today.toISOString().split('T')[0];
const todayFormatted = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

const showQuickAdd = ref(false);
const students = ref<any[]>([]);
const successMessage = ref('');

const titleInputRef = ref<HTMLInputElement | null>(null);

const quickForm = ref({
  studentId: '',
  title: ''
});

onMounted(async () => {
  store.fetchActivities(undefined, todayIso);
  try {
    students.value = (await api.get('/students')).data;
    if (students.value.length === 1) {
      quickForm.value.studentId = students.value[0].id;
    }
  } catch (e) {
    console.error('Erro ao carregar estudantes no dashboard', e);
  }
});

const completedActivities = computed(() => {
  return store.activities.filter(a => a.status === 'DONE');
});

const progressPercentage = computed(() => {
  if (store.activities.length === 0) return 0;
  return Math.round((completedActivities.value.length / store.activities.length) * 100);
});

const showToast = (msg: string) => {
  successMessage.value = msg;
  setTimeout(() => { successMessage.value = ''; }, 3000);
};

const openQuickAdd = () => {
  showQuickAdd.value = true;
  nextTick(() => {
    titleInputRef.value?.focus();
  });
};

const handleQuickAdd = async () => {
  const isFirst = store.activities.length === 0;
  
  const payload = {
    studentId: quickForm.value.studentId,
    title: quickForm.value.title,
    executionDate: new Date().toISOString(), 
    status: 'TODO'
  };

  const success = await store.addActivity(payload);
  if (success) {
    showQuickAdd.value = false;
    quickForm.value.title = '';
    
    if (isFirst) {
      showToast('🔥 Boa! Você começou o dia!');
    } else {
      showToast('✓ Atividade adicionada!');
    }
  }
};

const toggleStatus = async (act: any) => {
  const newStatus = act.status === 'DONE' ? 'TODO' : 'DONE';
  await store.updateActivity(act.id, { status: newStatus });
};
</script>

<style scoped>
.dashboard-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
.dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.dash-header h2 { margin: 0; font-size: 1.8rem; color: #1f2937; }
.subtitle { margin: 0.2rem 0 0; color: #6b7280; font-size: 1rem; }
.date-badge { background: #e0e7ff; color: #3730a3; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; text-transform: capitalize; }

/* Missão do Dia */
.mission-banner { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
.mission-banner h4 { margin: 0 0 0.25rem 0; font-size: 1.1rem; color: #e0e7ff; }
.mission-banner p { margin: 0; font-size: 1.2rem; font-weight: bold; }

/* Toast */
.toast-success { background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: bold; text-align: center; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }

.summary-section { margin-bottom: 2rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; }
.summary-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
.summary-header h3 { margin: 0; font-size: 1.2rem; color: #374151; }
.progress-text { font-size: 0.95rem; color: #4b5563; }
.progress-text strong { color: #4f46e5; }
.progress-bar { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #818cf8); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

.activities-section { margin-top: 1rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h3 { margin: 0; font-size: 1.4rem; color: #1f2937; }

/* Botões */
.btn-primary { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }
.btn-primary:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3); }
.btn-primary:active { transform: translateY(0); box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }

.btn-primary-sm { background: #e0e7ff; color: #4f46e5; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.btn-primary-sm:hover { background: #c7d2fe; transform: translateY(-1px); }

.btn-lg { padding: 1rem 2rem; font-size: 1.15rem; border-radius: 10px; }
.btn-text { background: transparent; color: #6b7280; border: none; font-weight: 500; cursor: pointer; padding: 0.75rem; transition: color 0.2s; }
.btn-text:hover { color: #374151; text-decoration: underline; }

.btn-click-anim:active { transform: scale(0.97); }

/* Quick Add Form */
.quick-add-card { background: #f9fafb; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid #e5e7eb; border-left: 4px solid #4f46e5; }
.quick-add-card h4 { margin: 0 0 1rem; color: #374151; }
.quick-add-form { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.qa-input { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; }
.qa-input:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); }
.qa-flex { flex: 1; min-width: 200px; }
.qa-actions { display: flex; gap: 0.5rem; }

/* Todo List */
.todo-list { display: flex; flex-direction: column; gap: 0.75rem; }
.todo-item { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; background: white; border-radius: 10px; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.todo-item:hover { border-color: #c7d2fe; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.05); transform: translateY(-1px); }
.todo-item.is-done { background: #f9fafb; border-color: #d1fae5; }
.todo-item.is-done .todo-title { text-decoration: line-through; color: #9ca3af; }
.todo-item.is-saving { opacity: 0.5; pointer-events: none; }

/* Custom Checkbox */
.checkbox-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
.todo-checkbox { width: 1.5rem; height: 1.5rem; opacity: 0; position: absolute; cursor: pointer; z-index: 2; margin: 0; }
.checkmark { width: 1.5rem; height: 1.5rem; background-color: white; border: 2px solid #d1d5db; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.todo-item:hover .checkmark { border-color: #4f46e5; }
.todo-checkbox:checked ~ .checkmark { background-color: #10b981; border-color: #10b981; }
.todo-checkbox:checked ~ .checkmark::after { content: ''; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }

.todo-content { display: flex; flex-direction: column; flex: 1; gap: 0.25rem; }
.todo-title { font-size: 1.1rem; font-weight: 500; color: #1f2937; transition: color 0.2s; }
.todo-student { font-size: 0.8rem; color: #6b7280; background: #f3f4f6; padding: 0.15rem 0.5rem; border-radius: 12px; display: inline-block; width: fit-content; }

.saving-indicator { font-size: 0.8rem; color: #4f46e5; font-weight: 500; font-style: italic; }

/* Empty State */
.empty-state { text-align: center; padding: 3rem 2rem; background: white; border-radius: 12px; border: 2px dashed #e5e7eb; transition: border-color 0.3s; margin-bottom: 2rem; }
.empty-state:hover { border-color: #c7d2fe; }
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
.empty-state h3 { margin: 0 auto 0.5rem; color: #1f2937; font-size: 1.3rem; max-width: 400px; line-height: 1.4; }
.empty-hint { color: #6b7280; font-size: 0.95rem; margin-top: 1rem; }

/* Sugestões Futuras */
.suggestions-placeholder { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
.suggestions-placeholder h4 { margin: 0 0 1rem; color: #4b5563; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
.suggestion-card-empty { background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 10px; padding: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.95rem; }

/* Animações */
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateX(-30px); }
.list-leave-to { opacity: 0; transform: translateX(30px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

.pulse-anim { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}
</style>
