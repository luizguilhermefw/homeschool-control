<template>
  <div class="plans-container">
    <header class="page-header">
      <div>
        <h1>Planos de Estudo</h1>
        <p class="subtitle">Organize os objetivos por ano e matéria</p>
      </div>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Cancelar' : '+ Novo Plano' }}
      </button>
    </header>

    <div v-if="showForm" class="form-card animate-fade-in">
      <h3>Criar Plano de Estudo</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Nome do Plano</label>
            <input v-model="form.name" type="text" required placeholder="Ex: Matemática 1º Semestre" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Estudante</label>
            <select v-model="form.studentId" required>
              <option disabled value="">Selecione...</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ano Letivo</label>
            <select v-model="form.academicYearId" required>
              <option disabled value="">Selecione...</option>
              <option v-for="ay in academicYears" :key="ay.id" :value="ay.id">{{ ay.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="store.loading">Criar Plano</button>
        </div>
      </form>
    </div>

    <div v-if="store.loading && !showForm" class="loading">Carregando planos...</div>

    <div v-else-if="store.studyPlans.length === 0 && !showForm" class="empty-state">
      <div class="empty-icon">🗺️</div>
      <h3>Nenhum plano criado</h3>
      <p>Os planos ajudam a estruturar o que precisa ser estudado durante o ano.</p>
      <button @click="showForm = true" class="btn-outline mt-3">Criar Meu Primeiro Plano</button>
    </div>

    <div v-else class="list-grid">
      <div 
        v-for="plan in store.studyPlans" 
        :key="plan.id" 
        class="plan-card" 
        @click="goToDetails(plan.id)"
      >
        <div class="card-content">
          <h3>{{ plan.name }}</h3>
          <div class="plan-tags">
            <span class="tag"><i class="icon">👤</i> {{ plan.student?.name }}</span>
            <span class="tag"><i class="icon">📅</i> {{ plan.academicYear?.name }}</span>
          </div>
        </div>
        <div class="card-arrow">➔</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStudyPlansStore } from '../stores/studyPlans.store';
import { api } from '../services/api';

const store = useStudyPlansStore();
const router = useRouter();

const showForm = ref(false);
const form = ref({ name: '', studentId: '', academicYearId: '' });

const students = ref<any[]>([]);
const academicYears = ref<any[]>([]);

onMounted(async () => {
  store.fetchStudyPlans();
  students.value = (await api.get('/students')).data;
  academicYears.value = (await api.get('/academic-years')).data;
});

const handleSubmit = async () => {
  const success = await store.addStudyPlan({ ...form.value });
  if (success) {
    showForm.value = false;
    form.value = { name: '', studentId: '', academicYearId: '' };
  }
};

const goToDetails = (id: string) => {
  router.push(`/study-plans/${id}`);
};
</script>

<style scoped>
.plans-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
h1 { font-size: 2rem; margin: 0; color: #1f2937; }
.subtitle { margin: 0.2rem 0 0; color: #6b7280; font-size: 1rem; }

.form-card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.form-card h3 { margin: 0 0 1rem; font-size: 1.2rem; color: #374151; }
.form-group { margin-bottom: 1rem; flex: 1; }
.form-row { display: flex; gap: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #4b5563; }
input, select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }

.btn-primary { background: #4f46e5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #4338ca; }
.btn-outline { background: transparent; color: #4f46e5; border: 2px solid #4f46e5; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #e0e7ff; }

.list-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.plan-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
.plan-card:hover { border-color: #4f46e5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1); }
.card-content h3 { margin: 0 0 0.75rem; font-size: 1.25rem; color: #1f2937; }
.plan-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { font-size: 0.75rem; background: #f3f4f6; color: #4b5563; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 500; }
.icon { font-style: normal; opacity: 0.6; }
.card-arrow { color: #9ca3af; font-size: 1.2rem; transition: transform 0.2s; }
.plan-card:hover .card-arrow { color: #4f46e5; transform: translateX(4px); }

.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px dashed #d1d5db; color: #6b7280; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.8; }
.empty-state h3 { margin: 0 0 0.5rem; color: #374151; font-size: 1.2rem; }
.empty-state p { margin: 0; }
.mt-3 { margin-top: 1.5rem; }
</style>
