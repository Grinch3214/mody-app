<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div class="login-form__field">
      <label class="login-form__label" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        class="login-form__input"
        type="text"
        placeholder="admin@example.com"
        autocomplete="email"
        required
      />
    </div>
    <div class="login-form__field">
      <label class="login-form__label" for="password">Пароль</label>
      <input
        id="password"
        v-model="password"
        class="login-form__input"
        type="password"
        placeholder="••••••••"
        autocomplete="current-password"
        required
      />
    </div>
    <p v-if="auth.error" class="login-form__error">{{ auth.error }}</p>
    <button class="login-form__submit" type="submit" :disabled="auth.loading">
      {{ auth.loading ? 'Входим...' : 'Войти' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

async function handleSubmit() {
  await auth.login({ email: email.value, password: password.value })
}
</script>

<style lang="scss" scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  &__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__input {
    width: 100%;
    padding: var(--spacing-md) 0;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--color-border);
    transition: border-color var(--transition-base);

    &::placeholder {
      color: var(--color-border);
    }

    &:focus {
      border-bottom-color: var(--color-accent);
    }
  }

  &__error {
    font-size: var(--font-size-sm);
    color: var(--color-error);
  }

  &__submit {
    width: 100%;
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-surface);
    background: var(--color-accent);
    border-radius: var(--border-radius-sm);
    transition: background var(--transition-base);
    margin-top: var(--spacing-sm);

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
