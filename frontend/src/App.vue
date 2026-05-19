<template>
  <div>
    <button @click="store.fetchProducts()">Загрузить</button>
    <p v-if="store.loading">Загрузка...</p>
    <p v-if="store.error">Ошибка: {{ store.error }}</p>
    <div v-for="p in store.products" :key="p.name">
      <b>{{ p.name }}</b> — {{ p.brand }} / {{ p.segment }} / {{ p.volume }}мл
      <span v-if="p.stock"> | остаток: {{ p.stock.bottles }} шт</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeneralStore } from './stores/general'

const store = useGeneralStore()
</script>
