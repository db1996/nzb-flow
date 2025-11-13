import * as yup from 'yup'

export type ServerSettings = {
    id: string
    isDefault: boolean
    isDefaultBackup: boolean

    server: string
    port: number
    ssl: boolean
    username: string
    password: string
    connections: number
}

export const ServerSettingsYupSchema: yup.Schema<ServerSettings> = yup.object({
    id: yup.string().default(''),
    isDefault: yup.boolean().default(false),
    isDefaultBackup: yup.boolean().default(false),
    server: yup.string().default(''),
    port: yup.number().default(119),
    ssl: yup.boolean().default(false),
    username: yup.string().default(''),
    password: yup.string().default(''),
    connections: yup.number().default(10)
})
