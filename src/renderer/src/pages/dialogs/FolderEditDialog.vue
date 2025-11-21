<script lang="ts" setup>
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import FileSelectInput from '@renderer/components/form/FileSelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import SelectInput from '@renderer/components/form/SelectInput.vue'

const props = defineProps({
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const settingsStore = useSettingsStore()
const emits = defineEmits(['close'])

const save = () => {
    if (settingsStore.activeFolderEdit === null) return

    settingsStore.saveFolder(settingsStore.activeFolderEdit)
    emits('close')
}

const updatedFolder = (data: { path: string; basename: string }) => {
    if (settingsStore.activeFolderEdit === null) return

    if (
        settingsStore.activeFolderEdit.name === '' ||
        settingsStore.activeFolderEdit.name === data.basename
    ) {
        settingsStore.activeFolderEdit.name = data.basename
    }

    console.log('opened folder:', data)
}
</script>

<template>
    <Dialog
        :open="settingsStore.activeFolderEdit !== null"
        class="overflow-auto"
        @update:open="emits('close')"
    >
        <DialogContent
            class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="settingsStore.activeFolderEdit !== null"
        >
            <DialogHeader>
                <div class="flex justify-between mr-8">
                    <DialogTitle>Folder settings</DialogTitle>
                    <div class="flex gap-4 align-items-center">
                        <Button variant="default" @click="save"> Save folder </Button>
                    </div>
                </div>
            </DialogHeader>

            <FileSelectInput
                v-model="settingsStore.activeFolderEdit.fullPath"
                label="Watched folder path"
                :disabled="disabled"
                @folder:selected="updatedFolder"
                class="mb-4"
            />

            <SelectInput
                label="Upload profile"
                v-model="settingsStore.activeFolderEdit.profileId"
                :disabled="disabled"
                :options="
                    settingsStore.profiles.map(profile => ({
                        label: profile.name,
                        value: profile.id
                    }))
                "
                :disable-clear="true"
            />
            <TextInput
                v-model="settingsStore.activeFolderEdit.name"
                label="Folder name (UI)"
                :disabled="disabled"
                class="mb-4"
            />

            <div class="grid grid-cols-2 gap-4">
                <SwitchInput
                    :disabled="disabled"
                    label="Active"
                    v-model="settingsStore.activeFolderEdit.active"
                />
                <SwitchInput
                    :disabled="disabled"
                    label="Auto approve"
                    v-model="settingsStore.activeFolderEdit.autoApprove"
                    help="Instead of placing a job in the approval list, automatically approve it for posting"
                />
                <SwitchInput
                    :disabled="disabled"
                    label="Upload subfolders of the watched folder"
                    v-model="settingsStore.activeFolderEdit.uploadFolder"
                    help="Any folder directly placed in the watched folder will be uploaded as separate jobs."
                />

                <SwitchInput
                    :disabled="disabled"
                    label="Upload files directly"
                    v-model="settingsStore.activeFolderEdit.uploadFiles"
                    help="Each individual file placed in the watched folder will be uploaded as separate jobs. Folders are ignored if the other option is disabled."
                />

                <TextInput
                    v-model="settingsStore.activeFolderEdit.ignorePrefixes"
                    label="Ignore folder/file prefixes"
                    :disabled="disabled"
                    help="Comma separated list of prefixes to ignore when scanning the folder, both files and folders are checked. Example: temp_, .partial"
                />

                <TextInput
                    v-model="settingsStore.activeFolderEdit.ignoreFileExtensions"
                    label="Ignore file extensions"
                    :disabled="disabled || !settingsStore.activeFolderEdit.uploadFiles"
                    help="Comma separated list of file extensions to ignore when scanning the folder, only files are checked. Example: .tmp, .bak"
                />

                <SwitchInput
                    :disabled="disabled"
                    label="Delete uploaded files"
                    v-model="settingsStore.activeFolderEdit.deleteUploadedFiles"
                    help="Delete files from the watched folder after they have been uploaded."
                />
            </div>
        </DialogContent>
    </Dialog>
</template>
