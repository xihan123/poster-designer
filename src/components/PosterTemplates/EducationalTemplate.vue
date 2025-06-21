<template>
  <div
      ref="posterRef"
      :class="{ 'transparent-bg': config.isTransparentBackground }"
      class="educational-template"
  >
    <!-- Header -->
    <div
        :style="{ background: headerGradient }"
        class="edu-header"
    >
      <!-- Logo (if present) -->
      <div
          v-if="config.logo?.isVisible && config.logo?.source"
          :style="{
          transform: `translate(${config.logo.position.x}px, ${config.logo.position.y}px)`,
          width: `${config.logo.size.width}px`,
          height: `${config.logo.size.height}px`
        }"
          class="edu-logo"
      >
        <img :alt="config.logo.altText || 'Logo'" :src="config.logo.source"/>
      </div>

      <div class="edu-title-area">
        <h1 class="edu-title">{{ config.title }}</h1>
        <h2 v-if="config.subtitle" class="edu-subtitle">{{ config.subtitle }}</h2>
        <div class="edu-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-icon">📚</div>
          <div class="decoration-line"></div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="edu-content">
      <!-- Main Image (if present) -->
      <div
          v-if="config.policeImage?.isVisible && config.policeImage?.source"
          :style="{
          transform: `translate(${config.policeImage.position.x}px, ${config.policeImage.position.y}px)`,
          width: `${config.policeImage.size.width}px`
        }"
          class="edu-main-image"
      >
        <img :alt="config.policeImage.altText || 'Main image'" :src="config.policeImage.source"/>
      </div>

      <!-- Content sections -->
      <div ref="contentContainer" class="edu-sections">
        <!-- Knowledge sections from case list -->
        <div
            v-for="(caseItem, index) in config.caseList"
            :key="caseItem.id"
            :class="{ 'section-with-number': index < 3 }"
            class="edu-section"
        >
          <div v-if="index < 3" class="section-number">{{ index + 1 }}</div>
          <div class="section-content">
            <div
                v-if="caseItem.title"
                :style="{ color: config.theme.primaryColor }"
                class="section-title"
            >
              {{ caseItem.title }}
            </div>

            <div
                class="section-text"
                v-html="processHighlightedText(caseItem.content, caseItem.highlights)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Tips section -->
      <div ref="tipsContainer" class="tips-container">
        <div :style="{ background: config.theme.primaryColor }" class="tips-header">
          <span class="tips-icon">💡</span>
          <span class="tips-title">重要提示</span>
        </div>

        <div class="tips-list">
          <div
              v-for="warning in config.warningTips"
              :key="warning.id"
              :style="{
              color: warning.style.color || config.theme.warningColor,
              fontSize: `${warning.style.fontSize}px`
            }"
              class="tip-item"
          >
            <span class="tip-bullet">•</span>
            <span
                class="tip-content"
                v-html="processWarningText(warning.content)"
            ></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div ref="footerContainer" class="edu-footer">
      <div class="footer-date">
        <span>{{ config.year }}/{{ config.month }}/{{ config.day }}</span>
        <span class="lunar-date">{{ config.lunarDate }}</span>
      </div>

      <div class="footer-badges">
        <div
            v-for="slogan in config.footerSlogans"
            :key="slogan.id"
            :style="{
            background: slogan.backgroundColor || config.theme.primaryColor,
            color: slogan.textColor || 'white',
            transform: `translate(${slogan.position.x}px, ${slogan.position.y}px)`,
            width: `${slogan.size * 1.8}px`,
            height: `${slogan.size}px`,
            fontSize: `${slogan.fontSize || Math.floor(slogan.size / 3)}px`
          }"
            class="footer-badge"
        >
          {{ slogan.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import type {PosterConfig} from '@/types/poster'
import {TextProcessor} from '@/utils/textProcessor'
import {ColorUtils} from '@/utils/colorUtils'
import {LayoutUtils} from '@/utils/layoutUtils'

const props = defineProps<{
  config: PosterConfig
}>()

const posterRef = ref<HTMLElement>()
const contentContainer = ref<HTMLElement>()
const tipsContainer = ref<HTMLElement>()
const footerContainer = ref<HTMLElement>()

// Computed styles
const headerGradient = computed(() => {
  const {primaryColor, accentColor} = props.config.theme
  return ColorUtils.createGradient(primaryColor, accentColor || primaryColor, '120deg')
})

// Process text with highlights
const processHighlightedText = (text: string, highlights: string[] = []) => {
  if (!text) return ''

  let processedText = TextProcessor.processHighlightText(text)

  // Apply custom highlights
  if (highlights && highlights.length > 0) {
    highlights.forEach(highlight => {
      if (highlight && highlight.trim()) {
        const regex = new RegExp(highlight.trim(), 'gi')
        processedText = processedText.replace(
            regex,
            match => `<span class="highlight-text">${match}</span>`
        )
      }
    })
  }

  return processedText
}

// Process warning text
const processWarningText = (text: string) => {
  if (!text) return ''
  return TextProcessor.formatWarningText(text)
}

// Update poster height based on content
const updatePosterHeight = async () => {
  if (!posterRef.value) return

  try {
    // Calculate optimal height
    const height = await LayoutUtils.calculatePosterHeight({
      textElement: contentContainer.value,
      warningElement: tipsContainer.value,
      footerElement: footerContainer.value,
      hasImage: !!props.config.policeImage?.source,
      minHeight: 880
    })

    posterRef.value.style.height = `${height}px`
  } catch (error) {
    console.warn('更新高度失败:', error)
    posterRef.value.style.height = '880px'
  }
}

// Watch for content changes to update height
watch([
  () => props.config.caseList,
  () => props.config.warningTips,
  () => props.config.policeImage
], () => {
  // Use debounce to avoid too many updates
  const debouncedResize = LayoutUtils.debounce(updatePosterHeight, 100)
  debouncedResize()
}, {deep: true})

onMounted(() => {
  setTimeout(updatePosterHeight, 200)
})

defineExpose({
  posterRef
})
</script>

<style scoped>
.educational-template {
  width: 600px;
  min-height: 880px;
  background: #f9fafb;
  position: relative;
  font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.educational-template.transparent-bg {
  background: transparent;
  box-shadow: none;
}

/* Header */
.edu-header {
  padding: 30px 20px;
  position: relative;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 140px;
}

.edu-logo {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edu-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.edu-title-area {
  text-align: center;
  width: 100%;
}

.edu-title {
  margin: 0 0 10px;
  font-size: 40px;
  line-height: 1.2;
  font-weight: 800;
}

.edu-subtitle {
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 15px;
  opacity: 0.9;
}

.edu-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.decoration-line {
  height: 2px;
  width: 80px;
  background: rgba(255, 255, 255, 0.6);
}

.decoration-icon {
  font-size: 24px;
  margin: 0 15px;
}

/* Content */
.edu-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edu-main-image {
  margin: 0 auto 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 250px;
  border-radius: 10px;
  overflow: hidden;
}

.edu-main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.edu-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.edu-section {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-with-number {
  padding-left: 0;
}

.section-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  font-size: 22px;
  font-weight: bold;
  color: white;
  background: v-bind('config.theme.primaryColor');
}

.section-content {
  padding: 15px 20px;
  flex: 1;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.section-text {
  font-size: 16px;
  line-height: 1.7;
}

.tips-container {
  margin-top: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tips-header {
  padding: 15px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tips-icon {
  font-size: 20px;
}

.tips-title {
  font-size: 18px;
  font-weight: 600;
}

.tips-list {
  padding: 20px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  font-weight: 600;
}

.tip-bullet {
  margin-right: 10px;
  font-size: 20px;
}

.tip-content {
  flex: 1;
  line-height: 1.6;
}

/* Footer */
.edu-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  padding: 20px 25px;
  background: #f3f4f6;
  flex-shrink: 0;
}

.footer-date {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 500;
}

.lunar-date {
  opacity: 0.8;
  font-size: 14px;
}

.footer-badges {
  display: flex;
  gap: 10px;
}

.footer-badge {
  border-radius: 30px;
  padding: 6px 15px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Highlight styles */
:deep(.highlight-text) {
  color: v-bind('config.theme.accentColor') !important;
  font-weight: bold !important;
  font-family: inherit !important;
}
</style>