<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import PostingSettings from '../_partials/PostingSettings.vue'
import RarSettings from '../_partials/RarSettings.vue'
import ParSettings from '../_partials/ParSettings.vue'
import NyuuSettings from '../_partials/NyuuSettings.vue'
import TextareaInput from '@renderer/components/form/TextareaInput.vue'
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { PropType } from 'vue'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'
import CommandData from '@main/types/settings/commands/commandData'
import SelectInput from '@renderer/components/form/SelectInput.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import Button from '@renderer/components/ui/button/Button.vue'
import CopyExplorerInput from '@renderer/components/form/CopyExplorerInput.vue'
import DialogDescription from '@renderer/components/ui/dialog/DialogDescription.vue'
import { Copy, Save } from 'lucide-vue-next'
import { copyToClipboard } from '@renderer/lib/utils'
import { ContentTemplateData } from '@main/types/settings/ContentTemplateData'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'

const settingsStore = useSettingsStore()

const props = defineProps({
    form: {
        type: Object as PropType<TaskConfig>,
        required: true
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emits = defineEmits(['close', 'profile-change'])

function updateModelValue(value: any) {
    props.form.used_profile = value
    emits('profile-change', value)
}

function addFiles() {
    window.api.chooseFiles().then((filePaths: string[]) => {
        if (filePaths.length === 0) {
            return
        }
        props.form.taskSettings.postingSettings.files.push(...filePaths)
    })
}

function addFolders() {
    window.api.chooseFolders().then((folderPaths: string[]) => {
        if (folderPaths.length === 0) {
            return
        }
        props.form.taskSettings.postingSettings.files.push(...folderPaths)
    })
}

const copyUtil = copyToClipboard()

function saveToFile(content: ContentTemplateData) {
    window.api.saveFile(content.fileName, content.content).then(() => {
        // Saved
        console.log('saved')
    })
}
</script>

<template>
    <Dialog :open="form !== null" class="overflow-auto" @update:open="emits('close')">
        <DialogContent
            class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="form !== null"
        >
            <DialogHeader>
                <slot name="header"></slot>
                <DialogDescription
                    >Task ID: {{ form.id }}
                    <Copy
                        @click="copyUtil.copy(form.id)"
                        :class="{
                            'text-green-500':
                                copyUtil.flashCopied.value && copyUtil.copiedSuccess.value
                        }"
                        class="cursor-pointer inline-block"
                        :size="12"
                    />
                </DialogDescription>
            </DialogHeader>
            <SelectInput
                :disabled="disabled"
                v-model="form.used_profile"
                :options="
                    settingsStore.profiles.map(profile => ({
                        label: profile.name,
                        value: profile.id
                    }))
                "
                :disable-clear="true"
                @update:model-value="updateModelValue($event)"
            />
            <Tabs default-value="posting" class="flex flex-col gap-4">
                <TabsList class="grid w-full grid-cols-7 grid-rows-2 h-18">
                    <slot name="tablist-before"></slot>
                    <TabsTrigger value="posting">Posting</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="server">Server</TabsTrigger>
                    <TabsTrigger value="rar">RAR</TabsTrigger>
                    <TabsTrigger value="par">PAR</TabsTrigger>
                    <TabsTrigger value="nyuu">Nyuu</TabsTrigger>
                    <TabsTrigger value="variables">Data</TabsTrigger>
                    <TabsTrigger value="templates">Content templates</TabsTrigger>
                    <slot name="tablist-after"></slot>
                </TabsList>
                <slot name="tabscontent"></slot>
                <TabsContent value="posting">
                    <PostingSettings
                        :task-settings="form"
                        :form="form.taskSettings.postingSettings"
                        :use-name="true"
                        :disabled="disabled"
                    />
                </TabsContent>
                <TabsContent value="files">
                    <div class="grid grid-cols-1 gap-4" v-if="disabled">
                        <CopyExplorerInput
                            v-model="form.nzbFile"
                            :label="`NZB File Path`"
                            :disable-copy-button="disabled"
                            :disable-folder-button="false"
                            :remove-copy-button="true"
                            :path="form.nzbFile"
                            class="w-full"
                        />
                        <CopyExplorerInput
                            v-model="form.rarParFolderPath"
                            :label="`Rar/Par Folder Path`"
                            :disable-copy-button="disabled"
                            :disable-folder-button="false"
                            :remove-copy-button="true"
                            :path="form.rarParFolderPath"
                            class="w-full"
                        />
                        <CopyExplorerInput
                            v-model="form.log_file"
                            :label="`Log File Path`"
                            :disable-copy-button="disabled"
                            :disable-folder-button="false"
                            :remove-copy-button="true"
                            :path="form.log_file"
                            class="w-full"
                        />
                    </div>
                    <div class="grid grid-cols-[1fr_100px] gap-4">
                        <TextareaInput
                            label="Files/folders to upload (one per line)"
                            :model-value="form.taskSettings.postingSettings.files"
                            :rows="10"
                            :help="!disabled ? 'You can drag and drop anywhere to add files' : ''"
                            :disabled="disabled"
                        />
                        <div class="flex flex-col gap-2 justify-start">
                            <Button
                                class="mt-[30px]"
                                variant="default"
                                :disabled="disabled"
                                @click="addFiles()"
                            >
                                Add files
                            </Button>
                            <Button variant="default" :disabled="disabled" @click="addFolders()">
                                Add folders
                            </Button>
                            <Button
                                variant="secondary"
                                :disabled="disabled"
                                @click="form.taskSettings.postingSettings.files = []"
                            >
                                Clear all
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="server">
                    <div class="grid grid-cols-1 gap-4">
                        <SelectInput
                            v-if="settingsStore.settings"
                            label="Server configuration"
                            v-model="form.taskSettings.serverId"
                            :disabled="disabled"
                            :options="
                                settingsStore.settings.servers.map(server => ({
                                    label: server.server,
                                    value: server.id
                                }))
                            "
                            :disable-clear="true"
                        />
                        <!-- <SelectInput
                            v-if="settingsStore.settings"
                            label="Backup server configuration (when primary server fails)"
                            v-model="form.taskSettings.backupServerId"
                            :disabled="disabled"
                            :options="
                                settingsStore.settings.servers.map(server => ({
                                    label: server.server,
                                    value: server.id
                                }))
                            "
                            :disable-clear="true"
                        /> -->
                    </div>
                </TabsContent>
                <TabsContent value="rar">
                    <RarSettings
                        :form="form.taskSettings.rarSettings"
                        :disabled="disabled"
                        :command-data="(disabled ? (form.rarCommandOutput as CommandData | undefined) : undefined)"
                    />
                </TabsContent>
                <TabsContent value="par">
                    <ParSettings
                        :form="form.taskSettings.parSettings"
                        :disabled="disabled"
                        :command-data="(disabled ? (form.parCommandOutput as CommandData | undefined) : undefined)"
                    />
                </TabsContent>
                <TabsContent value="nyuu">
                    <NyuuSettings
                        :form="form.taskSettings.nyuuSettings"
                        :disabled="disabled"
                        :command-data="(disabled ? (form.nyuuCommandOutput as CommandData | undefined) : undefined)"
                    />
                </TabsContent>
                <TabsContent value="variables">
                    <TextareaInput
                        label="Task Variables (JSON Format, these are used in the post templates)"
                        :model-value="JSON.stringify(form.taskVariables, null, 2)"
                        :rows="20"
                        :disabled="true"
                    />
                </TabsContent>
                <TabsContent value="templates">
                    <div class="flex flex-col gap-4" v-if="!disabled">
                        <SwitchInput
                            v-for="contentTemplate in settingsStore.contentTemplates"
                            :key="contentTemplate.id"
                            v-model="form.taskSettings.contentTemplates[contentTemplate.id]"
                            :label="contentTemplate.name"
                            help="Enable content templates for this profile"
                            :disabled="disabled"
                        />
                    </div>
                    <div
                        v-else
                        v-for="contentTemplateData in form.contentTemplateData"
                        :key="contentTemplateData.contentTemplateId"
                        class="mb-4"
                    >
                        <h3 class="text-md font-medium mb-2">
                            {{
                                settingsStore.contentTemplates.find(
                                    ct => ct.id === contentTemplateData.contentTemplateId
                                )?.name || contentTemplateData.contentTemplateId
                            }}
                        </h3>

                        <div class="grid grid-cols-[1fr_200px] gap-4">
                            <TextareaInput
                                :model-value="contentTemplateData.content"
                                :rows="10"
                                :disabled="true"
                            />
                            <div class="flex flex-col gap-2 justify-start">
                                <Button
                                    :variant="
                                        copyUtil.flashCopied.value
                                            ? copyUtil.copiedSuccess.value
                                                ? 'outline_success'
                                                : 'outline_destructive'
                                            : 'secondary'
                                    "
                                    @click="copyUtil.copy(contentTemplateData.content)"
                                >
                                    <Copy /> Copy content
                                </Button>
                                <Button
                                    variant="secondary"
                                    @click="saveToFile(contentTemplateData)"
                                >
                                    <Save /> Save to file
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
</template>
