import * as yup from 'yup'

export type ParSettings = {
    skipParCreation: boolean
    automaticParams: boolean
    redundancy: string
    slices: string
    minSlices: string
    maxSlices: string
}
export const ParSettingsYupSchema: yup.Schema<ParSettings> = yup.object({
    skipParCreation: yup.boolean().default(false),
    automaticParams: yup.boolean().default(true),
    redundancy: yup.string().default('8%'),
    slices: yup.string().default('0.5w*10'),
    minSlices: yup.string().default('1'),
    maxSlices: yup.string().default('32000')
})
