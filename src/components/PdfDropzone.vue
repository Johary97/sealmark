<template>
  <div
    class="dropzone"
    :class="{ 'is-dragging': isDragging }"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="$refs.fileInput.click()"
  >
    <input
      ref="fileInput"
      type="file"
      accept="application/pdf"
      class="hidden-input"
      @change="onFileSelected"
    />
    <div class="dropzone-content">
      <svg viewBox="0 0 24 24" class="dropzone-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <p class="dropzone-text">
        <strong>Glissez un fichier PDF</strong> ou cliquez pour parcourir
      </p>
      <p class="dropzone-hint">Format accepté : .pdf</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['file-selected'])
const isDragging = ref(false)

function pickPdf(fileList) {
  for (const file of fileList) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return file
    }
  }
  return null
}

function onDrop(event) {
  isDragging.value = false
  const file = pickPdf(event.dataTransfer.files)
  if (file) emit('file-selected', file)
}

function onFileSelected(event) {
  const file = pickPdf(event.target.files)
  if (file) emit('file-selected', file)
  event.target.value = ''
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--surface-background);
}

.dropzone:hover,
.dropzone.is-dragging {
  border-color: var(--primary-color);
  background: var(--input-focus-bg);
  transform: translateY(-1px);
}

.hidden-input {
  display: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-muted);
}

.dropzone-icon {
  width: 44px;
  height: 44px;
  color: var(--primary-color);
}

.dropzone-text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.dropzone-text strong {
  color: var(--color-heading);
}

.dropzone-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-subtle);
  font-family: var(--font-mono);
}
</style>
