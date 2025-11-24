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
    contentTemplates: yup
        .object()
        .test('boolean-map', 'contentTemplates must contain boolean values', (obj) => {
            if (!obj || typeof obj !== 'object') {
                return false
            }
            if (Object.keys(obj).length === 0) {
                return true
            }

            for (const key in obj) {
                if (typeof obj[key] !== 'boolean') {
                    return false
                }
            }

            return true
        })
        .strict()
        .noUnknown(false)
        .default({})
}) as yup.ObjectSchema<ProfileSettings>
