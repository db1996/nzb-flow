<script lang="ts" setup>
import { LoaderCircle } from 'lucide-vue-next';
import { computed, PropType } from 'vue';
import Icon from '../Icon.vue';
import { type ButtonVariants } from '../ui/button';
import Button from '../ui/button/Button.vue';

const props = defineProps({
    variant: String as PropType<ButtonVariants['variant']>,
    size: String as PropType<ButtonVariants['size']>,
    loading: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: '',
    },
    text: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const comp_disabled = computed(() => {
    return props.disabled || props.loading;
});
</script>
<template>
    <Button :variant="variant" :size="size" :disabled="comp_disabled">
        <Icon v-if="icon !== ''" :name="icon" />
        <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
        <span v-if="text">{{ text }}</span>
        <slot />
    </Button>
</template>
