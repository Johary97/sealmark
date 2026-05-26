import { ref, computed, provide, inject, watch, readonly } from 'vue'
import { DEFAULT_THEME_SLUG, THEME_REGISTRY, getTheme, THEME_LIST } from './registry.js'

const STORAGE_KEY = 'sealmark.theme-slug'
const MODE_KEY = 'sealmark.theme-mode'
const ThemeKey = Symbol('SealmarkTheme')

function readPersistedSlug() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && THEME_REGISTRY[v]) return v
  } catch {
    /* localStorage indisponible */
  }
  return DEFAULT_THEME_SLUG
}

function readPersistedMode(defaultMode) {
  try {
    const v = localStorage.getItem(MODE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* no-op */
  }
  return defaultMode || 'light'
}

/**
 * Crée le store thématique et le `provide` au niveau racine.
 * À appeler dans le `setup()` du composant racine (App.vue).
 */
export function provideTheme() {
  const slug = ref(readPersistedSlug())
  const initialManifest = getTheme(slug.value).manifest
  const mode = ref(readPersistedMode(initialManifest.defaultMode))
  const transitioning = ref(false)

  const manifest = computed(() => getTheme(slug.value).manifest)
  const Layout = computed(() => getTheme(slug.value).Layout)
  const availableThemes = computed(() => THEME_LIST)

  // Synchronise DOM + localStorage
  watch(
    [slug, mode],
    ([s, m]) => {
      document.documentElement.setAttribute('data-theme-slug', s)
      document.documentElement.setAttribute('data-theme', m)
      try {
        localStorage.setItem(STORAGE_KEY, s)
        localStorage.setItem(MODE_KEY, m)
      } catch {
        /* no-op */
      }
    },
    { immediate: true }
  )

  function switchTheme(nextSlug) {
    if (!THEME_REGISTRY[nextSlug] || nextSlug === slug.value) return
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      slug.value = nextSlug
      // adopte le mode par défaut du nouveau thème
      const nextManifest = getTheme(nextSlug).manifest
      if (nextManifest?.defaultMode) mode.value = nextManifest.defaultMode
      return
    }
    transitioning.value = true
    window.setTimeout(() => {
      slug.value = nextSlug
      const nextManifest = getTheme(nextSlug).manifest
      if (nextManifest?.defaultMode) mode.value = nextManifest.defaultMode
      window.setTimeout(() => {
        transitioning.value = false
      }, 140)
    }, 140)
  }

  function toggleMode() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  function setMode(next) {
    if (next === 'light' || next === 'dark') mode.value = next
  }

  const store = {
    slug: readonly(slug),
    mode: readonly(mode),
    manifest,
    Layout,
    transitioning: readonly(transitioning),
    availableThemes,
    switchTheme,
    toggleMode,
    setMode
  }

  provide(ThemeKey, store)
  return store
}

export function useTheme() {
  const ctx = inject(ThemeKey, null)
  if (!ctx) {
    throw new Error('useTheme() must be used under a component that called provideTheme()')
  }
  return ctx
}
