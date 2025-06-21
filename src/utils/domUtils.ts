/**
 * DOM操作工具类
 * 统一管理DOM相关操作
 */
export interface ImagePreviewOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'png' | 'jpg' | 'webp'
}

export interface ScrollPosition {
    x: number
    y: number
}

export interface ElementDimensions {
    width: number
    height: number
    top: number
    left: number
    scrollWidth: number
    scrollHeight: number
}

export class DomUtils {
    /**
     * 处理文件上传
     */
    static handleFileUpload(
        file: File,
        onSuccess?: (dataUrl: string) => void,
        onError?: (error: string) => void
    ): void {
        if (!file) {
            onError?.('请选择文件')
            return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
            const result = e.target?.result as string
            if (result) {
                onSuccess?.(result)
            } else {
                onError?.('文件读取失败')
            }
        }

        reader.onerror = () => {
            onError?.('文件读取出错')
        }

        reader.readAsDataURL(file)
    }

    /**
     * 生成图片预览
     */
    static async generateImagePreview(
        file: File,
        options: ImagePreviewOptions = {}
    ): Promise<string> {
        const {maxWidth = 800, maxHeight = 600, quality = 0.8, format = 'png'} = options

        return new Promise((resolve, reject) => {
            const img = new Image()
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Canvas context not available'))
                return
            }

            img.onload = () => {
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)

                canvas.width = img.width * scale
                canvas.height = img.height * scale

                // 🔧 关键修复：不预填充背景色，保持透明
                // 只有在明确要求非透明格式时才填充背景
                if (format === 'jpg') {
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }
                // PNG格式保持透明背景

                // 绘制图片，保持透明通道
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
                const dataUrl = canvas.toDataURL(mimeType, quality)

                resolve(dataUrl)
            }

            img.onerror = () => {
                reject(new Error('图片加载失败'))
            }

            img.src = URL.createObjectURL(file)
        })
    }

    /**
     * 获取元素完整尺寸信息
     */
    static getElementDimensions(element: HTMLElement): ElementDimensions {
        const rect = element.getBoundingClientRect()

        return {
            width: element.clientWidth,
            height: element.clientHeight,
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight
        }
    }

    /**
     * 平滑滚动到指定位置
     */
    static smoothScrollTo(element: HTMLElement, position: ScrollPosition): void {
        element.scrollTo({
            left: position.x,
            top: position.y,
            behavior: 'smooth'
        })
    }

    /**
     * 获取当前滚动位置
     */
    static getScrollPosition(element: HTMLElement = document.documentElement): ScrollPosition {
        return {
            x: element.scrollLeft,
            y: element.scrollTop
        }
    }

    /**
     * 检查元素是否在视口中
     */
    static isElementInViewport(element: HTMLElement, threshold: number = 0): boolean {
        const rect = element.getBoundingClientRect()
        const windowHeight = window.innerHeight || document.documentElement.clientHeight
        const windowWidth = window.innerWidth || document.documentElement.clientWidth

        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        )
    }

    /**
     * 等待元素加载完成
     */
    static waitForElementLoad(element: HTMLElement, timeout: number = 5000): Promise<void> {
        return new Promise((resolve, reject) => {
            if (element.ariaAutoComplete || element.offsetHeight > 0) {
                resolve()
                return
            }

            const timer = setTimeout(() => {
                cleanup()
                reject(new Error('Element load timeout'))
            }, timeout)

            const onLoad = () => {
                cleanup()
                resolve()
            }

            const onError = () => {
                cleanup()
                reject(new Error('Element load failed'))
            }

            const cleanup = () => {
                clearTimeout(timer)
                element.removeEventListener('load', onLoad)
                element.removeEventListener('error', onError)
            }

            element.addEventListener('load', onLoad, {once: true})
            element.addEventListener('error', onError, {once: true})
        })
    }

    /**
     * 创建并下载文件
     */
    static downloadFile(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = filename
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 延迟释放URL
        setTimeout(() => URL.revokeObjectURL(url), 100)
    }

    /**
     * 复制文本到剪贴板
     */
    static async copyToClipboard(text: string): Promise<boolean> {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text)
                return true
            } else {
                // 降级方案
                const textArea = document.createElement('textarea')
                textArea.value = text
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'

                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()

                const success = document.execCommand('copy')
                document.body.removeChild(textArea)

                return success
            }
        } catch (error) {
            console.error('复制失败:', error)
            return false
        }
    }

    /**
     * 防抖DOM操作
     */
    static debouncedObserver(
        callback: (entries: IntersectionObserverEntry[]) => void,
        delay: number = 100
    ): IntersectionObserver {
        let timeoutId: number

        return new IntersectionObserver((entries) => {
            clearTimeout(timeoutId)
            timeoutId = window.setTimeout(() => callback(entries), delay)
        })
    }
}