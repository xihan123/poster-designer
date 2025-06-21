import type {TemplateRegistry} from '@/types/template'
import PosterUniversalTemplate from './PosterUniversalTemplate.vue'
import GovernmentAnnouncementTemplate from './GovernmentAnnouncementTemplate.vue'
import EducationalTemplate from './EducationalTemplate.vue'

export const templateRegistry: TemplateRegistry = {
    'universal': {
        id: 'universal',
        name: '通用模板',
        component: PosterUniversalTemplate,
        description: '高度可定制的通用模板，适用于各种场景',
        defaultConfig: {
            title: '反诈预警',
            // primaryColor: '#2c5aa0'
        }
    },
    'government': {
        id: 'government',
        name: '政务公告',
        component: GovernmentAnnouncementTemplate,
        description: '庄重规范的政务公告模板',
        defaultConfig: {
            title: '公告',
            // primaryColor: '#b91c1c'
        }
    },
    'educational': {
        id: 'educational',
        name: '教育宣传',
        component: EducationalTemplate,
        description: '适合培训教育、知识普及的模板',
        defaultConfig: {
            title: '安全教育',
            // primaryColor: '#15803d'
        }
    }
}

export {
    PosterUniversalTemplate,
    GovernmentAnnouncementTemplate,
    EducationalTemplate
}