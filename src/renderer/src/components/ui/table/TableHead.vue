<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HTMLAttributes['class'];
    sortable?: boolean;
    active?: boolean;
    direction?: 'asc' | 'desc' | '';
}>();
</script>

<template>
    <th
        data-slot="table-head"
        :class="
            cn(
                'text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                sortable && 'cursor-pointer select-none',
                props.class,
            )
        "
    >
        <div
            class="flex w-full items-center justify-between gap-1"
            :class="{
                'justify-end': props.class && props.class.includes('text-right'),
                'justify-center': props.class && props.class.includes('text-center'),
                'justify-between': !(props.class && (props.class.includes('text-right') || props.class.includes('text-center'))),
            }"
        >
            <slot />
            <component
                :is="direction === 'asc' ? ChevronUp : direction === 'desc' ? ChevronDown : null"
                v-if="sortable && active && direction"
                class="text-muted-foreground size-4"
            />
        </div>
    </th>
</template>
