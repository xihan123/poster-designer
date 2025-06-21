<template>
  <div class="element-settings-panel">
    <div class="section-header">
      <h4>🧩 内容元素管理</h4>
    </div>

    <div class="element-types">
      <button
          v-for="type in elementTypes"
          :key="type.id"
          :class="['element-type-btn', { active: activeElementType === type.id }]"
          @click="setActiveElementType(type.id)"
      >
        <span class="element-icon">{{ type.icon }}</span>
        <span class="element-name">{{ type.name }}</span>
      </button>
    </div>

    <!-- Logo Settings -->
    <div v-if="activeElementType === 'logo'" class="element-settings">
      <h5>Logo 设置</h5>
      <div class="upload-container">
        <div
            :class="{ 'has-image': !!config.logo?.source }"
            class="image-preview"
        >
          <img v-if="config.logo?.source" :src="config.logo.source" alt="Logo"/>
          <div v-else class="upload-placeholder">
            <span class="upload-icon">📷</span>
            <span>点击上传 Logo</span>
          </div>
        </div>
        <input
            accept="image/*"
            class="file-input"
            type="file"
            @change="handleLogoUpload"
        />
      </div>

      <!-- Logo controls -->
      <div v-if="config.logo?.source" class="image-controls">
        <button class="delete-image-btn" @click="deleteLogo">
          <span class="delete-icon">🗑️</span> 删除 Logo
        </button>
      </div>

      <div class="position-controls">
        <label>位置调整</label>
        <div class="position-sliders">
          <div class="slider-group">
            <label>X 位置:</label>
            <input
                :value="config.logo?.position.x || 0"
                max="150"
                min="-150"
                type="range"
                @input="updateLogoPosition('x', $event)"
            />
            <span class="value-display">{{ config.logo?.position.x || 0 }}</span>
          </div>
          <div class="slider-group">
            <label>Y 位置:</label>
            <input
                :value="config.logo?.position.y || 0"
                max="150"
                min="-150"
                type="range"
                @input="updateLogoPosition('y', $event)"
            />
            <span class="value-display">{{ config.logo?.position.y || 0 }}</span>
          </div>
          <div class="slider-group">
            <label>大小:</label>
            <input
                :value="config.logo?.size.width || 100"
                max="300"
                min="20"
                type="range"
                @input="updateLogoSize($event)"
            />
            <span class="value-display">{{ config.logo?.size.width || 100 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Case Management -->
    <div v-if="activeElementType === 'cases'" class="element-settings">
      <h5>案例管理</h5>
      <div class="case-list">
        <draggable
            v-model="caseList"
            class="cases-draggable"
            handle=".case-drag-handle"
            item-key="id"
            @change="updateCaseOrder"
        >
          <template #item="{element: caseItem, index}">
            <div class="case-item">
              <div class="case-header">
                <span class="case-drag-handle">⋮⋮</span>
                <span class="case-title">{{ caseItem.title || `案例 ${index + 1}` }}</span>
                <div class="case-actions">
                  <button class="case-action-btn" @click="toggleCaseExpand(caseItem.id)">
                    {{ caseItem.isExpanded ? '收起' : '展开' }}
                  </button>
                  <button class="case-action-btn delete-btn" @click="deleteCase(caseItem.id)">
                    ✕
                  </button>
                </div>
              </div>

              <div v-if="caseItem.isExpanded" class="case-editor">
                <div class="form-group">
                  <label>标题:</label>
                  <input
                      v-model="caseItem.title"
                      class="form-control"
                      type="text"
                      @input="updateCase(caseItem.id, 'title', $event.target.value)"
                  />
                </div>
                <div class="form-group">
                  <label>内容:</label>
                  <textarea
                      v-model="caseItem.content"
                      class="form-control"
                      rows="4"
                      @input="updateCase(caseItem.id, 'content', $event.target.value)"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>高亮关键词：</label>
                  <div class="highlight-tags">
                    <span
                        v-for="(tag, i) in caseItem.highlights"
                        :key="i"
                        class="highlight-tag"
                    >
                      {{ tag }}
                      <button class="tag-remove" @click="removeHighlight(caseItem.id, i)">✕</button>
                    </span>
                    <input
                        v-model="newHighlight"
                        class="highlight-input"
                        placeholder="添加关键词"
                        type="text"
                        @keyup.enter="addHighlight(caseItem.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <button class="add-item-btn" @click="addNewCase">
          <span class="add-icon">+</span> 添加案例
        </button>
      </div>
    </div>

    <!-- Warning Tips Management -->
    <div v-if="activeElementType === 'warnings'" class="element-settings">
      <h5>警方提示</h5>
      <div class="warning-list">
        <draggable
            v-model="warningTips"
            class="warnings-draggable"
            handle=".warning-drag-handle"
            item-key="id"
            @change="updateWarningOrder"
        >
          <template #item="{element: warning, index}">
            <div class="warning-item">
              <div class="warning-header">
                <span class="warning-drag-handle">⋮⋮</span>
                <span class="warning-title">提示 {{ index + 1 }}</span>
                <div class="warning-actions">
                  <button class="warning-action-btn delete-btn" @click="deleteWarning(warning.id)">
                    ✕
                  </button>
                </div>
              </div>

              <div class="warning-editor">
                <div class="form-group">
                  <label>内容:</label>
                  <textarea
                      v-model="warning.content"
                      class="form-control warning-textarea"
                      rows="2"
                      @input="updateWarning(warning.id, 'content', $event.target.value)"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>样式:</label>
                  <div class="style-controls">
                    <div class="color-picker">
                      <label>颜色:</label>
                      <input
                          :value="warning.style.color"
                          type="color"
                          @input="updateWarningStyle(warning.id, 'color', $event.target.value)"
                      />
                    </div>
                    <div class="size-control">
                      <label>字号:</label>
                      <input
                          :value="warning.style.fontSize"
                          max="32"
                          min="12"
                          type="number"
                          @input="updateWarningStyle(warning.id, 'fontSize', Number($event.target.value))"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <button class="add-item-btn" @click="addNewWarning">
          <span class="add-icon">+</span> 添加警方提示
        </button>
      </div>
    </div>

    <!-- Police Image Settings -->
    <div v-if="activeElementType === 'police'" class="element-settings">
      <h5>形象图片</h5>
      <div class="upload-container">
        <div
            :class="{ 'has-image': !!config.policeImage?.source }"
            class="image-preview police-image"
        >
          <img v-if="config.policeImage?.source" :src="config.policeImage.source" alt="Police"/>
          <div v-else class="upload-placeholder">
            <span class="upload-icon">👮</span>
            <span>点击上传形象</span>
          </div>
        </div>
        <input
            accept="image/*"
            class="file-input"
            type="file"
            @change="handlePoliceImageUpload"
        />
      </div>

      <!-- Police image controls -->
      <div v-if="config.policeImage?.source" class="image-controls">
        <button class="delete-image-btn" @click="deletePoliceImage">
          <span class="delete-icon">🗑️</span> 删除形象图片
        </button>
      </div>

      <div class="position-controls">
        <label>位置与大小调整</label>
        <div class="position-sliders">
          <div class="slider-group">
            <label>X 位置:</label>
            <input
                :value="config.policeImage?.position.x || 0"
                max="260"
                min="-230"
                type="range"
                @input="updatePolicePosition('x', $event)"
            />
            <span class="value-display">{{ config.policeImage?.position.x || 0 }}</span>
          </div>
          <div class="slider-group">
            <label>Y 位置:</label>
            <input
                :value="config.policeImage?.position.y || 0"
                max="300"
                min="-300"
                type="range"
                @input="updatePolicePosition('y', $event)"
            />
            <span class="value-display">{{ config.policeImage?.position.y || 0 }}</span>
          </div>
          <div class="slider-group">
            <label>大小:</label>
            <input
                :value="config.policeImage?.size.width || 100"
                max="300"
                min="50"
                type="range"
                @input="updatePoliceSize($event)"
            />
            <span class="value-display">{{ config.policeImage?.size.width || 100 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 落款单位管理 -->
    <div v-if="activeElementType === 'footer'" class="element-settings">
      <h5>落款单位</h5>
      <div class="slogan-list">
        <draggable
            v-model="footerSlogans"
            class="slogans-draggable"
            handle=".slogan-drag-handle"
            item-key="id"
            @change="updateSloganOrder"
        >
          <template #item="{element: slogan, index}">
            <div class="slogan-item">
              <div class="slogan-header">
                <span class="slogan-drag-handle">⋮⋮</span>
                <span class="slogan-title">单位 {{ index + 1 }}</span>
                <div class="slogan-actions">
                  <button class="slogan-action-btn delete-btn" @click="deleteSlogan(slogan.id)">
                    ✕
                  </button>
                </div>
              </div>

              <div class="slogan-editor">
                <div class="form-group">
                  <label>单位名称:</label>
                  <input
                      v-model="slogan.content"
                      class="form-control"
                      type="text"
                      @input="updateSlogan(slogan.id, 'content', $event.target.value)"
                  />
                </div>

                <div class="form-group">
                  <div class="color-controls">
                    <div class="color-picker">
                      <label>背景颜色:</label>
                      <input
                          :value="slogan.backgroundColor === 'transparent' ? '#ffffff' : slogan.backgroundColor"
                          type="color"
                          @input="updateSlogan(slogan.id, 'backgroundColor', $event.target.value)"
                      />
                      <button
                          :class="{ active: slogan.backgroundColor === 'transparent' }"
                          class="transparent-btn"
                          @click="toggleTransparentBg(slogan.id)">
                        透明
                      </button>
                    </div>
                    <div class="color-picker">
                      <label>文字颜色:</label>
                      <input
                          :value="slogan.textColor"
                          type="color"
                          @input="updateSlogan(slogan.id, 'textColor', $event.target.value)"
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <div class="slider-group">
                    <label>大小:</label>
                    <input
                        :value="slogan.size"
                        max="120"
                        min="20"
                        type="range"
                        @input="updateSlogan(slogan.id, 'size', Number($event.target.value))"
                    />
                    <span class="value-display">{{ slogan.size }}px</span>
                  </div>
                </div>

                <div class="form-group">
                  <div class="slider-group">
                    <label>文字大小:</label>
                    <input
                        :value="slogan.fontSize || Math.floor(slogan.size / 2)"
                        max="48"
                        min="12"
                        type="range"
                        @input="updateSlogan(slogan.id, 'fontSize', Number($event.target.value))"
                    />
                    <span class="value-display">{{ slogan.fontSize || Math.floor(slogan.size / 2) }}px</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <button class="add-item-btn" @click="addNewSlogan">
          <span class="add-icon">+</span> 添加落款单位
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import draggable from 'vuedraggable'
import {v4 as uuidv4} from 'uuid'
import {DomUtils} from '@/utils/domUtils'
import type {CaseElement, PosterConfig, SlotElement, WarningElement} from '@/types/poster'

const props = defineProps<{
  config: PosterConfig
}>()

const emit = defineEmits<{
  (e: 'update', config: Partial<PosterConfig>): void
}>()

// Element type management
const elementTypes = [
  {id: 'logo', name: 'Logo', icon: '🖼️'},
  {id: 'cases', name: '案例', icon: '📋'},
  {id: 'warnings', name: '警示', icon: '⚠️'},
  {id: 'police', name: '形象', icon: '👮'},
  {id: 'footer', name: '落款', icon: '📝'} // 图标从 📢 改为 📝，更好地表示落款单位
]

const activeElementType = ref('logo')

const setActiveElementType = (type: string) => {
  activeElementType.value = type
}

// Local reactive data
const caseList = ref<CaseElement[]>([...(props.config.caseList || [])])
const warningTips = ref<WarningElement[]>([...(props.config.warningTips || [])])
const footerSlogans = ref<SlotElement[]>([...(props.config.footerSlogans || [])])
const newHighlight = ref('')

// Watch for external config changes
watch(() => props.config.caseList, (newCases) => {
  if (newCases) {
    caseList.value = [...newCases]
  }
}, {deep: true})

watch(() => props.config.warningTips, (newWarnings) => {
  if (newWarnings) {
    warningTips.value = [...newWarnings]
  }
}, {deep: true})

watch(() => props.config.footerSlogans, (newSlogans) => {
  if (newSlogans) {
    footerSlogans.value = [...newSlogans]
  }
}, {deep: true})

// Logo management
const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      const file = input.files[0]
      const preview = await DomUtils.generateImagePreview(file, {
        maxWidth: 800,
        maxHeight: 600
      })

      const logoConfig = props.config.logo || {
        id: uuidv4(),
        type: 'logo',
        position: {x: 0, y: 0, zIndex: 10, rotation: 0},
        isVisible: true,
        source: '',
        altText: 'Logo',
        size: {width: 100, height: 100},
        fit: 'contain'
      }

      emit('update', {
        logo: {
          ...logoConfig,
          source: preview
        }
      })
    } catch (error) {
      console.error('Logo upload error:', error)
    }
  }
}

// Delete logo
const deleteLogo = () => {
  emit('update', {logo: undefined})
}

const updateLogoPosition = (axis: 'x' | 'y', event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.config.logo) return

  const updatedPosition = {
    ...props.config.logo.position,
    [axis]: value
  }

  emit('update', {
    logo: {
      ...props.config.logo,
      position: updatedPosition
    }
  })
}

const updateLogoSize = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.config.logo) return

  const ratio = props.config.logo.size.height / props.config.logo.size.width
  const updatedSize = {
    width: value,
    height: Math.round(value * ratio)
  }

  emit('update', {
    logo: {
      ...props.config.logo,
      size: updatedSize
    }
  })
}

// Case management
const addNewCase = () => {
  const newCase: CaseElement = {
    id: uuidv4(),
    type: 'case',
    title: `案例 ${caseList.value.length + 1}`,
    content: '',
    highlights: [],
    position: {x: 0, y: 0, zIndex: 1, rotation: 0},
    isVisible: true,
    isExpanded: true
  }

  caseList.value.push(newCase)
  emit('update', {caseList: caseList.value})
}

const updateCase = (id: string, field: string, value: any) => {
  const index = caseList.value.findIndex(c => c.id === id)
  if (index !== -1) {
    caseList.value[index] = {
      ...caseList.value[index],
      [field]: value
    }
    emit('update', {caseList: caseList.value})
  }
}

const deleteCase = (id: string) => {
  caseList.value = caseList.value.filter(c => c.id !== id)
  emit('update', {caseList: caseList.value})
}

const toggleCaseExpand = (id: string) => {
  const index = caseList.value.findIndex(c => c.id === id)
  if (index !== -1) {
    caseList.value[index].isExpanded = !caseList.value[index].isExpanded
  }
}

const updateCaseOrder = () => {
  emit('update', {caseList: caseList.value})
}

const addHighlight = (caseId: string) => {
  if (!newHighlight.value.trim()) return

  const index = caseList.value.findIndex(c => c.id === caseId)
  if (index !== -1) {
    caseList.value[index].highlights.push(newHighlight.value.trim())
    emit('update', {caseList: caseList.value})
    newHighlight.value = ''
  }
}

const removeHighlight = (caseId: string, highlightIndex: number) => {
  const index = caseList.value.findIndex(c => c.id === caseId)
  if (index !== -1) {
    caseList.value[index].highlights.splice(highlightIndex, 1)
    emit('update', {caseList: caseList.value})
  }
}

// Warning tips management
const addNewWarning = () => {
  const newWarning: WarningElement = {
    id: uuidv4(),
    type: 'warning',
    content: '',
    position: {x: 0, y: 0, zIndex: 2, rotation: 0},
    isVisible: true,
    style: {
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Microsoft YaHei, SimHei',
      color: '#dc2626',
      alignment: 'left',
      lineHeight: 1.5,
      letterSpacing: 0
    }
  }

  warningTips.value.push(newWarning)
  emit('update', {warningTips: warningTips.value})
}

const updateWarning = (id: string, field: string, value: any) => {
  const index = warningTips.value.findIndex(w => w.id === id)
  if (index !== -1) {
    warningTips.value[index] = {
      ...warningTips.value[index],
      [field]: value
    }
    emit('update', {warningTips: warningTips.value})
  }
}

const updateWarningStyle = (id: string, styleField: string, value: any) => {
  const index = warningTips.value.findIndex(w => w.id === id)
  if (index !== -1) {
    warningTips.value[index].style = {
      ...warningTips.value[index].style,
      [styleField]: value
    }
    emit('update', {warningTips: warningTips.value})
  }
}

const deleteWarning = (id: string) => {
  warningTips.value = warningTips.value.filter(w => w.id !== id)
  emit('update', {warningTips: warningTips.value})
}

const updateWarningOrder = () => {
  emit('update', {warningTips: warningTips.value})
}

// Police image management
const handlePoliceImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      const file = input.files[0]
      const preview = await DomUtils.generateImagePreview(file, {
        maxWidth: 1000,
        maxHeight: 1000
      })

      const imageConfig = props.config.policeImage || {
        id: uuidv4(),
        type: 'image',
        position: {x: 0, y: 0, zIndex: 1, rotation: 0},
        isVisible: true,
        source: '',
        altText: 'Police Image',
        size: {width: 100, height: 100},
        fit: 'contain'
      }

      emit('update', {
        policeImage: {
          ...imageConfig,
          source: preview
        }
      })
    } catch (error) {
      console.error('Police image upload error:', error)
    }
  }
}

// Delete police image
const deletePoliceImage = () => {
  emit('update', {policeImage: undefined})
}

const updatePolicePosition = (axis: 'x' | 'y', event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.config.policeImage) return

  const updatedPosition = {
    ...props.config.policeImage.position,
    [axis]: value
  }

  emit('update', {
    policeImage: {
      ...props.config.policeImage,
      position: updatedPosition
    }
  })
}

const updatePoliceSize = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.config.policeImage) return

  const ratio = props.config.policeImage.size.height / props.config.policeImage.size.width
  const updatedSize = {
    width: value,
    height: Math.round(value * ratio)
  }

  emit('update', {
    policeImage: {
      ...props.config.policeImage,
      size: updatedSize
    }
  })
}

// 落款单位管理
const addNewSlogan = () => {
  const newSlogan: SlotElement = {
    id: uuidv4(),
    type: 'slot',
    content: '单位名称',
    position: {x: 0, y: 0, zIndex: 3, rotation: 0},
    isVisible: true,
    backgroundColor: props.config.theme.primaryColor || '#2c5aa0',
    textColor: '#ffffff',
    size: 60,
    fontSize: 22 // 新增文字大小设置
  }

  footerSlogans.value.push(newSlogan)
  emit('update', {footerSlogans: footerSlogans.value})
}

const updateSlogan = (id: string, field: string, value: any) => {
  const index = footerSlogans.value.findIndex(s => s.id === id)
  if (index !== -1) {
    footerSlogans.value[index] = {
      ...footerSlogans.value[index],
      [field]: value
    }
    emit('update', {footerSlogans: footerSlogans.value})
  }
}

const toggleTransparentBg = (id: string) => {
  const index = footerSlogans.value.findIndex(s => s.id === id);
  if (index !== -1) {
    const currentBg = footerSlogans.value[index].backgroundColor;
    footerSlogans.value[index].backgroundColor = currentBg === 'transparent' ?
        (props.config.theme.primaryColor || '#2c5aa0') : 'transparent';
    emit('update', {footerSlogans: footerSlogans.value});
  }
}

const deleteSlogan = (id: string) => {
  footerSlogans.value = footerSlogans.value.filter(s => s.id !== id)
  emit('update', {footerSlogans: footerSlogans.value})
}

const updateSloganOrder = () => {
  emit('update', {footerSlogans: footerSlogans.value})
}
</script>

<style scoped>
.element-settings-panel {
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

.element-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 15px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.element-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #f8f9fa;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;
  touch-action: manipulation;
}

.element-type-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.element-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.element-name {
  font-size: 12px;
  font-weight: 500;
}

.element-settings {
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  margin-bottom: 15px;
}

.element-settings h5 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

/* Upload area styles */
.upload-container {
  position: relative;
  margin-bottom: 15px;
}

.image-preview {
  width: 100%;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: #f9fafb;
}

.image-preview.police-image {
  height: 180px;
}

.image-preview.has-image {
  border-style: solid;
  background: white;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.upload-icon {
  font-size: 24px;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Image controls */
.image-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.delete-image-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-image-btn:hover {
  background: #fecaca;
}

.delete-icon {
  font-size: 16px;
}

/* Position controls */
.position-controls {
  margin-top: 15px;
}

.position-controls > label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 14px;
  color: #4b5563;
}

.position-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-group label {
  min-width: 60px;
  font-size: 13px;
  color: #6b7280;
}

.slider-group input[type="range"] {
  flex: 1;
  height: 6px;
}

.value-display {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

/* Border controls */
.border-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
}

.form-select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.border-width,
.border-radius {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.border-width label,
.border-radius label {
  min-width: 70px;
  font-size: 13px;
  color: #6b7280;
}

/* Case management styles */
.case-list, .warning-list, .slogan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.case-item, .warning-item, .slogan-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.case-header, .warning-header, .slogan-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.case-drag-handle, .warning-drag-handle, .slogan-drag-handle {
  cursor: move;
  margin-right: 10px;
  color: #6b7280;
}

.case-title, .warning-title, .slogan-title {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

.case-actions, .warning-actions, .slogan-actions {
  display: flex;
  gap: 5px;
}

.case-action-btn, .warning-action-btn, .slogan-action-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.case-action-btn:hover, .warning-action-btn:hover, .slogan-action-btn:hover {
  background: #f3f4f6;
}

.delete-btn {
  color: #ef4444;
  border-color: #fca5a5;
}

.delete-btn:hover {
  background: #fee2e2;
}

.case-editor, .warning-editor, .slogan-editor {
  padding: 15px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.warning-textarea {
  resize: vertical;
}

.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px 0;
}

.highlight-tag {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #3b82f6;
  display: flex;
  align-items: center;
}

.tag-remove {
  background: none;
  border: none;
  color: #ef4444;
  margin-left: 4px;
  cursor: pointer;
  padding: 0 3px;
  font-size: 12px;
}

.highlight-input {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  width: 100px;
}

.style-controls, .color-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker label {
  margin: 0;
  white-space: nowrap;
}

.color-picker input[type="color"] {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-control label {
  margin: 0;
}

.size-control input[type="number"] {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  margin-top: 5px;
  transition: all 0.2s;
  gap: 6px;
  touch-action: manipulation;
}

.add-item-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.add-icon {
  font-size: 16px;
  font-weight: bold;
}

.transparent-btn {
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 5px;
  cursor: pointer;
  color: #64748b;
}

.transparent-btn.active {
  background: #e2e8f0;
  color: #1e40af;
  border-color: #93c5fd;
  font-weight: 500;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .element-settings {
    padding: 12px;
  }

  .element-settings h5 {
    font-size: 15px;
  }

  .element-types {
    gap: 5px;
  }

  .element-type-btn {
    padding: 10px;
    min-width: 60px;
  }

  .element-icon {
    font-size: 18px;
  }

  .slider-group label {
    width: 50px;
  }

  .form-control, input[type="range"], .case-action-btn, .warning-action-btn, .slogan-action-btn {
    min-height: 44px; /* Improving touch targets */
  }

  .delete-image-btn {
    min-height: 44px;
    width: 100%;
    justify-content: center;
  }

  .color-controls, .style-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .color-picker {
    width: 100%;
    justify-content: space-between;
  }

  .color-picker input[type="color"] {
    width: 40px;
    height: 40px;
  }

  .border-width,
  .border-radius {
    flex-direction: column;
    align-items: flex-start;
  }

  .border-width label,
  .border-radius label {
    margin-bottom: 5px;
  }
}
</style>