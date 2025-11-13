<script setup lang="ts">
import { initializeTheme } from '@renderer/composables/useAppearance'
import { SidebarProvider } from '@ui/sidebar'
import { ref } from 'vue'

interface Props {
    variant?: 'header' | 'sidebar'
}

defineProps<Props>()

const isOpen = ref<boolean>(true)

initializeTheme()
</script>

<template>
    <div v-if="variant === 'header'" class="flex min-h-screen w-full flex-col">
        <slot />
    </div>
    <SidebarProvider v-else :default-open="isOpen">
        <slot />
    </SidebarProvider>
</template>
