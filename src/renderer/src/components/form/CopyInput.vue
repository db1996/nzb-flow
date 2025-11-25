<script lang="ts" setup>
import Button from '@renderer/components/ui/button/Button.vue'
import { Copy } from 'lucide-vue-next'
import { InputGroup, InputGroupInput } from '@components/ui/input-group'
import Label from '@renderer/components/ui/label/Label.vue'
import { ButtonGroup, ButtonGroupText } from '@components/ui/button-group'
import { computed } from 'vue'
import { copyToClipboard } from '@renderer/lib/utils'

const props = defineProps({
    modelValue: {
        type: String,
        required: false
    },
    label: {
        type: String,
        required: false
    },
    disableCopyButton: {
        type: Boolean,
        required: false,
        default: false
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    help: {
        type: String,
        required: false
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
    },
    value: {
        type: String,
        required: false
    }
})

const proxyValue = computed(() => {
    if (props.value !== undefined) {
        return props.value
    } else {
        if (props.modelValue === undefined) {
            return ''
        }
        return props.modelValue
    }
})

const copyUtils = copyToClipboard()
</script>
<template>
    <div class="grid w-full grid-cols-1 gap-2 items-start">
        <Label v-if="label" :class="labelHeightClass">{{ label }}</Label>
        <ButtonGroup class="!gap-0 w-full" :class="heightClass">
            <ButtonGroupText as-child>
                <Button
                    :disabled="disableCopyButton"
                    size="lg"
                    :variant="
                        copyUtils.flashCopied.value
                            ? copyUtils.copiedSuccess.value
                                ? 'outline_success'
                                : 'outline_destructive'
                            : 'secondary'
                    "
                    @click="copyUtils.copy(proxyValue)"
                >
                    <Copy />
                </Button>
            </ButtonGroupText>
            <InputGroup>
                <InputGroupInput
                    :model-value="proxyValue"
                    @update:modelValue="$emit('update:modelValue', $event)"
                    :disabled="disabled"
                />
            </InputGroup>
            <ButtonGroupText as-child v-if="$slots.append">
                <slot name="append"></slot>
            </ButtonGroupText>
        </ButtonGroup>
        <span class="ms-1 mt-0 text-xs text-gray-500 italic" :class="helpClass">{{ help }}</span>
    </div>
</template>
