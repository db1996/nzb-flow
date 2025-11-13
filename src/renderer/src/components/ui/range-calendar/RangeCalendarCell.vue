<script lang="ts" setup>
import { cn } from '@renderer/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import type { RangeCalendarCellProps } from 'reka-ui';
import { RangeCalendarCell, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

const props = defineProps<RangeCalendarCellProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <RangeCalendarCell
        data-slot="range-calendar-cell"
        :class="
            cn(
                '[&:has([data-selected])]:bg-accent relative p-0 text-center text-sm focus-within:relative focus-within:z-20 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md [&:has([data-selected][data-selection-end])]:rounded-r-md [&:has([data-selected][data-selection-start])]:rounded-l-md',
                props.class,
            )
        "
        v-bind="forwardedProps"
    >
        <slot />
    </RangeCalendarCell>
</template>
