import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Settings from './classes/Settings'
import fs from 'fs'
import AppState from './classes/AppState'

let appState: AppState | null = null

function createWindow(): void {
    // Create the browser window.
    Settings.mainWindow = new BrowserWindow({
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

    Settings.mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {
            action: 'deny'
        }
    })

    appState!.registerWindowHandlers()

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        Settings.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        Settings.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

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
    createWindow()

    fs.watchFile(Settings.allSettingsPath, async () => {
        await Settings.loadMainSettings()
        Settings.mainWindow?.webContents.send('settings-loaded', Settings.allSettings)
    })

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
            Settings.load()
            if (appState) {
                appState.registerWindowHandlers()
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
        appState?.tray,
        Settings.allSettings.theme.minimizeToTray
    )

    // Don't quit if showTrayIcon is enabled (app should stay in tray)
    if (
        Settings.allSettings.theme.showTrayIcon &&
        Settings.allSettings.theme.minimizeToTray &&
        appState &&
        appState.tray
    ) {
        return
    }

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    appState?.destroyTray()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
