<script lang="ts" setup>
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import FileSelectInput from '@renderer/components/form/FileSelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import Tabs from '@renderer/components/ui/tabs/Tabs.vue'
import TabsList from '@renderer/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@renderer/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '@renderer/components/ui/tabs/TabsContent.vue'
import CodeMirrorComponent from '@renderer/components/codemirror/CodeMirrorComponent.vue'
import { ref } from 'vue'
import { CODEMIRROR_VARIABLES } from '@main/types/settings/commands/TaskVariables'

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
    if (settingsStore.activeContentTemplateEdit === null) return

    settingsStore.saveContentTemplate(settingsStore.activeContentTemplateEdit)
    emits('close')
}

const variables = ref(CODEMIRROR_VARIABLES)
</script>

<template>
    <Dialog
        :open="settingsStore.activeContentTemplateEdit !== null"
        class="overflow-auto"
        @update:open="emits('close')"
    >
        <DialogContent
            class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="settingsStore.activeContentTemplateEdit !== null"
        >
            <DialogHeader>
                <div class="flex justify-between mr-8">
                    <DialogTitle>Content template settings</DialogTitle>
                    <div class="flex gap-4 align-items-center">
                        <Button variant="default" @click="save"> Save content template </Button>
                    </div>
                </div>
            </DialogHeader>
            <Tabs default-value="general" class="flex flex-col gap-4">
                <TabsList class="grid w-full grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="file">File and Contents</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <TextInput
                        v-model="settingsStore.activeContentTemplateEdit.name"
                        label="Content template name (UI)"
                        :disabled="disabled"
                        class="mb-4"
                    />

                    <hr />

                    <h3 class="text-md font-medium mb-2 mt-4">Where to save</h3>

                    <div class="grid grid-cols-2">
                        <SwitchInput
                            :disabled="disabled"
                            label="Save with NZB file after posting"
                            v-model="settingsStore.activeContentTemplateEdit.saveWithNzb"
                        />

                        <SwitchInput
                            :disabled="disabled"
                            label="Include in the post archive"
                            help="Include the generated file in the post archive uploaded to the news server. Some variables can not be used when this is enabled."
                            v-model="settingsStore.activeContentTemplateEdit.includeInPost"
                        />
                    </div>

                    <FileSelectInput
                        v-model="settingsStore.activeContentTemplateEdit.customLocation"
                        label="Custom save location"
                        help="Keep empty to not use it"
                        :disabled="disabled"
                        class="mb-4"
                    />
                </TabsContent>

                <TabsContent value="file">
                    <div class="grid grid-cols-2 gap-2">
                        <TextInput
                            v-model="settingsStore.activeContentTemplateEdit.fileName"
                            label="File name"
                            :disabled="disabled"
                            class="mb-4"
                            help="{fname} is the name of the nzb, rar files, par files and post name if you do not obfuscate"
                        />

                        <TextInput
                            v-model="settingsStore.activeContentTemplateEdit.fileType"
                            label="File extension"
                            :disabled="disabled"
                            placeholder=".txt, .nfo, .json"
                            class="mb-4"
                        />
                    </div>
                    <CodeMirrorComponent
                        v-model="settingsStore.activeContentTemplateEdit.templateContent"
                        :variables="variables"
                        :disabled="disabled"
                        :show-language="false"
                    />
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
</template>
