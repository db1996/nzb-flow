<script lang="ts" setup>
import { computed } from 'vue';
import TableCell from '../ui/table/TableCell.vue';
import { FolderOpen } from 'lucide-vue-next';
import TableButton from './TableButton.vue';
interface Props {
    full_path: string;
}

const props = withDefaults(defineProps<Props>(), {
    full_path: '',
});


const fileName = computed(() => {
    return props.full_path.split(/[\\/]/).pop() || '';
});

const openFile = () => {
    window.api.openFileInExplorer(props.full_path)
}
</script>
<template>
    <TableCell class="pl-0">
        <div class="flex items-center">
            <TableButton @click="openFile()">
                <FolderOpen />
            </TableButton>
            {{ fileName }}
        </div>
    </TableCell>
</template>
