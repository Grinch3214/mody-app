<template>
  <div class="sheets">
    <div class="sheets__header">
      <h1>Продукты</h1>
      <button @click="auth.logout()">Выйти</button>
    </div>
    <div class="sheets__filters">
      <input v-model="filters.segment" placeholder="Сегмент" @input="load" />
      <input v-model="filters.brand" placeholder="Бренд" @input="load" />
      <input v-model="filters.name" placeholder="Название" @input="load" />
    </div>
    <p v-if="store.loading">Загрузка...</p>
    <p v-if="store.error" class="error">{{ store.error }}</p>
    <div v-for="p in store.products" :key="p.name" class="product">
      <b>{{ p.name }}</b> — {{ p.brand }} / {{ p.segment }} / {{ p.volume }}мл
      <span v-if="p.stock"> | остаток: {{ p.stock.bottles }} шт</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useGeneralStore } from '@/stores/general'
import { useAuthStore } from '@/stores/auth'
import type { FilterQuery } from '@/types/product'

const store = useGeneralStore()
const auth = useAuthStore()

const filters = reactive<FilterQuery>({ segment: '', brand: '', name: '' })

function load() {
  void store.fetchProducts({
    segment: filters.segment || undefined,
    brand: filters.brand || undefined,
    name: filters.name || undefined,
  })
}

onMounted(load)
</script>
