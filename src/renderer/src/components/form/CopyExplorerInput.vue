<script lang="ts" setup>
import Button from '@renderer/components/ui/button/Button.vue'
import { Copy, FolderOpen } from 'lucide-vue-next'
import { InputGroup, InputGroupInput } from '@components/ui/input-group'
import Label from '@renderer/components/ui/label/Label.vue'
import { ButtonGroup, ButtonGroupText } from '@components/ui/button-group'
import { ref } from 'vue'

const props = defineProps({
    path: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: false
    },
    disableFolderButton: {
        type: Boolean,
        required: false,
        default: false
    },
    disableCopyButton: {
        type: Boolean,
        required: false,
        default: false
  },
    removeCopyButton: {
        type: Boolean,
        required: false,
        default: false
    }
})

const openFile = (path: string) => {
    window.api.openFileInExplorer(path)
}

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
    <div class="grid w-full grid-cols-1 gap-2">
        <Label v-if="label">{{ label }}</Label>
        <ButtonGroup class="!gap-0 w-full">
            <ButtonGroupText as-child v-if="!removeCopyButton">
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
                    @click="copyToClipboard(path)"
                >
                    <Copy />
                </Button>
            </ButtonGroupText>
            <InputGroup>
                <InputGroupInput :model-value="path" disabled />
            </InputGroup>
            <ButtonGroupText>
                <Button variant="secondary" @click="openFile(path)" :disabled="disableFolderButton">
                    <FolderOpen />
                </Button>
            </ButtonGroupText>
        </ButtonGroup>
    </div>
</template>
