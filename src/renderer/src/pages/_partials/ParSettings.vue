<script lang="ts" setup>
import CardForm from '@renderer/components/form/CardForm.vue'
import { PropType } from 'vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import { ParSettings } from '@main/types/settings/commands/ParSettings'
import CommandData from '@main/types/settings/commands/commandData'
import CommandDataView from './CommandDataView.vue'

defineProps({
    form: {
        type: Object as PropType<ParSettings>,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    commandData: {
        type: Object as PropType<CommandData>,
        required: false
    }
})
</script>
<template>
    <CardForm
        title="Parpar CLI"
        description="This program needs to use the Parpar archive format. For that it has to have access to the rar CLI "
        footer_class="justify-end"
    >
        <template #body>
            <CommandDataView v-if="commandData" :commandData="commandData" />
            <SwitchInput
                :disabled="disabled"
                label="Skip PAR Creation"
                help="Disable PAR file creation. If disabled, rar files will be uploaded directly. Default: off"
                v-model="form.skipParCreation"
            />

            <div class="grid gap-2 md:grid-cols-2 grid-cols-1">
                <SwitchInput
                    :disabled="disabled || form.skipParCreation"
                    label="Automatic redundancy"
                    description="Automatically determine redundancy level for PAR files. Based on file size"
                    v-model="form.automaticRedundancy"
                />
                <TextInput
                    :disabled="form.automaticRedundancy || disabled || form.skipParCreation"
                    label="Redundancy"
                    description="The redundancy level for PAR files."
                    v-model="form.redundancy"
                />
            </div>

            <div class="grid gap-2 md:grid-cols-2 grid-cols-1">
                <SwitchInput
                    :disabled="disabled || form.skipParCreation"
                    label="Automatic slices"
                    description="Automatically determine number of slices for PAR files. Based on file size"
                    v-model="form.automaticSlices"
                />
                <TextInput
                    :disabled="form.automaticSlices || disabled || form.skipParCreation"
                    label="Slices"
                    description="The number of slices for PAR files."
                    v-model="form.slices"
                />
            </div>
        </template>
    </CardForm>
</template>
