<script setup lang="ts">
import AppLogo from '@components/AppLogo.vue';
import NavMain from '@components/navigation/NavMain.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@ui/sidebar';
import { useNavigationStore } from '@composables/useNavigationStore';
import type { NavGroup } from '@renderer/types/navigation';
import { computed, onMounted, ref } from 'vue';
import { Cog } from 'lucide-vue-next';
import SidebarFooter from '../ui/sidebar/SidebarFooter.vue';
import SidebarAppearanceButton from './SidebarAppearanceButton.vue';
import { isCurrent } from '@renderer/helpers/route';
import SidebarToggleButton from './SidebarToggleButton.vue';
import Badge from '../ui/badge/Badge.vue';
import { useSettingsStore } from '@renderer/composables/settingsStore';

const settingsStore = useSettingsStore();
const navigationStore = useNavigationStore();

const navGroups = ref<NavGroup[]>([]);

const { open} = useSidebar();

onMounted(async () => {
    navGroups.value = await navigationStore.getNavigation('sidebar');
});

const badgeNumber = computed(() => {
    let count = 0;


    if(settingsStore.settings?.servers.length === 0) {
        count++;
    }
    if(!settingsStore.commands.rar.active && !settingsStore.commands.rar.checking){
        count++;
    }
    if(!settingsStore.commands.par.active && !settingsStore.commands.par.checking){
        count++;
    }
    if(!settingsStore.commands.nyuu.active && !settingsStore.commands.nyuu.checking){
        count++;
    }
    return count;
});
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                      <!-- <RouterLink to="/dashboard" > -->
                          <AppLogo />
                      <!-- </RouterLink> -->
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain v-for="(group, index) in navGroups" :key="index" :name="group.name" :items="group.items" />
        </SidebarContent>
        <SidebarFooter >
            <SidebarMenu>
                <SidebarMenuButton as-child :is-active="isCurrent('/settings')" :variant="!open && badgeNumber ? 'destructive' : 'default'">
                    <RouterLink to="/settings">
                        <Cog />
                        <span>Settings</span>
                        <Badge v-if="badgeNumber" variant="destructive">{{ badgeNumber }}</Badge>
                    </RouterLink>
                </SidebarMenuButton>
                <!-- <SidebarAppearanceButton /> -->
                <SidebarMenuItem>
                    <div class="flex flex-col justify-between items-start flex-nowrap" :class="{
                      'md:flex-row': open,
                    }">
                        <SidebarAppearanceButton />
                        <SidebarToggleButton />
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
