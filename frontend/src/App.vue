<template>
  <AppHeader @open-login="showLogin = true" />
  <main class="main">
    <RouterView />
  </main>
  <LoginPopup v-if="showLogin" @close="showLogin = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoginPopup from '@/components/auth/LoginPopup.vue'

const showLogin = ref(false)
</script>

<style lang="scss" scoped>
.main {
  padding: var(--spacing-xl);
}
</style>
