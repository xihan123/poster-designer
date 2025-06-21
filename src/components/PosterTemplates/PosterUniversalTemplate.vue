<template>
  <div
      ref="posterRef"
      :class="{ 'transparent-bg': config.isTransparentBackground }"
      :style="{
      background: !config.isTransparentBackground ? config.theme.backgroundColor : 'transparent',
      color: config.theme.textColor
    }"
      class="poster-universal-template"
  >
    <!-- Header -->
    <div
        :style="{
        background: headerGradient,
      }"
        class="poster-header"
    >
      <!-- Logo (if present) -->
      <div
          v-if="config.logo?.isVisible && config.logo?.source"
          :style="{
          transform: `translate(${config.logo.position.x}px, ${config.logo.position.y}px)`,
          width: `${config.logo.size.width}px`,
          height: `${config.logo.size.height}px`
        }"
          class="poster-logo"
      >
        <img :alt="config.logo.altText || 'Logo'" :src="config.logo.source"/>
      </div>

      <!-- Title Area -->
      <div class="title-area">
        <h1
            :style="{
            fontSize: `${titleTextBlock?.style.fontSize || 42}px`,
            fontWeight: titleTextBlock?.style.fontWeight || 'bold',
            color: titleTextBlock?.style.color || 'white',
            textAlign: titleTextBlock?.style.alignment || 'center'
          }"
            class="poster-title"
        >{{ config.title }}</h1>

        <div
            v-if="config.subtitle"
            :style="{
            fontSize: `${subtitleTextBlock?.style.fontSize || 24}px`,
            fontWeight: subtitleTextBlock?.style.fontWeight || 'normal',
            color: subtitleTextBlock?.style.color || 'white',
            textAlign: subtitleTextBlock?.style.alignment || 'center',
            opacity: 0.9
          }"
            class="poster-subtitle"
        >{{ config.subtitle }}
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="poster-content">
      <!-- Cases List -->
      <div ref="casesContainer" class="cases-container">
        <div
            v-for="(caseItem, index) in config.caseList"
            :key="caseItem.id"
            :class="{ 'first-case': index === 0 }"
            class="case-item"
        >
          <div
              v-if="caseItem.title"
              :style="{ color: config.theme.primaryColor }"
              class="case-title"
          >
            {{ caseItem.title }}
          </div>

          <div
              class="case-content"
              v-html="processHighlightedText(caseItem.content, caseItem.highlights)"
          ></div>
        </div>
      </div>

      <!-- Police Image (if present) -->
      <div
          v-if="config.policeImage?.isVisible && config.policeImage?.source"
          :style="{
          transform: `translate(${config.policeImage.position.x}px, ${config.policeImage.position.y}px)`,
          width: `${config.policeImage.size.width}px`
        }"
          class="police-image"
      >
        <img :alt="config.policeImage.altText || 'Police'" :src="config.policeImage.source"/>
      </div>

      <!-- Warnings Area -->
      <div ref="warningsContainer" class="warnings-container">
        <div
            v-for="warning in config.warningTips"
            :key="warning.id"
            :style="{
            color: warning.style.color || config.theme.warningColor,
            fontSize: `${warning.style.fontSize}px`,
            fontWeight: warning.style.fontWeight,
            transform: `translateY(${warning.position.y}px)`
          }"
            class="warning-item"
            v-html="processWarningText(warning.content)"
        ></div>
      </div>
    </div>

    <!-- Footer -->
    <div ref="footerContainer" class="poster-footer">
      <!-- Date Information -->
      <div class="date-info">
        <div class="solar-date">
          {{ config.year }}/{{ config.month }}/{{ config.day }}
        </div>
        <div class="lunar-date">
          {{ config.lunarDate }}
        </div>
      </div>

      <!-- Footer Slogans -->
      <div class="slogans-container">
        <div
            v-for="slogan in config.footerSlogans"
            :key="slogan.id"
            :style="{
            background: slogan.backgroundColor || config.theme.primaryColor,
            color: slogan.textColor || 'white',
            transform: `translate(${slogan.position.x}px, ${slogan.position.y}px)`,
            width: `${slogan.size}px`,
            height: `${slogan.size}px`,
            fontSize: `${slogan.fontSize || Math.floor(slogan.size / 2)}px`
          }"
            class="slogan-item"
        >
          {{ slogan.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import type {PosterConfig, TextBlockElement} from '@/types/poster'
import {TextProcessor} from '@/utils/textProcessor'
import {ColorUtils} from '@/utils/colorUtils'
import {LayoutUtils} from '@/utils/layoutUtils'

const props = defineProps<{
  config: PosterConfig
}>()

const posterRef = ref<HTMLElement>()
const casesContainer = ref<HTMLElement>()
const warningsContainer = ref<HTMLElement>()
const footerContainer = ref<HTMLElement>()

// Computed gradients
const headerGradient = computed(() => {
  const {primaryColor, secondaryColor} = props.config.theme
  return ColorUtils.createGradient(primaryColor, secondaryColor, '135deg')
})

// Find text blocks for title and subtitle
const titleTextBlock = computed(() => {
  return props.config.textBlocks?.find(block => block.id === 'title') as TextBlockElement | undefined
})

const subtitleTextBlock = computed(() => {
  return props.config.textBlocks?.find(block => block.id === 'subtitle') as TextBlockElement | undefined
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
      textElement: casesContainer.value,
      warningElement: warningsContainer.value,
      footerElement: footerContainer.value,
      hasImage: !!props.config.policeImage?.source,
      minHeight: 850
    })

    posterRef.value.style.height = `${height}px`
  } catch (error) {
    console.warn('更新高度失败:', error)
    posterRef.value.style.height = '850px'
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
.poster-universal-template {
  width: 600px;
  min-height: 850px;
  position: relative;
  font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.poster-universal-template.transparent-bg {
  background: transparent;
  box-shadow: none;
}

/* Header */
.poster-header {
  padding: 25px 20px;
  position: relative;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 140px;
}

.poster-logo {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.title-area {
  text-align: center;
  width: 100%;
  z-index: 5;
}

.poster-title {
  margin: 0 0 10px;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.poster-subtitle {
  line-height: 1.3;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Main Content */
.poster-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}

.cases-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.case-item {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.case-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.case-content {
  font-size: 16px;
  line-height: 1.7;
  text-align: justify;
}

.police-image {
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.police-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.warnings-container {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.warning-item {
  background: #fff5f5;
  border-radius: 8px;
  padding: 15px 20px;
  border-left: 5px solid;
  line-height: 1.5;
}

/* Footer */
.poster-footer {
  margin-top: auto;
  padding: 20px 25px;
  border-top: 2px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.solar-date {
  font-size: 16px;
  font-weight: bold;
}

.lunar-date {
  font-size: 14px;
  opacity: 0.8;
}

.slogans-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.slogan-item {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
}

/* Highlight styles */
:deep(.highlight-red) {
  color: #dc2626 !important;
  font-weight: bold !important;
  font-family: inherit !important;
}

/* Print optimization */
@media print {
  .poster-universal-template {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .highlight-red {
    color: #dc2626 !important;
    font-weight: bold !important;
  }
}
</style>