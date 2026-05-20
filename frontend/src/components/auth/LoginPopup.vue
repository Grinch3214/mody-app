<template>
  <el-dialog
    :model-value="modelValue"
    title="Вход"
    width="400px"
    align-center
    :close-on-click-modal="false"
    @close="emit('update:modelValue', false)"
  >
    <LoginForm />
  </el-dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGeneralStore } from '@/stores/general'
import LoginForm from './LoginForm.vue'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const auth = useAuthStore()
const general = useGeneralStore()

watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    void general.fetchProducts()
    emit('update:modelValue', false)
  }
})
</script>
