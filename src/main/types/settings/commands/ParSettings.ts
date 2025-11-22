import * as yup from 'yup'

export type ParSettings = {
    skipParCreation: boolean
    automaticRedundancy: boolean
    redundancy: string
    automaticSlices: boolean
    slices: string
    minSlices: string
    maxSlices: string
}
export const ParSettingsYupSchema: yup.Schema<ParSettings> = yup.object({
    skipParCreation: yup.boolean().default(false),
    automaticRedundancy: yup.boolean().default(true),
    redundancy: yup.string().default('8%'),
    automaticSlices: yup.boolean().default(true),
    slices: yup.string().default('0.5w*10'),
    minSlices: yup.string().default('1'),
    maxSlices: yup.string().default('32000')
})
