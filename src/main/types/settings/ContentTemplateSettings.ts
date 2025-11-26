import * as yup from 'yup'
export type ContentTemplateSettingsVariable = {
    key: string
    value: string
}

export const ContentTemplateSettingsVariableYupSchema = yup.object({
    key: yup.string().required(),
    value: yup.string().default('')
}) as yup.Schema<ContentTemplateSettingsVariable>

export type ContentTemplateSettings = {
    id: string
    name: string
    fileName: string
    templateContent: string
    fileType: string
    customVariables: ContentTemplateSettingsVariable[]

    customLocation: string
    includeInPost: boolean
    saveWithNzb: boolean
}
export const ContentTemplateSettingsYupSchema = yup.object({
    id: yup.string().default(''),
    name: yup.string().default(''),
    fileName: yup.string().default('{jobname}'),
    templateContent: yup.string().default(''),
    fileType: yup.string().default('.txt'),
    customVariables: yup
        .array()
        .of(ContentTemplateSettingsVariableYupSchema)
        .default(() => []),
    customLocation: yup.string().default(''),
    includeInPost: yup.boolean().default(false),
    saveWithNzb: yup.boolean().default(true)
}) as yup.Schema<ContentTemplateSettings>
