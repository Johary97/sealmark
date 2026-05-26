<template>
  <div class="pdf-preview">
    <div class="preview-header">
      <span class="page-label">Page {{ currentPage }} / {{ totalPages }}</span>
      <div class="page-nav">
        <button type="button" class="btn-nav" :disabled="currentPage <= 1" @click="goPrev">‹</button>
        <button type="button" class="btn-nav" :disabled="currentPage >= totalPages" @click="goNext">›</button>
      </div>
    </div>

    <div class="canvas-wrapper" ref="wrapperRef" @click="onClick">
      <canvas ref="canvasRef"></canvas>

      <div
        v-if="signaturePreview && marker"
        class="signature-marker"
        :style="markerStyle"
      >
        <img :src="signaturePreview" alt="signature preview" />
      </div>
    </div>

    <p class="preview-hint">
      Cliquez pour positionner la signature. Apposition sur la <strong>dernière page</strong> uniquement.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const props = defineProps({
  pdfFile: { type: Object, default: null },
  signaturePreview: { type: String, default: null },
  signatureWidth: { type: Number, default: 150 }
})

const emit = defineEmits(['position-selected', 'pages-detected'])

const canvasRef = ref(null)
const wrapperRef = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const marker = ref(null)

let pdfDoc = null
let renderTask = null

const markerStyle = computed(() => {
  if (!marker.value) return {}
  return {
    left: `${marker.value.xPercent}%`,
    top: `${marker.value.yPercent}%`,
    width: `${marker.value.widthPercent}%`
  }
})

async function loadPdf(file) {
  marker.value = null
  if (renderTask) {
    try { renderTask.cancel() } catch (_) {}
  }
  if (pdfDoc) {
    try { await pdfDoc.destroy() } catch (_) {}
    pdfDoc = null
  }
  if (!file) {
    totalPages.value = 0
    return
  }

  const arrayBuffer = await file.arrayBuffer()
  pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  totalPages.value = pdfDoc.numPages
  currentPage.value = pdfDoc.numPages
  emit('pages-detected', pdfDoc.numPages)
  await renderPage(currentPage.value)
}

async function renderPage(pageNum) {
  if (!pdfDoc) return
  const page = await pdfDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  renderTask = page.render({ canvasContext: ctx, viewport })
  try {
    await renderTask.promise
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException') throw e
  }
}

function onClick(event) {
  if (currentPage.value !== totalPages.value) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const xPercent = ((event.clientX - rect.left) / rect.width) * 100
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100

  if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return

  const A4_WIDTH = 595.28
  const widthPercent = Math.min(40, (props.signatureWidth / A4_WIDTH) * 100)

  marker.value = { xPercent, yPercent, widthPercent }
  emit('position-selected', {
    xPercent,
    yPercent,
    page: currentPage.value
  })
}

function goPrev() {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}
function goNext() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

watch(() => props.pdfFile, (file) => loadPdf(file), { immediate: true })

onBeforeUnmount(async () => {
  if (renderTask) try { renderTask.cancel() } catch (_) {}
  if (pdfDoc) try { await pdfDoc.destroy() } catch (_) {}
})
</script>

<style scoped>
.pdf-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-muted);
}

.page-label {
  font-family: var(--font-mono);
}

.page-nav {
  display: flex;
  gap: 0.25rem;
}

.btn-nav {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  background: var(--surface-background);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  transition: all var(--transition-fast);
}

.btn-nav:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  background: var(--surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.5rem;
  cursor: crosshair;
  max-width: 100%;
  overflow: auto;
}

.canvas-wrapper canvas {
  display: block;
  box-shadow: var(--shadow-card);
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.signature-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  border: 2px dashed var(--primary-color);
  background: var(--primary-shadow);
  padding: 0.25rem;
}

.signature-marker img {
  display: block;
  width: 100%;
  height: auto;
}

.preview-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.preview-hint strong {
  color: var(--color-heading);
}
</style>
