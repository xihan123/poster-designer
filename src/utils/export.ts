import html2canvas from 'html2canvas'
import {ColorUtils} from './colorUtils'
import {CanvasUtils} from './canvasUtils'

export interface ExportConfig {
    resolution: string
    format: string
    quality?: number
    customWidth?: number
    customHeight?: number
    isTransparentBackground?: boolean
    primaryColor?: string
}

// 分辨率配置
export const exportResolutions = {
    'hd': {width: 1920, height: 2720},
    '2k': {width: 2560, height: 3627},
    '4k': {width: 3840, height: 5440},
    'custom': {width: 2560, height: 3627}
}

// 创建下载用的海报副本
function createDownloadPoster(element: HTMLElement, config: ExportConfig): HTMLElement {
    const posterClone = element.cloneNode(true) as HTMLElement
    posterClone.id = 'downloadPoster'
    posterClone.style.position = 'absolute'
    posterClone.style.left = '-9999px'
    posterClone.style.top = '0'
    posterClone.style.transform = 'none'
    posterClone.style.width = '600px'
    posterClone.style.margin = '0'
    posterClone.style.fontFamily = "'Microsoft YaHei', 'SimHei', sans-serif"
    posterClone.style.border = 'none'
    posterClone.style.boxShadow = 'none'
    posterClone.style.borderRadius = '0'

    // 用Canvas替换SVG日期区域
    const dateSection = posterClone.querySelector('.date-section')
    if (dateSection) {
        const svg = dateSection.querySelector('.date-section-svg')
        if (svg) svg.remove()

        const canvas = document.createElement('canvas')
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.zIndex = '1'

        const themeColor = config.primaryColor || '#2c5aa0'
        CanvasUtils.createDateSection(canvas, {
            width: 120,
            height: 100,
            themeColor,
            year: '',
            monthDay: ''
        })

        dateSection.insertBefore(canvas, dateSection.firstChild)
        const themeColors = ColorUtils.getThemeColors(themeColor)
        updateDateSectionStyles(dateSection, themeColors)
    }

    // 确保所有关键样式都被内联
    applyInlineStyles(posterClone, config)
    return posterClone
}

function updateDateSectionStyles(
    dateSection: Element,
    themeColors: ReturnType<typeof ColorUtils.getThemeColors>
) {
    const dateYear = dateSection.querySelector('.date-year') as HTMLElement
    const dateMonthDay = dateSection.querySelector('.date-month-day') as HTMLElement
    const dateLunar = dateSection.parentElement?.querySelector('.date-lunar') as HTMLElement

    if (dateYear) {
        dateYear.style.cssText = `
      position: absolute !important;
      top: 18px !important;
      left: 15px !important;
      font-size: 18px !important;
      font-weight: bold !important;
      color: ${themeColors.primary} !important;
      z-index: 3 !important;
      font-family: 'Microsoft YaHei', 'SimHei', sans-serif !important;
    `
    }

    if (dateMonthDay) {
        dateMonthDay.style.cssText = `
      position: absolute !important;
      bottom: 5px !important;
      right: 15px !important;
      font-size: 24px !important;
      font-weight: bold !important;
      color: white !important;
      z-index: 3 !important;
      font-family: 'Microsoft YaHei', 'SimHei', sans-serif !important;
    `
    }

    if (dateLunar) {
        dateLunar.style.cssText = `
      position: absolute !important;
      top: 105px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      font-size: 17px !important;
      font-weight: bold !important;
      color: ${themeColors.primary} !important;
      white-space: nowrap !important;
      z-index: 3 !important;
      font-family: 'Microsoft YaHei', 'SimHei', sans-serif !important;
    `
    }
}

function applyInlineStyles(posterClone: HTMLElement, config: ExportConfig) {
    const allElements = posterClone.querySelectorAll('*')
    const themeColors = ColorUtils.getThemeColors(config.primaryColor || '#2c5aa0')

    allElements.forEach(element => {
        const htmlElement = element as HTMLElement

        if (htmlElement.classList.contains('highlight-red')) {
            htmlElement.style.color = '#dc2626'
            htmlElement.style.fontWeight = 'bold'
        }

        // 确保字体应用到所有文本元素
        if (htmlElement.tagName && !['IMG', 'SVG', 'CANVAS'].includes(htmlElement.tagName)) {
            htmlElement.style.fontFamily = "'Microsoft YaHei', 'SimHei', sans-serif"
        }

        // 处理渐变背景
        if (htmlElement.classList.contains('poster-header')) {
            htmlElement.style.background = ColorUtils.createGradient(
                themeColors.primary,
                themeColors.darker
            )
        }

        if (htmlElement.classList.contains('left-sidebar')) {
            htmlElement.style.background = ColorUtils.createGradient(
                themeColors.lightest,
                themeColors.lighter,
                '180deg'
            )
            htmlElement.style.color = themeColors.darker
        }
    })
}

export async function exportElement(
    element: HTMLElement,
    config: ExportConfig,
    filename: string = 'poster'
): Promise<void> {
    if (!element) {
        throw new Error('导出元素不存在')
    }

    let resolution = exportResolutions[config.resolution as keyof typeof exportResolutions]

    // 处理自定义分辨率
    if (config.resolution === 'custom' && config.customWidth && config.customHeight) {
        resolution = {
            width: config.customWidth,
            height: config.customHeight
        }
    }

    if (!resolution) {
        throw new Error('不支持的分辨率')
    }

    try {
        // 创建下载用的海报副本
        const downloadPoster = createDownloadPoster(element, config)
        document.body.appendChild(downloadPoster)

        // 计算缩放比例
        const scale = Math.min(resolution.width / 600, resolution.height / (downloadPoster.offsetHeight || 850))

        // 等待Canvas绘制完成
        await new Promise(resolve => setTimeout(resolve, 200))

        const options = {
            useCORS: true,
            allowTaint: false,
            scale: scale,
            width: 600,
            height: downloadPoster.offsetHeight || 850,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 600,
            windowHeight: downloadPoster.offsetHeight || 850,
            removeContainer: true,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            logging: false,
            backgroundColor: config.isTransparentBackground ? null : '#ffffff'
        }

        const canvas = await html2canvas(downloadPoster, options)

        // 创建最终输出canvas
        const finalCanvas = CanvasUtils.resizeCanvas(canvas, resolution.width, resolution.height, true)

        // 如果不是透明背景，填充白色背景
        if (!config.isTransparentBackground) {
            const ctx = finalCanvas.getContext('2d')!
            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)
        }

        // 清理临时元素
        document.body.removeChild(downloadPoster)

        // 下载文件
        const blob = await CanvasUtils.canvasToBlob(finalCanvas, config.format as 'png' | 'jpg', config.quality)

        if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${filename}.${config.format.toLowerCase()}`
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setTimeout(() => URL.revokeObjectURL(url), 100)
        } else {
            throw new Error('生成图片失败')
        }
    } catch (error) {
        console.error('导出失败:', error)
        throw new Error('导出失败，请检查网络连接后重试')
    }
}