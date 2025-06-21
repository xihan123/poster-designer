<template>
  <div class="tabs-container">
    <!-- 标签页标题 -->
    <div class="tabs-header">
      <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: modelValue === tab.key }"
          class="tab-item"
          @click="$emit('update:modelValue', tab.key)"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-name">{{ tab.name }}</span>
        <div v-if="modelValue === tab.key" class="active-indicator"></div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tabs-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tabs: {
    type: Array as () => Array<{
      key: string;
      name: string;
      icon?: string;
    }>,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0 12px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  flex-shrink: 0;
}

.tabs-header::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.tab-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s ease;
  margin-right: 4px;
}

.tab-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
  color: #3b82f6;
}

.tab-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.tab-icon {
  font-size: 16px;
}

.tab-name {
  padding-bottom: 2px; /* 微调文本垂直位置 */
}

.active-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
  border-radius: 2px 2px 0 0;
}

.tabs-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  background: white;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .tabs-header {
    padding: 0 8px;
  }

  .tab-item {
    padding: 10px 12px;
    font-size: 13px;
  }

  .tab-icon {
    font-size: 15px;
  }
}

/* 触摸设备优化 */
@media (hover: none) {
  .tab-item {
    padding: 10px 16px;
    min-height: 44px;
  }
}
</style>