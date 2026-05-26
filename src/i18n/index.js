import { createI18n } from 'vue-i18n'
import fr from './fr.json'
import en from './en.json'

const STORAGE_KEY = 'sealmark_locale'

function detectLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    /* localStorage indisponible */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'fr'
  return nav.toLowerCase().startsWith('en') ? 'en' : 'fr'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'fr',
  messages: { fr, en }
})

export function setLocale(next) {
  if (next !== 'fr' && next !== 'en') return
  i18n.global.locale.value = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* no-op */
  }
}

export default i18n
