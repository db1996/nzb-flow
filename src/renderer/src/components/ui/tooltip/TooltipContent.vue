<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import { TooltipArrow, TooltipContent, type TooltipContentEmits, type TooltipContentProps, TooltipPortal, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type TooltipVariants = 'primary' | 'success' | 'secondary';

const props = withDefaults(
    defineProps<
        TooltipContentProps & {
            class?: HTMLAttributes['class'];
            variant?: TooltipVariants;
        }
    >(),
    {
        sideOffset: 4,
        variant: 'primary',
    },
);

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'variant');
const forwarded = useForwardPropsEmits(delegatedProps, emits);

const variantClasses: Record<TooltipVariants, string> = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-emerald-600 text-white',
    secondary: 'bg-secondary text-foreground',
};

const arrowClasses: Record<TooltipVariants, string> = {
    primary: 'bg-primary fill-primary',
    success: 'bg-emerald-600 fill-emerald-600',
    secondary: 'bg-secondary fill-secondary',
};
</script>

<template>
    <TooltipPortal>
        <TooltipContent
            data-slot="tooltip-content"
            v-bind="{ ...forwarded, ...$attrs }"
            :class="
                cn(
                    variantClasses[props.variant],
                    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance',
                    props.class,
                )
            "
        >
            <slot />

            <TooltipArrow :class="cn(arrowClasses[props.variant], 'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]')" />
        </TooltipContent>
    </TooltipPortal>
</template>
