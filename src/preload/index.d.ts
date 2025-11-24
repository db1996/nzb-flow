import { ElectronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'
import { AllSettings } from '@main/types/settings/AllSettings'
import { TaskConfig, TaskSettings } from '@main/types/settings/commands/taskSettings'
import { ProgressInfo, UpdateInfo } from 'electron-updater'
import { QueueStatus } from '@main/types/settings/commands/QueueStatus'
import { CommandStep } from '@main/enums/CommandStep'

declare global {
    interface Window {
        electron: ElectronAPI
        dragDrop: {}
        api: {
            getAllSettings: () => Promise<AllSettings>
            saveAllSettings: (settings: AllSettings) => Promise<void>
            reloadSettings: (callback: () => void) => void
            settingsLoaded: (callback: (settings: AllSettings) => void) => void

            getUUID: () => Promise<string>

            generateEmptyTask: (profileId?: string, files?: string[]) => Promise<TaskConfig>
            queueTask: (task: TaskConfig) => Promise<void>
            unQueueTask: (id: string) => Promise<void>

            getProfiles: () => Promise<ProfileSettings[]>
            saveProfiles: (profiles: ProfileSettings[]) => Promise<void>
            saveProfile: (profile: ProfileSettings) => Promise<void>
            deleteProfile: (id: string) => Promise<void>

            getFolders: () => Promise<FolderSettings[]>
            saveFolder: (folder: FolderSettings) => Promise<void>
            deleteFolder: (id: string) => Promise<void>
            saveFolders: (folders: FolderSettings[]) => Promise<void>
            scanFolder: (id: string) => Promise<void>

            getContentTemplates: () => Promise<ContentTemplateSettings[]>
            saveContentTemplate: (template: ContentTemplateSettings) => Promise<void>
            deleteContentTemplate: (id: string) => Promise<void>

            getHistoryTasks: () => Promise<TaskConfig[]>
            clearHistoryTasks: () => Promise<void>
            deleteHistoryTask: (id: string) => Promise<void>
            deleteHistoryTasks: (ids: string[]) => Promise<void>

            // Approval task management
            getApprovalTasks: () => Promise<TaskConfig[]>
            addApprovalTask: (taskSettings: TaskConfig) => Promise<boolean>
            removeApprovalTask: (id: string) => Promise<boolean>
            removeMultipleApprovalTasks: (ids: string[]) => Promise<boolean>
            queueApprovalTask: (id: string) => Promise<boolean>
            queueMultipleApprovalTasks: (ids: string[]) => Promise<boolean>
            saveApprovalTask: (taskSettings: TaskConfig) => Promise<boolean>

            // Queue control
            pauseQueue: () => Promise<boolean>
            resumeQueue: () => Promise<boolean>
            getQueueStatus: () => Promise<QueueStatus>

            getDefaultFolders: () => Promise<{
                rarparFolder: string
                nzbOutputFolder: string
                taskHistoryFolder: string
                profilesSettingsFolder: string
                folderMonitoringFolder: string
            }>

            chooseFolder: (defaultPath?: string) => Promise<{
                path: string
                basename: string
            }>
            chooseFiles: () => Promise<string[]>
            chooseFolders: () => Promise<string[]>
            saveFile: (filePath: string, content: string) => Promise<void>

            openFolderInExplorer: (path: string) => Promise<void>
            openFileInExplorer: (path: string) => Promise<void>
            onCommandProgressPercentage: (
                callback: (data: {
                    id: string
                    currentStep: CommandStep
                    percentage: number
                }) => void
            ) => void

            onCommandFinish: (callback: (data: TaskConfig) => void) => void

            // Approval queue event listener
            onApprovalQueueUpdated: (callback: (data: TaskConfig[]) => void) => void
            onQueueUpdated: (callback: (data: QueueStatus) => void) => void

            checkRar: (customCommand: string | null = null) => Promise<boolean>
            checkParpar: (customCommand: string | null = null) => Promise<boolean>
            checkNyuu: (customCommand: string | null = null) => Promise<boolean>
            installNyuu: () => Promise<boolean>
            installParpar: () => Promise<boolean>
            copy: (text: string) => Promise<boolean>

            // Auto-updater APIs
            checkForUpdates: () => Promise<any>
            downloadUpdate: () => Promise<boolean>
            quitAndInstall: () => void
            getVersion: () => Promise<string>

            // Auto-updater event listeners
            onUpdateChecking: (callback: () => void) => void
            onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void
            onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => void
            onUpdateError: (callback: (error: string) => void) => void
            onUpdateDownloadProgress: (callback: (progress: ProgressInfo) => void) => void
            onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void
            checkUpdateOnStartup: () => Promise<void>

            getCurrentVersion: () => Promise<string>

            onFilesDropped: (callback: (filePaths: string[]) => void) => void
            onWindowDragOver: (callback: (dragging: boolean) => void) => void
        }
    }
}
