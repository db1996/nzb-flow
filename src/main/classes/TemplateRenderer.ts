import Handlebars from 'handlebars'
import { BUILT_IN_VARIABLES_KEYS, TaskVariables } from '../types/settings/commands/TaskVariables'
import { ContentTemplateSettingsVariable } from '../types/settings/ContentTemplateSettings'

export class TemplateRenderer {
    /** Render the template string using task variables */
    static render(
        template: string,
        variables: TaskVariables,
        customVariables: ContentTemplateSettingsVariable[]
    ): string {
        const compiled = Handlebars.compile(template)

        const customVariablesObj: Record<string, string> = {}
        customVariables.forEach((variable) => {
            customVariablesObj[variable.key] = variable.value
        })

        return compiled({ ...variables, ...customVariablesObj })
    }

    static getCustomVariables(template: string): string[] {
        // Match all handlebars variables (simplest: {{varName}} or {{varName ...}})
        const regex = /{{\s*([a-zA-Z0-9_]+)(?:\s+[^}]*)?}}/g
        const foundVars = new Set<string>()
        let match

        while ((match = regex.exec(template)) !== null) {
            const varName = match[1]
            if (!BUILT_IN_VARIABLES_KEYS.has(varName)) {
                foundVars.add(varName)
            }
        }

        return Array.from(foundVars)
    }

    /** Register custom helpers for sizes and times */
    static registerHelpers() {
        // ----------- SIZE HELPERS -----------
        Handlebars.registerHelper('sizeHuman', (size: number) => {
            if (size == null) return ''
            const KB = 1024
            const MB = KB * 1024
            const GB = MB * 1024
            const TB = GB * 1024

            if (size >= TB) return `${(size / TB).toFixed(2)} TB`
            if (size >= GB) return `${(size / GB).toFixed(2)} GB`
            if (size >= MB) return `${(size / MB).toFixed(2)} MB`
            if (size >= KB) return `${(size / KB).toFixed(2)} KB`
            return `${size} bytes`
        })

        Handlebars.registerHelper('sizeTB', (size: number) => {
            if (size == null) return ''
            return `${(size / 1024 ** 4).toFixed(2)} TB`
        })

        Handlebars.registerHelper('sizeGB', (size: number) => {
            if (size == null) return ''
            return `${(size / 1024 ** 3).toFixed(2)} GB`
        })

        Handlebars.registerHelper('sizeMB', (size: number) => {
            if (size == null) return ''
            return `${(size / 1024 ** 2).toFixed(2)} MB`
        })

        Handlebars.registerHelper('sizeKB', (size: number) => {
            if (size == null) return ''
            return `${(size / 1024).toFixed(2)} KB`
        })

        // ----------- TIME HELPERS -----------
        Handlebars.registerHelper('timeHuman', (ms: number) => {
            if (ms == null) return ''
            const seconds = Math.floor(ms / 1000)
            const h = Math.floor(seconds / 3600)
            const m = Math.floor((seconds % 3600) / 60)
            const s = seconds % 60
            return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
        })

        Handlebars.registerHelper('totalS', (ms: number) => {
            return ms == null ? '' : Math.floor(ms / 1000).toString()
        })

        Handlebars.registerHelper('totalM', (ms: number) => {
            return ms == null ? '' : Math.floor(ms / 1000 / 60).toString()
        })

        Handlebars.registerHelper('totalH', (ms: number) => {
            return ms == null ? '' : Math.floor(ms / 1000 / 3600).toString()
        })

        Handlebars.registerHelper('totalMS', (ms: number) => {
            return ms == null ? '' : ms.toString()
        })

        // Modular HH:MM:SS
        Handlebars.registerHelper('timeH', (ms: number) => {
            return ms == null ? '' : Math.floor(ms / 1000 / 3600).toString()
        })

        Handlebars.registerHelper('timeM', (ms: number) => {
            return ms == null
                ? ''
                : Math.floor((ms / 1000 / 60) % 60)
                      .toString()
                      .padStart(2, '0')
        })

        Handlebars.registerHelper('timeS', (ms: number) => {
            return ms == null
                ? ''
                : Math.floor((ms / 1000) % 60)
                      .toString()
                      .padStart(2, '0')
        })

        Handlebars.registerHelper('timeMS', (ms: number) => {
            return ms == null ? '' : (ms % 1000).toString().padStart(3, '0')
        })
    }
}
