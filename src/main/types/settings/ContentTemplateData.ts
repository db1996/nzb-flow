import * as yup from 'yup'
import {
    ContentTemplateSettingsVariable,
    ContentTemplateSettingsVariableYupSchema
} from './ContentTemplateSettings'

export type ContentTemplateData = {
    active: boolean
    contentTemplateId: string
    content: string
    fileName: string
    customVariables: ContentTemplateSettingsVariable[]
}

export const ContentTemplateDataYupSchema: yup.Schema<ContentTemplateData> = yup.object({
    active: yup.boolean().default(true),
    contentTemplateId: yup.string().default(''),
    content: yup.string().default(''),
    fileName: yup.string().default(''),
    customVariables: yup
        .array()
        .of(ContentTemplateSettingsVariableYupSchema)
        .default(() => [])
}) as yup.Schema<ContentTemplateData>
