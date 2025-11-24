import * as yup from 'yup'

export type ContentTemplateData = {
    contentTemplateId: string
    content: string
    custom_variables: Record<string, string>
}


export const ContentTemplateDataYupSchema: yup.Schema<ContentTemplateData> = yup.object({
    contentTemplateId: yup.string().default(''),
    content: yup.string().default(''),
    custom_variables: yup
        .object()
        .default(() => ({}))
}) as yup.Schema<ContentTemplateData>
