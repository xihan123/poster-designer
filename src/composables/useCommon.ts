import {onUnmounted, ref, type Ref, watch} from 'vue'

/**
 * 通用Hook集合
 */

/**
 * 防抖Hook
 */
export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
    const debouncedValue = ref(value.value) as Ref<T>
    let timeoutId: number

    const updateDebouncedValue = () => {
        clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
            debouncedValue.value = value.value
        }, delay)
    }

    watch(value, updateDebouncedValue, {immediate: true})

    onUnmounted(() => {
        clearTimeout(timeoutId)
    })

    return debouncedValue
}

/**
 * 本地存储Hook
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): [Ref<T>, (value: T) => void] {
    const storedValue = ref(defaultValue) as Ref<T>

    // 初始化时从localStorage读取
    try {
        const item = localStorage.getItem(key)
        if (item !== null) {
            storedValue.value = JSON.parse(item) as T
        } else {
            localStorage.setItem(key, JSON.stringify(defaultValue))
        }
    } catch (error) {
        console.warn(`读取localStorage失败: ${key}`, error)
        storedValue.value = defaultValue
    }

    // 监听ref变化，自动更新localStorage
    watch(
        storedValue,
        (newValue) => {
            try {
                localStorage.setItem(key, JSON.stringify(newValue))
            } catch (error) {
                console.warn(`写入localStorage失败: ${key}`, error)
            }
        },
        {deep: true}
    )

    // 设置值的函数
    const setValue = (value: T) => {
        storedValue.value = value
    }

    // 监听storage事件，实现跨标签页同步
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key) {
            if (event.newValue) {
                try {
                    storedValue.value = JSON.parse(event.newValue) as T
                } catch (error) {
                    console.warn(`解析localStorage新值失败: ${key}`, error)
                }
            } else {
                // 如果新值为null，说明在其他标签页被清除了
                storedValue.value = defaultValue
            }
        }
    }

    window.addEventListener('storage', handleStorageChange)

    onUnmounted(() => {
        window.removeEventListener('storage', handleStorageChange)
    })

    return [storedValue, setValue]
}

/**
 * 异步状态Hook
 */
export interface AsyncState<T> {
    data: Ref<T | null>
    loading: Ref<boolean>
    error: Ref<string | null>
    execute: () => Promise<void>
    reset: () => void
}

export function useAsyncState<T>(
    asyncFn: () => Promise<T>,
    immediate: boolean = false
): AsyncState<T> {
    const data = ref<T | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const execute = async () => {
        try {
            loading.value = true
            error.value = null
            data.value = await asyncFn()
        } catch (err) {
            error.value = err instanceof Error ? err.message : '未知错误'
            data.value = null
        } finally {
            loading.value = false
        }
    }

    const reset = () => {
        data.value = null
        loading.value = false
        error.value = null
    }

    if (immediate) {
        execute()
    }

    return {
        data: data as Ref<T | null>,
        loading,
        error,
        execute,
        reset
    }
}

/**
 * 窗口尺寸Hook
 */
export function useWindowSize() {
    const width = ref(window.innerWidth)
    const height = ref(window.innerHeight)

    const updateSize = () => {
        width.value = window.innerWidth
        height.value = window.innerHeight
    }

    window.addEventListener('resize', updateSize)

    onUnmounted(() => {
        window.removeEventListener('resize', updateSize)
    })

    return {width, height}
}

/**
 * 点击外部Hook
 */
export function useClickOutside(
    elementRef: Ref<HTMLElement | null>,
    callback: () => void
) {
    const handleClick = (event: MouseEvent) => {
        if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
            callback()
        }
    }

    document.addEventListener('click', handleClick)

    onUnmounted(() => {
        document.removeEventListener('click', handleClick)
    })
}

/**
 * 复制到剪贴板Hook
 */
export function useClipboard() {
    const isSupported = ref(!!navigator.clipboard)
    const copied = ref(false)

    const copy = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text)
            } else {
                // 降级方案
                const textArea = document.createElement('textarea')
                textArea.value = text
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }

            copied.value = true
            setTimeout(() => {
                copied.value = false
            }, 2000)

            return true
        } catch (error) {
            console.error('复制失败:', error)
            return false
        }
    }

    return {
        isSupported,
        copied,
        copy
    }
}