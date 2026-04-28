<template>
  <div>
    <h2>Gerenciar Estudantes</h2>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; max-width: 400px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="margin-top:0">Adicionar Novo</h3>
      <form @submit.prevent="createStudent" style="display: flex; gap: 0.5rem;">
        <input v-model="newStudentName" placeholder="Nome do filho/aluno" required style="margin:0" />
        <button type="submit" :disabled="saving">Salvar</button>
      </form>
    </div>

    <h3>Alunos Cadastrados</h3>
    <p v-if="loading" style="color: #6b7280;">Carregando alunos...</p>
    <p v-else-if="errorMessage" style="color: #ef4444;">{{ errorMessage }}</p>
    <ul v-else-if="students.length > 0" style="list-style: none; padding: 0;">
      <li v-for="student in students" :key="student.id" style="background: white; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 4px solid #3b82f6;">
        {{ student.name }}
      </li>
    </ul>

    <p v-else style="color: #6b7280;">Nenhum aluno cadastrado ainda. Comece adicionando acima!</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { studentsService, type Student } from '../services/students.service';

const students = ref<Student[]>([]);
const newStudentName = ref('');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');

const fetchStudents = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    students.value = await studentsService.list();
  } catch (error) {
    console.error('Falha ao buscar alunos', error);
    errorMessage.value = 'Nao foi possivel carregar os alunos.';
  } finally {
    loading.value = false;
  }
};

const createStudent = async () => {
  const name = newStudentName.value.trim();
  if (!name) return;

  saving.value = true;

  try {
    await studentsService.create({ name });
    newStudentName.value = '';
    await fetchStudents();
  } catch (error) {
    alert('Erro ao criar aluno');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchStudents();
});
</script>
