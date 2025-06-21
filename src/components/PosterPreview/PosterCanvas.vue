<template>
  <div ref="posterElement" class="poster-canvas">
    <component
        :is="templateComponent"
        :config="config"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import type {PosterConfig} from '@/types/poster'

interface Props {
  config: PosterConfig
  templateComponent: any
}

const props = defineProps<Props>()

const posterElement = ref<HTMLElement>()

const getPosterElement = () => {
  return posterElement.value
}

defineExpose({
  getPosterElement
})
</script>

<style scoped>
.poster-canvas {
  display: inline-block;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}
</style>