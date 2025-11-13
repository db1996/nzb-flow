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
import { onMounted, ref } from 'vue';
import SidebarFooter from '../ui/sidebar/SidebarFooter.vue';
import SidebarAppearanceButton from './SidebarAppearanceButton.vue';
import SidebarToggleButton from './SidebarToggleButton.vue';
import NavFooter from './NavFooter.vue';
import sidebar from '@renderer/navigation/sidebar';

const navigationStore = useNavigationStore();

const navGroups = ref<NavGroup[]>(sidebar["items"]);
const navGroupsFooter = ref<NavGroup[]>(sidebar["footerItems"]);

const { open} = useSidebar();

onMounted(async () => {
    navGroups.value = await navigationStore.getNavigation('sidebar');
    navGroupsFooter.value = await navigationStore.getNavigation('sidebarFooter');
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
              <NavFooter v-for="(group, index) in navGroupsFooter" :key="index" :name="group.name" :items="group.items" />
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
