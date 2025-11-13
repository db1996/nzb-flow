<script setup lang="ts">
import AppContent from '@components/AppContent.vue'
import AppShell from '@components/AppShell.vue'
import AppSidebar from '@components/navigation/AppSidebar.vue'
import AppSidebarHeader from '@components/navigation/AppSidebarHeader.vue'
import { BreadcrumbItem } from '@renderer/types/navigation'

interface Props {
    breadcrumbs?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => []
})
</script>

<template>
    <AppShell variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar">
            <AppSidebarHeader :breadcrumbs="breadcrumbs" />
            <slot />
        </AppContent>
    </AppShell>
</template>
