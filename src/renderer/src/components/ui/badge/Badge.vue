<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import type { PrimitiveProps } from 'reka-ui';
import { Primitive } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { type BadgeVariants, badgeVariants } from '.';

// Tooltip primitives
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';
type TooltipVariants = 'primary' | 'success' | 'secondary';

const props = defineProps<
    PrimitiveProps & {
        variant?: BadgeVariants['variant'];
        class?: HTMLAttributes['class'];

        // Tooltip props
        tooltip?: string | null;
        tooltipSide?: TooltipSide;
        tooltipAlign?: TooltipAlign;
        tooltipDelay?: number; // ms
        tooltipDisabled?: boolean;
        tooltipClass?: HTMLAttributes['class']; // custom tooltip content class
        tooltipVariant?: TooltipVariants;
    }
>();

// Omit internal-only props when forwarding to <Primitive/>
const delegatedProps = reactiveOmit(
    props,
    'class',
    'variant',
    'tooltip',
    'tooltipSide',
    'tooltipAlign',
    'tooltipDelay',
    'tooltipDisabled',
    'tooltipClass',
    'tooltipVariant',
);
</script>

<template>
    <!-- If no tooltip provided, behave exactly like before -->
    <Primitive
        v-if="!props.tooltip || props.tooltipDisabled"
        data-slot="badge"
        :class="cn(badgeVariants({ variant: props.variant }), props.class)"
        v-bind="delegatedProps"
    >
        <slot />
    </Primitive>

    <!-- Tooltip-enabled rendering -->
    <TooltipProvider v-else :delay-duration="props.tooltipDelay ?? 200">
        <Tooltip>
            <TooltipTrigger as-child>
                <Primitive data-slot="badge" :class="cn(badgeVariants({ variant: props.variant }), props.class)" v-bind="delegatedProps">
                    <slot />
                </Primitive>
            </TooltipTrigger>
            <TooltipContent
                :variant="props.tooltipVariant"
                :side="props.tooltipSide ?? 'top'"
                :align="props.tooltipAlign ?? 'center'"
                :class="props.tooltipClass"
            >
                <p>{{ props.tooltip }}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>
