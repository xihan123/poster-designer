/**
 * 移动端适配工具类
 * 统一管理响应式相关逻辑
 */
export interface DeviceInfo {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    orientation: 'portrait' | 'landscape'
    screenWidth: number
    screenHeight: number
    devicePixelRatio: number
}

export interface TouchEventOptions {
    preventDefault?: boolean
    passive?: boolean
    capture?: boolean
}

export class ResponsiveUtils {
    private static breakpoints = {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    }

    /**
     * 获取设备信息
     */
    static getDeviceInfo(): DeviceInfo {
        const width = window.innerWidth
        const height = window.innerHeight

        return {
            isMobile: width <= this.breakpoints.mobile,
            isTablet: width > this.breakpoints.mobile && width <= this.breakpoints.tablet,
            isDesktop: width > this.breakpoints.tablet,
            orientation: width > height ? 'landscape' : 'portrait',
            screenWidth: width,
            screenHeight: height,
            devicePixelRatio: window.devicePixelRatio || 1
        }
    }

    /**
     * 检查是否为移动设备
     */
    static isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    }

    /**
     * 检查是否为触摸设备
     */
    static isTouchDevice(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }

    /**
     * 获取安全区域
     */
    static getSafeAreaInsets(): {
        top: number
        right: number
        bottom: number
        left: number
    } {
        const style = getComputedStyle(document.documentElement)

        return {
            top: parseInt(style.getPropertyValue('--sat') || '0'),
            right: parseInt(style.getPropertyValue('--sar') || '0'),
            bottom: parseInt(style.getPropertyValue('--sab') || '0'),
            left: parseInt(style.getPropertyValue('--sal') || '0')
        }
    }

    /**
     * 监听视口尺寸变化
     */
    static onViewportChange(
        callback: (deviceInfo: DeviceInfo) => void,
        debounceDelay: number = 250
    ): () => void {
        let timeoutId: number

        const handler = () => {
            clearTimeout(timeoutId)
            timeoutId = window.setTimeout(() => {
                callback(this.getDeviceInfo())
            }, debounceDelay)
        }

        window.addEventListener('resize', handler)
        window.addEventListener('orientationchange', handler)

        // 返回清理函数
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', handler)
            window.removeEventListener('orientationchange', handler)
        }
    }

    /**
     * 监听方向变化
     */
    static onOrientationChange(
        callback: (orientation: 'portrait' | 'landscape') => void
    ): () => void {
        const handler = () => {
            const {orientation} = this.getDeviceInfo()
            callback(orientation)
        }

        // 使用 resize 事件作为降级方案
        window.addEventListener('orientationchange', handler)
        window.addEventListener('resize', handler)

        return () => {
            window.removeEventListener('orientationchange', handler)
            window.removeEventListener('resize', handler)
        }
    }

    /**
     * 添加触摸事件监听器
     */
    static addTouchEventListener(
        element: HTMLElement,
        eventType: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
        handler: (event: TouchEvent) => void,
        options: TouchEventOptions = {}
    ): () => void {
        const {preventDefault = false, passive = true, capture = false} = options

        const wrappedHandler = (event: TouchEvent) => {
            if (preventDefault && !passive) {
                event.preventDefault()
            }
            handler(event)
        }

        element.addEventListener(eventType, wrappedHandler, {passive, capture})

        return () => {
            element.removeEventListener(eventType, wrappedHandler, {capture})
        }
    }

    /**
     * 禁用页面滚动（移动端）
     */
    static disableScroll(): () => void {
        const body = document.body
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop

        body.style.position = 'fixed'
        body.style.top = `-${scrollTop}px`
        body.style.width = '100%'

        return () => {
            body.style.position = ''
            body.style.top = ''
            body.style.width = ''
            window.scrollTo(0, scrollTop)
        }
    }

    /**
     * 设置视口元标签
     */
    static setViewportMeta(options: {
        width?: string
        initialScale?: number
        maximumScale?: number
        userScalable?: boolean
    } = {}): void {
        const {
            width = 'device-width',
            initialScale = 1.0,
            maximumScale = 1.0,
            userScalable = false
        } = options

        let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement

        if (!viewport) {
            viewport = document.createElement('meta')
            viewport.name = 'viewport'
            document.head.appendChild(viewport)
        }

        viewport.content = [
            `width=${width}`,
            `initial-scale=${initialScale}`,
            `maximum-scale=${maximumScale}`,
            `user-scalable=${userScalable ? 'yes' : 'no'}`
        ].join(', ')
    }

    /**
     * 计算响应式字体大小
     */
    static getResponsiveFontSize(
        baseFontSize: number,
        minFontSize: number = 12,
        maxFontSize: number = 24
    ): number {
        const {screenWidth} = this.getDeviceInfo()
        const baseWidth = 375 // 基准宽度（iPhone X）

        const scale = screenWidth / baseWidth
        const fontSize = baseFontSize * scale

        return Math.max(minFontSize, Math.min(maxFontSize, fontSize))
    }

    /**
     * 获取当前断点
     */
    static getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
        const {isMobile, isTablet} = this.getDeviceInfo()

        if (isMobile) return 'mobile'
        if (isTablet) return 'tablet'
        return 'desktop'
    }
}