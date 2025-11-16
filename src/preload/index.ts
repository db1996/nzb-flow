import { contextBridge, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AllSettings } from '../main/types/settings/AllSettings'
import { TaskConfig } from '../main/types/settings/commands/taskSettings'
import { CommandStep } from '../main/enums/CommandStep'
import { QueueStatus } from '../main/types/settings/commands/QueueStatus'
import { ProfileSettings } from '../main/types/settings/ProfileSettings'
import { FolderSettings } from '../main/types/settings/FolderSettings'

// Custom APIs for renderer
const api = {
    getAllSettings: () => electronAPI.ipcRenderer.invoke('get-allsettings'),
    saveAllSettings: async (settings: AllSettings) =>
        await electronAPI.ipcRenderer.invoke('save-allsettings', settings),
    settingsLoaded: (callback: (arg0: AllSettings) => void) =>
        electronAPI.ipcRenderer.on('settings-loaded', (_, data: AllSettings) => callback(data)),
    reloadSettings: (callback: () => void) =>
        electronAPI.ipcRenderer.on('reload-settings', () => callback()),
    copy: async (text: string) => electronAPI.ipcRenderer.invoke('copy', text),

    getDefaultFolders: () => electronAPI.ipcRenderer.invoke('get-default-folders'),

    chooseFolder: async (defaultPath?: string) =>
        electronAPI.ipcRenderer.invoke('choose-folder', defaultPath),
    chooseFiles: () => electronAPI.ipcRenderer.invoke('choose-files'),
    chooseFolders: () => electronAPI.ipcRenderer.invoke('choose-folders'),
    openFolderInExplorer: (path: string) =>
        electronAPI.ipcRenderer.invoke('open-folder-in-explorer', path),
    openFileInExplorer: (path: string) =>
        electronAPI.ipcRenderer.invoke('open-file-in-explorer', path),

    generateEmptyTask: (profileId?: string, files?: string[]) =>
        electronAPI.ipcRenderer.invoke('generate-empty-task', {
            profileId: profileId,
            files: files
        }),
    getHistoryTasks: () => electronAPI.ipcRenderer.invoke('get-history-tasks'),
    clearHistoryTasks: () => electronAPI.ipcRenderer.invoke('clear-history-tasks'),
    deleteHistoryTask: (id: string) => electronAPI.ipcRenderer.invoke('delete-history-task', id),
    deleteHistoryTasks: (ids: string[]) =>
        electronAPI.ipcRenderer.invoke('delete-history-tasks', ids),
    queueTask: (task: TaskConfig) => electronAPI.ipcRenderer.invoke('queue-task', task),
    unQueueTask: (id: string) => electronAPI.ipcRenderer.invoke('unqueue-task', id),

    getProfiles: () => electronAPI.ipcRenderer.invoke('get-profiles'),
    saveProfiles: (profiles: ProfileSettings[]) =>
        electronAPI.ipcRenderer.invoke('save-profiles', profiles),
    saveProfile: (profile: ProfileSettings) =>
        electronAPI.ipcRenderer.invoke('save-profile', profile),
    deleteProfile: (id: string) => electronAPI.ipcRenderer.invoke('delete-profile', id),

    getFolders: () => electronAPI.ipcRenderer.invoke('get-folders'),
    saveFolder: (folder: FolderSettings) => electronAPI.ipcRenderer.invoke('save-folder', folder),
    deleteFolder: (id: string) => electronAPI.ipcRenderer.invoke('delete-folder', id),
    saveFolders: (folders: FolderSettings[]) =>
        electronAPI.ipcRenderer.invoke('save-folders', folders),
    scanFolder: (id: string) => electronAPI.ipcRenderer.invoke('scan-folder', id),

    // Approval task management APIs
    getApprovalTasks: () => electronAPI.ipcRenderer.invoke('get-approval-tasks'),
    addApprovalTask: (taskSettings: TaskConfig) =>
        electronAPI.ipcRenderer.invoke('add-approval-task', taskSettings),
    removeApprovalTask: (id: string) => electronAPI.ipcRenderer.invoke('remove-approval-task', id),
    removeMultipleApprovalTasks: (ids: string[]) =>
        electronAPI.ipcRenderer.invoke('remove-multiple-approval-tasks', ids),
    queueApprovalTask: (id: string) => electronAPI.ipcRenderer.invoke('queue-approval-task', id),
    queueMultipleApprovalTasks: (ids: string[]) =>
        electronAPI.ipcRenderer.invoke('queue-multiple-approval-tasks', ids),
    saveApprovalTask: (taskSettings: TaskConfig) =>
        electronAPI.ipcRenderer.invoke('save-approval-task', taskSettings),

    // Queue control APIs
    pauseQueue: () => electronAPI.ipcRenderer.invoke('pause-queue'),
    resumeQueue: () => electronAPI.ipcRenderer.invoke('resume-queue'),
    getQueueStatus: () => electronAPI.ipcRenderer.invoke('get-queue-status'),

    checkRar: (customCommand: string | null = null) =>
        electronAPI.ipcRenderer.invoke('test-rar', customCommand),
    checkParpar: (customCommand: string | null = null) =>
        electronAPI.ipcRenderer.invoke('test-parpar', customCommand),
    checkNyuu: (customCommand: string | null = null) =>
        electronAPI.ipcRenderer.invoke('test-nyuu', customCommand),
    installNyuu: () => electronAPI.ipcRenderer.invoke('install-nyuu'),
    installParpar: () => electronAPI.ipcRenderer.invoke('install-parpar'),
    onCommandProgressPercentage: (
        callback: (arg0: { id: string; currentStep: CommandStep; percentage: number }) => void
    ) =>
        electronAPI.ipcRenderer.on(
            'command-progress-percentage',
            (
                _,
                data: {
                    id: string
                    currentStep: CommandStep
                    percentage: number
                }
            ) => callback(data)
        ),
    onCommandFinish: (callback: (arg0: TaskConfig) => void) =>
        electronAPI.ipcRenderer.on('command-finish', (_, data: TaskConfig) => callback(data)),

    onQueueUpdated: (callback: (arg0: QueueStatus) => void) =>
        electronAPI.ipcRenderer.on('queue-update', (_, data: QueueStatus) => callback(data)),

    // Approval queue event listener
    onApprovalQueueUpdated: (callback: (arg0: TaskConfig[]) => void) =>
        electronAPI.ipcRenderer.on('approval-queue-updated', (_, data: TaskConfig[]) =>
            callback(data)
        ),

    // Auto-updater APIs
    checkForUpdates: () => electronAPI.ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => electronAPI.ipcRenderer.invoke('download-update'),
    quitAndInstall: () => electronAPI.ipcRenderer.invoke('quit-and-install'),
    getVersion: () => electronAPI.ipcRenderer.invoke('get-version'),

    // Auto-updater event listeners
    onUpdateChecking: (callback: () => void) =>
        electronAPI.ipcRenderer.on('update-checking', () => callback()),
    onUpdateAvailable: (callback: (arg0: any) => void) =>
        electronAPI.ipcRenderer.on('update-available', (_, info) => callback(info)),
    onUpdateNotAvailable: (callback: (arg0: any) => void) =>
        electronAPI.ipcRenderer.on('update-not-available', (_, info) => callback(info)),
    onUpdateError: (callback: (arg0: string) => void) =>
        electronAPI.ipcRenderer.on('update-error', (_, error) => callback(error)),
    onUpdateDownloadProgress: (callback: (arg0: any) => void) =>
        electronAPI.ipcRenderer.on('update-download-progress', (_, progress) => callback(progress)),
    onUpdateDownloaded: (callback: (arg0: any) => void) =>
        electronAPI.ipcRenderer.on('update-downloaded', (_, info) => callback(info)),
    checkUpdateOnStartup: () => electronAPI.ipcRenderer.invoke('check-update-startup'),

    getCurrentVersion: () => electronAPI.ipcRenderer.invoke('get-current-version'),
    onFilesDropped: (callback: (arg0: string[]) => void) => {
        window.addEventListener('drop', (event) => {
            event.preventDefault()
            const files = Array.from(event.dataTransfer?.files ?? [])
            const filePaths: string[] = []
            files.forEach((file: File) => {
                const filePath = webUtils.getPathForFile(file)
                filePaths.push(filePath)
            })

            callback(filePaths)
        })

        window.addEventListener('dragover', (e) => e.preventDefault())
    },
    onWindowDragOver: (callback: (dragging: boolean) => void) => {
        let dragCounter = 0

        window.addEventListener('dragenter', (e) => {
            e.preventDefault()
            dragCounter++
            if (dragCounter === 1) {
                callback(true)
            }
        })
        window.addEventListener('dragleave', (e) => {
            e.preventDefault()
            dragCounter--
            if (dragCounter === 0) {
                callback(false)
            }
        })
        window.addEventListener('dragend', (e) => {
            e.preventDefault()
            dragCounter = 0
            callback(false)
        })
        window.addEventListener('drop', (e) => {
            e.preventDefault()
            dragCounter = 0
            callback(false)
        })
        window.addEventListener('dragover', (e) => {
            e.preventDefault()
        })
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
