import {computed, ref} from 'vue'
import {templateRegistry} from '@/components/PosterTemplates'

export function useTemplateManager() {
    const currentTemplateId = ref('universal')

    const currentTemplate = computed(() => {
        return templateRegistry[currentTemplateId.value]
    })

    const availableTemplates = computed(() => {
        return Object.values(templateRegistry)
    })

    const switchTemplate = (templateId: string) => {
        if (templateRegistry[templateId]) {
            currentTemplateId.value = templateId
        }
    }

    return {
        currentTemplateId,
        currentTemplate,
        availableTemplates,
        switchTemplate
    }
}