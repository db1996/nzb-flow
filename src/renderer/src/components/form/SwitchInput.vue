<script lang="ts" setup>
import { computed, useId } from 'vue'
import Label from '../ui/label/Label.vue'
import Switch from '../ui/switch/Switch.vue'

const props = defineProps({
    modelValue: {
        type: Boolean
    },
    label: {
        type: String,
        required: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    help: {
        type: String,
        required: false
    },
    variant: {
        type: String as () => 'default' | 'withLabels',
        default: 'default'
    },
    yesText: {
        type: String,
        default: 'Yes'
    },
    noText: {
        type: String,
        default: 'No'
    },
    heightClass: {
        type: String,
        default: ''
    },
    labelHeightClass: {
        type: String,
        default: ''
    }
})

defineEmits(['update:modelValue'])

const proxyValue = computed(() => {
    return props.modelValue
})

const proxyId = useId()
</script>

<template>
    <div class="flex flex-col gap-2">
        <Label v-if="label" :for="proxyId" :class="labelHeightClass">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>

        <!-- with labels variant -->
        <div v-if="variant === 'withLabels'" class="flex items-center gap-3" :class="heightClass">
            <span class="text-muted-foreground text-sm">{{ noText }}</span>
            <Switch
                :id="proxyId"
                v-bind:model-value="proxyValue"
                @update:model-value="$emit('update:modelValue', $event)"
                :disabled="disabled"
            />
            <span class="text-muted-foreground text-sm">{{ yesText }}</span>
        </div>

        <!-- default variant -->
        <div v-else class="min-h-[2.5rem]">
            <Switch
                :id="proxyId"
                v-bind:model-value="proxyValue"
                @update:model-value="$emit('update:modelValue', $event)"
                :disabled="disabled"
            />
        </div>

        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" class="ms-1 mt-0 text-xs text-gray-500 italic">{{ help }}</span>
    </div>
</template>
