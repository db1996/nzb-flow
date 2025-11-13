<script setup lang="ts">
import { useSettingsStore } from '@renderer/composables/settingsStore';
import { useAppearance } from '@renderer/composables/useAppearance';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { Moon, Palette, MonitorCog, Sun } from 'lucide-vue-next';
import { ref } from 'vue';

const appearanceStore = useAppearance();
const settingsStore = useSettingsStore();

const currentAppearance = ref(appearanceStore.appearance);

function updateAppearance(newAppearance: 'light' | 'dark' | 'system') {
    appearanceStore.updateAppearance(newAppearance);
    currentAppearance.value = newAppearance;

    settingsStore.savePartialSettings({ theme: {...settingsStore.settings.theme, type: newAppearance } });
}

</script>
<template>
    <DropdownMenu>
        <DropdownMenuTrigger class="border-indigo-500 border-indigo-700 peer/menu-button overflow-hidden rounded-md p-2
            text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent
            active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50
            group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent
            data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground
            group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:pr-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm"
            >
            <Palette :size="18" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem @click="updateAppearance('dark')" :class="{'bg-primary text-white': currentAppearance === 'dark' }">
                <Moon/>
                Dark Mode
            </DropdownMenuItem>
            <DropdownMenuItem @click="updateAppearance('light')" :class="{'bg-primary text-white': currentAppearance === 'light' }">
                <Sun/>
                Light Mode
            </DropdownMenuItem>
            <DropdownMenuItem @click="updateAppearance('system')" :class="{'bg-primary text-white': currentAppearance === 'system' }">
                <MonitorCog/>
                System Default
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
