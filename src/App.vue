<template>
  <header class="app-header">
    <div class="header-inner">
      <a href="/" class="brand" aria-label="Sealmark">
        <svg class="brand-mark" viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 4h14l6 6v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M20 4v6h6" />
          <path d="M10 20l3 3 7-7" />
        </svg>
        <span class="brand-name">Sealmark</span>
      </a>
      <button type="button" class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Mode clair' : 'Mode sombre'" :aria-label="theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'">
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
    <div class="hero">
      <h1>Signez vos PDF.<br />Prouvez leur intégrité.</h1>
      <p class="tagline">
        Apposez une signature manuscrite, scellez le document avec une empreinte cryptographique et vérifiez à tout moment qu'il n'a pas été modifié. Vos fichiers ne quittent jamais votre appareil.
      </p>
    </div>
  </header>

  <nav class="tabs">
    <div class="tabs-inner">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>

  <main class="app-main">
    <section v-if="activeTab === 'sign'" class="panel-section fade-in-up">
      <h2 class="section-step">1. Sélectionner le document</h2>
      <div v-if="!pdfFile">
        <PdfDropzone @file-selected="onPdfSelected" />
        <p class="hint">
          Vous n'avez rien sous la main ? <a href="#" @click.prevent="loadSample">Essayer avec un document d'exemple</a>.
        </p>
      </div>
      <div v-else class="loaded-file">
        <span><strong>{{ pdfFile.name }}</strong> · {{ formatSize(pdfFile.size) }}</span>
        <button type="button" class="link-btn" @click="resetAll">Changer de fichier</button>
      </div>

      <template v-if="pdfFile">
        <div class="split">
          <div class="split-left">
            <h2 class="section-step">2. Choisir l'emplacement</h2>
            <PdfPreview
              :pdf-file="pdfFile"
              :signature-preview="signatureDataUrl"
              :signature-width="150"
              @position-selected="onPositionSelected"
            />
          </div>

          <div class="split-right">
            <h2 class="section-step">3. Apposer la signature</h2>
            <SignaturePad
              @signature-save="onSignatureSave"
              @signature-clear="signatureDataUrl = null"
              @signature-error="onError"
            />

            <div class="action-row">
              <button
                type="button"
                class="btn btn-success"
                :disabled="!signatureDataUrl || !signaturePosition || processing"
                @click="signPdf"
              >
                {{ processing ? 'Scellement en cours…' : '4. Sceller et télécharger' }}
              </button>
            </div>

            <div v-if="signedResult" class="result-box fade-in-up">
              <p class="result-title">✓ Document scellé</p>
              <button type="button" class="btn btn-primary" @click="downloadSigned">Télécharger le document signé</button>

              <div class="hash-display">
                <span class="badge">Empreinte</span>
                <code @click="copyHash" :title="copied ? 'Copié' : 'Cliquer pour copier'">{{ signedResult.hash }}</code>
                <span v-if="copied" class="copied-indicator">✓ copié</span>
              </div>
              <p class="hint">
                Conservez cette empreinte : elle permettra à n'importe qui de vérifier que le document n'a pas été modifié depuis sa signature.
              </p>
            </div>
          </div>
        </div>
      </template>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
    </section>

    <section v-if="activeTab === 'verify'" class="panel-section fade-in-up">
      <IntegrityChecker />
    </section>

    <section v-if="activeTab === 'crypto'" class="panel-section fade-in-up">
      <CryptoDemo />
    </section>
  </main>

  <footer class="app-footer">
    <div class="footer-inner">
      <span class="footer-brand">Sealmark</span>
      <span class="footer-sep">·</span>
      <span class="footer-claim">Traitement local, sans téléversement</span>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PdfDropzone from './components/PdfDropzone.vue'
import PdfPreview from './components/PdfPreview.vue'
import SignaturePad from './components/SignaturePad.vue'
import IntegrityChecker from './components/IntegrityChecker.vue'
import CryptoDemo from './components/CryptoDemo.vue'
import {
  superposerImageSurPdf,
  dataURLtoFile,
  percentToPdfPosition,
  generateDocumentHash
} from './services/pdf-service.js'

const tabs = [
  { id: 'sign', label: 'Signer un document' },
  { id: 'verify', label: 'Vérifier l\'intégrité' },
  { id: 'crypto', label: 'Coffre-fort de texte' }
]

const activeTab = ref('sign')
const theme = ref('dark')
const pdfFile = ref(null)
const signatureDataUrl = ref(null)
const signaturePosition = ref(null)
const signedResult = ref(null)
const errorMessage = ref('')
const processing = ref(false)
const copied = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('pdf-signature-theme')
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
    document.documentElement.setAttribute('data-theme', stored)
  }
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('pdf-signature-theme', theme.value)
}

function onPdfSelected(file) {
  pdfFile.value = file
  signedResult.value = null
  signaturePosition.value = null
  errorMessage.value = ''
}

async function loadSample() {
  try {
    const response = await fetch('/sample.pdf')
    if (!response.ok) {
      errorMessage.value = "Aucun PDF d'exemple disponible. Téléversez votre propre fichier."
      return
    }
    const blob = await response.blob()
    pdfFile.value = new File([blob], 'sample.pdf', { type: 'application/pdf' })
    signedResult.value = null
    signaturePosition.value = null
    errorMessage.value = ''
  } catch (e) {
    errorMessage.value = `Erreur de chargement de l'exemple : ${e.message}`
  }
}

function onSignatureSave(dataUrl) {
  signatureDataUrl.value = dataUrl
  errorMessage.value = ''
}

function onPositionSelected(pos) {
  signaturePosition.value = pos
}

function onError(msg) {
  errorMessage.value = msg
}

async function signPdf() {
  if (!pdfFile.value || !signatureDataUrl.value || !signaturePosition.value) return
  processing.value = true
  errorMessage.value = ''
  try {
    const signatureFile = dataURLtoFile(signatureDataUrl.value, 'signature.png')
    const pdfPosition = percentToPdfPosition(
      { x: signaturePosition.value.xPercent, y: signaturePosition.value.yPercent },
      { fromTop: true }
    )
    const signedBlob = await superposerImageSurPdf(pdfFile.value, signatureFile, {
      position: pdfPosition,
      imageWidth: 150
    })
    const hash = await generateDocumentHash(signedBlob)
    signedResult.value = { blob: signedBlob, hash }
  } catch (e) {
    errorMessage.value = `Erreur lors de la signature : ${e.message}`
  } finally {
    processing.value = false
  }
}

function downloadSigned() {
  if (!signedResult.value) return
  const url = URL.createObjectURL(signedResult.value.blob)
  const a = document.createElement('a')
  const baseName = pdfFile.value.name.replace(/\.pdf$/i, '')
  a.href = url
  a.download = `${baseName}-signe.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyHash() {
  if (!signedResult.value) return
  try {
    await navigator.clipboard.writeText(signedResult.value.hash)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch (_) {}
}

function resetAll() {
  pdfFile.value = null
  signatureDataUrl.value = null
  signaturePosition.value = null
  signedResult.value = null
  errorMessage.value = ''
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<style scoped>
.app-header {
  background: var(--navbar-background);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.header-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--color-heading);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.brand:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.brand-mark {
  color: var(--primary-color);
}

.brand-name {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hero {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2.75rem;
  text-align: left;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.75rem, 2.5vw + 1rem, 2.625rem);
  color: var(--color-heading);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0.875rem 0 0;
  font-size: 1rem;
  color: var(--color-muted);
  max-width: 62ch;
  line-height: 1.55;
}

.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.tabs {
  background: transparent;
  border-bottom: 1px solid var(--border-color);
}

.tabs-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  gap: 0.25rem;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-heading);
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.app-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.75rem 1.5rem;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-step {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-mono);
  color: var(--color-heading);
  font-weight: 500;
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1000px) {
  .split {
    grid-template-columns: 1fr;
  }
}

.split-left,
.split-right {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.loaded-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background: var(--success-bg);
  border: 1px solid var(--success-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-heading);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.8rem;
  font-family: inherit;
}

.hint {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--color-muted);
}

.action-row {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.result-box {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.result-title {
  margin: 0;
  color: var(--success-color);
  font-family: var(--font-mono);
  font-weight: 500;
}

.hash-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hash-display code {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  background: var(--code-background);
  border: 1px solid var(--border-color);
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  word-break: break-all;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.copied-indicator {
  color: var(--success-color);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.error-banner {
  margin-top: 0.75rem;
  padding: 0.75rem 0.875rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: 0.85rem;
}

.app-footer {
  border-top: 1px solid var(--border-color);
  margin-top: 3rem;
}

.footer-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-subtle);
}

.footer-brand {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-muted);
  letter-spacing: 0.02em;
}

.footer-sep {
  color: var(--color-subtle);
}

.footer-claim {
  font-style: italic;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0.875rem 1rem;
  }
  .hero {
    padding: 2rem 1rem 2.25rem;
  }
  .tabs-inner,
  .app-main,
  .footer-inner {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
