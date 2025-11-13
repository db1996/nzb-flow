import * as yup from 'yup'

export type QueueSettings = {
    maxCompressionWorkers: number
    maxUploadWorkers: number
    maxUploadQueueBeforePause: number
}

export const QueueSettingsYupSchema = yup.object({
    maxCompressionWorkers: yup.number().min(1).max(1000).default(2),
    maxUploadWorkers: yup.number().min(1).max(1000).default(1),
    maxUploadQueueBeforePause: yup.number().min(0).max(1000).default(2)
}) as yup.Schema<QueueSettings>
