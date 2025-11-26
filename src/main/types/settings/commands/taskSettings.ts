import * as yup from 'yup'
import { CommandStep } from '../../../enums/CommandStep'
import { RarSettings, RarSettingsYupSchema } from './RarSettings'
import { ParSettings, ParSettingsYupSchema } from './ParSettings'
import CommandData, { CommandDataYupSchema } from './commandData'
import { NyuuSettings, NyuuSettingsYupSchema } from './NyuuSettings'
import { PostingSettings, PostingSettingsYupSchema } from './PostingSettings'
import { TaskVariables, TaskVariablesYupSchema } from './TaskVariables'
import { ContentTemplateData, ContentTemplateDataYupSchema } from '../ContentTemplateData'

export type TaskConfig = {
    id: string
    created_at?: number
    folderWatchId: string
    started: boolean
    finished: boolean
    name: string
    password: string
    rarParFilename: string
    rarParFolderPath: string
    rarParFiles: string[]
    error: string
    nzbFile: string
    currentStep: CommandStep
    lastMessage: string
    log_file: string
    rarCommandOutput: CommandData
    parCommandOutput: CommandData
    nyuuCommandOutput: CommandData

    used_profile: string

    taskSettings: TaskSettings
    taskVariables: TaskVariables
    contentTemplateData: ContentTemplateData[]
}

export type TaskSettings = {
    rarSettings: RarSettings
    parSettings: ParSettings
    nyuuSettings: NyuuSettings
    postingSettings: PostingSettings
    serverId: string
    backupServerId: string

    contentTemplates: { id: string; enabled: boolean }[]
}

export const TaskSettingsYupSchema: yup.Schema<TaskSettings> = yup.object({
    rarSettings: RarSettingsYupSchema.default(() => RarSettingsYupSchema.cast({})),
    parSettings: ParSettingsYupSchema.default(() => ParSettingsYupSchema.cast({})),
    nyuuSettings: NyuuSettingsYupSchema.default(() => NyuuSettingsYupSchema.cast({})),
    postingSettings: PostingSettingsYupSchema.default(() => PostingSettingsYupSchema.cast({})),
    serverId: yup.string().default(''),
    backupServerId: yup.string().default(''),
    contentTemplates: yup
        .array()
        .of(
            yup.object({
                id: yup.string().required(),
                enabled: yup.boolean().required()
            })
        )
        .default([])
}) as yup.Schema<TaskSettings>

export const TaskConfigYupSchema: yup.Schema<TaskConfig> = yup.object({
    id: yup.string().default(''),
    created_at: yup.number().default(() => Date.now()),
    folderWatchId: yup.string().default(''),
    started: yup.boolean().default(false),
    finished: yup.boolean().default(false),
    name: yup.string().default(''),
    password: yup.string().default(''),
    rarParFilename: yup.string().default(''),
    rarParFolderPath: yup.string().default(''),
    rarParFiles: yup.array().of(yup.string()).default([]),
    error: yup.string().default(''),
    nzbFile: yup.string().default(''),
    currentStep: yup
        .mixed<CommandStep>()
        .oneOf(Object.values(CommandStep))
        .default(CommandStep.RAR),
    lastMessage: yup.string().default(''),
    log_file: yup.string().default(''),
    used_profile: yup.string().default(''),
    rarCommandOutput: CommandDataYupSchema.default(() => CommandDataYupSchema.cast({})),
    parCommandOutput: CommandDataYupSchema.default(() => CommandDataYupSchema.cast({})),
    nyuuCommandOutput: CommandDataYupSchema.default(() => CommandDataYupSchema.cast({})),

    taskSettings: TaskSettingsYupSchema.default(() => TaskSettingsYupSchema.cast({})),
    taskVariables: TaskVariablesYupSchema.default(() => TaskVariablesYupSchema.cast({})),
    contentTemplateData: yup
        .array()
        .of(ContentTemplateDataYupSchema)
        .default(() => [])
}) as yup.Schema<TaskConfig>
