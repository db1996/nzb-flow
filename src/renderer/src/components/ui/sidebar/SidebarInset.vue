<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <main
        data-slot="sidebar-inset"
        :class="
            cn(
                'bg-background relative flex w-full flex-1 flex-col',
                'md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:border-l md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
                props.class,
            )
        "
    >
        <slot />
    </main>
</template>
