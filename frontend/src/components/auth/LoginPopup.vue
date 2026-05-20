<template>
  <div class="popup-backdrop" @click.self="emit('close')">
    <div class="popup">
      <button class="popup__close" @click="emit('close')">✕</button>
      <h2 class="popup__title">Вход</h2>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGeneralStore } from '@/stores/general'
import LoginForm from './LoginForm.vue'

const auth = useAuthStore()
const general = useGeneralStore()
const emit = defineEmits<{ close: [] }>()

watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    void general.fetchProducts()
    emit('close')
  }
})
</script>

<style lang="scss" scoped>
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 30%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.popup {
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: var(--spacing-2xl) var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--border-radius);

  &__close {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    transition: color var(--transition-base);

    &:hover {
      color: var(--color-text-primary);
    }
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 300;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xl);
  }
}
</style>
