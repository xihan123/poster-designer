export interface PosterConfig {
    // Basic Settings
    title: string
    subtitle: string
    year: number
    month: number
    day: number
    lunarDate: string
    isAutoDate: boolean

    // Content Elements
    logo?: LogoElement
    headerImage?: ImageElement
    textBlocks: TextBlockElement[]
    caseList: CaseElement[]
    warningTips: WarningElement[]
    policeImage?: ImageElement
    footerSlogans: SlotElement[]

    // Style Settings
    theme: ThemeConfig

    // Export Settings
    resolution: 'hd' | '2k' | '4k' | 'custom'
    format: 'png' | 'jpg'
    customWidth?: number
    customHeight?: number
    isTransparentBackground: boolean
    quality?: number
}

export interface ThemeConfig {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    textColor: string
    backgroundColor: string
    warningColor: string
    customColors: Record<string, string>
}

export interface BaseElement {
    id: string
    type: string
    position: Position
    isVisible: boolean
}

export interface Position {
    x: number
    y: number
    zIndex: number
    rotation: number
}

export interface TextBlockElement extends BaseElement {
    type: 'text'
    content: string
    style: TextStyle
    isHighlightable: boolean
}

export interface TextStyle {
    fontSize: number
    fontWeight: string
    fontFamily: string
    color: string
    alignment: 'left' | 'center' | 'right' | 'justify'
    lineHeight: number
    letterSpacing: number
}

export interface ImageElement extends BaseElement {
    type: 'image'
    source: string
    altText: string
    size: {
        width: number
        height: number
    }
    fit: 'contain' | 'cover' | 'fill'
}

export interface LogoElement extends ImageElement {
    type: 'logo'
}

export interface CaseElement extends BaseElement {
    type: 'case'
    title: string
    content: string
    highlights: string[]
    isExpanded: boolean
}

export interface WarningElement extends BaseElement {
    type: 'warning'
    content: string
    icon?: string
    style: TextStyle
}

export interface SlotElement extends BaseElement {
    type: 'slot'
    content: string
    icon?: string
    backgroundColor: string
    textColor: string
    size: number
    fontSize?: number
}

// Export types
export interface ExportConfig {
    resolution: string
    format: string
    quality?: number
    customWidth?: number
    customHeight?: number
    isTransparentBackground?: boolean
}

export interface Resolution {
    width: number
    height: number
}

export interface ExportResult {
    success: boolean
    filename?: string
    error?: string
}