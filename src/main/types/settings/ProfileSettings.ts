import * as yup from 'yup'
import { TaskSettings, TaskSettingsYupSchema } from './commands/taskSettings'

export type ProfileSettings = {
    id: string
    name: string
    isDefault: boolean
    taskSettings: TaskSettings
    contentTemplates: Record<string, boolean> // Map of content template IDs to enabled/disabled status
}

export const ProfileSettingsYupSchema = yup.object({
    id: yup.string().default(''),
    name: yup.string().default('New Profile'),
    isDefault: yup.boolean().default(false),
    taskSettings: TaskSettingsYupSchema.default(() => TaskSettingsYupSchema.cast({})),
    contentTemplates: yup.object().default({}),
}) as yup.Schema<ProfileSettings>
