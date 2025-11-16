import { autoUpdater, UpdateInfo } from 'electron-updater'
import Settings from './Settings'

export default class Updater {
    public currentUpdateInfo: UpdateInfo | null = null
    public lastError: any | null = null

    public constructor() {}

    public setupAutoUpdater(): void {
        // Configure auto-updater
        autoUpdater.forceDevUpdateConfig = true
        autoUpdater.autoDownload = false

        // Auto-updater events
        autoUpdater.on('checking-for-update', () => {
            Settings.sendWebcontentUpdate('update-checking', null)
        })

        autoUpdater.on('update-available', (info) => {
            console.log('Update available:', info.version)
            this.currentUpdateInfo = info
            Settings.sendWebcontentUpdate('update-available', info)
        })

        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available:', info.version)
            this.currentUpdateInfo = info
            Settings.sendWebcontentUpdate('update-not-available', info)
        })

        autoUpdater.on('error', (err) => {
            this.lastError = err
            console.log('Error in auto-updater:', err)
            Settings.sendWebcontentUpdate('update-error', err)
        })

        autoUpdater.on('download-progress', (progressObj) => {
            let log_message = 'Download speed: ' + progressObj.bytesPerSecond
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
            log_message =
                log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
            console.log(log_message)
            Settings.sendWebcontentUpdate('update-download-progress', progressObj)
        })

        autoUpdater.on('update-downloaded', (info) => {
            this.currentUpdateInfo = info
            Settings.sendWebcontentUpdate('update-downloaded', info)
        })
    }

    public async checkForUpdatesStartup(): Promise<void> {
        await Settings.load()

        if (Settings.allSettings.updateCheckAutomatically) {
            // Check for updates after a short delay to allow the app to finish loading
            let result = await autoUpdater.checkForUpdates()

            if (
                result &&
                Settings.allSettings.updateDownloadAutomatically &&
                result.isUpdateAvailable
            ) {
                console.log('Auto update download started')
                await autoUpdater.downloadUpdate()

                if (Settings.allSettings.updateInstallAutomatically) {
                    setTimeout(() => {
                        console.log('Auto installing update')
                        autoUpdater.quitAndInstall()
                    }, 2000)
                }
            }
        }
    }
}
