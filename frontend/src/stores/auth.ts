import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import type { LoginRequest, LoginResponse } from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      if (!res.ok) throw new Error('Неверный email или пароль')
      const data = (await res.json()) as LoginResponse
      token.value = data.access_token
      localStorage.setItem('token', data.access_token)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, isLoggedIn, loading, error, login, logout }
})
