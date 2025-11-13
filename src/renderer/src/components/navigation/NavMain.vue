<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@ui/sidebar';
import { isCurrent, isExpanded, isVisible, resolve } from '@renderer/helpers/route';
import type { NavItem } from '@renderer/types/navigation';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { computed, onMounted, watch } from 'vue';
import Badge from '../ui/badge/Badge.vue';
import { useTasksStore } from '@renderer/composables/useTasksStore';

const props = defineProps<{
    items: NavItem[];
    name?: string;
}>();

const tasksStore = useTasksStore();

const { state } = useSidebar();

const visibleItems = computed(() => props.items.filter((item) => isVisible(item)));

onMounted(() => {
    // Ensure all items are initialized with isExpanded
    props.items.forEach((item) => {
        if (item.children && item.children.length) {
            item.isExpanded = isExpanded(item);
        }
    });

    console.log('NavMain mounted with items:', visibleItems.value);
        setApprovalBadge();
});

watch(
    () => tasksStore.approvalTasks,
  (_newItems) => {
        setApprovalBadge();
        console.log('NavMain items updated:', visibleItems.value);
    }
);

function setApprovalBadge() {
    const approvalItem = props.items.find(item => item.route === 'approval');
    if(approvalItem) {
        if(tasksStore.approvalTasks.length > 0) {
            approvalItem.badge = tasksStore.approvalTasks.length.toString();
        } else {
            approvalItem.badge = undefined;
        }
    }
}
</script>

<template>
    <SidebarGroup v-if="visibleItems.length" class="px-2 py-0">
        <SidebarGroupLabel v-if="name && state !== 'collapsed'">{{ name }}</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in visibleItems" :key="item.title">
                <template v-if="item.isDivider">
                    <div class="border-b mt-2" ></div>
                </template>
                <template v-else>
                    <template v-if="item.children && item.children.length">
                        <!-- Collapsible parent item -->
                        <Collapsible :default-open="isExpanded(item)" @update:open="item.isExpanded = $event">
                            <CollapsibleTrigger as-child class="cursor-pointer">
                                <SidebarMenuButton :is-active="isCurrent(item.current ?? item.route)" :tooltip="item.title">
                                    <div class="flex w-full items-center gap-2">
                                        <component :is="item.icon" :size="16" />
                                        <span class="flex-1 text-left">{{ item.title }}</span>
                                        <ChevronDown v-if="!item.isExpanded" :size="21" />
                                        <ChevronUp v-if="item.isExpanded" :size="21" />
                                    </div>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent class="mt-[4px] pl-4">
                                <SidebarMenu>
                                    <SidebarMenuItem v-for="child in item.children.filter((i) => i.isVisible ?? true)" :key="child.title">
                                        <SidebarMenuButton as-child :is-active="isCurrent(child.current ?? child.route)" :tooltip="child.title">
                                            <RouterLink :to="resolve(child.route)">
                                                <component :is="child.icon" :size="16" />
                                                <span>{{ child.title }}</span>
                                            </RouterLink>
                                            <Badge v-if="child.badge" :variant="child.badgeVariant" class="absolute top-1 right-2">{{
                                                child.badge
                                            }}</Badge>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    </template>

                    <template v-else>
                        <!-- Regular nav item -->
                        <SidebarMenuButton as-child :is-active="isCurrent(item.current ?? item.route)" :tooltip="item.title">
                            <RouterLink :to="resolve(item.route)">
                                <component :is="item.icon" />
                                <span>{{ item.title }}</span>
                            </RouterLink>
                            <Badge v-if="item.badge" :variant="item.badgeVariant" class="absolute top-1 right-2">
                                {{ item.badge }}
                            </Badge>
                        </SidebarMenuButton>
                    </template>
                </template>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
