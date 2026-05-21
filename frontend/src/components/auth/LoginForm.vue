<template>
  <el-form class="login-form" @submit.prevent="handleSubmit">
    <el-form-item>
      <el-input v-model="email" :placeholder="t('auth.email')" autocomplete="email" size="large" />
    </el-form-item>
    <el-form-item>
      <el-input
        v-model="password"
        type="password"
        :placeholder="t('auth.password')"
        show-password
        autocomplete="current-password"
        size="large"
      />
    </el-form-item>
    <el-button
      type="primary"
      native-type="submit"
      size="large"
      :loading="auth.loading"
      style="width: 100%"
    >
      {{ t('auth.submit') }}
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const { t } = useI18n()
const email = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await auth.login({ email: email.value, password: password.value })
  if (!success) {
    ElNotification({
      title: t('auth.errorTitle'),
      message: t('auth.errorMessage'),
      type: 'error',
      duration: 4000,
    })
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
