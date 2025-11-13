<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import { Primitive, type PrimitiveProps, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes['class'] }>();
const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <Primitive data-slot="pin-input-group" v-bind="forwardedProps" :class="cn('flex items-center', props.class)">
        <slot />
    </Primitive>
</template>
