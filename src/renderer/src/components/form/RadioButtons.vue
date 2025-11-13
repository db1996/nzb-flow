<script setup lang="ts">
import { computed, useId } from 'vue'
import Label from '../ui/label/Label.vue'

const props = withDefaults(
    defineProps<{
        modelValue: string | number | boolean
        options: {
            value: string | number | boolean
            label: string
            icon?: any
        }[]
        label?: string
        required?: boolean
        error?: string
        help?: string
    }>(),
    {
        required: false,
        error: ''
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | boolean): void
}>()

const proxyId = useId()

const isSelected = computed(() => (value: string | number | boolean) => props.modelValue === value)

function select(value: string | number | boolean) {
    emit('update:modelValue', value)
}
</script>

<template>
    <div class="grid gap-2">
        <Label v-if="label" :for="proxyId">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>

        <!-- shrink-wrap the background -->
        <div
            :id="proxyId"
            class="inline-flex w-fit gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800"
        >
            <button
                v-for="{ value, label, icon } in options"
                :key="value.toString()"
                type="button"
                @click="select(value)"
                :class="[
                    'flex cursor-pointer items-center rounded-md px-3.5 py-1.5 transition-colors',
                    isSelected(value)
                        ? 'text-primary dark:text-primary bg-white shadow-xs dark:bg-neutral-700'
                        : 'hover:text-primary dark:hover:text-primary text-neutral-500 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                ]"
            >
                <component v-if="icon" :is="icon" class="mr-1.5 -ml-1 h-4 w-4" />
                <span class="text-sm">{{ label }}</span>
            </button>
        </div>

        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" class="ms-1 mt-0 text-xs text-gray-500 italic">{{ help }}</span>
    </div>
</template>
