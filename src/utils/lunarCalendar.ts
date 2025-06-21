// 农历数据表（1900-2100年）
const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520
];

// 农历月份名称
const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']

// 农历日期名称
const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

interface LunarResult {
    year: number
    month: number
    day: number
    isLeapMonth: boolean
    monthName: string
    dayName: string
    fullString: string
}

export function solarToLunar(year: number, month: number, day: number): LunarResult {
    // 验证输入
    if (year < 1900 || year > 2100) {
        return getBackupLunar(year, month, day)
    }

    try {
        // 计算从1900年1月31日到指定日期的天数
        const baseDate = new Date(1900, 0, 31) // 1900年1月31日
        const targetDate = new Date(year, month - 1, day)
        const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff < 0) {
            return getBackupLunar(year, month, day)
        }

        let lunarYear = 1900
        let remainingDays = daysDiff

        // 确定农历年份
        while (remainingDays > 0) {
            const yearInfo = getLunarYearInfo(lunarYear)
            if (!yearInfo || remainingDays < yearInfo.totalDays) {
                break
            }
            remainingDays -= yearInfo.totalDays
            lunarYear++
        }

        const yearInfo = getLunarYearInfo(lunarYear)
        if (!yearInfo) {
            return getBackupLunar(year, month, day)
        }

        let lunarMonth = 1
        let isLeapMonth = false

        // 确定农历月份
        while (remainingDays > 0) {
            let monthDays: number

            // 检查是否是闰月
            if (yearInfo.leapMonth > 0 && lunarMonth === yearInfo.leapMonth + 1 && !isLeapMonth) {
                isLeapMonth = true
                monthDays = yearInfo.leapDays
                lunarMonth--
            } else {
                monthDays = yearInfo.monthDays[lunarMonth - 1]
            }

            if (remainingDays < monthDays) {
                break
            }

            remainingDays -= monthDays

            if (isLeapMonth) {
                isLeapMonth = false
            }
            lunarMonth++
        }

        const lunarDay = remainingDays + 1
        const monthName = isLeapMonth ? `闰${lunarMonths[lunarMonth - 1]}` : lunarMonths[lunarMonth - 1]
        const dayName = lunarDays[lunarDay - 1]

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            isLeapMonth,
            monthName,
            dayName,
            fullString: `农历${monthName}${dayName}`
        }
    } catch (error) {
        console.warn('农历计算失败:', error)
        return getBackupLunar(year, month, day)
    }
}

function getLunarYearInfo(year: number) {
    if (year < 1900 || year > 2100) {
        return null
    }

    const info = lunarInfo[year - 1900]
    const leapMonth = (info & 0xf)
    const leapDays = leapMonth > 0 ? ((info & 0x10000) ? 30 : 29) : 0

    const monthDays = []
    for (let i = 1; i <= 12; i++) {
        monthDays.push((info & (0x10000 >> i)) ? 30 : 29)
    }

    return {
        leapMonth,
        leapDays,
        monthDays,
        totalDays: monthDays.reduce((sum, days) => sum + days, 0) + leapDays
    }
}

function getBackupLunar(year: number, month: number, day: number): LunarResult {
    const baseDate = new Date(year, month - 1, day)
    const dayOfYear = Math.floor((baseDate.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const estimatedMonth = Math.floor((dayOfYear % 354) / 29.5)
    const estimatedDay = Math.floor((dayOfYear % 354) % 29.5)

    return {
        year,
        month: estimatedMonth + 1,
        day: estimatedDay + 1,
        isLeapMonth: false,
        monthName: lunarMonths[estimatedMonth] || '五月',
        dayName: lunarDays[estimatedDay] || '初一',
        fullString: `农历${lunarMonths[estimatedMonth] || '五月'}${lunarDays[estimatedDay] || '初一'}`
    }
}