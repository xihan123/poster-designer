<template>
  <div class="settings-section">
    <div class="section-header">
      <h4>📋 基本设置</h4>
    </div>

    <div class="header-settings">
      <!-- 标题设置 -->
      <div class="form-group">
        <label>主标题</label>
        <input
            :value="config.title"
            class="form-control"
            placeholder="输入海报主标题"
            type="text"
            @input="updateTitle"
        />
      </div>

      <div class="form-group">
        <label>副标题</label>
        <input
            :value="config.subtitle"
            class="form-control"
            placeholder="输入海报副标题"
            type="text"
            @input="updateSubtitle"
        />
      </div>

      <!-- 标题样式设置 -->
      <div class="title-style">
        <h5>样式设置</h5>
        <div class="style-options">
          <div class="option-group">
            <label>标题大小</label>
            <div class="slider-group">
              <input
                  :value="titleFontSize"
                  max="60"
                  min="24"
                  type="range"
                  @input="updateTitleFontSize"
              />
              <span class="value-display">{{ titleFontSize }}px</span>
            </div>
          </div>

          <div class="option-group">
            <label>副标题大小</label>
            <div class="slider-group">
              <input
                  :value="subtitleFontSize"
                  max="32"
                  min="16"
                  type="range"
                  @input="updateSubtitleFontSize"
              />
              <span class="value-display">{{ subtitleFontSize }}px</span>
            </div>
          </div>

          <div class="option-group alignment">
            <label>对齐方式</label>
            <div class="alignment-options">
              <button
                  v-for="align in alignmentOptions"
                  :key="align.value"
                  :class="['align-btn', { active: headerAlignment === align.value }]"
                  @click="updateAlignment(align.value)"
              >
                {{ align.icon }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日期设置 -->
      <div class="date-settings">
        <h5>日期设置</h5>
        <div class="auto-date-toggle">
          <label class="switch-label">
            <input
                :checked="config.isAutoDate"
                type="checkbox"
                @change="toggleAutoDate"
            />
            <span class="toggle-label">自动使用当前日期</span>
          </label>
        </div>

        <div v-if="!config.isAutoDate" class="date-inputs">
          <div class="date-row">
            <div class="date-field">
              <label>年份</label>
              <input
                  :value="config.year"
                  class="form-control"
                  max="2030"
                  min="2020"
                  type="number"
                  @input="updateYear"
              />
            </div>

            <div class="date-field">
              <label>月份</label>
              <input
                  :value="config.month"
                  class="form-control"
                  max="12"
                  min="1"
                  type="number"
                  @input="updateMonth"
              />
            </div>

            <div class="date-field">
              <label>日期</label>
              <input
                  :value="config.day"
                  class="form-control"
                  max="31"
                  min="1"
                  type="number"
                  @input="updateDay"
              />
            </div>
          </div>

          <div class="lunar-date">
            <span>农历: {{ config.lunarDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import type {PosterConfig} from '@/types/poster'

const props = defineProps<{
  config: PosterConfig
}>()

const emit = defineEmits<{
  (e: 'update', config: Partial<PosterConfig>): void
}>()

// Initial values from config or defaults
const titleFontSize = ref(props.config.textBlocks?.find(b => b.id === 'title')?.style?.fontSize || 42)
const subtitleFontSize = ref(props.config.textBlocks?.find(b => b.id === 'subtitle')?.style?.fontSize || 24)
const headerAlignment = ref(props.config.textBlocks?.find(b => b.id === 'title')?.style?.alignment || 'center')

const alignmentOptions = [
  {value: 'left', icon: '⟮'},
  {value: 'center', icon: '☰'},
  {value: 'right', icon: '⟯'}
]

// Update handlers
const updateTitle = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update', {title: value})
}

const updateSubtitle = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update', {subtitle: value})
}

const updateTitleFontSize = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  titleFontSize.value = value

  // Find and update the title block
  const titleBlock = props.config.textBlocks?.find(b => b.id === 'title')
  if (titleBlock) {
    emit('update', {
      textBlocks: props.config.textBlocks.map(block =>
          block.id === 'title'
              ? {...block, style: {...block.style, fontSize: value}}
              : block
      )
    })
  }
}

const updateSubtitleFontSize = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  subtitleFontSize.value = value

  // Find and update the subtitle block
  const subtitleBlock = props.config.textBlocks?.find(b => b.id === 'subtitle')
  if (subtitleBlock) {
    emit('update', {
      textBlocks: props.config.textBlocks.map(block =>
          block.id === 'subtitle'
              ? {...block, style: {...block.style, fontSize: value}}
              : block
      )
    })
  }
}

const updateAlignment = (alignment: string) => {
  headerAlignment.value = alignment

  // Update all header blocks to the same alignment
  emit('update', {
    textBlocks: props.config.textBlocks.map(block =>
        (block.id === 'title' || block.id === 'subtitle')
            ? {...block, style: {...block.style, alignment: alignment}}
            : block
    )
  })
}

const toggleAutoDate = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked
  emit('update', {isAutoDate: isChecked})

  if (isChecked) {
    // Set to current date
    const today = new Date()
    emit('update', {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    })
  }
}

const updateYear = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update', {year: value})
}

const updateMonth = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update', {month: value})
}

const updateDay = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update', {day: value})
}
</script>

<style scoped>
.settings-section {
  padding: 15px;
  background-color: white;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h4 {
  color: #2c5aa0;
  margin: 0;
  font-weight: 700;
  font-size: 18px;
}

.header-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.title-style, .date-settings {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e2e8f0;
}

h5 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

.style-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.slider-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.slider-group input[type="range"] {
  flex: 1;
  height: 6px;
}

.value-display {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.alignment-options {
  display: flex;
  gap: 10px;
}

.align-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.align-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.align-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.auto-date-toggle {
  margin-bottom: 15px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.switch-label input {
  width: 18px;
  height: 18px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.date-inputs {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.date-row {
  display: flex;
  gap: 10px;
}

.date-field {
  flex: 1;
}

.date-field label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  display: block;
}

.lunar-date {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .form-control, input[type="number"], .align-btn {
    min-height: 44px; /* Improve touch targets */
  }

  .date-row {
    flex-wrap: wrap;
  }

  .date-field {
    min-width: 100px;
  }
}
</style>