import * as yup from 'yup'

export type ContentTemplateSettings = {
    id: string
    name: string
    fileName: string
    templateContent: string
    fileType: string

    customLocation: string
    includeInPost: boolean
    saveWithNzb: boolean
}

export const ContentTemplateSettingsYupSchema = yup.object({
    id: yup.string().default(''),
    name: yup.string().default(''),
    fileName: yup.string().default(''),
    templateContent: yup.string().default(''),
    fileType: yup.string().default('.txt'),

    customLocation: yup.string().default(''),
    includeInPost: yup.boolean().default(false),
    saveWithNzb: yup.boolean().default(true)
}) as yup.Schema<ContentTemplateSettings>
