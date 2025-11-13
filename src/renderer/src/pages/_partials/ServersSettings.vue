<script lang="ts" setup>
import { PropType, ref, watch } from 'vue'
import { ServerSettings, ServerSettingsYupSchema } from '@main/types/settings/ServerSettings'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import TableCellHidden from '@renderer/components/table/TableCellHidden.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import Button from '@renderer/components/ui/button/Button.vue'
import { Pencil, Plus, Save, Trash } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog'
import ServerSettingsPage from './ServerSettings.vue'
import CardForm from '@renderer/components/form/CardForm.vue'

const settingsStore = useSettingsStore()

const props = defineProps({
    form: {
        type: Array as PropType<ServerSettings[]>,
        required: true
    }
})

const activeServerSettingIndex = ref<number | null>(null)
const activeServerSettingForm = ref<ServerSettings | null>(null)
const activeServerSettingIsNew = ref<boolean>(false)

watch(activeServerSettingIndex, newIndex => {
    if (newIndex !== null && props.form[newIndex]) {
        activeServerSettingForm.value = JSON.parse(JSON.stringify(props.form[newIndex]))
    } else {
        activeServerSettingForm.value = null
    }
})

const cancelActiveServerSettings = () => {
    activeServerSettingIndex.value = null
    activeServerSettingForm.value = null
    activeServerSettingIsNew.value = false
}

const storeActiveServerSettings = () => {
    console.log(
        'storing active server settings',
        activeServerSettingForm.value,
        activeServerSettingIndex.value,
        activeServerSettingIsNew.value
    )

    if (activeServerSettingForm.value === null) {
        return
    }

    if (activeServerSettingIsNew.value) {
        props.form.push(activeServerSettingForm.value)
    } else {
        if (activeServerSettingIndex.value === null) {
            return
        }
        props.form[activeServerSettingIndex.value] = activeServerSettingForm.value
    }

    cancelActiveServerSettings()
}

const newServerSetting = () => {
    activeServerSettingForm.value = ServerSettingsYupSchema.cast({})
    activeServerSettingIsNew.value = true
    activeServerSettingIndex.value = null
}

const editServerSetting = (index: number) => {
    activeServerSettingIndex.value = index
    activeServerSettingIsNew.value = false
}
</script>
<template>
    <CardForm title="Server Settings" description="Manage your Usenet server settings">
        <template #body>
            <Table :columns="3">
                <template #head>
                    <TableHead>Host</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Connections</TableHead>
                    <TableHead>SSL</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead
                        ># <Button class="w-8" @click="newServerSetting"><Plus /></Button
                    ></TableHead>
                </template>
                <template #body>
                    <TableRow v-for="(server, index) in form" :key="index">
                        <TableCell>{{ server.server }}:{{ server.port }}</TableCell>
                        <TableCell>{{ server.username }}</TableCell>
                        <TableCellHidden :value="server.password" />
                        <TableCell>{{ server.connections }}</TableCell>
                        <TableCell>{{ server.ssl ? 'Enabled' : 'Disabled' }}</TableCell>
                        <TableCell>
                            <SwitchInput
                                v-model="server.isDefault"
                                @update:model-value="settingsStore.setServerDefault(index, $event)"
                            />
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="outline_default"
                                size="xs"
                                class="mr-2"
                                @click="editServerSetting(index)"
                            >
                                <Pencil />
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <Button
                                            variant="outline_destructive"
                                            size="xs"
                                            @click="form.splice(index, 1)"
                                            ><Trash
                                        /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            Remove from the serverlist, is not saved until you save
                                            the settings.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                    </TableRow>
                </template>
            </Table>
        </template>
    </CardForm>

    <Dialog
        :open="activeServerSettingForm !== null"
        class="overflow-auto"
        @update:open="cancelActiveServerSettings"
    >
        <DialogContent
            class="max-h-[80vh] max-w-xxl sm:max-w-xxl overflow-auto flex flex-col"
            v-if="activeServerSettingForm !== null"
        >
            <DialogHeader>
                <div class="flex justify-between mr-8">
                    <DialogTitle>Server details</DialogTitle>
                    <div class="flex gap-4 align-items-center">
                        <Button variant="default" @click="storeActiveServerSettings">
                            Create <Save />
                        </Button>
                    </div>
                </div>
            </DialogHeader>
            <ServerSettingsPage :form="activeServerSettingForm" :use-name="false" />
        </DialogContent>
    </Dialog>
</template>
