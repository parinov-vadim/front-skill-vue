<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{
  modelValue: string
  language: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const extensions = computed(() => {
  const lang = (() => {
    switch (props.language) {
      case 'html': return html()
      case 'css': return css()
      case 'typescript': return javascript({ typescript: true })
      default: return javascript()
    }
  })()
  return [lang, oneDark]
})
</script>

<template>
  <Codemirror
    :model-value="modelValue"
    :extensions="extensions"
    :style="{ height: '100%' }"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<style scoped>
:deep(.cm-editor) {
  height: 100%;
}
</style>
