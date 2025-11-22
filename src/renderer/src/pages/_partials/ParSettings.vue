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
                help="Default: off <br>Disable PAR file creation. If disabled, rar files will be uploaded directly."
                v-model="form.skipParCreation"
            />
            <SwitchInput
                :disabled="disabled || form.skipParCreation"
                label="Automatic redundancy and slices"
                help="Default: on <br>Automatically determine the best PAR2 parameters based on the size of the files being processed. <br>This also uses the nyuu article size to create a multiple of that for the slice size."
                v-model="form.automaticParams"
            />
            <div class="grid gap-2 md:grid-cols-2 grid-cols-1">
                <TextInput
                    :disabled="form.automaticParams || disabled || form.skipParCreation"
                    label="Redundancy"
                    help="Default: 8% <br>The redundancy level for PAR files."
                    v-model="form.redundancy"
                />
                <TextInput
                    :disabled="form.automaticParams || disabled || form.skipParCreation"
                    label="Slices"
                    help="Default: 0.5w*10 (unused) <br>The number of slices for PAR files. <br>You can use expressions like '0.5w*10', or 700k, 5m, 1g."
                    v-model="form.slices"
                />
            </div>

            <div class="grid gap-2 md:grid-cols-2 grid-cols-1">
                <TextInput
                    :disabled="disabled || form.skipParCreation"
                    label="Min Slices"
                    help="The minimum number of slices for PAR files."
                    v-model="form.minSlices"
                />
                <TextInput
                    :disabled="disabled || form.skipParCreation"
                    label="Max Slices"
                    help="The maximum number of slices for PAR files<br> Watch out: parpar's internal limit is 32767 slices."
                    v-model="form.maxSlices"
                />
            </div>
        </template>
    </CardForm>
</template>
