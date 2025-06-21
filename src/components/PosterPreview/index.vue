<template>
  <div class="poster-preview">
    <div class="preview-toolbar">
      <div class="zoom-controls">
        <button :disabled="zoom <= 0.5" class="zoom-btn" @click="decreaseZoom">
          <span class="zoom-icon">−</span>
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button :disabled="zoom >= 2" class="zoom-btn" @click="increaseZoom">
          <span class="zoom-icon">+</span>
        </button>
      </div>

      <button
          :disabled="isExporting"
          class="preview-export-btn"
          @click="$emit('export')"
      >
        {{ isExporting ? '导出中...' : '导出海报' }}
      </button>
    </div>

    <div ref="previewContainer" class="preview-container">
      <div
          :style="{
              transform: `scale(${zoom})`
            }"
          class="poster-wrapper"
      >
        <PosterCanvas
            ref="posterCanvas"
            :config="config"
            :template-component="templateComponent"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import PosterCanvas from './PosterCanvas.vue'
import type {PosterConfig} from '@/types/poster'

const props = defineProps<{
  config: PosterConfig
  templateComponent: any
  deviceInfo?: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
  isExporting?: boolean
}>()

defineEmits<{
  (e: 'export'): void
}>()

const posterCanvas = ref<InstanceType<typeof PosterCanvas>>()
const previewContainer = ref<HTMLElement>()

const zoom = ref(1)

// Zoom controls
const increaseZoom = () => {
  if (zoom.value < 2) {
    zoom.value = Math.min(2, zoom.value + 0.1)
    saveZoomLevel()
  }
}

const decreaseZoom = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(0.5, zoom.value - 0.1)
    saveZoomLevel()
  }
}

// Save zoom level to localStorage
const saveZoomLevel = () => {
  localStorage.setItem('posterZoomLevel', zoom.value.toString())
}

// Get the poster element for export
const getPosterElement = () => {
  return posterCanvas.value?.getPosterElement()
}

// Initialize zoom level from localStorage
const initZoomLevel = () => {
  const savedZoom = localStorage.getItem('posterZoomLevel')
  if (savedZoom) {
    const parsedZoom = parseFloat(savedZoom)
    zoom.value = isNaN(parsedZoom) ? 1 : parsedZoom
  } else {
    // Set initial zoom based on screen size
    if (props.deviceInfo?.isMobile) {
      zoom.value = 0.7
    } else if (props.deviceInfo?.isTablet) {
      zoom.value = 0.9
    } else {
      zoom.value = 1
    }
    saveZoomLevel()
  }
}

// Reset zoom on template change
watch(
    () => props.templateComponent,
    () => {
      if (props.deviceInfo?.isMobile) {
        zoom.value = 0.7
      } else {
        zoom.value = 1
      }
      saveZoomLevel()
    }
)

onMounted(() => {
  initZoomLevel()
})

defineExpose({
  getPosterElement,
  $forceUpdate: () => {
    if (posterCanvas.value) {
      posterCanvas.value.$forceUpdate?.()
    }
  }
})
</script>

<style scoped>
.poster-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-toolbar {
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
}

.zoom-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-icon {
  font-size: 20px;
  line-height: 1;
}

.zoom-level {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  width: 50px;
  text-align: center;
}

.preview-export-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  min-height: 38px;
}

.preview-export-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.preview-export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.preview-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  -webkit-overflow-scrolling: touch;
}

.poster-wrapper {
  transform-origin: center;
  transition: transform 0.2s ease;
  will-change: transform;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .preview-toolbar {
    padding: 10px 15px;
  }

  .zoom-btn {
    width: 40px;
    height: 40px;
    min-height: 40px;
  }

  .preview-export-btn {
    min-height: 40px;
  }

  .preview-container {
    padding: 15px 10px;
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .poster-wrapper {
    transition: none;
  }
}
</style>