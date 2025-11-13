import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'

export interface DimensionThreshold {
    min?: number
    max?: number
}

export interface ResizeConfig {
    id: string
    width?: DimensionThreshold
    height?: DimensionThreshold
    callback: (state: { widthActive: boolean; heightActive: boolean; w: number; h: number }) => void
    lastWidthState?: boolean
    lastHeightState?: boolean
}

export const useWindowResizeStore = defineStore('windowResize', () => {
    const width = ref(window.innerWidth)
    const height = ref(window.innerHeight)
    const configs = ref<ResizeConfig[]>([])

    const handleResize = () => {
        width.value = window.innerWidth
        height.value = window.innerHeight

        configs.value.forEach((config) => {
            const wActive =
                !config.width ||
                ((config.width.min === undefined || width.value >= config.width.min) &&
                    (config.width.max === undefined || width.value <= config.width.max))

            const hActive =
                !config.height ||
                ((config.height.min === undefined || height.value >= config.height.min) &&
                    (config.height.max === undefined || height.value <= config.height.max))

            // Only call if something changed
            if (wActive !== config.lastWidthState || hActive !== config.lastHeightState) {
                config.lastWidthState = wActive
                config.lastHeightState = hActive
                config.callback({
                    widthActive: wActive,
                    heightActive: hActive,
                    w: width.value,
                    h: height.value
                })
            }
        })
    }

    window.addEventListener('resize', handleResize)

    const registerConfig = (config: Omit<ResizeConfig, 'lastWidthState' | 'lastHeightState'>) => {
        const existing = configs.value.find((c) => c.id === config.id)
        if (existing) Object.assign(existing, config)
        else
            configs.value.push({ ...config, lastWidthState: undefined, lastHeightState: undefined })

        // Run immediately to set initial state
        handleResize()

        // Cleanup automatically if used in component scope
        onUnmounted(() => {
            unregisterConfig(config.id)
        })
    }

    const unregisterConfig = (id: string) => {
        configs.value = configs.value.filter((c) => c.id !== id)
    }

    return {
        width,
        height,
        registerConfig,
        unregisterConfig
    }
})
