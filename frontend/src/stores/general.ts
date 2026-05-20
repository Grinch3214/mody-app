import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Product, FilterQuery } from '@/types/product'

const API_URL = import.meta.env.VITE_API_URL

export const useGeneralStore = defineStore('general', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(query: FilterQuery = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (query.segment) params.set('segment', query.segment)
      if (query.brand) params.set('brand', query.brand)
      if (query.name) params.set('name', query.name)

      const url = `${API_URL}/sheets${params.size ? `?${params}` : ''}`
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(url, { headers })
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
