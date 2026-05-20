import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/sheets',
    },
    {
      path: '/sheets',
      component: () => import('@/views/SheetsView.vue'),
    },
  ],
})

export default router
