<script lang="ts" setup>
import type { PropType } from 'vue';
import { ref, useId, watch } from 'vue';
import Input from '../ui/input/Input.vue';
import Label from '../ui/label/Label.vue';

const props = defineProps({
    modelValue: {
        type: [Object, Array, null] as PropType<File | File[] | null>,
        default: null,
    },
    name: {
        type: String,
        default: undefined,
    },
    label: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    accept: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | File[] | null): void;
    (e: 'change', value: File | File[] | null, ev: Event): void;
}>();

const id = useId();
const inputEl = ref<HTMLInputElement | null>(null);

function onChange(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const files = el.files;
    let value: File | File[] | null = props.multiple ? [] : null;

    if (files && files.length > 0) {
        value = props.multiple ? Array.from(files) : files[0];
    }

    emit('update:modelValue', value);
    emit('change', value, ev);
}

watch(
    () => props.error,
    (err) => {
        if (err) inputEl.value?.focus();
    },
    { immediate: false },
);

watch(
    () => props.modelValue,
    (val) => {
        const isEmpty = val === null || (Array.isArray(val) && val.length === 0);

        if (isEmpty && inputEl.value) {
            inputEl.value.value = '';
        }
    },
);

defineExpose({
    focus: () => inputEl.value?.focus(),
});
</script>

<template>
    <div class="relative grid gap-2">
        <Label v-if="label" :for="id">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>

        <div class="relative">
            <Input
                ref="inputEl"
                :id="id"
                :name="name"
                type="file"
                :multiple="multiple"
                :accept="accept"
                :disabled="disabled"
                @change="onChange"
                :class="['mt-1 block w-full', { 'border-red-600': error }]"
            />
        </div>

        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" class="ms-1 mt-0 text-xs text-gray-500 italic">{{ help }}</span>
    </div>
</template>
