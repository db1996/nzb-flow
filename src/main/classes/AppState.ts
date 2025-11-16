import { app, dialog, ipcMain, Menu, shell, Tray } from 'electron'
import trayIcon from '../../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import TaskManager from '../commands/manager/TaskManager'
import path from 'path'
import Nyuu from '../commands/nyuu'
import ParCommand from '../commands/par'
import RarCommand from '../commands/rar'
import { AllSettings } from '../types/settings/AllSettings'
import { TaskConfig } from '../types/settings/commands/taskSettings'
import { FolderSettings } from '../types/settings/FolderSettings'
import { ProfileSettings } from '../types/settings/ProfileSettings'
import Settings from './Settings'
import Utils from './Utils'
import Updater from './Updater'
import ncp from 'copy-paste'
import { ApiServer } from '../api/ApiServer'

export default class AppState {
    public taskManager: TaskManager

    public tray: Tray | null = null
    public updaterInstance: Updater | null = null
    public apiServer: ApiServer

    constructor() {
        this.taskManager = new TaskManager()
        this.updaterInstance = new Updater()
        this.updaterInstance.setupAutoUpdater()

        this.apiServer = new ApiServer(3000, this.taskManager)
    }

    public async init() {
        this.registerIpcHandlers()
        await Settings.load(false, this.taskManager)

        if (Settings.allSettings.theme.showTrayIcon && !this.tray) {
            this.createTray()
        }

        this.apiServer.start()
    }

    public registerWindowHandlers() {
        if (!Settings.mainWindow) return
        Settings.mainWindow.on('ready-to-show', () => {
            Settings.mainWindow?.show()

            // Create tray icon on startup if showTrayIcon is enabled
            if (Settings.allSettings.theme.showTrayIcon && !this.tray) {
                this.createTray()
            }
        })

        Settings.mainWindow.on('close', (event) => {
            // Only hijack close event if both showTrayIcon and minimizeToTray are true
            if (
                Settings.allSettings.theme.showTrayIcon &&
                Settings.allSettings.theme.minimizeToTray
            ) {
                event.preventDefault()
                Settings.mainWindow?.hide()
                // Create tray if it doesn't exist (shouldn't happen, but safety check)
                if (!this.tray) {
                    this.createTray()
                }
            }
        })
    }

    private registerIpcHandlers() {
        ipcMain.handle('save-allsettings', (_event, allSettings: AllSettings) => {
            Settings.saveAllSettings(allSettings)

            // Handle tray setting changes
            if (allSettings.theme.showTrayIcon) {
                // If showTrayIcon is enabled, create tray if it doesn't exist
                if (!this.tray) {
                    this.createTray()
                }
            } else {
                // If showTrayIcon is disabled, destroy tray
                this.destroyTray()
            }
        })
        ipcMain.handle('get-allsettings', () => {
            return Settings.allSettings
        })

        ipcMain.handle('queue-task', (_event, task: TaskConfig) => {
            this.taskManager.queueTaskConfig(task)
            return true
        })

        ipcMain.handle('unqueue-task', async (_event, id: string) => {
            this.taskManager.unQueueTaskId(id)
            return true
        })

        // Approval task management handlers
        ipcMain.handle('get-approval-tasks', () => {
            return this.taskManager.getApprovalTaskConfig()
        })

        ipcMain.handle('add-approval-task', (_event, taskSettings: TaskConfig) => {
            this.taskManager.addApprovalTaskConfig(taskSettings)
            return true
        })

        ipcMain.handle('remove-approval-task', (_event, id: string) => {
            this.taskManager.removeApprovalTaskConfig(id)
            return true
        })

        ipcMain.handle('remove-multiple-approval-tasks', (_event, ids: string[]) => {
            this.taskManager.removeMultipleApprovalTaskConfigs(ids)
            return true
        })

        ipcMain.handle('queue-approval-task', async (_event, id: string) => {
            try {
                this.taskManager.queueApprovalTask(id)
                return true
            } catch (error) {
                console.error('Error queueing approval task:', error)
                return false
            }
        })

        ipcMain.handle('queue-multiple-approval-tasks', async (_event, ids: string[]) => {
            try {
                this.taskManager.queueMultipleApprovalTaskConfigs(ids)
                return true
            } catch (error) {
                console.error('Error queueing multiple approval tasks:', error)
                return false
            }
        })

        ipcMain.handle('save-approval-task', (_event, taskSettings: TaskConfig) => {
            this.taskManager.saveApprovalTaskConfig(taskSettings)
            return true
        })

        // Queue control handlers
        ipcMain.handle('pause-queue', () => {
            this.taskManager.pauseAllQueues()
            return true
        })

        ipcMain.handle('resume-queue', () => {
            this.taskManager.resumeAllQueues()
            return true
        })

        ipcMain.handle('get-queue-status', () => {
            return this.taskManager.getQueueStatus()
        })

        ipcMain.handle(
            'generate-empty-task',
            (_event, { profileId, files }: { profileId?: string; files?: string[] }) => {
                if (!profileId) {
                    profileId = Settings.profiles.find((profile) => profile.isDefault)?.id || ''
                }

                const newTask = this.taskManager.getFreshTask(profileId, files)

                return JSON.parse(JSON.stringify(newTask.taskConfig))
            }
        )

        ipcMain.handle('get-history-tasks', async () => {
            return await Settings.loadHistoryTasks()
        })

        ipcMain.handle('delete-history-task', async (_event, id: string) => {
            Settings.deleteHistoryTask(id)
            return
        })

        ipcMain.handle('delete-history-tasks', async (_event, ids: string[]) => {
            ids.forEach(async (id) => {
                Settings.deleteHistoryTask(id)
            })
            return
        })

        ipcMain.handle('clear-history-tasks', async () => {
            Settings.clearHistoryTasks()
            return
        })

        ipcMain.handle('test-rar', async (_event, customCommand: string | null = null) => {
            const rarCommand = new RarCommand()
            return rarCommand.testConnection(customCommand)
        })

        ipcMain.handle('test-parpar', async (_event, customCommand: string | null = null) => {
            const parCommand = new ParCommand()
            return parCommand.testConnection(customCommand)
        })

        ipcMain.handle('test-nyuu', async (_event, customCommand: string | null = null) => {
            const nyuuCommand = new Nyuu()
            return nyuuCommand.testConnection(customCommand)
        })

        ipcMain.handle('get-default-folders', () => {
            return {
                rarparFolder: Settings.defaultRarparFolder,
                nzbOutputFolder: Settings.defaultNzbOutputFolder,
                taskHistoryFolder: Settings.defaultTaskHistoryPath,
                profilesSettingsFolder: Settings.defaultProfileSettingsPath,
                folderMonitoringFolder: Settings.defaultFolderSettingsPath
            }
        })

        ipcMain.handle('choose-folder', async (_event, defaultPath?: string) => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory'],
                defaultPath: defaultPath || undefined
            })

            return {
                path: result.filePaths[0] || null,
                basename: result.filePaths[0] ? path.basename(result.filePaths[0]) : null
            }
        })

        ipcMain.handle('choose-files', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections']
            })

            const ret: string[] = []
            for (const file of result.filePaths) {
                if (file !== undefined && file !== null && file !== '') {
                    ret.push(file)
                }
            }
            return ret
        })

        ipcMain.handle('choose-folders', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory', 'multiSelections']
            })

            const ret: string[] = []
            for (const file of result.filePaths) {
                if (file !== undefined && file !== null && file !== '') {
                    ret.push(file)
                }
            }
            return ret
        })

        ipcMain.handle('open-folder-in-explorer', async (_event, path: string) => {
            shell.openPath(path)
        })

        ipcMain.handle('open-file-in-explorer', async (_event, path: string) => {
            shell.showItemInFolder(path)
        })

        ipcMain.handle('install-parpar', async (_event) => {
            console.log('Installing parpar via npm...')

            Utils.runInstallInTerminal('npm install -g @animetosho/parpar')
        })

        ipcMain.handle('install-nyuu', async (_event) => {
            console.log('Installing nyuu via npm...')

            Utils.runInstallInTerminal('npm install -g nyuu --production')
        })

        ipcMain.handle('copy', async (_event, text: string) => {
            try {
                ncp.copy(text)
                return true
            } catch (error) {
                return false
            }
        })

        // Auto-updater IPC handlers
        ipcMain.handle('check-for-updates', async () => {
            console.log('Check for update icp')
            try {
                // return null
                return await autoUpdater.checkForUpdatesAndNotify()
            } catch (error) {
                console.error('Error checking for updates:', error)
                return null
            }
        })

        ipcMain.handle('download-update', async () => {
            console.log('download for update icp')
            try {
                return await autoUpdater.downloadUpdate()
            } catch (error) {
                console.error('Error downloading update:', error)
                return false
            }
        })

        ipcMain.handle('quit-and-install', () => {
            autoUpdater.quitAndInstall()
        })

        ipcMain.handle('get-version', () => {
            return app.getVersion()
        })

        ipcMain.handle('check-update-startup', () => {
            this.updaterInstance?.checkForUpdatesStartup()
        })

        ipcMain.handle('get-current-version', () => {
            return app.getVersion()
        })

        ipcMain.handle('get-profiles', async () => {
            return await Settings.loadProfiles()
        })

        ipcMain.handle('save-profiles', async (_event, profiles: ProfileSettings[]) => {
            profiles.forEach((profile) => {
                Settings.saveProfile(profile)
            })
            return
        })

        ipcMain.handle('save-profile', async (_event, profile: ProfileSettings) => {
            Settings.saveProfile(profile)
            return
        })

        ipcMain.handle('delete-profile', async (_event, id: string) => {
            Settings.deleteProfile(id)
            return
        })

        ipcMain.handle('get-folders', async () => {
            return await Settings.loadFolders()
        })

        ipcMain.handle('delete-folder', async (_event, id: string) => {
            Settings.deleteFolder(id)
            return
        })

        ipcMain.handle('scan-folder', async (_event, id: string) => {
            return Settings.scanFolder(id)
        })

        ipcMain.handle('save-folder', async (_event, folderSettings: FolderSettings) => {
            Settings.saveFolder(folderSettings)
            return
        })

        ipcMain.handle('save-folders', async (_event, folderSettings: FolderSettings[]) => {
            folderSettings.forEach((folder) => {
                Settings.saveFolder(folder)
            })
            return
        })
    }

    public createTray(): void {
        if (this.tray) return // Tray already exists

        this.tray = new Tray(trayIcon)

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => {
                    if (Settings.mainWindow) {
                        Settings.mainWindow.show()
                        Settings.mainWindow.focus()
                    }
                }
            },
            {
                label: 'Hide',
                click: () => {
                    if (Settings.mainWindow) {
                        Settings.mainWindow.hide()
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    if (this.tray) {
                        this.tray.destroy()
                    }
                    app.quit()
                }
            }
        ])

        this.tray.setContextMenu(contextMenu)
        this.tray.setToolTip('NZB Flow')

        // Double-click to show/hide window
        this.tray.on('double-click', () => {
            if (Settings.mainWindow) {
                if (Settings.mainWindow.isVisible()) {
                    Settings.mainWindow.hide()
                } else {
                    Settings.mainWindow.show()
                    Settings.mainWindow.focus()
                }
            }
        })
    }

    public destroyTray(): void {
        console.log('destroyTray called')

        if (this.tray) {
            this.tray.destroy()
            this.tray = null
        }
    }
}
