import * as yup from 'yup'
import { TaskSettings, TaskSettingsYupSchema } from "./commands/taskSettings"

export type ProfileSettings = {
    id: string
    name: string
    isDefault: boolean
    taskSettings: TaskSettings
}

export const ProfileSettingsYupSchema = yup.object({
    id: yup.string().default(''),
    name: yup.string().min(1).max(50).default('New Profile'),
    isDefault: yup.boolean().default(false),
    taskSettings: TaskSettingsYupSchema.default(() => TaskSettingsYupSchema.cast({})),
}) as yup.Schema<ProfileSettings>
