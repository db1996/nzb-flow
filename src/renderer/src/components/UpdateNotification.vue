<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './ui/button/Button.vue'

const updateState = ref<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'>(
    'idle'
)
const updateInfo = ref<any>(null)
const downloadProgress = ref(0)
const errorMessage = ref('')
const showUpdateNotification = ref(false)

// Auto-updater event handlers
const handleUpdateChecking = () => {
    updateState.value = 'checking'
    showUpdateNotification.value = true
}

const handleUpdateAvailable = (info: any) => {
    updateState.value = 'available'
    updateInfo.value = info
    showUpdateNotification.value = true
}

const handleUpdateNotAvailable = () => {
    updateState.value = 'idle'
    showUpdateNotification.value = false
}

const handleUpdateError = (error: string) => {
    updateState.value = 'error'
    errorMessage.value = error
    showUpdateNotification.value = true
}

const handleDownloadProgress = (progress: any) => {
    updateState.value = 'downloading'
    downloadProgress.value = progress.percent || 0
    showUpdateNotification.value = true
}

const handleUpdateDownloaded = (info: any) => {
    updateState.value = 'downloaded'
    updateInfo.value = info
    showUpdateNotification.value = true
}

// Action handlers
const downloadUpdate = async () => {
    try {
        updateState.value = 'downloading'
        await window.api.downloadUpdate()
    } catch (error) {
        console.error('Failed to download update:', error)
        updateState.value = 'error'
        errorMessage.value = 'Failed to download update'
    }
}

const installUpdate = () => {
    window.api.quitAndInstall()
}

const dismissUpdate = () => {
    showUpdateNotification.value = false
    updateState.value = 'idle'
}

// Manual check for updates (you can call this from a menu or button)
const checkForUpdates = async () => {
    try {
        await window.api.checkForUpdates()
    } catch (error) {
        console.error('Failed to check for updates:', error)
    }
}

// Expose checkForUpdates for parent components
defineExpose({
    checkForUpdates
})

onMounted(() => {
    // Register event listeners
    window.api.onUpdateChecking(handleUpdateChecking)
    window.api.onUpdateAvailable(handleUpdateAvailable)
    window.api.onUpdateNotAvailable(handleUpdateNotAvailable)
    window.api.onUpdateError(handleUpdateError)
    window.api.onUpdateDownloadProgress(handleDownloadProgress)
    window.api.onUpdateDownloaded(handleUpdateDownloaded)
})
</script>
<template>
    <Button @click="checkForUpdates()" variant="default"> Check for Updates </Button>
    <div v-if="showUpdateNotification" class="fixed bottom-4 right-4 z-50">
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <!-- Checking for update -->
            <div v-if="updateState === 'checking'" class="flex items-center space-x-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span class="text-sm text-gray-700">Checking for updates...</span>
            </div>

            <!-- Update available -->
            <div v-else-if="updateState === 'available'" class="space-y-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900">Update Available</span>
                </div>
                <p class="text-sm text-gray-600">
                    Version {{ updateInfo?.version }} is ready to download.
                </p>
                <div class="flex space-x-2">
                    <button
                        @click="downloadUpdate"
                        class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    >
                        Download
                    </button>
                    <button
                        @click="dismissUpdate"
                        class="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded"
                    >
                        Later
                    </button>
                </div>
            </div>

            <!-- Downloading -->
            <div v-else-if="updateState === 'downloading'" class="space-y-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900">Downloading Update</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: downloadProgress + '%' }"
                    ></div>
                </div>
                <p class="text-xs text-gray-500">{{ Math.round(downloadProgress) }}% complete</p>
            </div>

            <!-- Ready to install -->
            <div v-else-if="updateState === 'downloaded'" class="space-y-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900">Update Ready</span>
                </div>
                <p class="text-sm text-gray-600">
                    Update downloaded. Restart to install version {{ updateInfo?.version }}.
                </p>
                <div class="flex space-x-2">
                    <button
                        @click="installUpdate"
                        class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                    >
                        Restart & Install
                    </button>
                    <button
                        @click="dismissUpdate"
                        class="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded"
                    >
                        Later
                    </button>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="updateState === 'error'" class="space-y-3">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-900">Update Error</span>
                </div>
                <p class="text-sm text-gray-600">{{ errorMessage }}</p>
                <button
                    @click="dismissUpdate"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded"
                >
                    Dismiss
                </button>
            </div>

            <!-- Close button -->
            <button
                @click="dismissUpdate"
                class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
            </button>
        </div>
    </div>
</template>
