import { BrowserWindow, shell, Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import trayIcon from '../../../resources/tray/icon.png?asset'
import xIcon from '../../../resources/tray/x.png?asset'
import Settings from './Settings'
import type AppState from './AppState'

export default class WindowTrayManager {
    private mainWindow: BrowserWindow | null = null
    private tray: Tray | null = null
    private appState: AppState

    constructor(appState: AppState) {
        this.appState = appState
    }

    public openMenu(): Electron.Menu {
        const img = nativeImage.createFromPath(trayIcon).resize({ width: 16, height: 16 })

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Hide',
                icon: img,
                click: () => {
                    this.hideWindow()
                }
            },
            ...this.generalMenu()
        ])

        return contextMenu
    }

    public closedMenu(): Electron.Menu {
        const img = nativeImage.createFromPath(trayIcon).resize({ width: 16, height: 16 })

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show',
                icon: img,
                click: () => {
                    this.showWindow()
                }
            },
            ...this.generalMenu()
        ])

        return contextMenu
    }

    public generalMenu(): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] {
        const img = nativeImage.createFromPath(xIcon).resize({ width: 16, height: 16 })

        return [
            { type: 'separator' },
            {
                label: 'Quit',
                icon: img,
                click: () => {
                    app.quit()
                }
            }
        ]
    }

    /**
     * Create the main application window
     */
    public createWindow(): BrowserWindow {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.show()
            this.mainWindow.focus()
            return this.mainWindow
        }

        // Create the browser window
        this.mainWindow = new BrowserWindow({
            width: 1024,
            height: 670,
            show: false,
            autoHideMenuBar: true,
            title: 'NZB Flow',
            icon: icon,
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            }
        })

        // Store reference in Settings for backward compatibility
        Settings.mainWindow = this.mainWindow

        this.setupWindowEventHandlers()
        this.loadWindowContent()

        return this.mainWindow
    }

    /**
     * Destroy the main window while keeping the app running
     */
    public destroyWindow(): void {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.destroy()
            this.mainWindow = null
            Settings.mainWindow = null
            this.updateTrayMenu() // Update tray menu when window is destroyed
        }
    }

    /**
     * Show the main window (create if it doesn't exist)
     */
    public showWindow(): void {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
            this.createWindow()
        } else {
            this.mainWindow.show()
            this.mainWindow.focus()
            this.updateTrayMenu() // Update tray menu when window is shown
        }
    }

    /**
     * Hide the main window
     */
    public hideWindow(): void {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.hide()
            this.updateTrayMenu() // Update tray menu when window is hidden
        }
    }

    /**
     * Get the main window instance
     */
    public getWindow(): BrowserWindow | null {
        return this.mainWindow
    }

    /**
     * Check if window exists and is not destroyed
     */
    public hasWindow(): boolean {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed()
    }

    /**
     * Create system tray
     */
    public createTray(): void {
        if (this.tray) return // Tray already exists

        this.tray = new Tray(trayIcon)
        this.updateTrayMenu() // Use the new function to set initial menu
        this.tray.setToolTip('NZB Flow')

        this.tray.on('double-click', () => {
            if (this.hasWindow() && this.mainWindow!.isVisible()) {
                this.hideWindow()
            } else {
                this.showWindow()
            }
        })
    }

    /**
     * Destroy system tray
     */
    public destroyTray(): void {
        if (this.tray) {
            this.tray.destroy()
            this.tray = null
        }
    }

    /**
     * Update tray menu based on current window state
     */
    public updateTrayMenu(): void {
        if (!this.tray) return

        const isWindowVisible = this.hasWindow() && this.mainWindow!.isVisible()
        const menu = isWindowVisible ? this.openMenu() : this.closedMenu()
        this.tray.setContextMenu(menu)
    }

    /**
     * Check if tray exists
     */
    public hasTray(): boolean {
        return this.tray !== null
    }

    /**
     * Update tray visibility based on settings
     */
    public updateTrayBasedOnSettings(): void {
        if (Settings.allSettings.theme.showTrayIcon) {
            if (!this.tray) {
                this.createTray()
            }
        } else {
            this.destroyTray()
        }
    }

    /**
     * Handle window close event based on settings
     */
    public handleWindowClose(event: Electron.Event): void {
        if (Settings.allSettings.theme.showTrayIcon && Settings.allSettings.theme.minimizeToTray) {
            event.preventDefault()
            if (!this.tray) {
                this.createTray()
            }
            this.destroyWindow()
        }
    }

    /**
     * Handle app quit logic based on settings
     */
    public shouldQuitApp(): boolean {
        // Don't quit if showTrayIcon is enabled and minimizeToTray is enabled
        if (
            Settings.allSettings.theme.showTrayIcon &&
            Settings.allSettings.theme.minimizeToTray &&
            this.tray
        ) {
            console.log('Hiding window instead of quitting app')
            return false
        }

        return true
    }

    /**
     * Setup window event handlers
     */
    private setupWindowEventHandlers(): void {
        if (!this.mainWindow) return

        this.mainWindow.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url)
            return {
                action: 'deny'
            }
        })

        this.mainWindow.on('ready-to-show', () => {
            this.mainWindow?.show()
            this.updateTrayBasedOnSettings()
            this.updateTrayMenu() // Update tray menu when window is ready and shown
        })

        this.mainWindow.on('show', () => {
            this.updateTrayMenu() // Update tray menu when window becomes visible
        })

        this.mainWindow.on('hide', () => {
            this.updateTrayMenu() // Update tray menu when window is hidden
        })

        this.mainWindow.on('close', (event) => {
            this.handleWindowClose(event)
            // updateTrayMenu will be called in handleWindowClose or destroyWindow
        })

        // Register IPC handlers when window is created
        this.appState.registerWindowHandlers()
    }

    /**
     * Load window content (dev URL or production file)
     */
    private loadWindowContent(): void {
        if (!this.mainWindow) return

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        }
    }

    /**
     * Minimize window to tray (destroy window but keep app running with tray)
     */
    public minimizeToTray(): void {
        if (Settings.allSettings.theme.showTrayIcon) {
            if (!this.tray) {
                this.createTray()
            }
            this.destroyWindow()
        } else {
            console.warn('Cannot minimize to tray: tray is not enabled in settings')
        }
    }

    /**
     * Restore window from tray
     */
    public restoreFromTray(): void {
        this.showWindow()
    }

    /**
     * Toggle window visibility (show if hidden, hide if shown)
     */
    public toggleWindow(): void {
        if (!this.hasWindow() || !this.mainWindow!.isVisible()) {
            this.showWindow()
        } else {
            if (
                Settings.allSettings.theme.showTrayIcon &&
                Settings.allSettings.theme.minimizeToTray
            ) {
                this.minimizeToTray()
            } else {
                this.hideWindow()
            }
        }
    }

    /**
     * Check if app is running with tray only (no window)
     */
    public isRunningInTray(): boolean {
        return this.hasTray() && !this.hasWindow()
    }

    /**
     * Cleanup method to destroy all resources
     */
    public cleanup(): void {
        this.destroyTray()
        this.destroyWindow()
    }
}
