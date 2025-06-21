/**
 * 表单验证工具类
 * 统一管理各种验证逻辑
 */
export interface ValidationResult {
    isValid: boolean
    message?: string
}

export interface FileValidationOptions {
    maxSize?: number // bytes
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
}

export interface TextValidationOptions {
    minLength?: number
    maxLength?: number
    required?: boolean
    pattern?: RegExp
}

export class ValidationUtils {
    /**
     * 验证颜色格式
     */
    static validateColor(color: string): ValidationResult {
        if (!color) {
            return {isValid: false, message: '颜色值不能为空'}
        }

        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexPattern.test(color)) {
            return {isValid: false, message: '请输入有效的十六进制颜色值'}
        }

        return {isValid: true}
    }

    /**
     * 验证文件
     */
    static validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        } = options

        if (!file) {
            return {isValid: false, message: '请选择文件'}
        }

        // 检查文件大小
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
            return {isValid: false, message: `文件大小不能超过 ${maxSizeMB}MB`}
        }

        // 检查文件类型
        if (!allowedTypes.includes(file.type)) {
            return {isValid: false, message: '不支持的文件格式'}
        }

        return {isValid: true}
    }

    /**
     * 验证图片尺寸
     */
    static async validateImageDimensions(
        file: File,
        options: { maxWidth?: number; maxHeight?: number } = {}
    ): Promise<ValidationResult> {
        return new Promise((resolve) => {
            const img = new Image()
            const url = URL.createObjectURL(file)

            img.onload = () => {
                URL.revokeObjectURL(url)

                const {maxWidth = 5000, maxHeight = 5000} = options

                if (img.width > maxWidth || img.height > maxHeight) {
                    resolve({
                        isValid: false,
                        message: `图片尺寸不能超过 ${maxWidth}×${maxHeight}`
                    })
                } else {
                    resolve({isValid: true})
                }
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                resolve({isValid: false, message: '无法读取图片文件'})
            }

            img.src = url
        })
    }

    /**
     * 验证日期范围
     */
    static validateDateRange(year: number, month: number, day: number): ValidationResult {
        if (!year || !month || !day) {
            return {isValid: false, message: '日期不能为空'}
        }

        if (year < 2020 || year > 2030) {
            return {isValid: false, message: '年份必须在 2020-2030 之间'}
        }

        if (month < 1 || month > 12) {
            return {isValid: false, message: '月份必须在 1-12 之间'}
        }

        if (day < 1 || day > 31) {
            return {isValid: false, message: '日期必须在 1-31 之间'}
        }

        // 检查日期有效性
        const date = new Date(year, month - 1, day)
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return {isValid: false, message: '无效的日期'}
        }

        return {isValid: true}
    }

    /**
     * 验证文本
     */
    static validateText(text: string, options: TextValidationOptions = {}): ValidationResult {
        const {minLength = 0, maxLength = 1000, required = false, pattern} = options

        if (required && (!text || text.trim().length === 0)) {
            return {isValid: false, message: '此字段为必填项'}
        }

        if (text && text.length < minLength) {
            return {isValid: false, message: `最少需要 ${minLength} 个字符`}
        }

        if (text && text.length > maxLength) {
            return {isValid: false, message: `最多只能输入 ${maxLength} 个字符`}
        }

        if (pattern && text && !pattern.test(text)) {
            return {isValid: false, message: '格式不正确'}
        }

        return {isValid: true}
    }

    /**
     * 验证数字范围
     */
    static validateNumberRange(
        value: number,
        min: number,
        max: number,
        fieldName: string = '数值'
    ): ValidationResult {
        if (isNaN(value)) {
            return {isValid: false, message: `${fieldName}必须是数字`}
        }

        if (value < min || value > max) {
            return {isValid: false, message: `${fieldName}必须在 ${min}-${max} 之间`}
        }

        return {isValid: true}
    }

    /**
     * 批量验证
     */
    static validateAll(validators: (() => ValidationResult)[]): ValidationResult {
        for (const validator of validators) {
            const result = validator()
            if (!result.isValid) {
                return result
            }
        }
        return {isValid: true}
    }
}