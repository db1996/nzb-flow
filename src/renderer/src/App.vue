<script setup lang="ts">
import { watch } from 'vue'
import { useSettingsStore } from './composables/settingsStore'
import { useAppearance } from './composables/useAppearance'

const settingsStore = useSettingsStore()
const appearanceStore = useAppearance()

watch(
    () => settingsStore.settings?.theme?.type,
    newThemeType => {
        if (newThemeType) {
            appearanceStore.updateAppearance(newThemeType)
        }
    }
)
</script>

<template>
    <router-view />
</template>
