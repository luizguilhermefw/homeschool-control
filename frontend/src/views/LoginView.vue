<template>
  <div style="max-width: 400px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2>Login Registudy</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>E-mail: </label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Senha: </label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="authStore.loading" style="width: 100%; margin-top: 1rem;">
        {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
    <p style="text-align: center; margin-top: 1rem;">
      Nao tem conta? <router-link to="/signup">Cadastre-se</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push((route.query.redirect as string) || '/dashboard');
  } catch (error) {
    alert('Credenciais invalidas.');
  }
};
</script>
