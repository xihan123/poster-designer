<template>
  <div class="theme-manager">
    <div class="section-header">
      <h4>🎨 设计主题</h4>
    </div>

    <div class="theme-selector">
      <div class="preset-themes">
        <h5>预设主题</h5>
        <div class="theme-presets">
          <div
              v-for="theme in themePresets"
              :key="theme.id"
              :style="{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }"
              class="theme-preset"
              @click="applyPresetTheme(theme)"
          >
            <div class="theme-name">{{ theme.name }}</div>
          </div>
        </div>
      </div>

      <div class="custom-theme">
        <h5>自定义主题</h5>

        <div class="color-settings">
          <div class="color-row">
            <div class="color-group">
              <label>主题色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.primaryColor"
                    type="color"
                    @input="updateThemeColor('primaryColor', $event)"
                />
                <input
                    :value="config.theme.primaryColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('primaryColor', $event)"
                />
              </div>
            </div>

            <div class="color-group">
              <label>次要色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.secondaryColor"
                    type="color"
                    @input="updateThemeColor('secondaryColor', $event)"
                />
                <input
                    :value="config.theme.secondaryColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('secondaryColor', $event)"
                />
              </div>
            </div>
          </div>

          <div class="color-row">
            <div class="color-group">
              <label>强调色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.accentColor"
                    type="color"
                    @input="updateThemeColor('accentColor', $event)"
                />
                <input
                    :value="config.theme.accentColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('accentColor', $event)"
                />
              </div>
            </div>

            <div class="color-group">
              <label>警告色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.warningColor"
                    type="color"
                    @input="updateThemeColor('warningColor', $event)"
                />
                <input
                    :value="config.theme.warningColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('warningColor', $event)"
                />
              </div>
            </div>
          </div>

          <div class="color-row">
            <div class="color-group">
              <label>文本颜色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.textColor"
                    type="color"
                    @input="updateThemeColor('textColor', $event)"
                />
                <input
                    :value="config.theme.textColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('textColor', $event)"
                />
              </div>
            </div>

            <div class="color-group">
              <label>背景颜色</label>
              <div class="color-input-group">
                <input
                    :value="config.theme.backgroundColor"
                    type="color"
                    @input="updateThemeColor('backgroundColor', $event)"
                />
                <input
                    :value="config.theme.backgroundColor"
                    class="color-text-input"
                    type="text"
                    @input="updateThemeColor('backgroundColor', $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="theme-actions">
          <button class="btn" @click="generateRandomTheme">随机生成</button>
          <button class="btn primary" @click="saveCurrentTheme">保存为预设</button>
        </div>
      </div>

      <div v-if="showSaveDialog" class="save-dialog">
        <div class="dialog-header">
          <h5>保存主题</h5>
          <button class="close-btn" @click="showSaveDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <label>主题名称</label>
          <input v-model="newThemeName" class="form-control" placeholder="输入主题名称" type="text">
          <div class="dialog-actions">
            <button class="btn" @click="showSaveDialog = false">取消</button>
            <button class="btn primary" @click="confirmSaveTheme">保存</button>
          </div>
        </div>
      </div>
    </div>

    <div class="theme-preview">
      <h5>主题预览</h5>
      <div :style="{ background: config.theme.backgroundColor }" class="preview-palette">
        <div :style="{ background: config.theme.primaryColor }" class="color-preview primary">
          <span>主题色</span>
        </div>
        <div :style="{ background: config.theme.secondaryColor }" class="color-preview secondary">
          <span>次要色</span>
        </div>
        <div :style="{ background: config.theme.accentColor }" class="color-preview accent">
          <span>强调色</span>
        </div>
        <div :style="{ background: config.theme.warningColor, color: getContrastColor(config.theme.warningColor) }"
             class="color-preview warning">
          <span>警告色</span>
        </div>
        <div :style="{ color: config.theme.textColor }" class="text-preview">
          <p>这是正文预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {ColorUtils} from '@/utils/colorUtils'
import {useLocalStorage} from '@/composables/useCommon'
import type {PosterConfig, ThemeConfig} from '@/types/poster'

const props = defineProps<{
  config: PosterConfig
}>()

const emit = defineEmits<{
  (e: 'update', config: Partial<PosterConfig>): void
}>()

// Default theme presets
const defaultPresets = [
  {
    id: 'police-blue',
    name: '警察蓝',
    primaryColor: '#2c5aa0',
    secondaryColor: '#1e3a8a',
    accentColor: '#0284c7',
    textColor: '#1e293b',
    backgroundColor: '#f1f5f9',
    warningColor: '#dc2626'
  },
  {
    id: 'government-red',
    name: '政府红',
    primaryColor: '#b91c1c',
    secondaryColor: '#7f1d1d',
    accentColor: '#f97316',
    textColor: '#1e293b',
    backgroundColor: '#f5f5f4',
    warningColor: '#b91c1c'
  },
  {
    id: 'cyber-modern',
    name: '科技蓝',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#06b6d4',
    textColor: '#0f172a',
    backgroundColor: '#f1f5f9',
    warningColor: '#dc2626'
  },
  {
    id: 'formal-dark',
    name: '庄重黑',
    primaryColor: '#334155',
    secondaryColor: '#0f172a',
    accentColor: '#6366f1',
    textColor: '#1e293b',
    backgroundColor: '#f8fafc',
    warningColor: '#b91c1c'
  },
  {
    id: 'forest-green',
    name: '森林绿',
    primaryColor: '#166534',
    secondaryColor: '#14532d',
    accentColor: '#65a30d',
    textColor: '#1e293b',
    backgroundColor: '#f7fee7',
    warningColor: '#b91c1c'
  }
]

// User custom themes stored in localStorage
const [userThemes, setUserThemes] = useLocalStorage<typeof defaultPresets>('userThemePresets', [])

// Combined theme presets
const themePresets = computed(() => {
  return [...defaultPresets, ...userThemes.value]
})

// Dialog state
const showSaveDialog = ref(false)
const newThemeName = ref('')

// Apply a preset theme
const applyPresetTheme = (theme: any) => {
  emit('update', {
    theme: {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      textColor: theme.textColor,
      backgroundColor: theme.backgroundColor,
      warningColor: theme.warningColor,
      customColors: props.config.theme.customColors || {}
    }
  })
}

// Update individual theme color
const updateThemeColor = (colorKey: keyof ThemeConfig, event: Event) => {
  const value = (event.target as HTMLInputElement).value

  // Validate hex color
  if (!/^#[0-9A-F]{6}$/i.test(value) && event.type === 'input' && (event.target as HTMLInputElement).type === 'text') {
    return
  }

  emit('update', {
    theme: {
      ...props.config.theme,
      [colorKey]: value
    }
  })
}

// Generate a random theme
const generateRandomTheme = () => {
  const primaryHue = Math.floor(Math.random() * 360)
  const secondaryHue = (primaryHue + 30) % 360
  const accentHue = (primaryHue + 180) % 360

  const primary = ColorUtils.hslToHex(primaryHue, 70, 40)
  const secondary = ColorUtils.hslToHex(secondaryHue, 80, 30)
  const accent = ColorUtils.hslToHex(accentHue, 80, 50)

  emit('update', {
    theme: {
      ...props.config.theme,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent
    }
  })
}

// Save the current theme
const saveCurrentTheme = () => {
  showSaveDialog.value = true
  newThemeName.value = '自定义主题'
}

// Confirm theme save
const confirmSaveTheme = () => {
  if (!newThemeName.value.trim()) return

  const newTheme = {
    id: 'custom-' + Date.now(),
    name: newThemeName.value.trim(),
    primaryColor: props.config.theme.primaryColor,
    secondaryColor: props.config.theme.secondaryColor,
    accentColor: props.config.theme.accentColor,
    textColor: props.config.theme.textColor,
    backgroundColor: props.config.theme.backgroundColor,
    warningColor: props.config.theme.warningColor
  }

  const updatedThemes = [...userThemes.value, newTheme]
  setUserThemes(updatedThemes)
  showSaveDialog.value = false
}

// Get contrast color for text visibility
const getContrastColor = (bgColor: string): string => {
  return ColorUtils.getContrastColor(bgColor)
}
</script>

<style scoped>
.theme-manager {
  padding: 15px 0;
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

.theme-selector {
  margin-bottom: 20px;
  position: relative;
}

h5 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

.preset-themes {
  margin-bottom: 20px;
}

.theme-presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.theme-preset {
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  display: flex;
  align-items: flex-end;
  touch-action: manipulation;
}

.theme-preset:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.theme-name {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 100%;
  text-align: center;
  padding: 5px;
  font-size: 12px;
  font-weight: 500;
}

.custom-theme {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e2e8f0;
}

.color-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.color-row {
  display: flex;
  gap: 15px;
}

.color-group {
  flex: 1;
  min-width: 0;
}

.color-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input-group input[type="color"] {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  min-width: 0;
}

.theme-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  min-height: 38px;
}

.btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.btn.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.btn.primary:hover {
  background: #1d4ed8;
}

/* Theme save dialog */
.save-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.dialog-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h5 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
}

.dialog-body {
  padding: 15px;
}

.dialog-body label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
  display: block;
}

.dialog-body .form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 15px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Theme preview */
.theme-preview {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e2e8f0;
}

.preview-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 15px;
  border-radius: 6px;
}

.color-preview {
  height: 70px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-preview span {
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.text-preview {
  grid-column: 1 / -1;
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .color-row {
    flex-direction: column;
    gap: 10px;
  }

  .preview-palette {
    grid-template-columns: 1fr 1fr;
  }

  .color-input-group input[type="color"] {
    width: 32px;
    height: 32px;
  }

  .theme-preset {
    height: 60px;
  }

  .theme-name {
    font-size: 10px;
    padding: 3px;
  }

  .theme-preview {
    padding: 10px;
  }

  .color-preview {
    height: 50px;
  }

  .color-preview span {
    font-size: 10px;
  }

  .dialog-body .form-control {
    font-size: 12px;
  }

  .btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .btn.primary {
    font-size: 12px;
  }

  .dialog-header h5 {
    font-size: 14px;
  }

  .dialog-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .dialog-actions .btn {
    width: 100%;
  }

  .dialog-actions .btn.primary {
    margin-top: 10px;
  }

  .save-dialog {
    width: 90%;
    max-width: 400px;
  }

  .theme-selector {
    padding: 10px;
  }

  .theme-selector h5 {
    font-size: 14px;
  }

  .theme-selector .preset-themes {
    margin-bottom: 15px;
  }

  .theme-selector .custom-theme {
    padding: 10px;
  }

  .theme-selector .color-settings {
    gap: 10px;
  }

  .theme-selector .color-row {
    flex-direction: column;
    gap: 10px;
  }

  .theme-selector .color-group {
    width: 100%;
  }

  .theme-selector .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .theme-selector .color-input-group input[type="color"] {
    width: 100%;
    height: 36px;
  }

  .theme-selector .color-text-input {
    width: 100%;
  }

  .theme-selector .theme-actions {
    flex-direction: column;
    gap: 10px;
  }

  .theme-selector .theme-actions .btn {
    width: 100%;
  }

  .theme-selector .theme-actions .btn.primary {
    margin-top: 10px;
  }

  .theme-selector .save-dialog {
    width: 90%;
    max-width: 400px;
  }

  .theme-selector .save-dialog .dialog-body {
    padding: 10px;
  }

  .theme-selector .save-dialog .dialog-body label {
    font-size: 12px;
  }

  .theme-selector .save-dialog .dialog-body .form-control {
    font-size: 12px;
    padding: 6px 10px;
  }

  .theme-selector .save-dialog .dialog-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .theme-selector .save-dialog .dialog-actions .btn {
    width: 100%;
  }

  .theme-selector .save-dialog .dialog-actions .btn.primary {
    margin-top: 10px;
  }

  .theme-selector .save-dialog .close-btn {
    font-size: 14px;
  }

  .theme-selector .save-dialog .dialog-header h5 {
    font-size: 16px;
  }

  .theme-selector .save-dialog .dialog-header {
    padding: 10px;
  }

  .theme-selector .save-dialog .dialog-header .close-btn {
    font-size: 16px;
  }

  .theme-selector .save-dialog .dialog-body {
    padding: 10px;
  }

  .theme-selector .save-dialog .dialog-body label {
    font-size: 12px;
  }

  .theme-selector .save-dialog .dialog-body .form-control {
    font-size: 12px;
    padding: 6px 10px;
  }

  .theme-selector .save-dialog .dialog-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .theme-selector .save-dialog .dialog-actions .btn {
    width: 100%;
  }

  .theme-selector .save-dialog .dialog-actions .btn.primary {
    margin-top: 10px;
  }
}
</style>