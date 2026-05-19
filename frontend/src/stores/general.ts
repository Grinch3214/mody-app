import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Product {
  segment: string
  brand: string
  name: string
  volume: number
  prices: {
    full: number | null
    500: number | null
    250: number | null
    100: number | null
    50: number | null
  }
  stock: {
    bottles: number
    openMl: number
    totalMl: number
  } | null
}

export const useGeneralStore = defineStore('general', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('http://localhost:3000/sheets')
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      products.value = await res.json() as Product[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
})
