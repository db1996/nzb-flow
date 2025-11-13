<script setup lang="ts">
import { getCurrentAppearance } from '@renderer/composables/useAppearance';
import { computed, type HTMLAttributes } from 'vue';
import lightTheme from '@renderer/assets/logo-light.svg';
import darkTheme from '@renderer/assets/logo-dark.svg';
import smallLogo from '@renderer/assets/icon.png';
import { useSidebar } from './ui/sidebar';

const { open} = useSidebar();

defineOptions({
    inheritAttrs: false,
});

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>();

const source = computed(() => {
    if (getCurrentAppearance() === 'light') {
        return lightTheme;
    } else {
        return darkTheme;
    }
});
</script>

<template>
    <img v-show="open" :src="source" alt="Logo">
    <img v-show="!open" :src="smallLogo" alt="Logo" class="mx-auto">
</template>
