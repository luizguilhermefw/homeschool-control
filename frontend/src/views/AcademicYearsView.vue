<template>
  <div class="academic-years-container">
    <header class="page-header">
      <h1>Anos Letivos</h1>
      <button @click="showForm = true" class="btn-primary" v-if="!showForm">+ Novo Ano Letivo</button>
    </header>

    <div v-if="showForm" class="form-card">
      <h2>Adicionar Ano Letivo</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Nome (ex: Ano Letivo 2024)</label>
          <input v-model="form.name" type="text" required placeholder="Digite o nome" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data de Início</label>
            <input v-model="form.startDate" type="date" required />
          </div>
          <div class="form-group">
            <label>Data de Término</label>
            <input v-model="form.endDate" type="date" required />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="showForm = false" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="store.loading">
            {{ store.loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
      <p v-if="store.error" class="error-msg">{{ store.error }}</p>
    </div>

    <div v-if="store.loading && !showForm" class="loading">Carregando...</div>

    <div v-else class="list-grid">
      <div v-for="year in store.academicYears" :key="year.id" class="card">
        <div class="card-content">
          <h3>{{ year.name }}</h3>
          <p class="dates">
            {{ formatDate(year.startDate) }} até {{ formatDate(year.endDate) }}
          </p>
        </div>
        <button @click="handleRemove(year.id)" class="btn-danger-icon" title="Remover">🗑️</button>
      </div>
      
      <div v-if="store.academicYears.length === 0 && !showForm" class="empty-state">
        Nenhum ano letivo cadastrado.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAcademicYearsStore } from '../stores/academicYears.store';

const store = useAcademicYearsStore();
const showForm = ref(false);

const form = ref({
  name: '',
  startDate: '',
  endDate: ''
});

onMounted(() => {
  store.fetchAcademicYears();
});

const handleSubmit = async () => {
  // Converte data local para ISO string (00:00:00Z) de forma simplificada para o teste
  const start = new Date(form.value.startDate).toISOString();
  const end = new Date(form.value.endDate).toISOString();
  
  const success = await store.addAcademicYear({
    name: form.value.name,
    startDate: start,
    endDate: end
  });
  
  if (success) {
    showForm.value = false;
    form.value = { name: '', startDate: '', endDate: '' };
  }
};

const handleRemove = async (id: string) => {
  if (confirm('Tem certeza que deseja remover este ano letivo?')) {
    await store.removeAcademicYear(id);
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR');
};
</script>

<style scoped>
.academic-years-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  color: var(--text-color);
}

.form-card {
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-danger-icon:hover {
  opacity: 1;
}

.list-grid {
  display: grid;
  gap: 1rem;
}

.card {
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card h3 {
  margin: 0 0 0.5rem 0;
}

.dates {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.error-msg {
  color: #ef4444;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: var(--surface-color);
  border-radius: 12px;
}
</style>
