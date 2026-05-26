<template>
  <header class="no-header">
    <div class="no-header__inner">
      <a href="/" class="no-brand" aria-label="Sealmark">
        <span class="no-seal" aria-hidden="true">S</span>
        <span class="no-brand__text">
          <span class="no-brand__name">Sealmark</span>
          <span class="no-brand__sub">étude · signature · sceau</span>
        </span>
      </a>
    </div>
    <div class="no-hero">
      <slot name="header" />
    </div>
  </header>

  <nav class="no-tabs">
    <div class="no-tabs__inner">
      <slot name="tabs" />
    </div>
  </nav>

  <main class="no-paper">
    <slot />
  </main>

  <footer class="no-footer">
    <div class="no-footer__inner">
      <slot name="footer" />
    </div>
  </footer>

  <AppFab />
</template>

<script setup>
import AppFab from '@components/AppFab.vue'
</script>

<style scoped>
.no-header {
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
}
.no-header__inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.no-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: var(--text-strong);
}
.no-seal {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--accent-color), color-mix(in srgb, var(--accent-color) 60%, #5b3a06));
  color: #fffdf3;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 600;
  font-size: 1.15rem;
  box-shadow: var(--shadow-md);
  border: 1px solid color-mix(in srgb, var(--accent-color) 60%, #000 40%);
}
.no-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.no-brand__name {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 600;
  font-size: 1.2rem;
  letter-spacing: 0.005em;
}
.no-brand__sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.no-hero {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem 2.25rem;
  text-align: center;
  font-family: var(--font-serif);
}
.no-hero :deep(h1) {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 600;
  margin: 0 0 0.6rem;
  letter-spacing: 0.005em;
}
.no-hero :deep(.tagline) {
  color: var(--text-muted);
  font-family: var(--font-sans);
  margin: 0 auto;
  max-width: 60ch;
  line-height: 1.55;
}

.no-tabs {
  border-bottom: 1px solid var(--border-color);
}
.no-tabs__inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
.no-tabs__inner :deep(.tab-btn) {
  font-family: var(--font-serif);
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.78rem;
  padding: 0.875rem 1.1rem;
}

.no-paper {
  max-width: 720px;
  margin: 1.5rem auto 3rem;
  padding: 4rem;
  background: var(--surface-solid);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  position: relative;
}
.no-paper::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
  border-radius: calc(var(--radius-lg) - 2px);
  pointer-events: none;
}

.no-footer {
  border-top: 1px solid var(--border-color);
  background: var(--surface);
}
.no-footer__inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

@media (max-width: 720px) {
  .no-paper {
    padding: 1.5rem;
    margin: 1rem;
  }
  .no-header__inner,
  .no-tabs__inner,
  .no-footer__inner {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
