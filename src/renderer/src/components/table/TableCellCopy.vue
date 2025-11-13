<script lang="ts" setup>
import { computed, ref } from 'vue';
import TableCell from '../ui/table/TableCell.vue';
import { Copy } from 'lucide-vue-next';
import TableButton from './TableButton.vue';

interface Props {
    value: string;
}
const props = withDefaults(defineProps<Props>(), {
    value: '',
});

const flashCopied = ref(false)
const copiedSuccess = ref(false)

async function copyToClipboard() {
    const str = props.value.toString() || ''
    const res = await window.api.copy(str)
    if(res){
        copiedSuccess.value = true
    }else{
        copiedSuccess.value = false
    }
    flashCopied.value = true
    setTimeout(() => {
        flashCopied.value = false
    }, 1500);
}

const textClass = computed(() => {
    if(flashCopied.value && copiedSuccess.value){
        return 'text-green-600 border-green-600 border-1'
    }else if(flashCopied.value && !copiedSuccess.value){
        return 'text-red-600 border-red-600 border-1 '
    }
    return ''
})
</script>
<template>
    <TableCell class="pl-0">
        <div class="flex items-center">
            <TableButton @click="copyToClipboard()" :class="textClass">
              <Copy />
            </TableButton>
            <slot></slot>
        </div>
    </TableCell>
</template>
