<template>
  <header class="header">
    <span class="header__logo">Mody</span>
    <button v-if="!auth.isLoggedIn" class="header__btn" @click="emit('open-login')">
      Войти
    </button>
    <button v-else class="header__btn header__btn--logout" @click="auth.logout()">
      Выйти
    </button>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const emit = defineEmits<{ 'open-login': [] }>()
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);

  &__logo {
    font-size: var(--font-size-lg);
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-primary);
  }

  &__btn {
    font-size: var(--font-size-sm);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-accent);
    transition: color var(--transition-base);

    &:hover {
      color: var(--color-accent-hover);
    }

    &--logout {
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text-primary);
      }
    }
  }
}
</style>
