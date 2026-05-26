<template>
  <div ref="rootRef" class="theme-switcher">
    <button
      type="button"
      class="theme-switcher__trigger"
      :aria-haspopup="'listbox'"
      :aria-expanded="open"
      :title="active?.name || 'Choisir le thème'"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
      <span class="theme-switcher__label">{{ active?.name }}</span>
    </button>

    <div v-if="open" role="listbox" class="theme-switcher__menu" aria-label="Choisir le thème">
      <button
        v-for="m in availableThemes"
        :key="m.slug"
        type="button"
        role="option"
        :aria-selected="m.slug === slug"
        :class="['theme-switcher__option', { 'is-active': m.slug === slug }]"
        @click="onPick(m.slug)"
      >
        <span class="theme-switcher__swatch" :style="{ background: m.swatch }" aria-hidden="true" />
        <span class="theme-switcher__text">
          <span class="theme-switcher__name">
            {{ m.name }}
            <svg v-if="m.slug === slug" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span class="theme-switcher__desc">{{ m.description }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useTheme } from './useTheme.js'

const { slug, availableThemes, switchTheme } = useTheme()
const open = ref(false)
const rootRef = ref(null)

const active = computed(
  () => availableThemes.value.find((m) => m.slug === slug.value) || availableThemes.value[0]
)

function onPick(s) {
  switchTheme(s)
  open.value = false
}

function onDocMouseDown(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) open.value = false
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
.theme-switcher {
  position: relative;
  display: inline-flex;
}
.theme-switcher__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-family: var(--font-sans, inherit);
  background: transparent;
  color: var(--text, var(--color-text));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}
.theme-switcher__trigger:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.theme-switcher__label {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 480px) {
  .theme-switcher__label { display: none; }
}
.theme-switcher__menu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 18rem;
  z-index: 50;
  background: var(--surface-solid, var(--surface-background, #fff));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.18));
}
.theme-switcher__option {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 140ms ease;
  color: var(--text, var(--color-text));
  font-family: var(--font-sans, inherit);
}
.theme-switcher__option:hover {
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
}
.theme-switcher__option.is-active {
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}
.theme-switcher__swatch {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 6px);
}
.theme-switcher__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.theme-switcher__name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-strong, var(--color-heading));
}
.theme-switcher__desc {
  font-size: 0.7rem;
  color: var(--text-muted, var(--color-muted));
  line-height: 1.35;
}
</style>
