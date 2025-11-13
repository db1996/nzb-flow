<script setup lang="ts">
import { cn } from '@renderer/lib/utils'
import { useEventListener, useMediaQuery, useVModel } from '@vueuse/core'
import { TooltipProvider } from 'reka-ui'
import { computed, type HTMLAttributes, onMounted, type Ref, ref } from 'vue'
import {
    provideSidebarContext,
    SIDEBAR_COOKIE_MAX_AGE,
    SIDEBAR_COOKIE_NAME,
    SIDEBAR_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON
} from './utils'
import { useWindowResizeStore } from '@renderer/composables/useWindowResizeStore'
import { useSettingsStore } from '@renderer/composables/settingsStore'

const props = withDefaults(
    defineProps<{
        defaultOpen?: boolean
        open?: boolean
        class?: HTMLAttributes['class']
    }>(),
    {
        defaultOpen: true,
        open: undefined
    }
)

const emits = defineEmits<{
    'update:open': [open: boolean]
}>()

const previousOpen = ref<boolean | null>(null)

const isMobile = useMediaQuery('(max-width: 768px)')
const resizeStore = useWindowResizeStore()
const openMobile = ref(false)
const settingsStore = useSettingsStore()

const open = useVModel(props, 'open', emits, {
    defaultValue: props.defaultOpen ?? false,
    passive: (props.open === undefined) as false
}) as Ref<boolean>

function setOpen(value: boolean) {
    open.value = value // emits('update:open', value)

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open.value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
}

function setOpenMobile(value: boolean) {
    openMobile.value = value
}

// Helper to toggle the sidebar.
function toggleSidebar() {
    return setOpen(!open.value)
}

useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
    }
})

onMounted(async () => {
    if(settingsStore.settings === null){
        await settingsStore.getSettings();
    }
})

resizeStore.registerConfig({
    id: 'mobileLayoutWatcher',
    width: { max: 768 },
    callback: ({ widthActive }) => {
        if (widthActive) {
            previousOpen.value = open.value ? true : false
            open.value = false
        } else {
            if (previousOpen.value === null) {
                return
            }

            open.value = previousOpen.value
        }
    }
})

// We add a state so that we can do data-state="expanded" or "collapsed".
// This makes it easier to style the sidebar with Tailwind classes.
const state = computed(() => (open.value ? 'expanded' : 'collapsed'))

provideSidebarContext({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar
})
</script>

<template>
    <TooltipProvider :delay-duration="0">
        <div
            data-slot="sidebar-wrapper"
            :style="{
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON
            }"
            :class="
                cn(
                    'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
                    props.class
                )
            "
            v-bind="$attrs"
        >
            <slot />
        </div>
    </TooltipProvider>
</template>
