<template>
  <div class="app-container">
    <nav v-if="authStore.isAuthenticated">
      <div class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/study-plans">Planejamento</router-link>
        <router-link to="/activities">Diário (Execução)</router-link>
        <router-link to="/students">Estudantes</router-link>
        <router-link to="/academic-years">Anos Letivos</router-link>
        <router-link to="/subjects">Disciplinas</router-link>
      </div>
      <button @click="logout" class="logout-btn">Sair</button>
    </nav>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
/* CSS Reset básico e estilos simplificados */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9fafb;
  color: #1f2937;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
}

nav {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.nav-links a {
  margin-right: 1rem;
  text-decoration: none;
  color: #3b82f6;
  font-weight: bold;
}

.nav-links a.router-link-active {
  color: #1d4ed8;
  text-decoration: underline;
}

.logout-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-weight: bold;
}

main {
  padding: 0 1rem;
}

input {
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
