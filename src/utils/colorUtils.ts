/**
 * 颜色处理工具类 - 增强版
 * 提供颜色转换、调整等功能
 */
export interface ThemeColors {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    light: string
    dark: string
    lighter: string
    lightest: string
    darker: string
    darkest: string
}

export interface ColorPalette {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
}

export class ColorUtils {
    /**
     * 将十六进制颜色转换为RGB对象
     */
    static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            }
            : null
    }

    /**
     * 将RGB值转换为十六进制颜色
     */
    static rgbToHex(r: number, g: number, b: number): string {
        const toHex = (n: number) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    /**
     * 将RGB转换为HSL
     */
    static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h: number
        let s: number
        const l = (max + min) / 2

        if (max === min) {
            h = s = 0 // 无色相
        } else {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break
                case g:
                    h = (b - r) / d + 2;
                    break
                case b:
                    h = (r - g) / d + 4;
                    break
                default:
                    h = 0
            }
            h /= 6
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        }
    }

    /**
     * 将HSL转换为RGB
     */
    static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
        h /= 360
        s /= 100
        l /= 100

        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        let r: number, g: number, b: number

        if (s === 0) {
            r = g = b = l // 无色相
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1 / 3)
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        }
    }

    /**
     * 使颜色变亮
     */
    static lightenColor(color: string, percent: number): string {
        const rgb = this.hexToRgb(color)
        if (!rgb) return color

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
        hsl.l = Math.min(100, hsl.l + percent)

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    }

    /**
     * 使颜色变暗
     */
    static darkenColor(color: string, percent: number): string {
        const rgb = this.hexToRgb(color)
        if (!rgb) return color

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
        hsl.l = Math.max(0, hsl.l - percent)

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    }

    /**
     * 根据背景色获取对比色（黑色或白色）
     */
    static getContrastColor(backgroundColor: string): string {
        const rgb = this.hexToRgb(backgroundColor)
        if (!rgb) return '#000000'

        // 使用WCAG公式计算相对亮度
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
        return luminance > 0.5 ? '#000000' : '#ffffff'
    }

    /**
     * 检查颜色对比度是否符合无障碍标准
     */
    static checkAccessibilityContrast(foreground: string, background: string): {
        ratio: number
        AA: boolean
        AAA: boolean
    } {
        const getLuminance = (color: string) => {
            const rgb = this.hexToRgb(color)
            if (!rgb) return 0

            const toLinear = (c: number) => {
                c = c / 255
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
            }

            return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
        }

        const l1 = getLuminance(foreground)
        const l2 = getLuminance(background)
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

        return {
            ratio: Math.round(ratio * 100) / 100,
            AA: ratio >= 4.5,
            AAA: ratio >= 7
        }
    }

    /**
     * 生成主题色变体
     */
    static generateThemeVariants(baseColor: string): ThemeColors {
        return {
            primary: baseColor,
            secondary: this.adjustSaturation(baseColor, -20),
            success: '#198754',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#0dcaf0',
            light: '#f8f9fa',
            dark: '#212529',
            lighter: this.lightenColor(baseColor, 40),
            lightest: this.lightenColor(baseColor, 80),
            darker: this.darkenColor(baseColor, 30),
            darkest: this.darkenColor(baseColor, 60)
        }
    }

    /**
     * 生成颜色调色板
     */
    static generateColorPalette(baseColor: string): ColorPalette {
        return {
            50: this.lightenColor(baseColor, 45),
            100: this.lightenColor(baseColor, 40),
            200: this.lightenColor(baseColor, 30),
            300: this.lightenColor(baseColor, 20),
            400: this.lightenColor(baseColor, 10),
            500: baseColor,
            600: this.darkenColor(baseColor, 10),
            700: this.darkenColor(baseColor, 20),
            800: this.darkenColor(baseColor, 30),
            900: this.darkenColor(baseColor, 40)
        }
    }

    /**
     * 调整颜色饱和度
     */
    static adjustSaturation(color: string, percent: number): string {
        const rgb = this.hexToRgb(color)
        if (!rgb) return color

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
        hsl.s = Math.max(0, Math.min(100, hsl.s + percent))

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l)
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    }

    /**
     * 创建渐变色
     */
    static createGradient(
        startColor: string,
        endColor: string,
        direction: string = '135deg'
    ): string {
        return `linear-gradient(${direction}, ${startColor} 0%, ${endColor} 100%)`
    }

    /**
     * 获取主题色配色方案（兼容性保持）
     */
    static getThemeColors(primaryColor: string) {
        return {
            primary: primaryColor,
            lighter: this.lightenColor(primaryColor, 40),
            lightest: this.lightenColor(primaryColor, 80),
            darker: this.darkenColor(primaryColor, 30),
            darkest: this.darkenColor(primaryColor, 60)
        }
    }

    /**
     * 验证颜色格式
     */
    static isValidHexColor(color: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
    }

    /**
     * 混合两种颜色
     */
    static mixColors(color1: string, color2: string, weight: number = 0.5): string {
        const rgb1 = this.hexToRgb(color1)
        const rgb2 = this.hexToRgb(color2)

        if (!rgb1 || !rgb2) return color1

        const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight)
        const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight)
        const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight)

        return this.rgbToHex(r, g, b)
    }

    /**
     * Convert HSL to Hex color
     */
    static hslToHex(h: number, s: number, l: number): string {
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h >= 60 && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h >= 180 && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h >= 240 && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (h >= 300 && h < 360) {
            r = c;
            g = 0;
            b = x;
        }

        // Convert to hex
        const toHex = (n: number) => {
            const val = Math.round((n + m) * 255);
            const hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}