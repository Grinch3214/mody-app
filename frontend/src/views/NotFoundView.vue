<template>
  <div class="not-found">
    <img src="/not-found.svg" class="not-found__image" alt="" />
    <h1 class="not-found__title">{{ t('notFound.title') }}</h1>
    <p class="not-found__message">{{ t('notFound.message') }}</p>
    <el-button type="primary" @click="router.push('/')">{{ t('notFound.back') }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  height: 100%;
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;

  &__image {
    width: 280px;
    max-width: 100%;
  }

  &__title {
    font-size: var(--font-size-xl);
    font-weight: 300;
    color: var(--el-text-color-primary);
  }

  &__message {
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-secondary);
  }
}
</style>
