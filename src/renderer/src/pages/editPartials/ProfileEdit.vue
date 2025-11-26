<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import PostingSettings from '../_partials/PostingSettings.vue'
import RarSettings from '../_partials/RarSettings.vue'
import ParSettings from '../_partials/ParSettings.vue'
import NyuuSettings from '../_partials/NyuuSettings.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import SelectInput from '@renderer/components/form/SelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import Card from '@renderer/components/ui/card/Card.vue'
import CardHeader from '@renderer/components/ui/card/CardHeader.vue'
import CardTitle from '@renderer/components/ui/card/CardTitle.vue'
import CardDescription from '@renderer/components/ui/card/CardDescription.vue'
import CardContent from '@renderer/components/ui/card/CardContent.vue'
import { Copy, X } from 'lucide-vue-next'
import { copyToClipboard } from '@renderer/lib/utils'
import { useContentTemplateStore } from '@renderer/composables/useContentTemplateStore'
import { computed } from 'vue'

const props = defineProps({
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const settingsStore = useSettingsStore()
const contentTemplateStore = useContentTemplateStore()
const emits = defineEmits(['close'])

const save = () => {
    if (settingsStore.activeProfileEdit === null) return

    settingsStore.saveProfile(settingsStore.activeProfileEdit)
    emits('close')
}

const switches = computed(() => {
    if (!settingsStore.activeProfileEdit) return {}

    let ret: Record<string, boolean> = {}
    for (const ct of settingsStore.activeProfileEdit.taskSettings.contentTemplates) {
        ret[ct.id] = ct.enabled
    }
    return ret
})

function updateSwitch(contentTemplateId: string, value: boolean) {
    if (!settingsStore.activeProfileEdit) return

    if (settingsStore.activeProfileEdit === null) return

    const template = settingsStore.activeProfileEdit.taskSettings.contentTemplates.find(
        ct => ct.id === contentTemplateId
    )
    if (template) {
        template.enabled = value
    }
}
const copyUtils = copyToClipboard()
</script>

<template>
    <Card v-if="settingsStore.activeProfileEdit">
        <CardHeader>
            <div class="flex gap-2 justify-between">
                <CardTitle>Profile Settings - {{ settingsStore.activeProfileEdit.name }}</CardTitle>
                <div class="flex gap-2 align-items-center">
                    <Button variant="default" @click="save"> Save profile </Button>
                    <Button variant="secondary" @click="emits('close')"> <X /> </Button>
                </div>
            </div>
            <CardDescription>
                ID:
                <code class="mx-1 mt-0 text-xs text-gray-500 italic"
                    >{{ settingsStore.activeProfileEdit.id }}
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
                    @click="copyUtils.copy(settingsStore.activeProfileEdit.id)"
                />
            </CardDescription>
        </CardHeader>
        <CardContent>
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
                            v-for="contentTemplate in contentTemplateStore.contentTemplates"
                            @update:model-value="updateSwitch(contentTemplate.id, $event)"
                            :key="contentTemplate.id"
                            v-model="switches[contentTemplate.id]"
                            :label="contentTemplate.name"
                            help="Enable content templates for this profile"
                            :disabled="disabled"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
</template>
