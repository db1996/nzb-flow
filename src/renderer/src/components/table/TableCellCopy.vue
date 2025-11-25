<script lang="ts" setup>
import { computed } from 'vue'
import TableCell from '../ui/table/TableCell.vue'
import { Copy } from 'lucide-vue-next'
import TableButton from './TableButton.vue'
import { copyToClipboard } from '@renderer/lib/utils'

interface Props {
    value: string
}
const props = withDefaults(defineProps<Props>(), {
    value: ''
})

const copyUtils = copyToClipboard()

const textClass = computed(() => {
    if (copyUtils.flashCopied.value && copyUtils.copiedSuccess.value) {
        return 'text-green-600'
    } else if (copyUtils.flashCopied.value && !copyUtils.copiedSuccess.value) {
        return 'text-red-600'
    }
    return ''
})
</script>
<template>
    <TableCell class="pl-0">
        <div class="flex items-center">
            <TableButton @click="copyUtils.copy(props.value)" :class="textClass">
                <Copy />
            </TableButton>
            <slot></slot>
        </div>
    </TableCell>
</template>
