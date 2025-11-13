<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HTMLAttributes['class'];
    href?: string;
}>();

function isInteractive(el: EventTarget | null): boolean {
    return !!(el && (el as HTMLElement).closest('a, button, input, textarea, select'));
}

function onRowClick(e: MouseEvent) {
    if (!props.href) return;
    if (isInteractive(e.target)) return;

    // router.visit(props.href);
}
</script>

<template>
    <tr
        data-slot="table-row"
        :class="cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', href && 'cursor-pointer', props.class)"
        @click="onRowClick"
    >
        <slot />
    </tr>
</template>
