<script lang="ts" setup>
import { PropType } from 'vue'
import CommandData from '@main/types/settings/commands/commandData'
import TextInput from '@renderer/components/form/TextInput.vue'
import TextareaInput from '@renderer/components/form/TextareaInput.vue'

defineProps({
    commandData: {
        type: Object as PropType<CommandData>,
        required: true
    }
})
</script>
<template>
    <TextInput
        label="Executed Command"
        help="The output shell command after variable replacement"
        :model-value="commandData.executedCommand"
    />

    <TextareaInput
        label="Command Output"
        help="The output from the command execution"
        :model-value="commandData.output"
        :rows="6"
    />
</template>
