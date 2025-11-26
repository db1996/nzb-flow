<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from '@ui/sidebar'
import { isCurrent, isExpanded, isVisible, resolve } from '@renderer/helpers/route'
import type { NavItem } from '@renderer/types/navigation'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { computed, onMounted, watch } from 'vue'
import Badge from '../ui/badge/Badge.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'

const props = defineProps<{
    items: NavItem[]
    name?: string
}>()
const settingsStore = useSettingsStore()

const { state, open } = useSidebar()

const visibleItems = computed(() => props.items.filter(item => isVisible(item)))

onMounted(() => {
    // Ensure all items are initialized with isExpanded
    props.items.forEach(item => {
        if (item.children && item.children.length) {
            item.isExpanded = isExpanded(item)
        }
    })

    if (!settingsStore.settings) return
    setSettingsBadge()
})

watch(
    () => settingsStore.settings?.servers,
    _newItems => {
        if (!settingsStore.settings) return
        setSettingsBadge()
    }
)

watch(
    () => [settingsStore.commands],
    _newItems => {
        if (!settingsStore.settings) return
        setSettingsBadge()
    },
    { deep: true }
)

function setSettingsBadge() {
    let count = 0
    console.log('settingsStore settings changed, updating badge', settingsStore.settings)

    if (settingsStore.settings?.servers.length === 0) {
        count++
    }
    if (!settingsStore.commands.rar.active && !settingsStore.commands.rar.checking) {
        count++
    }
    if (!settingsStore.commands.par.active && !settingsStore.commands.par.checking) {
        count++
    }
    if (!settingsStore.commands.nyuu.active && !settingsStore.commands.nyuu.checking) {
        count++
    }
    const approvalItem = props.items.find(item => item.route === 'settings')
    if (approvalItem) {
        if (count > 0) {
            approvalItem.badge = count.toString()
        } else {
            approvalItem.badge = undefined
        }
    }
}
</script>

<template>
    <SidebarGroup v-if="visibleItems.length" class="px-0 py-0">
        <SidebarGroupLabel v-if="name && state !== 'collapsed'">{{ name }}</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in visibleItems" :key="item.title">
                <template v-if="item.isDivider">
                    <div class="border-b mt-2"></div>
                </template>
                <template v-else>
                    <template v-if="item.children && item.children.length">
                        <!-- Collapsible parent item -->
                        <Collapsible
                            :default-open="isExpanded(item)"
                            @update:open="item.isExpanded = $event"
                        >
                            <CollapsibleTrigger as-child class="cursor-pointer">
                                <SidebarMenuButton
                                    :is-active="isCurrent(item.current ?? item.route)"
                                    :tooltip="item.title"
                                >
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
                                    <SidebarMenuItem
                                        v-for="child in item.children.filter(
                                            i => i.isVisible ?? true
                                        )"
                                        :key="child.title"
                                    >
                                        <SidebarMenuButton
                                            as-child
                                            :is-active="isCurrent(child.current ?? child.route)"
                                            :tooltip="child.title"
                                        >
                                            <RouterLink :to="resolve(child.route)">
                                                <component :is="child.icon" :size="16" />
                                                <span>{{ child.title }}</span>
                                            </RouterLink>
                                            <Badge
                                                v-show="child.badge && open"
                                                :variant="child.badgeVariant"
                                                class="absolute top-1 right-2"
                                                >{{ child.badge }}</Badge
                                            >
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    </template>

                    <template v-else>
                        <!-- Regular nav item -->
                        <SidebarMenuButton
                            as-child
                            :is-active="isCurrent(item.current ?? item.route)"
                            :tooltip="item.title"
                        >
                            <RouterLink :to="resolve(item.route)">
                                <component :is="item.icon" />
                                <span>{{ item.title }}</span>
                            </RouterLink>
                            <Badge
                                v-show="item.badge && open"
                                :variant="item.badgeVariant"
                                class="absolute top-1 right-2"
                            >
                                {{ item.badge }}
                            </Badge>
                            <Badge
                                v-show="item.badge && !open"
                                :variant="item.badgeVariant"
                                class="absolute top-1 right-[-20px]"
                            >
                                {{ item.badge }}
                            </Badge>
                        </SidebarMenuButton>
                    </template>
                </template>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
