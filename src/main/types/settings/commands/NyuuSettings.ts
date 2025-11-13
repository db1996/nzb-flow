import * as yup from 'yup'

export type NyuuSettings = {
    includePasswordInNzb: boolean
    articleSize: string
    checkConnections: number
    checkTries: number
    checkDelay: string
    checkRetryDelay: string
    checkPostTries: number
    checkQueueSize: number
    yencNameOverride: boolean
    yencName: string
    subjectOverride: boolean
    subject: string
    filenameOverride: boolean
    filename: string
    dateOverride: boolean
    date: string
    messageIdOverride: boolean
    messageId: string
    articleEncodingOverride: boolean
    articleEncoding: string
}

export const NyuuSettingsYupSchema: yup.Schema<NyuuSettings> = yup.object({
    includePasswordInNzb: yup.boolean().default(false),
    articleSize: yup.string().default('700K'),
    checkConnections: yup.number().default(0),
    checkTries: yup.number().default(2),
    checkDelay: yup.string().default('5s'),
    checkRetryDelay: yup.string().default('30s'),
    checkPostTries: yup.number().default(1),
    checkQueueSize: yup.number().default(10000),
    yencNameOverride: yup.boolean().default(false),
    yencName: yup.string().default('{filename}'),
    subjectOverride: yup.boolean().default(false),
    subject: yup.string().default('{comment} [{0filenum}/{files}] - "{filename}" yEnc ({part}/{parts}) {filesize} {comment2}'),
    filenameOverride: yup.boolean().default(false),
    filename: yup.string().default('{basename}'),
    dateOverride: yup.boolean().default(false),
    date: yup.string().default('{now}'),
    messageIdOverride: yup.boolean().default(false),
    messageId: yup.string().default('${rand(24)}-{timestamp}@nyuu'),
    articleEncodingOverride: yup.boolean().default(false),
    articleEncoding: yup.string().default('{filename}')
})
