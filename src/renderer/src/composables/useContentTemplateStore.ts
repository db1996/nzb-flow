import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
    ContentTemplateSettings,
    ContentTemplateSettingsYupSchema
} from '@main/types/settings/ContentTemplateSettings'
import { contentTemplateExamples } from '@main/classes/ContentTemplate'
import { TemplateRenderer } from '@main/classes/TemplateRenderer'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'

export const useContentTemplateStore = defineStore('contentTemplateStore', () => {
    const contentTemplates = ref<ContentTemplateSettings[]>([])
    const activeContentTemplateEdit = ref<ContentTemplateSettings | null>(null)

    const isRegenerating = ref(false)

    async function init() {
        getContentTemplates()
    }

    const isChangingTemplateContent = ref(false)

    watch(
        activeContentTemplateEdit,
        () => {
            if (isChangingTemplateContent.value) {
                return
            }

            isChangingTemplateContent.value = true
            if (
                activeContentTemplateEdit.value &&
                activeContentTemplateEdit.value.templateContent !== ''
            ) {
                const customVars = TemplateRenderer.getCustomVariables(
                    activeContentTemplateEdit.value.templateContent
                )

                for (const varKey of customVars) {
                    if (
                        !activeContentTemplateEdit.value.customVariables.find(
                            (v) => v.key === varKey
                        )
                    ) {
                        activeContentTemplateEdit.value.customVariables.push({
                            key: varKey,
                            value: ''
                        })
                    }
                }

                for (
                    let i = activeContentTemplateEdit.value.customVariables.length - 1;
                    i >= 0;
                    i--
                ) {
                    const existingVar = activeContentTemplateEdit.value.customVariables[i]
                    if (!customVars.includes(existingVar.key)) {
                        activeContentTemplateEdit.value.customVariables.splice(i, 1)
                    }
                }
            }
            isChangingTemplateContent.value = false
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

    async function regenerateAndSave(task: TaskConfig): Promise<TaskConfig | null> {
        if (window.api) {
            isRegenerating.value = true
            const newTask = await window.api.regenerateContentTemplates(
                JSON.parse(JSON.stringify(task))
            )
            isRegenerating.value = false
            return newTask
        }

        return null
    }

    return {
        init,
        contentTemplates,
        activeContentTemplateEdit,
        getContentTemplates,
        saveContentTemplate,
        deleteContentTemplate,
        newContentTemplate,
        regenerateAndSave,
        isRegenerating
    }
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useContentTemplateStore, import.meta.hot))
