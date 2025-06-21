/**
 * Canvas绘制工具类
 * 提供Canvas相关的绘制和处理功能
 */

export interface DateSectionConfig {
    width: number
    height: number
    themeColor: string
    year: string
    monthDay: string
    yearFontSize?: number
    monthDayFontSize?: number
}

export interface GradientConfig {
    type: 'linear' | 'radial'
    colors: Array<{ offset: number; color: string }>
    direction?: { x1: number; y1: number; x2: number; y2: number }
    center?: { x: number; y: number; radius: number }
}

export class CanvasUtils {
    /**
     * 创建日期区域Canvas
     */
    static createDateSection(canvas: HTMLCanvasElement, config: DateSectionConfig): void {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const {width, height, themeColor, year, monthDay} = config

        // 设置canvas尺寸
        canvas.width = width
        canvas.height = height

        // 绘制对角线分割的背景
        ctx.fillStyle = themeColor
        ctx.beginPath()
        ctx.moveTo(width, 0) // 右上角
        ctx.lineTo(width, height) // 右下角
        ctx.lineTo(0, height) // 左下角
        ctx.closePath()
        ctx.fill()

        // 绘制年份文字
        ctx.fillStyle = themeColor
        ctx.font = `bold ${config.yearFontSize || 18}px 'Microsoft YaHei', sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(year, 15, 18)

        // 绘制月/日文字
        ctx.fillStyle = 'white'
        ctx.font = `bold ${config.monthDayFontSize || 24}px 'Microsoft YaHei', sans-serif`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText(monthDay, width - 15, height - 5)
    }

    /**
     * 绘制渐变背景
     */
    static drawGradientBackground(
        ctx: CanvasRenderingContext2D,
        config: GradientConfig,
        width: number,
        height: number
    ): void {
        let gradient: CanvasGradient

        if (config.type === 'linear') {
            const {x1 = 0, y1 = 0, x2 = width, y2 = height} = config.direction || {}
            gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        } else {
            const {x = width / 2, y = height / 2, radius = Math.max(width, height)} = config.center || {}
            gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        }

        config.colors.forEach(({offset, color}) => {
            gradient.addColorStop(offset, color)
        })

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
    }

    /**
     * 优化Canvas用于导出
     */
    static optimizeCanvasForExport(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 设置高质量渲染
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // 设置文本渲染质量
        ctx.textRendering = 'optimizeLegibility'
    }

    /**
     * 将Canvas转换为Blob
     */
    static canvasToBlob(
        canvas: HTMLCanvasElement,
        format: 'png' | 'jpg' = 'png',
        quality: number = 0.98
    ): Promise<Blob | null> {
        return new Promise(resolve => {
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
            canvas.toBlob(resolve, mimeType, quality)
        })
    }

    /**
     * 调整Canvas尺寸并保持内容
     */
    static resizeCanvas(
        sourceCanvas: HTMLCanvasElement,
        targetWidth: number,
        targetHeight: number,
        maintainAspectRatio: boolean = true
    ): HTMLCanvasElement {
        const targetCanvas = document.createElement('canvas')
        const targetCtx = targetCanvas.getContext('2d')!

        targetCanvas.width = targetWidth
        targetCanvas.height = targetHeight

        if (maintainAspectRatio) {
            const sourceAspectRatio = sourceCanvas.width / sourceCanvas.height
            const targetAspectRatio = targetWidth / targetHeight

            let drawWidth = targetWidth
            let drawHeight = targetHeight
            let drawX = 0
            let drawY = 0

            if (sourceAspectRatio > targetAspectRatio) {
                // 原图更宽，以宽度为准
                drawHeight = targetWidth / sourceAspectRatio
                drawY = (targetHeight - drawHeight) / 2
            } else {
                // 原图更高，以高度为准
                drawWidth = targetHeight * sourceAspectRatio
                drawX = (targetWidth - drawWidth) / 2
            }

            targetCtx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight)
        } else {
            targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
        }

        return targetCanvas
    }

    /**
     * 检测图片透明度
     */
    static checkImageTransparency(img: HTMLImageElement): Promise<boolean> {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                resolve(false)
                return
            }

            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight

            ctx.drawImage(img, 0, 0)

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                let hasAlpha = false
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] < 255) {
                        hasAlpha = true
                        break
                    }
                }

                resolve(hasAlpha)
            } catch (error) {
                console.warn('无法检测图片透明度:', error)
                resolve(false)
            }
        })
    }

    /**
     * 创建高DPI Canvas
     */
    static createHighDPICanvas(
        width: number,
        height: number,
        ratio: number = window.devicePixelRatio || 1
    ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; ratio: number } {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        canvas.width = width * ratio
        canvas.height = height * ratio
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'

        ctx.scale(ratio, ratio)

        return {canvas, ctx, ratio}
    }
}