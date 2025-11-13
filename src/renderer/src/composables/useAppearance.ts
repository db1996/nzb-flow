import type { Appearance } from '@renderer/types/appearance'
import { ref } from 'vue'
import { useSettingsStore } from './settingsStore'

export function updateTheme(value: Appearance) {
    if (typeof window === 'undefined') {
        return
    }

    if (value === 'system') {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        const systemTheme = mediaQueryList.matches ? 'dark' : 'light'

        document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
        document.documentElement.classList.toggle('dark', value === 'dark')
    }
}

export function getCurrentAppearance(): Appearance {
    let useSystem = false
    let appearance: Appearance = 'system'

    if (typeof window === 'undefined') {
        useSystem = true
    } else {
        const settings = useSettingsStore()
        appearance = settings.settings?.theme?.type || 'system'
    }

    if (useSystem || appearance === 'system') {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
        return mediaQueryList.matches ? 'dark' : 'light'
    } else {
        return appearance
    }
}

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null
    }

    return window.matchMedia('(prefers-color-scheme: dark)')
}

const getStoredAppearance = () => {
    if (typeof window === 'undefined') {
        return null
    }
    const settings = useSettingsStore()

    return settings.settings?.theme?.type || 'system'
}

const handleSystemThemeChange = () => {
    const currentAppearance = getStoredAppearance()

    updateTheme(currentAppearance || 'system')
}

export function initializeTheme() {
    if (typeof window === 'undefined') {
        return
    }

    // Initialize theme from saved preference or default to system...
    const savedAppearance = getStoredAppearance()
    updateTheme(savedAppearance || 'system')
    // Set up system theme change listener...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange)
}

export function useAppearance() {
    const appearance = ref<Appearance>(getStoredAppearance() || 'system')

    function updateAppearance(value: string) {
        if (!['light', 'dark', 'system'].includes(value)) {
            console.warn(`Invalid appearance value: ${value}`)
            return
        }
        const actualAppearance = value as Appearance
        appearance.value = actualAppearance

        updateTheme(actualAppearance)
    }

    return {
        appearance,
        updateAppearance
    }
}
