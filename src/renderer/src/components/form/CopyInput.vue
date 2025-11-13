<script lang="ts" setup>
import Button from '@renderer/components/ui/button/Button.vue'
import { Copy } from 'lucide-vue-next'
import { InputGroup, InputGroupInput } from '@components/ui/input-group'
import Label from '@renderer/components/ui/label/Label.vue'
import { ButtonGroup, ButtonGroupText } from '@components/ui/button-group'
import { ref } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        required: true
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
    }
})

const flashCopied = ref(false)
const copiedSuccess = ref(false)

async function copyToClipboard(str: string) {
    const res = await window.api.copy(str)
    if (res) {
        copiedSuccess.value = true
    } else {
        copiedSuccess.value = false
    }
    flashCopied.value = true
    setTimeout(() => {
        flashCopied.value = false
    }, 1500)
}
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
                        flashCopied
                            ? copiedSuccess
                                ? 'outline_success'
                                : 'outline_destructive'
                            : 'secondary'
                    "
                    @click="copyToClipboard(modelValue)"
                >
                    <Copy />
                </Button>
            </ButtonGroupText>
            <InputGroup>
                <InputGroupInput
                    :model-value="modelValue"
                    @update:modelValue="$emit('update:modelValue', $event)"
                    :disabled="disabled"
                />
            </InputGroup>
        </ButtonGroup>
        <span class="ms-1 mt-0 text-xs text-gray-500 italic" :class="helpClass">{{ help }}</span>
    </div>
</template>
