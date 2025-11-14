import { app, shell, BrowserWindow, ipcMain, dialog, Tray, Menu } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import Settings from './classes/Settings'
import { AllSettings } from './types/settings/AllSettings'
import fs from 'fs'
import RarCommand from './commands/rar'
import ParCommand from './commands/par'
import Nyuu from './commands/nyuu'
import ncp from 'copy-paste'
import TaskManager from './commands/manager/TaskManager'
import { TaskConfig } from './types/settings/commands/taskSettings'
import Updater from './classes/Updater'
import { ProfileSettings } from './types/settings/ProfileSettings'
import Utils from './classes/Utils'
import { FolderSettings } from './types/settings/FolderSettings'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let updaterInstance: Updater | null = null

function createTray(): void {
    if (tray) return // Tray already exists

    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                if (mainWindow) {
                    mainWindow.show()
                    mainWindow.focus()
                }
            }
        },
        {
            label: 'Hide',
            click: () => {
                if (mainWindow) {
                    mainWindow.hide()
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                if (tray) {
                    tray.destroy()
                }
                app.quit()
            }
        }
    ])

    tray.setContextMenu(contextMenu)
    tray.setToolTip('NZB Flow')

    // Double-click to show/hide window
    tray.on('double-click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
                mainWindow.focus()
            }
        }
    })
}

function destroyTray(): void {
    console.log('destroyTray called')

    if (tray) {
        tray.destroy()
        tray = null
    }
}

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        title: 'NZB Flow',
        icon: icon, // Set icon for all platforms including Windows
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show()

        // Create tray icon on startup if showTrayIcon is enabled
        if (Settings.allSettings.theme.showTrayIcon && !tray) {
            createTray()
        }
    })

    mainWindow.on('close', (event) => {
        // Only hijack close event if both showTrayIcon and minimizeToTray are true
        if (Settings.allSettings.theme.showTrayIcon && Settings.allSettings.theme.minimizeToTray) {
            event.preventDefault()
            mainWindow?.hide()

            // Create tray if it doesn't exist (shouldn't happen, but safety check)
            if (!tray) {
                createTray()
            }
        }
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {
            action: 'deny'
        }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app name for development and production
    app.setName('NZB Flow')

    const taskManager = new TaskManager()
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.nzbflow.app')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('get-allsettings', () => {
        return Settings.allSettings
    })

    ipcMain.handle('save-allsettings', (_event, allSettings: AllSettings) => {
        Settings.saveAllSettings(allSettings)

        // Handle tray setting changes
        if (allSettings.theme.showTrayIcon) {
            // If showTrayIcon is enabled, create tray if it doesn't exist
            if (!tray) {
                createTray()
            }
        } else {
            // If showTrayIcon is disabled, destroy tray
            destroyTray()
        }
    })

    ipcMain.handle('queue-task', async (_event, task: TaskConfig) => {
        taskManager.queueTaskConfig(task)
        return true
    })

    ipcMain.handle('unqueue-task', async (_event, id: string) => {
        taskManager.unQueueTaskId(id)
        return true
    })

    // Approval task management handlers
    ipcMain.handle('get-approval-tasks', () => {
        return taskManager.getApprovalTaskConfig()
    })

    ipcMain.handle('add-approval-task', (_event, taskSettings: TaskConfig) => {
        taskManager.addApprovalTaskConfig(taskSettings)
        return true
    })

    ipcMain.handle('remove-approval-task', (_event, id: string) => {
        taskManager.removeApprovalTaskConfig(id)
        return true
    })

    ipcMain.handle('remove-multiple-approval-tasks', (_event, ids: string[]) => {
        taskManager.removeMultipleApprovalTaskConfigs(ids)
        return true
    })

    ipcMain.handle('queue-approval-task', async (_event, id: string) => {
        try {
            await taskManager.queueApprovalTask(id)
            return true
        } catch (error) {
            console.error('Error queueing approval task:', error)
            return false
        }
    })

    ipcMain.handle('queue-multiple-approval-tasks', async (_event, ids: string[]) => {
        try {
            await taskManager.queueMultipleApprovalTaskConfigs(ids)
            return true
        } catch (error) {
            console.error('Error queueing multiple approval tasks:', error)
            return false
        }
    })

    ipcMain.handle('save-approval-task', (_event, taskSettings: TaskConfig) => {
        taskManager.saveApprovalTaskConfig(taskSettings)
        return true
    })

    // Queue control handlers
    ipcMain.handle('pause-queue', () => {
        taskManager.pauseAllQueues()
        return true
    })

    ipcMain.handle('resume-queue', () => {
        taskManager.resumeAllQueues()
        return true
    })

    ipcMain.handle('get-queue-status', () => {
        return taskManager.getQueueStatus()
    })

    ipcMain.handle(
        'generate-empty-task',
        (_event, { profileId, files }: { profileId?: string; files?: string[] }) => {
            if (!profileId) {
                profileId = Settings.profiles.find((profile) => profile.isDefault)?.id || ''
            }

            const newTask = taskManager.getFreshTask(profileId, files)

            return JSON.parse(JSON.stringify(newTask.taskConfig))
        }
    )

    ipcMain.handle('get-history-tasks', async () => {
        return await Settings.loadHistoryTasks()
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

    ipcMain.handle('choose-folder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
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
        updaterInstance?.checkForUpdatesStartup()
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

    createWindow()
    Settings.load(mainWindow, false, taskManager)
    updaterInstance = new Updater(mainWindow)
    updaterInstance.setupAutoUpdater()

    // Create tray icon after settings are loaded if showTrayIcon is enabled
    if (Settings.allSettings.theme.showTrayIcon && !tray) {
        createTray()
    }

    fs.watchFile(Settings.allSettingsPath, async () => {
        await Settings.loadMainSettings()
        Settings.mainWindow?.webContents.send('settings-loaded', Settings.allSettings)
    })

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
            Settings.load(mainWindow)
        }
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    console.log(
        'window close called',
        Settings.allSettings.theme.showTrayIcon,
        tray,
        Settings.allSettings.theme.minimizeToTray
    )

    // Don't quit if showTrayIcon is enabled (app should stay in tray)
    if (
        Settings.allSettings.theme.showTrayIcon &&
        Settings.allSettings.theme.minimizeToTray &&
        tray
    ) {
        return
    }

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    destroyTray()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
