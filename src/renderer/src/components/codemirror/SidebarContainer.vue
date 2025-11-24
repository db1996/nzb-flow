<script setup lang="ts">
import type { CodeMirrorVariable } from '@renderer/types/codemirror'
import SidebarItem from './SidebarItem.vue'

defineProps<{
    variables: CodeMirrorVariable[]
}>()

const emit = defineEmits<{
    (e: 'select', template: string): void
}>()

function handleSelect(template: string) {
    emit('select', template)
}
</script>

<template>
    <div class="w-64 border-r bg-muted/20 overflow-y-auto p-2 space-y-2">
        <SidebarItem
            v-for="variable in variables"
            :key="variable.key"
            :variable="variable"
            @select="handleSelect"
        />
    </div>
</template>
