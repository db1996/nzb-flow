<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <td data-slot="table-cell" :class="cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', props.class)">
        <slot />
    </td>
</template>
