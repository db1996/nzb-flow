<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps, useForwardProps } from 'reka-ui';

const props = defineProps<DropdownMenuTriggerProps>();

const forwardedProps = useForwardProps(props);
</script>

<template>
    <DropdownMenuTrigger data-slot="dropdown-menu-trigger" v-bind="forwardedProps" class="cursor-pointer">
        <slot />
    </DropdownMenuTrigger>
</template>
