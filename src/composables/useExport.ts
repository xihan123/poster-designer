import {ref} from 'vue'
import {exportElement} from '@/utils/export'
import type {PosterConfig} from '@/types/poster'

export interface ExportOptions {
    onSuccess?: (filename: string) => void
    onError?: (error: Error) => void
    quality?: number // 添加可选的质量参数
}

export function useExport() {
    const isExporting = ref(false)
    const exportProgress = ref(0)
    const exportStage = ref('')
    const exportError = ref<string | null>(null)

    const exportPoster = async (
        element: HTMLElement,
        posterConfig: PosterConfig,
        filename: string = 'poster',
        options: ExportOptions = {}
    ) => {
        if (!element) {
            throw new Error('导出元素不存在')
        }

        isExporting.value = true
        exportProgress.value = 0
        exportStage.value = '准备导出...'
        exportError.value = null

        try {
            // 进度回调
            const updateProgress = (progress: number, stage: string) => {
                exportProgress.value = progress
                exportStage.value = stage
            }

            updateProgress(10, '验证配置...')

            // 构建导出配置
            const exportConfig = {
                resolution: posterConfig.resolution,
                format: posterConfig.format,
                customWidth: posterConfig.customWidth,
                customHeight: posterConfig.customHeight,
                isTransparentBackground: posterConfig.isTransparentBackground,
                primaryColor: posterConfig.theme?.primaryColor,
                quality: posterConfig.format === 'jpg' ? (posterConfig.quality || 0.92) : 0.98
            }

            updateProgress(30, '准备渲染...')
            await new Promise(resolve => setTimeout(resolve, 100))
            updateProgress(50, '渲染海报...')

            // 执行导出
            await exportElement(element, exportConfig, filename)

            updateProgress(100, '导出完成')
            options.onSuccess?.(filename)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '导出失败'
            exportError.value = errorMessage
            console.error('导出失败:', error)
            options.onError?.(error instanceof Error ? error : new Error(errorMessage))
            throw error
        } finally {
            setTimeout(() => {
                isExporting.value = false
                exportProgress.value = 0
                exportStage.value = ''
            }, 1000)
        }
    }

    const clearError = () => {
        exportError.value = null
    }

    return {
        isExporting,
        exportProgress,
        exportStage,
        exportError,
        exportPoster,
        clearError
    }
}