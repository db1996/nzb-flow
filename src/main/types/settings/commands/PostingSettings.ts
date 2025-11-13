import * as yup from 'yup'
import {
    RandomSettings,
    RandomSettingsYupSchema,
    RandomSettingsYupSchemaName
} from '../RandomSettings'

export type PostingSettings = {
    nameSettings: RandomSettings
    passwordSettings: RandomSettings
    saveRarPars: boolean
    deleteUploadedFiles: boolean
    files: string[]
    post_from: string
    postFromRandomized: boolean
    post_groups: string
    obfuscateSubject: boolean
    obfuscateFilename: boolean
    obfuscateYencName: boolean
}

export const PostingSettingsYupSchema: yup.Schema<PostingSettings> = yup.object({
    nameSettings: RandomSettingsYupSchema.default(() => RandomSettingsYupSchemaName.cast({})),
    passwordSettings: RandomSettingsYupSchema.default(() => RandomSettingsYupSchema.cast({})),
    saveRarPars: yup.boolean().default(false),
    deleteUploadedFiles: yup.boolean().default(false),
    files: yup.array().of(yup.string().required()).default([]),
    post_from: yup.string().default(''),
    postFromRandomized: yup.boolean().default(true),
    post_groups: yup.string().default('alt.binaries.test'),
    obfuscateSubject: yup.boolean().default(false),
    obfuscateFilename: yup.boolean().default(false),
    obfuscateYencName: yup.boolean().default(false)
}) as yup.Schema<PostingSettings>
