/**
 * 文本处理工具类 - 增强版
 * 提供文本格式化、高亮处理等功能
 */
export interface TextStats {
    characters: number
    charactersNoSpaces: number
}

export interface HighlightRule {
    pattern: RegExp
    className: string
    priority: number
}

export class TextProcessor {
    private static defaultHighlightRules: HighlightRule[] = [
        {pattern: /【([^】]+)】/g, className: 'highlight-red', priority: 3},
        {pattern: /"([^"]+)"/g, className: 'highlight-red', priority: 2},
        {pattern: /(\d+(?:\.\d+)?[余多]?[万千百十亿]?元)/g, className: 'highlight-red', priority: 1}
    ]

    /**
     * 处理高亮文本（综合处理）
     */
    static processHighlightText(text: string, customRules?: HighlightRule[]): string {
        if (!text) return ''

        // 1. 清理文本
        text = text.trim()

        // 2. 处理段落缩进
        text = this.addParagraphIndent(text)

        // 3. 使用规则进行高亮处理
        const rules = customRules || this.defaultHighlightRules
        text = this.applyHighlightRules(text, rules)

        // 4. 清理嵌套标签
        text = this.cleanNestedSpans(text)

        return text
    }

    /**
     * 应用高亮规则
     */
    static applyHighlightRules(text: string, rules: HighlightRule[]): string {
        // 按优先级排序，优先级高的先处理
        const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

        let processedText = text

        for (const rule of sortedRules) {
            processedText = processedText.replace(rule.pattern, (match, content) => {
                // 检查是否已经被处理过
                if (match.includes('highlight-red') || match.includes('<span')) {
                    return match
                }

                if (content) {
                    return `<span class="${rule.className}">${content}</span>`
                } else {
                    return `<span class="${rule.className}">${match}</span>`
                }
            })
        }

        return processedText
    }

    /**
     * 添加段落缩进
     */
    static addParagraphIndent(text: string): string {
        return text
            .split('\n')
            .map(line => {
                const trimmedLine = line.trim()
                if (trimmedLine.length === 0) return ''

                // 如果行不是以缩进开始，添加2个空格
                if (!trimmedLine.startsWith('  ')) {
                    return '    ' + trimmedLine
                }
                return trimmedLine
            })
            .join('\n')
            .replace(/^ {2}/gm, '&nbsp;&nbsp;&nbsp;&nbsp;') // 转换为HTML不间断空格
    }

    /**
     * 高亮【】标记的内容
     */
    static highlightBracketContent(text: string): string {
        return text.replace(/【([^】]+)】/g, '<span class="highlight-red">$1</span>')
    }

    /**
     * 高亮引号内容
     */
    static highlightQuotedContent(text: string): string {
        return text.replace(/"([^"]+)"/g, (match, content) => {
            // 检查内容是否已经被标记处理
            if (content.includes('highlight-red')) {
                return match // 已经处理过，直接返回原内容
            }
            return '<span class="highlight-red">"' + content + '"</span>'
        })
    }

    /**
     * 高亮金额数字
     */
    static highlightCurrency(text: string): string {
        return text.replace(/(\d+(?:\.\d+)?[余多]?[万千百十亿]?元)/g, match => {
            // 避免重复处理已经高亮的内容
            return match.includes('highlight-red')
                ? match
                : '<span class="highlight-red">' + match + '</span>'
        })
    }

    /**
     * 清理嵌套的span标签
     */
    static cleanNestedSpans(text: string): string {
        return text.replace(
            /<span class="highlight-red"><span class="highlight-red">([^<]+)<\/span><\/span>/g,
            '<span class="highlight-red">$1</span>'
        )
    }

    /**
     * 移除HTML标签
     */
    static stripHtmlTags(text: string): string {
        return text.replace(/<[^>]*>/g, '')
    }

    /**
     * 智能截断文本
     */
    static smartTruncate(text: string, maxLength: number, suffix: string = '...'): string {
        if (text.length <= maxLength) return text

        // 尝试在单词边界截断
        const truncated = text.substring(0, maxLength - suffix.length)
        const lastSpace = truncated.lastIndexOf(' ')

        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + suffix
        }

        return truncated + suffix
    }

    /**
     * 截断文本（向后兼容）
     */
    static truncateText(text: string, maxLength: number, suffix: string = '...'): string {
        return this.smartTruncate(text, maxLength, suffix)
    }

    /**
     * 转义HTML特殊字符
     */
    static escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }
        return text.replace(/[&<>"']/g, m => map[m])
    }

    /**
     * 反转义HTML字符
     */
    static unescapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        }
        return text.replace(/&(?:amp|lt|gt|quot|#039);/g, m => map[m])
    }

    /**
     * 计算文本行数
     */
    static getLineCount(text: string): number {
        return text.split('\n').length
    }

    /**
     * 格式化文本（用于警告文本）
     */
    static formatWarningText(text: string): string {
        if (!text) return ''

        return text
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n')
    }

    /**
     * 检测文本语言
     */
    static detectLanguage(text: string): 'zh' | 'en' | 'mixed' | 'unknown' {
        const cleanText = this.stripHtmlTags(text).replace(/\s/g, '')
        if (!cleanText) return 'unknown'

        const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g)?.length || 0
        const englishChars = cleanText.match(/[a-zA-Z]/g)?.length || 0

        const chineseRatio = chineseChars / cleanText.length
        const englishRatio = englishChars / cleanText.length

        if (chineseRatio > 0.7) return 'zh'
        if (englishRatio > 0.7) return 'en'
        if (chineseRatio > 0.3 && englishRatio > 0.3) return 'mixed'

        return 'unknown'
    }

    /**
     * 文本相似度计算（简单版本）
     */
    static calculateSimilarity(text1: string, text2: string): number {
        const clean1 = this.stripHtmlTags(text1).toLowerCase()
        const clean2 = this.stripHtmlTags(text2).toLowerCase()

        if (clean1 === clean2) return 1

        const maxLength = Math.max(clean1.length, clean2.length)
        if (maxLength === 0) return 1

        let matches = 0
        const minLength = Math.min(clean1.length, clean2.length)

        for (let i = 0; i < minLength; i++) {
            if (clean1[i] === clean2[i]) {
                matches++
            }
        }

        return matches / maxLength
    }

    /**
     * 提取关键词（简单版本）
     */
    static extractKeywords(text: string, maxCount: number = 10): string[] {
        const cleanText = this.stripHtmlTags(text)
        const words = cleanText
            .replace(/[^\u4e00-\u9fffa-zA-Z\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1)

        const frequency: Record<string, number> = {}

        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1
        })

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxCount)
            .map(([word]) => word)
    }
}