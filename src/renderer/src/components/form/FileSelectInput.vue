<script lang="ts" setup>
import Button from '@renderer/components/ui/button/Button.vue'
import { FolderOpen } from 'lucide-vue-next'
import { InputGroup, InputGroupInput } from '@components/ui/input-group'
import Label from '@renderer/components/ui/label/Label.vue'
import { ButtonGroup, ButtonGroupText } from '@components/ui/button-group'

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

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'folder:selected', folder: { path: string; basename: string }): void
}>()

async function selectFolder() {
    const result = await window.api.chooseFolder()

    if (result) {
        emit('update:modelValue', result.path)
        emit('folder:selected', result)
    }
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
                    variant="secondary"
                    @click="selectFolder()"
                >
                    <FolderOpen />
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
