import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Product, FilterQuery } from '@/types/product'

const API_URL = import.meta.env.VITE_API_URL

export const useGeneralStore = defineStore('general', () => {
  const products = ref<Product[]>([])
  const allSegments = ref<string[]>([])
  const allBrands = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(query: FilterQuery = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (query.segments?.length) params.set('segment', query.segments.join(','))
      if (query.brand) params.set('brand', query.brand)
      if (query.name) params.set('name', query.name)

      const url = `${API_URL}/sheets${params.size ? `?${params}` : ''}`
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      products.value = (await res.json()) as Product[]

      if (!query.segments?.length) {
        allSegments.value = [...new Set(products.value.map((p) => p.segment))].sort()
      }
      if (!query.brand) {
        allBrands.value = [...new Set(products.value.map((p) => p.brand))].sort()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function fetchOptions() {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_URL}/sheets`, { headers })
      if (!res.ok) return
      const all = (await res.json()) as Product[]
      allSegments.value = [...new Set(all.map((p) => p.segment))].sort()
      allBrands.value = [...new Set(all.map((p) => p.brand))].sort()
    } catch { /* ignore */ }
  }

  return { products, allSegments, allBrands, loading, error, fetchProducts, fetchOptions }
})
