<script setup lang="ts">
import { Textarea } from '@ui/textarea';
import { computed, ref, useId } from 'vue';
import Label from '../ui/label/Label.vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Array<String>],
    },
    label: {
        type: String,
        required: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: '',
    },
    error: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    rows: {
        type: [Number, String],
        default: 4,
    },
    maxlength: {
        type: Number,
        required: false,
    },
});

const proxyId = useId();
const emit = defineEmits(['update:modelValue'])

const proxyValue = computed(() => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.join('\n')
    }
    return props.modelValue
})

const textarea = ref<HTMLTextAreaElement | null>(null);


function updateValue(string) {
    if (Array.isArray(props.modelValue)) {
        const value = string.split('\n').map((v) => v.trim())

        emit('update:modelValue', value)
        return
    }
    emit('update:modelValue', string)
}
</script>

<template>
    <div class="relative grid gap-2">
        <Label v-if="label" :for="proxyId">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>

        <Textarea
            ref="textarea"
            :id="proxyId"
            v-bind:model-value="proxyValue"
            :rows="rows"
            :maxlength="maxlength"
            :disabled="disabled"
            :placeholder="placeholder"
            @update:model-value="updateValue"
            :class="['mt-1 block w-full', { 'border-red-600': error }]"
        />

        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" :id="`${proxyId}-help`" class="ms-1 mt-0 text-xs text-gray-500 italic">{{ help }}</span>
    </div>
</template>
