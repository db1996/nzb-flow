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
</script>

<template>
    <Dialog :open="form !== null" class="overflow-auto" @update:open="emits('close')">
        <DialogContent
            class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="form !== null"
        >
            <DialogHeader>
                <slot name="header"></slot>
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
                <TabsList class="grid w-full grid-cols-6">
                    <slot name="tablist-before"></slot>
                    <TabsTrigger value="posting"> Posting </TabsTrigger>
                    <TabsTrigger value="files"> Files </TabsTrigger>
                    <TabsTrigger value="server"> Server </TabsTrigger>
                    <TabsTrigger value="rar"> RAR </TabsTrigger>
                    <TabsTrigger value="par"> PAR </TabsTrigger>
                    <TabsTrigger value="nyuu"> Nyuu </TabsTrigger>
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
            </Tabs>
        </DialogContent>
    </Dialog>
</template>
