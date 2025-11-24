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

export const contentTemplateExamples: string[] = [
    `Post Report for {{fname}}

Original size: {{sizeHuman raw_size}}
RAR size: {{sizeHuman rar_size}} ({{rar_count}} files, took {{timeHuman rar_time}})
PAR size: {{sizeHuman par_size}} ({{par_count}} files, took {{timeHuman par_time}})
Upload size: {{sizeHuman nyuu_size}} (took {{timeHuman nyuu_time}})

Total processing time: {{timeHuman total_time}}

---

Original Files ({{raw_files.length}})

{{#each raw_files}}
- {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}

---

RAR Files ({{rar_files.length}})

{{#each rar_files}}
- {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}

---

PAR Files ({{par_files.length}})

{{#each par_files}}
- {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}

---

Uploaded Files ({{nyuu_files.length}})

{{#each nyuu_files}}
- {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}
`
]
