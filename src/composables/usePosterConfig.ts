import {reactive, watch} from 'vue'
import {v4 as uuidv4} from 'uuid'
import type {CaseElement, PosterConfig, SlotElement, TextBlockElement, WarningElement} from '@/types/poster'
import {solarToLunar} from '@/utils/lunarCalendar'
import {useLocalStorage} from '@/composables/useCommon'

const getCurrentDate = () => {
    const today = new Date()
    return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
    }
}

const getCurrentLunar = () => {
    const {year, month, day} = getCurrentDate()
    try {
        const lunarResult = solarToLunar(year, month, day)
        return lunarResult.fullString
    } catch (error) {
        console.warn('获取农历日期失败:', error)
        return '农历日期获取失败'
    }
}

const createDefaultConfig = (): PosterConfig => {
    const currentDate = getCurrentDate()

    // Create default text blocks
    const titleBlock: TextBlockElement = {
        id: 'title',
        type: 'text',
        content: '反诈预警',
        position: {x: 0, y: 0, zIndex: 10, rotation: 0},
        isVisible: true,
        style: {
            fontSize: 42,
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei, SimHei',
            color: '#ffffff',
            alignment: 'center',
            lineHeight: 1.2,
            letterSpacing: 0
        },
        isHighlightable: false
    }

    const subtitleBlock: TextBlockElement = {
        id: 'subtitle',
        type: 'text',
        content: '防范电信网络诈骗',
        position: {x: 0, y: 0, zIndex: 9, rotation: 0},
        isVisible: true,
        style: {
            fontSize: 24,
            fontWeight: 'normal',
            fontFamily: 'Microsoft YaHei, SimHei',
            color: '#ffffff',
            alignment: 'center',
            lineHeight: 1.3,
            letterSpacing: 0
        },
        isHighlightable: false
    }

    // Create default case
    const defaultCase: CaseElement = {
        id: uuidv4(),
        type: 'case',
        title: '电信诈骗案例',
        content: '2024年5月28日，居民Y先生在家中浏览网页时收到陌生用户私信，对方自称知晓【股票交易内幕】，诱导Y先生下载名为"中投国际"的APP。在客服的指导下，Y先生先后向指定账户转账【20余万元】至APP内，后因无法正常登陆发觉被骗。',
        highlights: ['股票交易内幕', '20余万元'],
        position: {x: 0, y: 0, zIndex: 1, rotation: 0},
        isVisible: true,
        isExpanded: true
    }

    // Create default warning
    const defaultWarning: WarningElement = {
        id: uuidv4(),
        type: 'warning',
        content: '凡是承诺"内幕消息""高额回报""稳赚不赔"的网络投资理财就是诈骗！',
        position: {x: 0, y: 0, zIndex: 5, rotation: 0},
        isVisible: true,
        style: {
            fontSize: 21,
            fontWeight: 'bold',
            fontFamily: 'Microsoft YaHei, SimHei',
            color: '#dc2626',
            alignment: 'left',
            lineHeight: 1.5,
            letterSpacing: 0
        }
    }

    // Create default signing entity (updated from slogan)
    const defaultSigningEntity: SlotElement = {
        id: uuidv4(),
        type: 'slot',
        content: '反诈中心',
        position: {x: 0, y: 0, zIndex: 3, rotation: 0},
        isVisible: true,
        backgroundColor: '#2c5aa0',
        textColor: '#ffffff',
        size: 72,
        fontSize: 20
    }

    return {
        // Basic settings
        title: '反诈预警',
        subtitle: '防范电信网络诈骗',
        year: currentDate.year,
        month: currentDate.month,
        day: currentDate.day,
        lunarDate: getCurrentLunar(),
        isAutoDate: true,

        // Content elements
        textBlocks: [titleBlock, subtitleBlock],
        caseList: [defaultCase],
        warningTips: [defaultWarning],
        footerSlogans: [defaultSigningEntity],

        // Theme settings
        theme: {
            primaryColor: '#2c5aa0',
            secondaryColor: '#1e3a8a',
            accentColor: '#0284c7',
            textColor: '#1e293b',
            backgroundColor: '#f1f5f9',
            warningColor: '#dc2626',
            customColors: {}
        },

        // Export settings
        resolution: '2k',
        format: 'png',
        isTransparentBackground: false
    }
}

export function usePosterConfig() {
    // Load saved config or use default
    const [savedConfig, setSavedConfig] = useLocalStorage('posterConfig', createDefaultConfig())

    // Create reactive config
    const config = reactive<PosterConfig>({
        ...createDefaultConfig(),
        ...savedConfig.value
    })

    // Watch for config changes and save
    watch(
        config,
        (newConfig) => {
            setSavedConfig(newConfig)

            // Auto-update lunar date when solar date changes
            if (newConfig.isAutoDate) {
                const today = new Date()
                config.year = today.getFullYear()
                config.month = today.getMonth() + 1
                config.day = today.getDate()

                try {
                    const lunarResult = solarToLunar(config.year, config.month, config.day)
                    config.lunarDate = lunarResult.fullString
                } catch (error) {
                    console.warn('更新农历日期失败:', error)
                }
            } else if (newConfig.year && newConfig.month && newConfig.day) {
                try {
                    const lunarResult = solarToLunar(newConfig.year, newConfig.month, newConfig.day)
                    config.lunarDate = lunarResult.fullString
                } catch (error) {
                    console.warn('更新农历日期失败:', error)
                }
            }
        },
        {deep: true}
    )

    const updateConfig = (updates: Partial<PosterConfig>) => {
        // Handle special reset case
        if ('__reset' in updates) {
            const defaultConf = createDefaultConfig()
            Object.keys(config).forEach((key) => {
                // @ts-ignore
                config[key] = defaultConf[key]
            })
            return
        }

        // Normal updates
        Object.assign(config, updates)
    }

    return {
        config,
        updateConfig,
        createDefaultConfig
    }
}