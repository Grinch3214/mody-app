<template>
  <AppHeader />
  <main class="main">
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style lang="scss" scoped>
.main {
  height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}
</style>
