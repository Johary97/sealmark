<template>
  <div class="integrity-checker">
    <h2>Vérifier l'intégrité d'un document</h2>
    <p class="muted">
      Chargez un PDF et l'empreinte SHA-256 qui lui a été associée. Sealmark recalcule l'empreinte localement et confirme si le document est resté intact, à l'octet près.
    </p>

    <PdfDropzone @file-selected="onFile" />

    <div v-if="file" class="file-info">
      <strong>Fichier :</strong> {{ file.name }} ({{ formatSize(file.size) }})
    </div>

    <div class="hash-input">
      <label for="expected-hash">Hash SHA-256 attendu</label>
      <textarea
        id="expected-hash"
        v-model="expectedHash"
        placeholder="ex. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
        rows="2"
      ></textarea>
    </div>

    <div class="actions">
      <button type="button" class="btn btn-primary" :disabled="!file || !expectedHash" @click="verify">
        Vérifier
      </button>
    </div>

    <div v-if="result" class="result fade-in-up" :class="result.isVerified ? 'success' : 'failure'">
      <strong v-if="result.error">Erreur : {{ result.error }}</strong>
      <template v-else>
        <strong>{{ result.isVerified ? '✓ Intégrité confirmée' : '✗ Hash différent — document altéré ou hash incorrect' }}</strong>
        <div class="hash-row">
          <span class="hash-label">Calculé :</span>
          <code>{{ result.currentHash }}</code>
        </div>
        <div class="hash-row">
          <span class="hash-label">Attendu :</span>
          <code>{{ result.storedHash }}</code>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PdfDropzone from './PdfDropzone.vue'
import { verifyDocumentIntegrity } from '../services/pdf-service.js'

const file = ref(null)
const expectedHash = ref('')
const result = ref(null)

function onFile(f) {
  file.value = f
  result.value = null
}

async function verify() {
  if (!file.value || !expectedHash.value) return
  result.value = await verifyDocumentIntegrity(file.value, expectedHash.value)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<style scoped>
.integrity-checker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.25rem;
}

.muted {
  color: var(--color-muted);
  margin: 0;
  font-size: 0.875rem;
}

.file-info {
  padding: 0.625rem 0.875rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--color-text);
}

.file-info strong {
  color: var(--color-heading);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.hash-input {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.hash-input label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-heading);
  font-family: var(--font-mono);
}

.hash-input textarea {
  word-break: break-all;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.result {
  padding: 0.875rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.result.success {
  background: var(--success-bg);
  border: 1px solid var(--success-color);
  color: var(--success-color);
}

.result.failure {
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  color: var(--error-color);
}

.result strong {
  font-family: var(--font-mono);
}

.hash-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  color: var(--color-text);
}

.hash-label {
  font-weight: 500;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  min-width: 70px;
  color: var(--color-muted);
}

.hash-row code {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  word-break: break-all;
  flex: 1;
  background: var(--code-background);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  color: var(--color-text);
}
</style>
