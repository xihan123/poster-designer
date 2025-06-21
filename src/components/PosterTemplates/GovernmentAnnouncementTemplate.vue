<template>
  <div
      ref="posterRef"
      :class="{ 'transparent-bg': config.isTransparentBackground }"
      class="government-template"
  >
    <!-- Header with seal and title -->
    <div
        :style="{ background: headerGradient }"
        class="govt-header"
    >
      <!-- Optional logo -->
      <div
          v-if="config.logo?.isVisible && config.logo?.source"
          :style="{
          transform: `translate(${config.logo.position.x}px, ${config.logo.position.y}px)`
        }"
          class="govt-seal"
      >
        <img :alt="config.logo.altText || 'Official Seal'" :src="config.logo.source"/>
      </div>

      <div class="govt-titles">
        <h1 class="govt-main-title">{{ config.title }}</h1>
        <h2 v-if="config.subtitle" class="govt-subtitle">{{ config.subtitle }}</h2>
        <div :style="{ background: config.theme.warningColor }" class="red-line"></div>
      </div>
    </div>

    <!-- Document content -->
    <div class="govt-content">
      <!-- Document number and date -->
      <div class="document-info">
        <div class="doc-date">{{ formatDate(config.year, config.month, config.day) }}</div>
      </div>

      <!-- Main content -->
      <div ref="contentContainer" class="content-body">
        <div
            v-for="(caseItem, index) in config.caseList"
            :key="caseItem.id"
            class="content-paragraph"
        >
          <div
              v-if="caseItem.title && index === 0"
              :style="{ color: config.theme.primaryColor }"
              class="paragraph-title"
          >
            {{ caseItem.title }}
          </div>

          <div
              class="paragraph-text"
              v-html="processHighlightedText(caseItem.content, caseItem.highlights)"
          ></div>
        </div>
      </div>

      <!-- Warning section -->
      <div ref="warningContainer" class="warning-section">
        <div
            v-for="warning in config.warningTips"
            :key="warning.id"
            :style="{
            borderColor: warning.style.color || config.theme.warningColor
          }"
            class="warning-box"
        >
          <div
              :style="{
              color: warning.style.color || config.theme.warningColor,
              fontSize: `${warning.style.fontSize}px`
            }"
              class="warning-content"
              v-html="processWarningText(warning.content)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Footer with stamp -->
    <div ref="footerContainer" class="govt-footer">
      <div class="footer-content">
        <div
            v-if="config.policeImage?.isVisible && config.policeImage?.source"
            :style="{
            transform: `translate(${config.policeImage.position.x}px, ${config.policeImage.position.y}px)`
          }"
            class="official-stamp"
        >
          <img :alt="config.policeImage.altText || 'Official Stamp'" :src="config.policeImage.source"/>
        </div>

        <div
            :style="{
              fontSize: config.footerSlogans[0]?.fontSize ? `${config.footerSlogans[0].fontSize}px` : '20px'
            }"
            class="issuer">
          {{ config.footerSlogans[0]?.content || '公安机关' }}
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
const warningContainer = ref<HTMLElement>()
const footerContainer = ref<HTMLElement>()

// Computed styles
const headerGradient = computed(() => {
  const {primaryColor, secondaryColor} = props.config.theme
  return ColorUtils.createGradient(primaryColor, secondaryColor, 'to right')
})

// Format date in more formal way
const formatDate = (year: number, month: number, day: number): string => {
  return `${year}年${month}月${day}日`
}

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
            match => `<span class="highlight-red">${match}</span>`
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
      warningElement: warningContainer.value,
      footerElement: footerContainer.value,
      hasImage: !!props.config.policeImage?.source,
      minHeight: 900
    })

    posterRef.value.style.height = `${height}px`
  } catch (error) {
    console.warn('更新高度失败:', error)
    posterRef.value.style.height = '900px'
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
.government-template {
  width: 600px;
  min-height: 900px;
  background: #fff9f9;
  position: relative;
  font-family: 'SimSun', 'FangSong', 'Microsoft YaHei', serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  border: 1px solid #e5e5e5;
}

.government-template.transparent-bg {
  background: transparent;
  box-shadow: none;
  border: none;
}

/* Header */
.govt-header {
  padding: 40px 20px 25px;
  position: relative;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.govt-seal {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.govt-seal img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.govt-titles {
  text-align: center;
  width: 100%;
}

.govt-main-title {
  font-size: 42px;
  margin: 0 0 10px;
  font-weight: bold;
  letter-spacing: 8px;
}

.govt-subtitle {
  font-size: 24px;
  font-weight: normal;
  margin: 0 0 15px;
}

.red-line {
  width: 80%;
  height: 3px;
  margin: 0 auto;
}

/* Content */
.govt-content {
  padding: 30px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.document-info {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
  font-family: 'FangSong', serif;
}

.doc-date {
  font-size: 16px;
}

.content-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  text-align: justify;
  line-height: 1.8;
  font-size: 18px;
  font-family: 'FangSong', serif;
}

.content-paragraph {
  text-indent: 2em;
}

.paragraph-title {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
  text-indent: 0;
}

.warning-section {
  margin-top: 30px;
}

.warning-box {
  border-left: 4px solid;
  padding: 15px 20px;
  background: #fff5f5;
  margin-bottom: 15px;
}

.warning-content {
  font-weight: bold;
  line-height: 1.5;
}

/* Footer */
.govt-footer {
  margin-top: auto;
  padding: 20px 40px 40px;
  border-top: 1px solid #eee;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.official-stamp {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.official-stamp img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.issuer {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  font-family: 'FangSong', serif;
}

/* Highlight styles */
:deep(.highlight-red) {
  color: #dc2626 !important;
  font-weight: bold !important;
  font-family: inherit !important;
}
</style>