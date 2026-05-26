<template>
  <header class="cv-header">
    <div class="cv-header__inner">
      <a href="/" class="cv-brand">
        <span class="cv-prompt">[SEALMARK]</span>
        <span class="cv-status">// integrity engine v1.0</span>
      </a>
    </div>
    <div class="cv-hero">
      <slot name="header" />
    </div>
  </header>

  <nav class="cv-tabs">
    <div class="cv-tabs__inner">
      <slot name="tabs" />
    </div>
  </nav>

  <main class="cv-main">
    <slot />
  </main>

  <footer class="cv-footer">
    <div class="cv-footer__inner">
      <span class="cv-cursor">&gt;_</span>
      <slot name="footer" />
    </div>
  </footer>

  <AppFab />
</template>

<script setup>
import AppFab from '@components/AppFab.vue'
</script>

<style scoped>
.cv-header {
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-color);
}
.cv-header__inner {
  max-width: 90rem;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.cv-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--primary-color);
  font-family: var(--font-mono);
  text-shadow: 0 0 8px var(--primary-shadow);
}
.cv-prompt {
  font-weight: 700;
  letter-spacing: 0.18em;
  font-size: 0.95rem;
}
.cv-status {
  color: var(--text-muted);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.cv-hero {
  max-width: 90rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 2.5rem;
}
.cv-hero :deep(h1) {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin: 0 0 0.75rem;
}
.cv-hero :deep(.tagline) {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 70ch;
  line-height: 1.6;
}

.cv-tabs {
  border-bottom: 1px solid var(--border-color);
}
.cv-tabs__inner {
  max-width: 90rem;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  gap: 0;
}
.cv-tabs__inner :deep(.tab-btn) {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.875rem 1.1rem;
  font-size: 0.78rem;
  border-right: 1px solid var(--border-color);
}

.cv-main {
  max-width: 90rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
}

.cv-footer {
  border-top: 1px solid var(--border-color);
  background: var(--surface);
}
.cv-footer__inner {
  max-width: 90rem;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
.cv-cursor {
  color: var(--primary-color);
  text-shadow: 0 0 6px var(--primary-shadow);
}

@media (max-width: 640px) {
  .cv-header__inner,
  .cv-hero,
  .cv-tabs__inner,
  .cv-main,
  .cv-footer__inner {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
