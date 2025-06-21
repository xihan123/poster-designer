<template>
  <div class="control-panel">
    <div class="panel-header">
      <h2 class="panel-title">海报设计器</h2>
    </div>

    <div class="panel-content">
      <div class="tabs">
        <button
            :class="['tab-btn', { active: activeTab === 'basic' }]"
            @click="setActiveTab('basic')"
        >
          <span class="tab-icon">✏️</span> 基础设置
        </button>
        <button
            :class="['tab-btn', { active: activeTab === 'elements' }]"
            @click="setActiveTab('elements')"
        >
          <span class="tab-icon">🧩</span> 元素管理
        </button>
        <button
            :class="['tab-btn', { active: activeTab === 'theme' }]"
            @click="setActiveTab('theme')"
        >
          <span class="tab-icon">🎨</span> 样式设置
        </button>
        <button
            :class="['tab-btn', { active: activeTab === 'export' }]"
            @click="setActiveTab('export')"
        >
          <span class="tab-icon">⚙️</span> 导出设置
        </button>
      </div>

      <div class="tab-content">
        <BasicSettings
            v-if="activeTab === 'basic'"
            :config="config"
            :device-info="deviceInfo"
            @update="updateConfig"
        />
        <ElementSettings
            v-else-if="activeTab === 'elements'"
            :config="config"
            @update="updateConfig"
        />
        <StyleSettings
            v-else-if="activeTab === 'theme'"
            :config="config"
            @update="updateConfig"
        />
        <ExportSettings
            v-else-if="activeTab === 'export'"
            :config="config"
            :device-info="deviceInfo"
            :is-exporting="isExporting"
            @export="$emit('export')"
            @update="updateConfig"
            @update-poster="$emit('update-poster')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import BasicSettings from './BasicSettings.vue'
import ElementSettings from './ElementSettings.vue'
import StyleSettings from './ThemeSettings.vue'
import ExportSettings from './ExportSettings.vue'
import type {PosterConfig} from '@/types/poster'

interface Props {
  config: PosterConfig
  deviceInfo?: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
  isExporting?: boolean
  exportProgress?: number
  exportStage?: string
}

interface Emits {
  (e: 'update-config', config: Partial<PosterConfig>): void

  (e: 'export'): void

  (e: 'update-poster'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Default tab is 'basic'
const activeTab = ref('basic')

const setActiveTab = (tab: string) => {
  activeTab.value = tab
  // Force update poster preview when changing tabs
  emit('update-poster')
}

const updateConfig = (updates: Partial<PosterConfig>) => {
  emit('update-config', updates)
}
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e3a8a;
}

.panel-actions {
  display: flex;
  gap: 10px;
}

.export-btn {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.export-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.export-btn.busy {
  background: #9ca3af;
  opacity: 1;
}

.export-icon {
  font-size: 16px;
}

.export-progress {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  padding: 0 10px;
  flex-shrink: 0;
}

.tab-btn {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  touch-action: manipulation;
}

.tab-btn:hover {
  color: #334155;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .panel-header {
    padding: 12px 15px;
  }

  .panel-title {
    font-size: 16px;
  }

  .export-btn {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 44px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 44px;
  }

  .tab-content {
    padding: 10px 15px;
  }
}

/* iPad and tablet optimization */
@media (min-width: 769px) and (max-width: 1024px) {
  .panel-header {
    padding: 15px;
  }

  .panel-title {
    font-size: 17px;
  }

  .tab-content {
    padding: 15px;
  }
}
</style>