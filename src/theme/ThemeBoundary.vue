<template>
  <div
    class="theme-boundary"
    :style="{ opacity: transitioning ? 0.4 : 1 }"
  >
    <component :is="Layout">
      <template #header><slot name="header" /></template>
      <template #tabs><slot name="tabs" /></template>
      <template #viewer><slot name="viewer" /></template>
      <template #signature-pad><slot name="signature-pad" /></template>
      <template #actions><slot name="actions" /></template>
      <template #result><slot name="result" /></template>
      <template #verify><slot name="verify" /></template>
      <template #crypto><slot name="crypto" /></template>
      <template #footer><slot name="footer" /></template>
      <template #default><slot /></template>
    </component>
    <slot name="overlays" />
  </div>
</template>

<script setup>
import { useTheme } from './useTheme.js'

const { Layout, transitioning } = useTheme()
</script>

<style scoped>
.theme-boundary {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: opacity 140ms ease-out;
}
</style>
