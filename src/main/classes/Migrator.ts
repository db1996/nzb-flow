import { AllSettings } from '../types/settings/AllSettings'
import { TaskConfig } from '../types/settings/commands/taskSettings'
import { FolderSettings } from '../types/settings/FolderSettings'
import { ProfileSettings } from '../types/settings/ProfileSettings'

export default class Migrator {
    static migrateAllSettings(
        _oldConfig: any,
        validatedConfig: AllSettings,
        _diff: {
            added: string[]
            removed: string[]
            changed: string[]
        }
    ): AllSettings {
        return validatedConfig
    }

    static migrateProfileSettings(
        _oldConfig: any,
        validatedConfig: ProfileSettings,
        diff: {
            added: string[]
            removed: string[]
            changed: string[]
        }
    ): ProfileSettings {
        if(diff.added.includes('taskSettings.rarSettings.recursion') && diff.removed.includes('taskSettings.postingSettings.recursion')){
            validatedConfig.taskSettings.rarSettings.recursion = _oldConfig.taskSettings.postingSettings.recursion
        }
        return validatedConfig
    }

    static migrateTaskConfig(
        _oldConfig: any,
        validatedConfig: TaskConfig,
        _diff: {
            added: string[]
            removed: string[]
            changed: string[]
        }
    ): TaskConfig {
        if(_diff.added.includes('taskSettings.rarSettings.recursion') && _diff.removed.includes('taskSettings.postingSettings.recursion')){
            validatedConfig.taskSettings.rarSettings.recursion = _oldConfig.taskSettings.postingSettings.recursion
        }

        return validatedConfig
    }

    static migrateFolderSettings(
        _oldConfig: any,
        validatedConfig: FolderSettings,
        _diff: {
            added: string[]
            removed: string[]
            changed: string[]
        }
    ): FolderSettings {
        return validatedConfig
    } 
}
