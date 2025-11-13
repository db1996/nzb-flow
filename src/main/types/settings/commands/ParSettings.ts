import * as yup from 'yup'

export type ParSettings = {
    skipParCreation: boolean
    automaticRedundancy: boolean
    redundancy: string
    automaticSlices: boolean
    slices: string
}
export const ParSettingsYupSchema: yup.Schema<ParSettings> = yup.object({
    skipParCreation: yup.boolean().default(false),
    automaticRedundancy: yup.boolean().default(true),
    redundancy: yup.string().default(''),
    automaticSlices: yup.boolean().default(true),
    slices: yup.string().default('')
})
