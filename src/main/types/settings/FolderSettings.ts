import * as yup from 'yup'

export type FolderSettings = {
    id: string
    name: string
    fullPath: string
    active: boolean
    autoApprove: boolean
    uploadFiles: boolean
    uploadFolder: boolean
    deleteUploadedFiles: boolean
    ignorePrefixes: string[]
    ignoreFileExtensions: string[]

    profileId: string
}

export const FolderSettingsYupSchema = yup.object({
    id: yup.string().default(''),
    name: yup.string().default(''),
    fullPath: yup.string().default(''),
    active: yup.boolean().default(true),
    autoApprove: yup.boolean().default(false),
    uploadFiles: yup.boolean().default(false),
    uploadFolder: yup.boolean().default(true),
    deleteUploadedFiles: yup.boolean().default(false),
    ignorePrefixes: yup.array().of(yup.string()).default([]),
    ignoreFileExtensions: yup.array().of(yup.string()).default([]),

    profileId: yup.string().default('')
}) as yup.Schema<FolderSettings>
