import { ProgressInfo, UpdateInfo } from 'electron-updater'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' |  'unavailable'

export const useUpdateStore = defineStore('update', () => {
    const updateState = ref<UpdateState>('idle')
    const updateInfo = ref<UpdateInfo | null>(null)
    const downloadProgress = ref(0)
    const errorMessage = ref('')
    const currentVersion = ref('')
    const startupChecked = ref(false)
    const currentToastId = ref<string | number | null>(null)
    const toastIsDownloading = ref(false)

    // --- Handlers for electron-updater events ---

    const initUpdateStore = async () => {
        initializeListeners()
        currentVersion.value = await getCurrentVersion()
    }

    async function getCurrentVersion(): Promise<string> {
        const version = await window.api.getCurrentVersion()

        return version
    }

    const handleUpdateChecking = () => {
        updateState.value = 'checking'
    }

    const handleUpdateAvailable = (info: UpdateInfo) => {
        updateState.value = 'available'
        updateInfo.value = info

        if(currentToastId.value)
          toast.dismiss(currentToastId.value!)

        currentToastId.value = toast('Update available!', {
            description: 'Download the update now, or visit the settings to do it later.',
            duration: Infinity,
            closeButton: true,
            action: {
                label: 'Download',
                onClick: () => window.api.downloadUpdate()
            },
            onAutoClose: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            },
            onDismiss: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            }
        })
    }

    const handleUpdateNotAvailable = (info: UpdateInfo) => {
        updateState.value = 'unavailable'
        updateInfo.value = info
    }

    const handleUpdateError = (error: string) => {
        updateState.value = 'error'
        errorMessage.value = error

        if(currentToastId.value)
          toast.dismiss(currentToastId.value!)

        currentToastId.value = toast('Something went wrong with the update process :(', {
            description: 'An error occurred: ' + error,
            duration: 2000,
            closeButton: true,
            onAutoClose: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            },
            onDismiss: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            }
        })
    }

    const handleDownloadProgress = (progress: ProgressInfo) => {
        updateState.value = 'downloading'
        downloadProgress.value = progress.percent || 0

        if(!toastIsDownloading.value) {
            toastIsDownloading.value = true

            if(currentToastId.value)
              toast.dismiss(currentToastId.value!)

            currentToastId.value = toast('Downloading update...', {
                description: 'Download is in progress.',
                duration: Infinity,
                closeButton: true,
                onAutoClose: (t) => {
                    if (t.id === currentToastId.value) {
                        currentToastId.value = null
                        toastIsDownloading.value = false
                    }
                },
                onDismiss: (t) => {
                    if (t.id === currentToastId.value) {
                        currentToastId.value = null
                        toastIsDownloading.value = false
                    }
                }
            })
        }
    }

    const handleUpdateDownloaded = (info: UpdateInfo) => {
        updateState.value = 'downloaded'
        updateInfo.value = info

        if(currentToastId.value)
          toast.dismiss(currentToastId.value!)

        currentToastId.value = toast('Update downloaded', {
            description: 'Install the update now, or visit the settings to do it later.',
            duration: Infinity,
            closeButton: true,
            action: {
                label: 'Install',
                onClick: () => window.api.quitAndInstall()
            },
            onAutoClose: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            },
            onDismiss: (t) => {
                if (t.id === currentToastId.value) {
                    currentToastId.value = null
                }
            }
        })
    }

    // --- Actions exposed to the app/UI ---

    const downloadUpdate = async () => {
        updateState.value = 'downloading'
        console.log('downloading update...')
        if(currentToastId.value)
          toast.dismiss(currentToastId.value!)

        toast.promise(
            () =>
                new Promise((resolve) => {
                    window.api.downloadUpdate().then(resolve).catch(resolve)
                }),
            {
                loading: 'Loading',
                error: (err: any) => {
                    console.error('Failed to download update:', err)
                    updateState.value = 'error'
                    errorMessage.value = 'Failed to download update'
                    return 'Failed to download update'
                },
                success: (data: any) => {
                    updateState.value = 'downloaded'
                    updateInfo.value = data
                    return 'Update downloaded'
                }
            }
        )
    }

    const installUpdate = () => {
        console.log('Installing update...')
        window.api.quitAndInstall()
    }

    const dismissUpdate = () => {
        console.log('Dismissing update...')
        updateState.value = 'idle'
    }

    const checkForUpdates = async () => {
        try {
            await window.api.checkForUpdates()
        } catch (error) {
            console.error('Failed to check for updates:', error)
        }
    }

    const checkUpdateOnStartup = async () => {
        if (startupChecked.value) return
        startupChecked.value = true

        try {
            await window.api.checkUpdateOnStartup()
        } catch (error) {
            console.error('Failed to check for updates on startup:', error)
        }
    }

    // --- Initialize event listeners once ---
    const initializeListeners = () => {
        if (!window.api) return console.warn('window.api not found')

        window.api.onUpdateChecking(handleUpdateChecking)
        window.api.onUpdateAvailable(handleUpdateAvailable)
        window.api.onUpdateNotAvailable(handleUpdateNotAvailable)
        window.api.onUpdateError(handleUpdateError)
        window.api.onUpdateDownloadProgress(handleDownloadProgress)
        window.api.onUpdateDownloaded(handleUpdateDownloaded)
    }

    return {
        updateState,
        updateInfo,
        downloadProgress,
        errorMessage,
        currentVersion,

        checkForUpdates,
        downloadUpdate,
        installUpdate,
        dismissUpdate,
        initUpdateStore,
        checkUpdateOnStartup
    }
})
