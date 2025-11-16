import { ServerSettingsYupSchema } from './ServerSettings'
import { QueueSettings, QueueSettingsYupSchema } from './QueueSettings'
import { ServerSettings } from './ServerSettings'
import { ThemeSettings, ThemeYupSchema } from './ThemeSettings'
import * as yup from 'yup'

export type AllSettings = {
    theme: ThemeSettings
    queue: QueueSettings
    servers: ServerSettings[]
    rarparFolder: string
    nzbOutputFolder: string
    taskHistoryFolder: string
    profilesSettingsFolder: string
    folderMonitoringFolder: string

    httpServerEnabled: boolean
    httpServerPort: number
    httpServerApiToken: string

    wsServerEnabled: boolean
    wsServerPort: number
    wsServerApiToken: string

    updateCheckAutomatically: boolean
    updateDownloadAutomatically: boolean
    updateInstallAutomatically: boolean
    commands: {
        rar: string
        par: string
        nyuu: string
    }
}

export const AllSettingsYupSchema = yup.object({
    theme: ThemeYupSchema.default(() => ThemeYupSchema.cast({})),
    queue: QueueSettingsYupSchema.default(() => QueueSettingsYupSchema.cast({})),
    servers: yup
        .array()
        .of(ServerSettingsYupSchema)
        .default(() => []),
    rarparFolder: yup.string().default(''),
    nzbOutputFolder: yup.string().default(''),
    taskHistoryFolder: yup.string().default(''),
    profilesSettingsFolder: yup.string().default(''),
    folderMonitoringFolder: yup.string().default(''),
    httpServerEnabled: yup.boolean().default(false),
    httpServerPort: yup.number().default(3000),
    httpServerApiToken: yup.string().default(''),
    wsServerEnabled: yup.boolean().default(false),
    wsServerPort: yup.number().default(3001),
    wsServerApiToken: yup.string().default(''),
    updateCheckAutomatically: yup.boolean().default(true),
    updateDownloadAutomatically: yup.boolean().default(false),
    updateInstallAutomatically: yup.boolean().default(false),
    commands: yup
        .object({
            rar: yup.string().default('rar'),
            par: yup.string().default('parpar'),
            nyuu: yup.string().default('nyuu')
        })
        .default(() => ({ rar: 'rar', par: 'parpar', nyuu: 'nyuu' }))
}) as yup.Schema<AllSettings>
