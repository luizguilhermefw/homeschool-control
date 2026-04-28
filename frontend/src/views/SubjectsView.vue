<template>
  <div class="subjects-container">
    <header class="page-header">
      <h1>Disciplinas</h1>
      <button @click="showForm = true" class="btn-primary" v-if="!showForm">+ Nova Disciplina</button>
    </header>

    <div v-if="showForm" class="form-card">
      <h2>Adicionar Disciplina</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Nome da Disciplina</label>
          <input v-model="form.name" type="text" required placeholder="ex: Matemática" />
        </div>
        <div class="form-group">
          <label>Cor de Destaque (Hexadecimal)</label>
          <input v-model="form.color" type="color" class="color-picker" />
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
      <div v-for="subject in store.subjects" :key="subject.id" class="card" :style="{ borderLeft: `6px solid ${subject.color || '#4f46e5'}` }">
        <div class="card-content">
          <h3>{{ subject.name }}</h3>
        </div>
        <button @click="handleRemove(subject.id)" class="btn-danger-icon" title="Remover">🗑️</button>
      </div>
      
      <div v-if="store.subjects.length === 0 && !showForm" class="empty-state">
        Nenhuma disciplina cadastrada.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSubjectsStore } from '../stores/subjects.store';

const store = useSubjectsStore();
const showForm = ref(false);

const form = ref({
  name: '',
  color: '#4f46e5'
});

onMounted(() => {
  store.fetchSubjects();
});

const handleSubmit = async () => {
  const success = await store.addSubject({
    name: form.value.name,
    color: form.value.color
  });
  
  if (success) {
    showForm.value = false;
    form.value = { name: '', color: '#4f46e5' };
  }
};

const handleRemove = async (id: string) => {
  if (confirm('Tem certeza que deseja remover esta disciplina?')) {
    await store.removeSubject(id);
  }
};
</script>

<style scoped>
.subjects-container {
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

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
}

.color-picker {
  height: 40px;
  width: 100px;
  padding: 0;
  border: none;
  cursor: pointer;
  background: none;
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
