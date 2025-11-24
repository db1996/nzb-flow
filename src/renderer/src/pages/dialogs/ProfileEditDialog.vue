<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import PostingSettings from '../_partials/PostingSettings.vue'
import RarSettings from '../_partials/RarSettings.vue'
import ParSettings from '../_partials/ParSettings.vue'
import NyuuSettings from '../_partials/NyuuSettings.vue'
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import SelectInput from '@renderer/components/form/SelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'

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
    if (settingsStore.activeProfileEdit === null) return

    settingsStore.saveProfile(settingsStore.activeProfileEdit)
    emits('close')
}
</script>

<template>
    <Dialog
        :open="settingsStore.activeProfileEdit !== null"
        class="overflow-auto"
        @update:open="emits('close')"
    >
        <DialogContent
            class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="settingsStore.activeProfileEdit !== null"
        >
            <DialogHeader>
                <div class="flex justify-between mr-8">
                    <DialogTitle>Profile settings</DialogTitle>
                    <div class="flex gap-4 align-items-center">
                        <Button variant="default" @click="save"> Save profile </Button>
                    </div>
                </div>
            </DialogHeader>
            <TextInput
                v-model="settingsStore.activeProfileEdit.name"
                label="Profile name"
                :disabled="disabled"
                class="mb-4"
            />
            <Tabs default-value="posting" class="flex flex-col gap-4">
                <TabsList class="grid w-full grid-cols-6">
                    <slot name="tablist-before"></slot>
                    <TabsTrigger value="posting"> Posting </TabsTrigger>
                    <TabsTrigger value="server"> Server </TabsTrigger>
                    <TabsTrigger value="rar"> RAR </TabsTrigger>
                    <TabsTrigger value="par"> PAR </TabsTrigger>
                    <TabsTrigger value="nyuu"> Nyuu </TabsTrigger>
                    <TabsTrigger value="content-templates"> Content Templates </TabsTrigger>
                    <slot name="tablist-after"></slot>
                </TabsList>
                <slot name="tabscontent"></slot>
                <TabsContent value="posting">
                    <PostingSettings
                        :form="settingsStore.activeProfileEdit.taskSettings.postingSettings"
                        :use-name="false"
                        :disabled="disabled"
                    />
                </TabsContent>
                <TabsContent value="server">
                    <div class="grid grid-cols-1 gap-4">
                        <SelectInput
                            v-if="settingsStore.settings"
                            label="Server configuration"
                            v-model="settingsStore.activeProfileEdit.taskSettings.serverId"
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
                            v-model="settingsStore.activeProfileEdit.taskSettings.backupServerId"
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
                        :form="settingsStore.activeProfileEdit.taskSettings.rarSettings"
                        :disabled="disabled"
                    />
                </TabsContent>
                <TabsContent value="par">
                    <ParSettings
                        :form="settingsStore.activeProfileEdit.taskSettings.parSettings"
                        :disabled="disabled"
                    />
                </TabsContent>
                <TabsContent value="nyuu">
                    <NyuuSettings
                        :form="settingsStore.activeProfileEdit.taskSettings.nyuuSettings"
                        :disabled="disabled"
                    />
                </TabsContent>
                <TabsContent value="content-templates">
                    <div class="flex flex-col gap-4">
                        <SwitchInput
                            v-for="contentTemplate in settingsStore.contentTemplates"
                            :key="contentTemplate.id"
                            v-model="
                                settingsStore.activeProfileEdit.taskSettings.contentTemplates[
                                    contentTemplate.id
                                ]
                            "
                            :label="contentTemplate.name"
                            help="Enable content templates for this profile"
                            :disabled="disabled"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
</template>
