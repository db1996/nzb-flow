<script setup lang="ts">
import { watch } from 'vue'
import { useSettingsStore } from './composables/settingsStore'
import { useAppearance } from './composables/useAppearance'

// const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

const settingsStore = useSettingsStore()
const appearanceStore = useAppearance()


watch(
    () => settingsStore.settings?.theme?.type,
    newThemeType => {
        if (newThemeType) {
            console.log('Theme changed:', newThemeType)
            appearanceStore.updateAppearance(newThemeType)
        }
    }
)
</script>

<template>
    <router-view />
</template>
