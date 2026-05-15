<template>
  <div class="signature-pad-wrapper">
    <div class="signature-editor">
      <div class="signature-area">
        <div class="resizable-container" ref="resizableContainer">
          <div class="canvas-size">
            {{ Math.round(canvasWidth) }} × {{ Math.round(canvasHeight) }} px
          </div>
          <div class="signature-pad" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
            <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="signature-canvas"></canvas>
          </div>

          <div class="resize-handle corner-se" @mousedown="startResize($event, 'se')"></div>
          <div class="resize-handle corner-sw" @mousedown="startResize($event, 'sw')"></div>
          <div class="resize-handle corner-ne" @mousedown="startResize($event, 'ne')"></div>
          <div class="resize-handle corner-nw" @mousedown="startResize($event, 'nw')"></div>
          <div class="resize-handle edge-n" @mousedown="startResize($event, 'n')"></div>
          <div class="resize-handle edge-s" @mousedown="startResize($event, 's')"></div>
          <div class="resize-handle edge-e" @mousedown="startResize($event, 'e')"></div>
          <div class="resize-handle edge-w" @mousedown="startResize($event, 'w')"></div>

          <div v-if="isEmpty" class="dessin-title">
            Dessinez votre signature
          </div>
        </div>
      </div>

      <div class="signature-controls">
        <div class="control-row">
          <div class="control-item">
            <label>Couleur</label>
            <input type="color" v-model="strokeColor" @change="updateStrokeColor" class="color-input">
            <div class="preset-colors-inline">
              <span
                v-for="(color, index) in presetColors"
                :key="index"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :class="{ active: strokeColor === color }"
                @click="selectPresetColor(color)"
              ></span>
            </div>
          </div>
          <div class="control-item">
            <label>Épaisseur</label>
            <input type="range" v-model.number="strokeWidth" min="0.5" max="10" step="0.5" @input="updateStrokeWidth" class="range-input">
            <span class="range-value">{{ strokeWidth }}px</span>
          </div>
        </div>
      </div>
    </div>

    <div class="signature-actions">
      <button type="button" class="btn" @click="clearSignature">Effacer</button>
      <button type="button" class="btn btn-primary" @click="saveSignature">Appliquer</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import SignaturePad from 'signature_pad'

const props = defineProps({
  initialWidth: { type: Number, default: 400 },
  initialHeight: { type: Number, default: 200 },
  minWidth: { type: Number, default: 200 },
  maxWidth: { type: Number, default: 800 },
  minHeight: { type: Number, default: 100 },
  maxHeight: { type: Number, default: 500 }
})

const emit = defineEmits(['signature-save', 'signature-clear', 'signature-error', 'size-change'])

const canvasRef = ref(null)
const canvasWidth = ref(props.initialWidth)
const canvasHeight = ref(props.initialHeight)
const strokeColor = ref('#2980b9')
const strokeWidth = ref(2)
const isEmpty = ref(true)
const presetColors = ['#2980b9', '#1a1a1a', '#e74c3c', '#2ecc71']

let signaturePad = null
let resizing = false
let resizeDirection = null
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

function initSignaturePad() {
  signaturePad = new SignaturePad(canvasRef.value, {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    penColor: strokeColor.value,
    minWidth: strokeWidth.value * 0.5,
    maxWidth: strokeWidth.value * 2,
    throttle: 16,
    minDistance: 5
  })

  signaturePad.addEventListener('beginStroke', () => {
    isEmpty.value = false
  })
  signaturePad.addEventListener('endStroke', () => {
    isEmpty.value = signaturePad.isEmpty()
  })
}

function updateStrokeColor() {
  if (signaturePad) signaturePad.penColor = strokeColor.value
}

function updateStrokeWidth() {
  if (signaturePad) {
    signaturePad.minWidth = strokeWidth.value * 0.5
    signaturePad.maxWidth = strokeWidth.value * 2
  }
}

function selectPresetColor(color) {
  strokeColor.value = color
  updateStrokeColor()
}

function clearSignature() {
  if (signaturePad) {
    signaturePad.clear()
    isEmpty.value = true
    emit('signature-clear')
  }
}

function saveSignature() {
  if (!signaturePad || signaturePad.isEmpty()) {
    emit('signature-error', 'Aucune signature à sauvegarder')
    return null
  }

  try {
    const signatureData = signaturePad.toDataURL('image/png')
    emit('signature-save', signatureData)
    return signatureData
  } catch (error) {
    emit('signature-error', 'Erreur technique lors de la sauvegarde')
    return null
  }
}

function startResize(event, direction) {
  event.preventDefault()
  resizing = true
  resizeDirection = direction
  startX = event.clientX
  startY = event.clientY
  startWidth = canvasWidth.value
  startHeight = canvasHeight.value
  document.body.style.userSelect = 'none'
}

function onResize(event) {
  if (!resizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  let newWidth = startWidth
  let newHeight = startHeight

  switch (resizeDirection) {
    case 'se': newWidth = startWidth + deltaX; newHeight = startHeight + deltaY; break
    case 'sw': newWidth = startWidth - deltaX; newHeight = startHeight + deltaY; break
    case 'ne': newWidth = startWidth + deltaX; newHeight = startHeight - deltaY; break
    case 'nw': newWidth = startWidth - deltaX; newHeight = startHeight - deltaY; break
    case 'n':  newHeight = startHeight - deltaY; break
    case 's':  newHeight = startHeight + deltaY; break
    case 'e':  newWidth = startWidth + deltaX; break
    case 'w':  newWidth = startWidth - deltaX; break
  }

  newWidth = Math.max(props.minWidth, Math.min(newWidth, props.maxWidth))
  newHeight = Math.max(props.minHeight, Math.min(newHeight, props.maxHeight))

  canvasWidth.value = newWidth
  canvasHeight.value = newHeight

  emit('size-change', { width: newWidth, height: newHeight })
}

function stopResize() {
  if (!resizing) return
  resizing = false
  document.body.style.userSelect = ''
  nextTick(() => resizeCanvas())
}

function resizeCanvas() {
  if (!signaturePad) return
  const wasEmpty = signaturePad.isEmpty()
  const data = wasEmpty ? null : signaturePad.toDataURL()

  signaturePad.clear()
  signaturePad.canvas.width = canvasWidth.value
  signaturePad.canvas.height = canvasHeight.value

  if (data) {
    signaturePad.fromDataURL(data)
    isEmpty.value = false
  }
}

function handleWindowResize() {
  if (signaturePad) signaturePad.resizeCanvas()
}

onMounted(() => {
  initSignaturePad()
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('resize', handleWindowResize)
})

defineExpose({ clearSignature, saveSignature })
</script>

<style scoped>
.signature-pad-wrapper {
  width: 100%;
}

.signature-editor {
  background: var(--surface-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
}

.signature-area {
  display: flex;
  justify-content: center;
  padding-top: 0.25rem;
}

.resizable-container {
  position: relative;
  display: inline-block;
}

.canvas-size {
  font-size: 0.7rem;
  color: var(--color-muted);
  font-family: var(--font-mono);
  background: var(--code-background);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  border: 1px solid var(--border-color);
}

.signature-pad {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  position: relative;
  box-shadow: var(--shadow-card);
}

.signature-canvas {
  display: block;
  touch-action: none;
  border-radius: var(--radius-sm);
  cursor: crosshair;
}

.resize-handle {
  position: absolute;
  background: var(--primary-color);
  border: 2px solid var(--body-background);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0.85;
  transition: all var(--transition-fast);
}

.resize-handle:hover {
  opacity: 1;
  transform: scale(1.15);
}

.corner-se, .corner-sw, .corner-ne, .corner-nw {
  width: 10px;
  height: 10px;
}

.corner-se { bottom: -5px; right: -5px; cursor: se-resize; }
.corner-sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.corner-ne { top: -5px; right: -5px; cursor: ne-resize; }
.corner-nw { top: -5px; left: -5px; cursor: nw-resize; }

.edge-n, .edge-s, .edge-e, .edge-w {
  width: 8px;
  height: 8px;
}

.edge-n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.edge-s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.edge-e { right: -4px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.edge-w { left: -4px; top: 50%; transform: translateY(-50%); cursor: w-resize; }

.dessin-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  color: var(--color-subtle);
  font-family: var(--font-mono);
  text-align: center;
  pointer-events: none;
}

.signature-controls {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}

.control-row {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-item label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-heading);
  font-family: var(--font-mono);
  min-width: 60px;
}

.color-input {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0;
  background: var(--input-background);
}

.preset-colors-inline {
  display: flex;
  gap: 0.375rem;
  margin-left: 0.25rem;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform var(--transition-fast);
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-shadow);
}

.range-input {
  width: 120px;
  accent-color: var(--primary-color);
}

.range-value {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-family: var(--font-mono);
  min-width: 36px;
}

.signature-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .control-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
