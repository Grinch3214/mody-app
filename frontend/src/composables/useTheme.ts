import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system')

function applyTheme(t: Theme) {
  applyDark(t === 'dark' || (t === 'system' && getSystemDark()))
}

applyTheme(theme.value)

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', () => {
  if (theme.value === 'system') applyDark(getSystemDark())
})

watch(theme, (t) => {
  localStorage.setItem(STORAGE_KEY, t)
  applyTheme(t)
})

export function useTheme() {
  const isDark = ref(document.documentElement.classList.contains('dark'))

  watch(theme, (t) => {
    isDark.value = t === 'dark' || (t === 'system' && getSystemDark())
  })

  function toggle() {
    if (theme.value === 'system') {
      theme.value = getSystemDark() ? 'light' : 'dark'
    } else {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }
    isDark.value = document.documentElement.classList.contains('dark')
  }

  return { theme, isDark, toggle }
}
