import { app, shell, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import Settings from './classes/Settings'
import fs from 'fs'
import AppState from './classes/AppState'

let appState: AppState | null = null

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app name for development and production
    app.setName('NZB Flow')

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.nzbflow.app')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    appState = new AppState()
    appState.init()

    // Create the main window
    appState.getWindowTrayManager().createWindow()

    fs.watchFile(Settings.allSettingsPath, async () => {
        await Settings.loadMainSettings()
        Settings.sendWebcontentUpdate('settings-updated', Settings.allSettings)
    })

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            if (appState) {
                appState.getWindowTrayManager().createWindow()
                Settings.load()
            }
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
        Settings.allSettings.theme.minimizeToTray
    )

    // Check if app should quit based on tray settings
    if (appState && !appState.getWindowTrayManager().shouldQuitApp()) {
        return
    }

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    appState?.cleanup()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
