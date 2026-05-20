<template>
  <div class="login-page">
    <div class="login-page__container">
      <div class="login-page__header">
        <h1 class="login-page__title">Mody</h1>
        <p class="login-page__subtitle">Управление каталогом</p>
      </div>
      <template v-if="auth.isLoggedIn">
        <p class="login-page__already">Вы уже в системе</p>
        <el-button @click="router.push('/sheets')">Перейти к каталогу</el-button>
      </template>
      <LoginForm v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'

const auth = useAuthStore()
const router = useRouter()

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) void router.push('/sheets')
  },
)
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--el-bg-color-page);

  &__container {
    width: 100%;
    max-width: 360px;
    padding: var(--spacing-xl) var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  &__title {
    font-size: var(--font-size-xl);
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--el-text-color-primary);
  }

  &__subtitle {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
    letter-spacing: 0.04em;
  }

  &__already {
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>
