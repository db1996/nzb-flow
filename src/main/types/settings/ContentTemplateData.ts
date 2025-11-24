import * as yup from 'yup'

export type ContentTemplateData = {
    active: boolean
    contentTemplateId: string
    content: string
    fileName: string
    custom_variables: Record<string, string>
}

export const ContentTemplateDataYupSchema: yup.Schema<ContentTemplateData> = yup.object({
    active: yup.boolean().default(true),
    contentTemplateId: yup.string().default(''),
    content: yup.string().default(''),
    fileName: yup.string().default(''),
    custom_variables: yup
        .object()
        .test('string-map', 'custom_variables must contain string values', (obj) => {
            if (!obj || typeof obj !== 'object') {
                return false
            }
            if (Object.keys(obj).length === 0) {
                return true
            }

            for (const key in obj) {
                if (typeof obj[key] !== 'string') {
                    return false
                }
            }

            return true
        })
        .strict()
        .noUnknown(false)
        .default({})
}) as yup.Schema<ContentTemplateData>
