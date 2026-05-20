<template>
  <header class="header">
    <span class="header__logo">Mody</span>
    <div class="header__actions">
      <el-select v-model="currentLocale" size="small" style="width: 72px" @change="onLocaleChange">
        <el-option v-for="l in locales" :key="l.value" :label="l.label" :value="l.value" />
      </el-select>
      <el-switch
        v-model="isDark"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        inline-prompt
        @change="toggle"
      />
      <button v-if="auth.isLoggedIn" class="header__btn header__btn--logout" @click="auth.logout()">
        {{ t('auth.logout') }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { setLocale, type Locale } from '@/i18n'

const auth = useAuthStore()
const { isDark, toggle } = useTheme()
const { t, locale } = useI18n()

const locales = [
  { value: 'uk', label: 'УКР' },
  { value: 'ru', label: 'РУС' },
  { value: 'en', label: 'ENG' },
]

const currentLocale = ref<Locale>(locale.value as Locale)

function onLocaleChange(val: Locale) {
  setLocale(val)
}
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
