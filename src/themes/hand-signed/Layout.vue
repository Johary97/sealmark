<template>
  <header class="hs-header">
    <div class="hs-header__inner">
      <a href="/" class="hs-brand">
        <span class="hs-brand__script">Sealmark</span>
        <span class="hs-brand__sub">— une lettre, scellée par vos soins</span>
      </a>
      <div class="hs-tools">
        <ThemeSwitcher />
        <button
          type="button"
          class="hs-mode-toggle"
          @click="toggleMode"
          :title="mode === 'dark' ? 'Mode clair' : 'Mode sombre'"
        >
          <svg v-if="mode === 'dark'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </div>
    <div class="hs-hero">
      <slot name="header" />
    </div>
  </header>

  <nav class="hs-tabs">
    <div class="hs-tabs__inner">
      <slot name="tabs" />
    </div>
  </nav>

  <main class="hs-paper">
    <div class="hs-paper__sheet">
      <slot />
      <div class="hs-paper__signoff">
        <span class="hs-paper__closing">Fait avec soin,</span>
        <span class="hs-paper__author">l'auteur</span>
      </div>
    </div>
  </main>

  <footer class="hs-footer">
    <div class="hs-footer__inner">
      <slot name="footer" />
    </div>
  </footer>
</template>

<script setup>
import { useTheme } from '@theme/useTheme.js'
import ThemeSwitcher from '@theme/ThemeSwitcher.vue'

const { mode, toggleMode } = useTheme()
</script>

<style scoped>
.hs-header {
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-color);
}
.hs-header__inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.hs-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text-strong);
}
.hs-brand__script {
  font-family: var(--font-script);
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1;
}
.hs-brand__sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.hs-tools {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.hs-mode-toggle {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 180ms ease, color 180ms ease;
}
.hs-mode-toggle:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.hs-hero {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 2.25rem;
  text-align: center;
}
.hs-hero :deep(h1) {
  font-family: var(--font-script);
  font-weight: 600;
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 3vw + 1rem, 3rem);
  line-height: 1.05;
}
.hs-hero :deep(.tagline) {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--text-muted);
  max-width: 56ch;
  margin: 0 auto;
  line-height: 1.55;
}

.hs-tabs {
  border-bottom: 1px solid var(--border-color);
}
.hs-tabs__inner {
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
.hs-tabs__inner :deep(.tab-btn) {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  padding: 0.875rem 1.25rem;
  text-transform: none;
  letter-spacing: 0;
}

.hs-paper {
  max-width: 56rem;
  margin: 1.5rem auto 3rem;
  padding: 0 1.5rem;
}
.hs-paper__sheet {
  background: var(--surface-solid);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 6rem;
  box-shadow: var(--shadow-md);
  position: relative;
}
.hs-paper__signoff {
  margin-top: 2.5rem;
  text-align: right;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.hs-paper__closing {
  font-size: 0.95rem;
}
.hs-paper__author {
  font-family: var(--font-script);
  font-size: 1.6rem;
  color: var(--primary-color);
  line-height: 1;
}

.hs-footer {
  border-top: 1px solid var(--border-color);
  background: var(--surface);
}
.hs-footer__inner {
  max-width: 56rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--text-muted);
}

@media (max-width: 720px) {
  .hs-paper__sheet { padding: 1.75rem; }
  .hs-header__inner,
  .hs-tabs__inner,
  .hs-paper,
  .hs-footer__inner {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
