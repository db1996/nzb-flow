<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Eye, EyeClosed } from 'lucide-vue-next';
import TableCellCopy from './TableCellCopy.vue';
import TableButton from './TableButton.vue';

interface Props {
    value: string;
    copy?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    copy: true
});

const isHidden = ref(true);

const proxyValue = computed(() => {
    if(isHidden.value){
      return '••••••••'
    }
    return props.value

})

</script>
<template>
    <TableCellCopy v-if="props.copy" :value="props.value">
        <span>{{ proxyValue }}</span>
        <TableButton @click="isHidden = !isHidden">
            <Eye :size="12" v-if="isHidden"/>
            <EyeClosed :size="12" v-if="!isHidden"/>
        </TableButton>
    </TableCellCopy>
</template>
