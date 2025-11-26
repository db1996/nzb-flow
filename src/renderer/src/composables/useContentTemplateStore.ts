import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
    ContentTemplateSettings,
    ContentTemplateSettingsYupSchema
} from '@main/types/settings/ContentTemplateSettings'
import { contentTemplateExamples } from '@main/classes/ContentTemplate'

export const useContentTemplateStore = defineStore('contentTemplateStore', () => {
    const contentTemplates = ref<ContentTemplateSettings[]>([])
    const activeContentTemplateEdit = ref<ContentTemplateSettings | null>(null)

    async function init() {
        getContentTemplates()
    }

    watch(
        activeContentTemplateEdit,
        () => {
            console.log('Active Content Template Edit changed:', activeContentTemplateEdit.value)
        },
        { deep: true }
    )

    async function newContentTemplate() {
        const newContentTemplate: ContentTemplateSettings = ContentTemplateSettingsYupSchema.cast(
            {}
        )

        newContentTemplate.templateContent = contentTemplateExamples[0] || ''

        activeContentTemplateEdit.value = newContentTemplate
    }

    async function saveContentTemplate(contentTemplate: ContentTemplateSettings): Promise<void> {
        if (window.api) {
            await window.api.saveContentTemplate(JSON.parse(JSON.stringify(contentTemplate)))
            await getContentTemplates()
        }
    }

    async function deleteContentTemplate(id: string): Promise<void> {
        if (window.api) {
            await window.api.deleteContentTemplate(id)
            await getContentTemplates()
        }
    }

    async function getContentTemplates(): Promise<ContentTemplateSettings[]> {
        if (window.api) {
            contentTemplates.value = await window.api.getContentTemplates()
            console.log('Content Templates loaded:', contentTemplates.value)
        }

        return contentTemplates.value
    }

    return {
        init,
        contentTemplates,
        activeContentTemplateEdit,
        getContentTemplates,
        saveContentTemplate,
        deleteContentTemplate,
        newContentTemplate
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useContentTemplateStore, import.meta.hot))
