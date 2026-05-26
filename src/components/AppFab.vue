<template>
  <div ref="rootRef" class="app-fab" :class="{ 'is-open': open }">
    <ul class="app-fab__actions" :aria-hidden="!open">
      <!-- Thème : utilise le ThemeSwitcher complet (avec dropdown auto-flip vers le haut) -->
      <li class="app-fab__action">
        <span class="app-fab__label">Thème</span>
        <div class="app-fab__slot">
          <ThemeSwitcher />
        </div>
      </li>

      <!-- Mode clair / sombre -->
      <li class="app-fab__action">
        <span class="app-fab__label">{{ mode === 'dark' ? 'Mode clair' : 'Mode sombre' }}</span>
        <button
          type="button"
          class="app-fab__btn"
          :aria-label="mode === 'dark' ? 'Mode clair' : 'Mode sombre'"
          @click="toggleMode"
        >
          <svg v-if="mode === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="app-fab__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="Paramètres"
      @click="open = !open"
    >
      <svg v-if="!open" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()
const open = ref(false)
const rootRef = ref(null)

function onDocMouseDown(e) {
  if (!rootRef.value) return
  if (rootRef.value.contains(e.target)) return
  // Ignore clics dans le dropdown du ThemeSwitcher (téléporté en body)
  if (e.target.closest && e.target.closest('[role="listbox"]')) return
  open.value = false
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

watch(open, (v) => {
  if (v) {
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('mousedown', onDocMouseDown)
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.app-fab {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  font-family: var(--font-sans, system-ui, sans-serif);
}
@media (min-width: 640px) {
  .app-fab {
    right: 1.5rem;
    bottom: 1.5rem;
  }
}

.app-fab__actions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  transform-origin: bottom right;
  transition: opacity 220ms ease, transform 220ms ease;
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
}
.app-fab.is-open .app-fab__actions {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.app-fab__action {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.app-fab__label {
  padding: 0.25rem 0.55rem;
  background: var(--primary-color);
  color: #fff;
  font-size: 0.72rem;
  white-space: nowrap;
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.2));
  font-family: var(--font-sans, inherit);
  letter-spacing: 0.01em;
}
.app-fab__slot {
  /* Conteneur d'ancrage pour le ThemeSwitcher (sa trigger garde son style propre) */
  display: inline-flex;
  background: var(--surface-solid, var(--surface, #fff));
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.2));
}
.app-fab__btn,
.app-fab__trigger {
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill, 9999px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.25));
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.app-fab__btn {
  width: 2.75rem;
  height: 2.75rem;
}
.app-fab__trigger {
  width: 3rem;
  height: 3rem;
}
.app-fab__btn:hover,
.app-fab__trigger:hover {
  transform: scale(1.08);
}
.app-fab__btn:focus-visible,
.app-fab__trigger:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
