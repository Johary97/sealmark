<template>
  <div class="crypto-demo">
    <h2>{{ t('crypto.title') }}</h2>
    <p class="muted">
      {{ t('crypto.lede') }}
    </p>

    <div class="grid">
      <div class="panel">
        <label>{{ t('crypto.passwordLabel') }}</label>
        <input v-model="password" type="text" :placeholder="t('crypto.passwordPlaceholder')" />

        <label>{{ t('crypto.plaintextLabel') }}</label>
        <textarea v-model="plaintext" rows="6" :placeholder="t('crypto.plaintextPlaceholder')"></textarea>

        <div class="actions">
          <button type="button" class="btn btn-primary" :disabled="!plaintext || !password" @click="onEncrypt">
            {{ t('crypto.encrypt') }}
          </button>
        </div>
      </div>

      <div class="panel">
        <label>{{ t('crypto.ciphertextLabel') }}</label>
        <textarea v-model="ciphertext" rows="6" :placeholder="t('crypto.ciphertextPlaceholder')"></textarea>

        <div class="actions">
          <button type="button" class="btn" :disabled="!ciphertext || !password" @click="onDecrypt">
            {{ t('crypto.decrypt') }}
          </button>
        </div>

        <div v-if="decryptedOutput !== null" class="output fade-in-up">
          <strong>{{ t('crypto.decryptedLabel') }}</strong>
          <pre>{{ decryptedOutput }}</pre>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { encryptText, decryptText } from '../services/pdf-service.js'

const { t } = useI18n()

const password = ref('')
const plaintext = ref('')
const ciphertext = ref('')
const decryptedOutput = ref(null)
const error = ref('')

function onEncrypt() {
  error.value = ''
  decryptedOutput.value = null
  try {
    ciphertext.value = encryptText(plaintext.value, password.value)
  } catch (e) {
    error.value = e.message
  }
}

function onDecrypt() {
  error.value = ''
  try {
    decryptedOutput.value = decryptText(ciphertext.value, password.value)
  } catch (e) {
    error.value = e.message
    decryptedOutput.value = null
  }
}
</script>

<style scoped>
.crypto-demo {
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.panel label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-heading);
  font-family: var(--font-mono);
  margin-top: 0.25rem;
}

.actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.output {
  margin-top: 0.5rem;
  padding: 0.625rem;
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
}

.output strong {
  display: block;
  font-family: var(--font-mono);
  color: var(--color-heading);
  font-size: 0.75rem;
  margin-bottom: 0.375rem;
}

.output pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text);
}

.error {
  padding: 0.625rem 0.875rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-md);
  color: var(--error-color);
  font-size: 0.85rem;
}
</style>
