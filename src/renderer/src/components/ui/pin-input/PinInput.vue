<script setup lang="ts">
import { cn } from '@renderer/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import { PinInputRoot, type PinInputRootEmits, type PinInputRootProps, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

const props = withDefaults(defineProps<PinInputRootProps & { class?: HTMLAttributes['class'] }>(), {
    modelValue: () => [],
});
const emits = defineEmits<PinInputRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <PinInputRoot
        data-slot="pin-input"
        v-bind="forwarded"
        :class="cn('flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50', props.class)"
    >
        <slot />
    </PinInputRoot>
</template>
