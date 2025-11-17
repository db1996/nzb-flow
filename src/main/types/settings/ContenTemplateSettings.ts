import * as yup from 'yup'

export type ContentTemplateSettings = {
    name: string
    fileName: string
    templateContent: string
    fileType: string
    taskLogOnly: boolean

    customLocation: string
    saveInArchive: boolean
    saveWithNzb: boolean
}

export const ContentTemplateSettingsYupSchema = yup.object({
    name: yup.string().default(''),
    fileName: yup.string().default(''),
    templateContent: yup.string().default(''),
    fileType: yup.string().default('text/plain'),
    taskLogOnly: yup.boolean().default(true),

    customLocation: yup.string().default(''),
    saveInArchive: yup.boolean().default(false),
    saveWithNzb: yup.boolean().default(false)
}) as yup.Schema<ContentTemplateSettings>
