<template>
  <div style="max-width: 400px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2>Criar Conta</h2>
    <form @submit.prevent="handleSignup">
      <div>
        <label>Nome da Familia (Tenant): </label>
        <input v-model="familyName" placeholder="Ex: Familia Silva" required />
      </div>
      <div>
        <label>Seu Nome: </label>
        <input v-model="userName" placeholder="Responsavel" required />
      </div>
      <div>
        <label>E-mail: </label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Senha: </label>
        <input v-model="password" type="password" required minlength="6" />
      </div>
      <button type="submit" :disabled="authStore.loading" style="width: 100%; margin-top: 1rem;">
        {{ authStore.loading ? 'Criando conta...' : 'Registrar e Entrar' }}
      </button>
    </form>
    <p style="text-align: center; margin-top: 1rem;">
      Ja possui conta? <router-link to="/login">Faca Login</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const familyName = ref('');
const userName = ref('');
const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleSignup = async () => {
  try {
    await authStore.signup({
      familyName: familyName.value,
      userName: userName.value,
      email: email.value,
      password: password.value,
    });
    router.push('/dashboard');
  } catch (error) {
    alert('Erro ao cadastrar. O e-mail ja pode estar em uso.');
  }
};
</script>
