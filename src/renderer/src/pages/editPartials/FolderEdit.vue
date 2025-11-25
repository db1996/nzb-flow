<script lang="ts" setup>
import { useSettingsStore } from '@renderer/composables/settingsStore'
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import FileSelectInput from '@renderer/components/form/FileSelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import SelectInput from '@renderer/components/form/SelectInput.vue'
import CardHeader from '@renderer/components/ui/card/CardHeader.vue'
import CardTitle from '@renderer/components/ui/card/CardTitle.vue'
import CardDescription from '@renderer/components/ui/card/CardDescription.vue'
import { Copy, X } from 'lucide-vue-next'
import CardContent from '@renderer/components/ui/card/CardContent.vue'
import { copyToClipboard } from '@renderer/lib/utils'
import Card from '@renderer/components/ui/card/Card.vue'

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
const copyUtils = copyToClipboard()
</script>

<template>
    <Card v-if="settingsStore.activeFolderEdit">
        <CardHeader>
            <div class="flex gap-2 justify-between">
                <CardTitle
                    >Folder monitoring Settings -
                    {{ settingsStore.activeFolderEdit.name }}</CardTitle
                >
                <div class="flex gap-2 align-items-center">
                    <Button variant="default" @click="save"> Save folder </Button>
                    <Button variant="secondary" @click="emits('close')"> <X /> </Button>
                </div>
            </div>
            <CardDescription>
                ID:
                <code class="mx-1 mt-0 text-xs text-gray-500 italic"
                    >{{ settingsStore.activeFolderEdit.id }}
                </code>
                <Copy
                    class="inline cursor-pointer"
                    :class="{
                        'text-green-500':
                            copyUtils.flashCopied.value && copyUtils.copiedSuccess.value,
                        'text-red-500':
                            copyUtils.flashCopied.value && !copyUtils.copiedSuccess.value
                    }"
                    :size="14"
                    @click="copyUtils.copy(settingsStore.activeFolderEdit.id)"
                />
            </CardDescription>
        </CardHeader>
        <CardContent>
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
                class="mb-4"
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
        </CardContent>
    </Card>
</template>
