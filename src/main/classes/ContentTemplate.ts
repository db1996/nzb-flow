import { TaskVariables } from '../types/settings/commands/TaskVariables'
import { ContentTemplateSettings } from '../types/settings/ContentTemplateSettings'
import { TemplateRenderer } from './TemplateRenderer'

export class ContentTemplate {
    contentTemplateSettings: ContentTemplateSettings

    constructor(contentTemplate: ContentTemplateSettings) {
        this.contentTemplateSettings = contentTemplate
    }

    public getResult(taskVariables: TaskVariables): string {
        TemplateRenderer.registerHelpers()

        return TemplateRenderer.render(
            this.contentTemplateSettings.templateContent,
            taskVariables,
            {}
        )
    }
}
