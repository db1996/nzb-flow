<script lang="ts" setup>
import { Label } from '@components/ui/label'
import CardForm from '@renderer/components/form/CardForm.vue'
import { PropType } from 'vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import { RarSettings } from '@main/types/settings/commands/RarSettings'
import CommandDataView from './CommandDataView.vue'
import CommandData from '@main/types/settings/commands/commandData'

defineProps({
    form: {
        type: Object as PropType<RarSettings>,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    commandData: {
        type: Object as PropType<CommandData> | null,
        required: false,
        default: null
    }
})
</script>
<template>
    <CardForm
        title="RAR CLI"
        description="Most NZB clients expect files to be compressed using the RAR format."
        footer_class="justify-end"
    >
        <template #body>
            <CommandDataView v-if="commandData" :commandData="commandData" />
            <SwitchInput
                :disabled="disabled"
                label="Skip RAR Creation"
                help="Default: off <br>Disable RAR compression for creating RAR archives. <br>If disabled, password protection is not available. Par files will be created directly from the source files."
                v-model="form.skipRarCreation"
            />
            <Label class="font-medium text-sm">RAR Command Line Tool</Label>

            <div class="grid gap-2 grid-cols-2 lg:grid-cols-3">
                <TextInput
                    :disabled="disabled || form.skipRarCreation"
                    label="Exclude files"
                    help="Default: empty <br>These files will not be uploaded. <br>Comma separated: Example: *.nfo, *.txt, or hello.txt"
                    class="flex-1"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    v-model="form.excludes"
                />
                <SwitchInput
                    :disabled="disabled || form.skipRarCreation"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    label="Recursion"
                    help="Default: on <br>Recursively add files from subdirectories, maintains subdirectory structure"
                    v-model="form.recursion"
                />
                <SwitchInput
                    :disabled="disabled || form.skipRarCreation"
                    label="Encrypt headers"
                    help="Default: on <br>Encrypt file names and headers in the RAR archive, only done if a password is set"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    v-model="form.encryptHeaders"
                />
                <SwitchInput
                    :disabled="disabled || form.skipRarCreation"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    label="Solid Archive"
                    help="Default: off <br>Create a single solid archive"
                    v-model="form.solidArchive"
                />
                <SwitchInput
                    :disabled="disabled || form.skipRarCreation"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    label="Automatic Volume size"
                    help="Default: off <br>Automatically determine volume size based on file size <br>If both this and 'volume size' are not set, a single archive is created."
                    v-model="form.automaticVolumes"
                />
                <TextInput
                    :disabled="form.automaticVolumes || disabled || form.skipRarCreation"
                    label-height-class="min-h-[2rem]"
                    height-class="min-h-[2.5rem]"
                    label="Volume Size (split archive)"
                    help="Default: empty <br>The size of each volume, end in: b = bytes, k = kilobytes, m = megabytes, M = millions of bytes, g = gigabytes, G = billions of bytes"
                    v-model="form.volumes"
                />
            </div>
        </template>
    </CardForm>
</template>
