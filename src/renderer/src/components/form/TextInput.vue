<script lang="ts" setup>
import { LoaderCircle } from 'lucide-vue-next'
import { computed, ref, useId, watch } from 'vue'
import Icon from '../Icon.vue'
import Input from '../ui/input/Input.vue'
import Label from '../ui/label/Label.vue'

const props = defineProps({
    modelValue: {
        type: [String, Number, Array<string>]
    },
    label: {
        type: String,
        required: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    type: {
        type: String as () => 'text' | 'email' | 'password' | 'number' | 'tel' | 'search',
        default: 'text'
    },
    icon: {
        type: String,
        required: false
    },
    iconPosition: {
        type: String,
        default: 'start',
        validator: (value: string) => ['start', 'end'].includes(value)
    },
    placeholder: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    help: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    heightClass: {
        type: String,
        default: ''
    },
    labelHeightClass: {
        type: String,
        default: ''
    },
    helpClass: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const proxyId = useId()

const input = ref<HTMLInputElement | null>(null)

const proxyValue = computed(() => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.join(', ')
    }
    return props.modelValue
})

watch(
    () => props.error,
    error => {
        if (error && input.value) {
            input.value.focus()
        }
    },
    { immediate: true }
)

defineExpose({
    focus: () => input.value?.focus()
})

function updateValue(string) {
    if (Array.isArray(props.modelValue)) {
        const value = string.split(',').map(v => v.trim())

        emit('update:modelValue', value)
        return
    }
    emit('update:modelValue', string)
}
</script>

<template>
    <div class="relative flex flex-col gap-2">
        <Label v-if="label" :for="proxyId" :class="labelHeightClass">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>
        <div class="relative" :class="heightClass">
            <Input
                ref="input"
                :id="proxyId"
                v-bind:model-value="proxyValue"
                :type="type"
                :disabled="disabled"
                :placeholder="placeholder"
                @update:model-value="updateValue($event)"
                :class="[
                    'mt-1 block w-full',
                    { 'border-red-600': error },
                    { 'pl-9': iconPosition === 'start' && icon },
                    { 'pr-9': iconPosition === 'end' && icon },
                    { 'pr-9': loading }
                ]"
            />
            <span
                v-if="loading"
                class="absolute inset-y-0 end-0 flex items-center justify-center px-3 pt-1"
            >
                <LoaderCircle class="text-muted-foreground size-4 animate-spin" />
            </span>
            <span
                v-if="iconPosition === 'start' && icon"
                class="absolute inset-y-0 start-0 flex items-center justify-center px-3 pt-1"
            >
                <Icon :name="icon" class="text-muted-foreground size-4" />
            </span>
            <span
                v-if="iconPosition === 'end' && icon"
                class="absolute inset-y-0 end-0 flex items-center justify-center px-3 pt-1"
            >
                <Icon :name="icon" class="text-muted-foreground size-4" />
            </span>
        </div>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" class="ms-1 mt-0 text-xs text-gray-500 italic" :class="helpClass">{{
            help
        }}</span>
    </div>
</template>
