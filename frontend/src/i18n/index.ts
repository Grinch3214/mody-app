import { createI18n } from 'vue-i18n'
import uk from './locales/uk'
import ru from './locales/ru'
import en from './locales/en'

export type Locale = 'uk' | 'ru' | 'en'

const STORAGE_KEY = 'locale'

const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
const validLocales: Locale[] = ['uk', 'ru', 'en']
const initialLocale: Locale = saved && validLocales.includes(saved) ? saved : 'uk'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'uk',
  messages: { uk, ru, en },
})

export function setLocale(locale: Locale) {
  ;(i18n.global.locale as { value: Locale }).value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}
