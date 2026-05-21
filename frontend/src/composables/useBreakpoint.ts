import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 1024

export function useBreakpoint() {
  const isMobile = ref(
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT,
  )

  function onResize() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { isMobile }
}
