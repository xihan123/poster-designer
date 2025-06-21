<template>
  <div class="settings-section">
    <div class="section-header">
      <h4>📤 导出设置</h4>
    </div>

    <!-- 输出分辨率 -->
    <div class="form-group">
      <label class="form-label">📏 输出分辨率</label>
      <select
          :value="config.resolution"
          class="form-select"
          @change="handleResolutionChange"
      >
        <option value="hd">高清 HD (1920×2720)</option>
        <option value="2k">2K 超清 (2560×3627)</option>
        <option value="4k">4K 极清 (3840×5440)</option>
        <option value="custom">自定义分辨率</option>
      </select>

      <!-- 自定义分辨率 -->
      <div v-if="config.resolution === 'custom'" class="custom-resolution">
        <div class="row">
          <div class="col-6">
            <label class="input-label">宽度 (px)</label>
            <input
                :value="config.customWidth || 2560"
                class="form-control"
                max="10000"
                min="600"
                placeholder="宽度"
                type="number"
                @input="handleWidthChange"
            />
          </div>
          <div class="col-6">
            <label class="input-label">高度 (px)</label>
            <input
                :value="config.customHeight || 3627"
                class="form-control"
                max="15000"
                min="850"
                placeholder="高度"
                type="number"
                @input="handleHeightChange"
            />
          </div>
        </div>

        <div class="preset-ratios">
          <button
              v-for="ratio in aspectRatios"
              :key="ratio.name"
              class="ratio-btn"
              @click="applyAspectRatio(ratio)"
          >
            {{ ratio.name }}
          </button>
        </div>
      </div>
      <div class="tips">{{ resolutionTips }}</div>
    </div>

    <!-- 输出格式 -->
    <div class="form-group">
      <label class="form-label">🖼️ 输出格式</label>
      <div class="format-selector">
        <div
            v-for="format in formats"
            :key="format.value"
            :class="['format-option', { active: config.format === format.value }]"
            @click="selectFormat(format.value)"
        >
          <div class="format-icon">{{ format.icon }}</div>
          <div class="format-details">
            <div class="format-name">{{ format.name }}</div>
            <div class="format-desc">{{ format.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景设置 -->
    <div class="form-group">
      <label class="form-label">🎭 背景设置</label>
      <div class="toggle-group">
        <label class="toggle-switch">
          <input
              :checked="config.isTransparentBackground"
              type="checkbox"
              @change="toggleTransparentBg"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">透明背景 (仅 PNG 格式)</span>
      </div>
    </div>

    <!-- 质量设置 -->
    <div v-if="config.format === 'jpg'" class="form-group">
      <label class="form-label">🎨 图片质量</label>
      <div class="quality-control">
        <input
            :value="config.quality || 0.92"
            class="quality-slider"
            max="1"
            min="0.5"
            step="0.05"
            type="range"
            @input="handleQualityChange"
        />
        <div class="quality-info">
          <span class="quality-value">{{ Math.round((config.quality || 0.92) * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- 导出操作按钮 -->
    <div class="export-actions">
      <button
          :disabled="isExporting"
          class="btn btn-primary w-100 mb-2"
          @click="$emit('update-poster')"
      >
        🔄 更新预览
      </button>

      <button
          :disabled="isExporting"
          class="btn btn-success w-100"
          @click="$emit('export')"
      >
        {{ isExporting ? `📸 生成中...` : '📥 下载海报' }}
      </button>
    </div>

    <!-- 导出进度提示 -->
    <div v-if="isExporting" class="export-progress">
      <div class="progress-container">
        <div class="progress-bar">
          <div
              :style="{ width: exportProgress + '%' }"
              class="progress-fill"
          ></div>
        </div>
        <div class="progress-text">
          <span class="progress-stage">{{ exportStage }}</span>
          <span class="progress-percent">{{ Math.round(exportProgress) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, watch} from 'vue'
import type {PosterConfig} from '@/types/poster'

interface Props {
  config: PosterConfig
  isExporting?: boolean
  exportProgress?: number
  exportStage?: string
  deviceInfo?: {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
}

interface Emits {
  (e: 'update', config: Partial<PosterConfig>): void

  (e: 'export'): void

  (e: 'update-poster'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 格式选项
const formats = [
  {
    value: 'png',
    name: 'PNG',
    icon: '🖼️',
    description: '无损格式，支持透明背景'
  },
  {
    value: 'jpg',
    name: 'JPEG',
    icon: '📷',
    description: '小体积，不支持透明背景'
  }
]

// 宽高比预设
const aspectRatios = [
  {name: '2:3', ratio: 2 / 3},
  {name: '3:4', ratio: 3 / 4},
  {name: '1:1', ratio: 1},
  {name: '16:9', ratio: 16 / 9}
]

// Watch for format changes
watch(() => props.config.format, (newFormat) => {
  // If changing to JPG and transparent bg is enabled, disable transparent bg
  if (newFormat === 'jpg' && props.config.isTransparentBackground) {
    emit('update', {isTransparentBackground: false})
  }
})

// 计算属性
const resolutionTips = computed(() => {
  const tips = {
    'hd': '适合网络分享，文件较小',
    '2k': '推荐选择，清晰度与文件大小平衡',
    '4k': '超高清晰度，适合印刷，文件较大',
    'custom': '自定义尺寸，适合特殊需求'
  }
  return tips[props.config.resolution] || '请选择合适的分辨率'
})

// Toggle transparent background
const toggleTransparentBg = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked

  // If trying to enable transparent bg with JPG format, show warning
  if (isChecked && props.config.format === 'jpg') {
    alert('JPEG格式不支持透明背景，请先切换为PNG格式')
    return
  }

  emit('update', {isTransparentBackground: isChecked})
}

const handleResolutionChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as PosterConfig['resolution']
  emit('update', {resolution: value})
}

const handleWidthChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  emit('update', {customWidth: value})
}

const handleHeightChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  emit('update', {customHeight: value})
}

const selectFormat = (format: 'png' | 'jpg') => {
  // If switching to JPG with transparent bg enabled, disable transparent bg
  if (format === 'jpg' && props.config.isTransparentBackground) {
    emit('update', {
      format,
      isTransparentBackground: false
    })
  } else {
    emit('update', {format})
  }
}

const handleQualityChange = (event: Event) => {
  const quality = parseFloat((event.target as HTMLInputElement).value)
  emit('update', {quality})
}

const applyAspectRatio = (ratio: { name: string, ratio: number }) => {
  const currentWidth = props.config.customWidth || 2560
  const newHeight = Math.round(currentWidth / ratio.ratio)
  emit('update', {
    customHeight: Math.max(850, Math.min(15000, newHeight))
  })
}
</script>

<style scoped>
.settings-section {
  background: white;
  padding: 20px;
  margin: 0;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h4 {
  color: #2c5aa0;
  margin: 0;
  font-weight: 700;
  font-size: 18px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
  display: block;
  font-size: 14px;
}

.form-select,
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-select:focus,
.form-control:focus {
  outline: none;
  border-color: #2c5aa0;
}

.custom-resolution {
  margin-top: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.preset-ratios {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.ratio-btn {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6c757d;
  font-size: 11px;
  cursor: pointer;
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.col-6 {
  flex: 1;
  min-width: 0;
}

.input-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  display: block;
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2c5aa0;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-size: 14px;
  color: #4b5563;
}

.format-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.format-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  background: white;
}

.format-option:hover {
  border-color: #3b82f6;
}

.format-option.active {
  border-color: #2c5aa0;
  background: #eff6ff;
}

.format-icon {
  font-size: 24px;
  margin-right: 12px;
}

.format-details {
  flex: 1;
}

.format-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin-bottom: 2px;
}

.format-desc {
  color: #6c757d;
  font-size: 12px;
}

.quality-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.quality-slider {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  outline: none;
  border-radius: 3px;
  cursor: pointer;
}

.quality-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #2c5aa0;
  border-radius: 50%;
  cursor: pointer;
}

.quality-info {
  min-width: 60px;
  text-align: center;
}

.quality-value {
  font-weight: 600;
  color: #2c5aa0;
  font-size: 14px;
}

.export-actions {
  margin: 24px 0 0 0;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #2c5aa0;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3d6f;
}

.btn-success {
  background: #198754;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #157347;
}

.w-100 {
  width: 100%;
}

.mb-2 {
  margin-bottom: 10px;
}

.export-progress {
  margin-top: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.progress-container {
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #198754, #20c997);
  border-radius: 4px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}

.progress-stage {
  color: #374151;
}

.progress-percent {
  color: #198754;
}

.tips {
  background: #f8f9fa;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  border-left: 3px solid #e9ecef;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .settings-section {
    padding: 15px;
  }

  .row {
    flex-direction: column;
    gap: 8px;
  }

  .form-control {
    padding: 10px 12px;
    font-size: 16px;
    min-height: 44px;
  }
}
</style>