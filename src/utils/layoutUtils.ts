/**
 * 布局计算工具类
 * 提供DOM元素尺寸计算、防抖等功能
 */
export class LayoutUtils {
    /**
     * 等待下一个Vue tick
     */
    static async waitForNextTick(): Promise<void> {
        return new Promise(resolve => {
            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(() => resolve())
            } else {
                setTimeout(resolve, 16) // 约60fps
            }
        })
    }

    /**
     * 获取元素尺寸信息
     */
    static getElementDimensions(element: HTMLElement): {
        width: number
        height: number
        scrollWidth: number
        scrollHeight: number
        offsetWidth: number
        offsetHeight: number
    } {
        return {
            width: element.clientWidth,
            height: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight
        }
    }

    /**
     * 计算海报高度
     */
    static async calculatePosterHeight(config: {
        textElement?: HTMLElement
        warningElement?: HTMLElement
        footerElement?: HTMLElement
        hasImage: boolean
        minHeight?: number
    }): Promise<number> {
        await this.waitForNextTick()

        const {
            textElement,
            warningElement,
            footerElement,
            hasImage,
            minHeight = 850
        } = config

        if (!textElement || !warningElement || !footerElement) {
            return minHeight
        }

        try {
            const textHeight = textElement.scrollHeight
            const warningHeight = warningElement.scrollHeight
            const footerHeight = footerElement.offsetHeight
            const imageHeight = hasImage ? 220 : 0

            // 固定高度部分
            const headerHeight = 120
            const paddingHeight = 50
            const dateHeight = 120
            const bottomSectionSpacing = 40
            const footerSpacing = 35

            // 计算主内容区域高度
            const mainContentHeight = Math.max(350, textHeight + imageHeight + 40)

            // 计算警告区域实际高度
            const warningActualHeight = Math.max(60, warningHeight + 20)

            // 计算总高度
            const totalHeight =
                headerHeight +
                mainContentHeight +
                bottomSectionSpacing +
                Math.max(dateHeight, warningActualHeight) +
                footerSpacing +
                footerHeight +
                paddingHeight

            return Math.max(minHeight, totalHeight)
        } catch (error) {
            console.warn('计算高度时出错:', error)
            return minHeight
        }
    }

    /**
     * 防抖函数
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func.apply(null, args), delay)
        }
    }

}