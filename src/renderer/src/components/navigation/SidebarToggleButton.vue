<script setup lang="ts">
import { PanelLeft, PanelLeftClose } from 'lucide-vue-next'
import { useSidebar } from '../ui/sidebar'
import Button from '../ui/button/Button.vue'
import { watch } from 'vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'

const { toggleSidebar, open } = useSidebar()
const settingsStore = useSettingsStore()

function toggleSidebarWithSettings () {
    toggleSidebar()
    if (settingsStore.settings == null) {
        return
    }
    if (settingsStore.settings.theme.sidebarOpen !== open.value) {
        settingsStore.savePartialSettings({
            theme: { ...settingsStore.settings.theme, sidebarOpen: open.value }
        })
    }
}

watch(
    () => settingsStore.settings?.theme?.sidebarOpen,
    newSidebarOpen => {
        if (open.value === newSidebarOpen) {
            return
        }
        toggleSidebar()
    }
)
</script>
<template>
    <Button
        variant="ghost"
        size="sm"
        @click="toggleSidebarWithSettings"
        class="border-indigo-500 border-indigo-700 peer/menu-button overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:pr-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm"
    >
        <PanelLeft v-if="!open" />
        <PanelLeftClose v-else />
    </Button>
</template>
