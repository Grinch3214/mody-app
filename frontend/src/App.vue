<template>
  <AppHeader />
  <main class="main">
    <RouterView />
  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<style lang="scss" scoped>
.main {
  height: calc(100vh - var(--header-height, 64px) - var(--footer-height, 72px));
  overflow: hidden;
}
</style>
