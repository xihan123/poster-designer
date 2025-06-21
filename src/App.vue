<template>
  <div class="app">
    <div class="app-layout">
      <!-- 移动端折叠控制按钮 -->
      <div v-if="deviceInfo.isMobile" class="mobile-controls">
        <button
            :class="['mobile-toggle-btn', { active: showMobilePanel }]"
            @click="toggleMobilePanel"
        >
          <span class="toggle-icon">{{ showMobilePanel ? '✕' : '⚙️' }}</span>
          {{ showMobilePanel ? '关闭设置' : '编辑设置' }}
        </button>
      </div>

      <!-- 左侧控制面板 -->
      <div
          :class="[
            'control-panel-container',
            { 'mobile-panel': deviceInfo.isMobile, 'mobile-hidden': deviceInfo.isMobile && !showMobilePanel }
          ]"
          :style="{ width: deviceInfo.isMobile ? '100%' : `${panelWidth}px` }"
      >
        <ControlPanel
            :config="config"
            :device-info="deviceInfo"
            :is-exporting="isExporting.value"
            @export="exportPoster"
            @update-config="updateConfig"
            @update-poster="updatePoster"
        />

        <!-- 拖拽手柄 - 移动端隐藏 -->
        <div
            v-if="!deviceInfo.isMobile"
            class="resize-handle"
            @mousedown="startResize"
        ></div>
      </div>

      <!-- 右侧预览区域 -->
      <div :class="['preview-container', { 'mobile-preview': deviceInfo.isMobile }]">
        <PosterPreview
            ref="posterPreview"
            :config="config"
            :device-info="deviceInfo"
            :template-component="currentTemplate.component"
            @export="exportPoster"
        />
      </div>
    </div>

    <!-- 模板选择器 -->
    <div :class="['template-selector', { 'mobile-template': deviceInfo.isMobile }]">
      <div class="template-list">
        <div
            v-for="template in availableTemplates"
            :key="template.id"
            :class="[
              'template-item',
              { active: currentTemplateId === template.id },
              { 'mobile-item': deviceInfo.isMobile }
            ]"
            @click="switchTemplate(template.id)"
        >
          <div class="template-preview">
            <span>{{ template.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端遮罩 -->
    <div
        v-if="deviceInfo.isMobile && showMobilePanel"
        class="mobile-overlay"
        @click="toggleMobilePanel"
    ></div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast" @click="clearError">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
      <span class="error-close">✕</span>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-toast">
      <span class="success-icon">✅</span>
      <span class="success-text">{{ successMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import ControlPanel from '@/components/ControlPanel/index.vue'
import PosterPreview from '@/components/PosterPreview/index.vue'
import {usePosterConfig} from '@/composables/usePosterConfig'
import {useTemplateManager} from '@/composables/useTemplateManager'
import {useExport} from '@/composables/useExport'
import {useLocalStorage} from '@/composables/useCommon'
import {ResponsiveUtils} from '@/utils'

const {config, updateConfig} = usePosterConfig()
const {
  currentTemplateId,
  currentTemplate,
  availableTemplates,
  switchTemplate
} = useTemplateManager()
const {isExporting, exportPoster: exportPosterUtil} = useExport()
// const {width: windowWidth} = useWindowSize()

// 使用新的本地存储Hook
const [panelWidth, setPanelWidth] = useLocalStorage('posterPanelWidth', 380)

const posterPreview = ref<InstanceType<typeof PosterPreview>>()
const isResizing = ref(false)
const showMobilePanel = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 使用ResponsiveUtils获取设备信息
const deviceInfo = computed(() => ResponsiveUtils.getDeviceInfo())

// 清理视口变化监听器
let cleanupViewportListener: (() => void) | null = null

// 切换移动端面板显示
const toggleMobilePanel = () => {
  showMobilePanel.value = !showMobilePanel.value

  if (showMobilePanel.value && ResponsiveUtils.isTouchDevice()) {
    // 移动端打开面板时禁用页面滚动
    const cleanup = ResponsiveUtils.disableScroll()
    watch(() => showMobilePanel.value, (isOpen) => {
      if (!isOpen) cleanup()
    })
  }
}

// 监听模板切换，移动端自动关闭面板
watch(currentTemplateId, () => {
  if (deviceInfo.value.isMobile) {
    showMobilePanel.value = false
  }
})

// 监听设备方向变化
watch(() => deviceInfo.value.orientation, (newOrientation) => {
  console.log('设备方向变化:', newOrientation)
  if (deviceInfo.value.isMobile && showMobilePanel.value) {
    // 方向变化时重新调整面板
    showMobilePanel.value = false
  }
})

const updatePoster = () => {
  posterPreview.value?.$forceUpdate?.()
}

const exportPoster = async () => {
  try {
    clearMessages()

    const posterElement = posterPreview.value?.getPosterElement()
    if (!posterElement) {
      throw new Error('未找到海报元素')
    }

    // 生成文件名
    const filename = generateFileName()

    await exportPosterUtil(posterElement, config, filename)

    showSuccess('海报导出成功！')

    // 移动端导出成功后关闭面板
    if (deviceInfo.value.isMobile) {
      showMobilePanel.value = false
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : '导出失败，请重试'
    showError(message)
  }
}

// 生成文件名
const generateFileName = (): string => {
  const timestamp = new Date().toLocaleDateString('sv-SE')
  const title = config.title || '海报'
  const transparentSuffix = config.isTransparentBackground ? '_透明' : ''

  let resolutionSuffix = ''
  if (config.resolution === 'custom' && config.customWidth && config.customHeight) {
    resolutionSuffix = `_${config.customWidth}x${config.customHeight}`
  } else {
    const resolutions = {
      'hd': '_1920x2720',
      '2k': '_2560x3627',
      '4k': '_3840x5440',
      'custom': `_${config.customWidth || 2560}x${config.customHeight || 3627}`
    }
    resolutionSuffix = resolutions[config.resolution] || '_2560x3627'
  }

  return `${title}_${timestamp}${transparentSuffix}${resolutionSuffix}`
}

// 消息管理
const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const clearError = () => {
  errorMessage.value = ''
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// 拖拽调整面板宽度
const startResize = (e: MouseEvent) => {
  if (deviceInfo.value.isMobile) return

  isResizing.value = true
  const startX = e.clientX
  const startWidth = panelWidth.value

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return

    const newWidth = startWidth + (e.clientX - startX)
    const clampedWidth = Math.max(300, Math.min(600, newWidth))
    setPanelWidth(clampedWidth)
  }

  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

onMounted(() => {
  // 设置视口元标签
  ResponsiveUtils.setViewportMeta({
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 5.0,
    userScalable: true
  })

  // 监听视口变化
  cleanupViewportListener = ResponsiveUtils.onViewportChange((info) => {
    // 桌面端时自动显示面板
    if (!info.isMobile) {
      showMobilePanel.value = false
    }
  })
})

onUnmounted(() => {
  cleanupViewportListener?.()
})
</script>

<style scoped>
.app {
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.app-layout {
  flex: 1;
  display: flex;
  height: calc(100vh - 80px);
  min-height: 0;
}

/* 移动端控制按钮 */
.mobile-controls {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1001;
  display: none;
}

.mobile-toggle-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  touch-action: manipulation;
}

.mobile-toggle-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.mobile-toggle-btn.active {
  background: #dc2626;
}

.toggle-icon {
  font-size: 16px;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  backdrop-filter: blur(2px);
}

.control-panel-container {
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: white;
  border-right: 2px solid #e9ecef;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: transparent;
  cursor: ew-resize;
  z-index: 1000;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background: #3b82f6;
  opacity: 0.5;
}

.resize-handle:active {
  background: #3b82f6;
  opacity: 0.8;
}

.preview-container {
  flex: 1;
  height: 100%;
  overflow: auto;
  background: #f8fafc;
  min-width: 0;
}

.template-selector {
  height: 80px;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.template-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.template-list::-webkit-scrollbar {
  height: 4px;
}

.template-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.template-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.template-item {
  min-width: 120px;
  height: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  flex-shrink: 0;
  touch-action: manipulation;
}

.template-item:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

.template-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.template-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  padding: 0 8px;
  text-align: center;
  user-select: none;
}

.template-item.active .template-preview {
  color: #3b82f6;
}

/* 消息提示样式 */
.error-toast,
.success-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1002;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease;
  max-width: 90vw;
}

.error-toast {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  cursor: pointer;
}

.success-toast {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.error-close {
  margin-left: 8px;
  cursor: pointer;
  font-weight: bold;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ===== 移动端样式 ===== */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    height: calc(100vh - 60px);
  }

  .mobile-controls {
    display: block;
  }

  .mobile-overlay {
    display: block;
  }

  .control-panel-container.mobile-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 70vh;
    z-index: 1000;
    border-right: none;
    border-bottom: 2px solid #e9ecef;
    transform: translateY(0);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .control-panel-container.mobile-hidden {
    transform: translateY(-100%);
  }

  .preview-container.mobile-preview {
    height: 100%;
    padding-top: 60px;
  }

  .template-selector.mobile-template {
    height: 60px;
    padding: 8px 15px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
  }

  .template-item.mobile-item {
    min-width: 100px;
    height: 44px;
    min-height: 44px;
  }

  .template-preview {
    font-size: 12px;
    padding: 0 6px;
  }

  .template-list {
    gap: 10px;
  }

  .error-toast,
  .success-toast {
    top: 70px;
    max-width: calc(100vw - 20px);
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .control-panel-container.mobile-panel {
    height: 75vh;
  }

  .mobile-toggle-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .template-item.mobile-item {
    min-width: 80px;
    height: 40px;
    min-height: 40px;
  }

  .template-preview {
    font-size: 11px;
  }
}

/* 横屏适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .control-panel-container.mobile-panel {
    height: 90vh;
  }

  .app-layout {
    height: calc(100vh - 50px);
  }

  .template-selector.mobile-template {
    height: 50px;
    padding: 5px 15px;
  }

  .template-item.mobile-item {
    height: 40px;
    min-height: 40px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: more) {
  .template-item {
    border-width: 3px;
  }

  .error-toast,
  .success-toast {
    border-width: 2px;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .mobile-toggle-btn,
  .template-item,
  .control-panel-container {
    transition: none;
  }

  .error-toast,
  .success-toast {
    animation: none;
  }
}
</style>