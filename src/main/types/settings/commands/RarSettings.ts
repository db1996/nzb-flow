import * as yup from 'yup'

export type RarSettings = {
    recursion: boolean
    automaticVolumes: boolean
    volumes: string
    excludes: string[]
    solidArchive: boolean
    encryptHeaders: boolean
    skipRarCreation: boolean
}

export const RarSettingsYupSchema: yup.Schema<RarSettings> = yup.object({
    recursion: yup.boolean().default(true),
    excludes: yup.array().of(yup.string().required()).default([]),
    automaticVolumes: yup.boolean().default(true),
    volumes: yup.string().default(''),
    solidArchive: yup.boolean().default(false),
    encryptHeaders: yup.boolean().default(true),
    skipRarCreation: yup.boolean().default(false)
})
