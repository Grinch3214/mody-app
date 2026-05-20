<template>
  <header class="header">
    <span class="header__logo">Mody</span>
    <div class="header__actions">
      <el-switch
        v-model="isDark"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        inline-prompt
        @change="toggle"
      />
      <button v-if="!auth.isLoggedIn" class="header__btn" @click="emit('open-login')">
        Войти
      </button>
      <button v-else class="header__btn header__btn--logout" @click="auth.logout()">
        Выйти
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const emit = defineEmits<{ 'open-login': [] }>()
const { isDark, toggle } = useTheme()
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  background: var(--el-bg-color);

  &__logo {
    font-size: var(--el-font-size-extra-large);
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--el-text-color-primary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  &__btn {
    font-size: var(--el-font-size-small);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--el-color-primary);
    transition: color var(--el-transition-duration-fast);

    &:hover {
      color: var(--el-color-primary-dark-2);
    }

    &--logout {
      color: var(--el-text-color-secondary);

      &:hover {
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
