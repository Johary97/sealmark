<template>
  <ThemeBoundary>
    <!-- Hero (slot "header") -->
    <template #header>
      <h1>Signez vos PDF.<br />Prouvez leur intégrité.</h1>
      <p class="tagline">
        Apposez une signature manuscrite, scellez le document avec une empreinte cryptographique et vérifiez à tout moment qu'il n'a pas été modifié. Vos fichiers ne quittent jamais votre appareil.
      </p>
    </template>

    <!-- Onglets (slot "tabs") -->
    <template #tabs>
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </template>

    <!-- Contenu principal (slot par défaut) -->
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
            <div class="cv-scanline-host">
              <PdfPreview
                :pdf-file="pdfFile"
                :signature-preview="signatureDataUrl"
                :signature-width="150"
                @position-selected="onPositionSelected"
              />
            </div>
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
                class="btn btn-success notary-stamp-trigger"
                :disabled="!signatureDataUrl || !signaturePosition || processing"
                @click="signPdf"
              >
                {{ processing ? 'Scellement en cours…' : '4. Sceller et télécharger' }}
              </button>
            </div>

            <div v-if="signedResult" class="result-box fade-in-up notary-stamp">
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

    <!-- Footer (slot "footer") -->
    <template #footer>
      <span class="footer-brand">Sealmark</span>
      <span class="footer-sep">·</span>
      <span class="footer-claim">Traitement local, sans téléversement</span>
    </template>
  </ThemeBoundary>
</template>

<script setup>
import { ref } from 'vue'
import PdfDropzone from './components/PdfDropzone.vue'
import PdfPreview from './components/PdfPreview.vue'
import SignaturePad from './components/SignaturePad.vue'
import IntegrityChecker from './components/IntegrityChecker.vue'
import CryptoDemo from './components/CryptoDemo.vue'
import ThemeBoundary from '@theme/ThemeBoundary.vue'
import { provideTheme } from '@theme/useTheme.js'
import {
  superposerImageSurPdf,
  dataURLtoFile,
  percentToPdfPosition,
  generateDocumentHash
} from './services/pdf-service.js'

// Active le store thématique (provide/inject) au niveau racine.
provideTheme()

const tabs = [
  { id: 'sign', label: 'Signer un document' },
  { id: 'verify', label: 'Vérifier l\'intégrité' },
  { id: 'crypto', label: 'Coffre-fort de texte' }
]

const activeTab = ref('sign')
const pdfFile = ref(null)
const signatureDataUrl = ref(null)
const signaturePosition = ref(null)
const signedResult = ref(null)
const errorMessage = ref('')
const processing = ref(false)
const copied = ref(false)

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

<style>
/* Styles globaux non scopés (pour fonctionner à travers les Layouts qui consomment les slots) */
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-step {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-mono);
  color: var(--color-heading, var(--text-strong));
  font-weight: 500;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-muted, var(--text-muted));
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}
.tab-btn:hover {
  color: var(--color-heading, var(--text-strong));
}
.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 1000px) {
  .split { grid-template-columns: 1fr; }
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
  color: var(--color-heading, var(--text-strong));
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
  color: var(--color-muted, var(--text-muted));
}
.action-row {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.result-box {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface-background, var(--surface));
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
  color: var(--color-text, var(--text));
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

.footer-brand {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-muted, var(--text-muted));
  letter-spacing: 0.02em;
}
.footer-sep {
  color: var(--color-subtle, var(--text-muted));
}
.footer-claim {
  font-style: italic;
}
</style>
