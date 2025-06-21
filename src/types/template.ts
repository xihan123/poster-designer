import {PosterConfig} from "@/types/poster.ts";

export interface TemplateConfig {
    id: string
    name: string
    component: any
    thumbnail?: string
    defaultConfig: Partial<PosterConfig>
    description?: string
}

export interface TemplateRegistry {
    [key: string]: TemplateConfig
}