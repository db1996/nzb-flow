<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import { Button } from '@components/ui/button'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import { FolderSettings } from '@main/types/settings/FolderSettings'
import FolderEditDialog from './dialogs/FolderEditDialog.vue'
import { Plus } from 'lucide-vue-next'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import TooltipProvider from '@renderer/components/ui/tooltip/TooltipProvider.vue'
import Tooltip from '@renderer/components/ui/tooltip/Tooltip.vue'
import TooltipTrigger from '@renderer/components/ui/tooltip/TooltipTrigger.vue'
import TooltipContent from '@renderer/components/ui/tooltip/TooltipContent.vue'

const settingsStore = useSettingsStore()

const setEditFolder = (profile: FolderSettings) => {
    settingsStore.activeFolderEdit = JSON.parse(JSON.stringify(profile))
}

const setActiveFolder = (folder: FolderSettings, active: boolean) => {
    folder.active = active
    settingsStore.saveFolder(folder)
}
</script>

<template>
    <AppLayout>
        <FolderEditDialog @close="settingsStore.activeFolderEdit = null" />

        <Card>
            <CardHeader>
                <CardTitle>Folders to monitor</CardTitle>
            </CardHeader>
            <CardContent>
                <Table :columns="4">
                    <template #head>
                        <TableHead>Name</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead class="w-[270px]"
                            >#
                            <Button class="w-8" @click="settingsStore.newFolder">
                                <Plus /> </Button
                        ></TableHead>
                    </template>
                    <template #body>
                        <TableRow v-for="(folder, index) in settingsStore.folders" :key="index">
                            <TableCell>{{ folder.name }}</TableCell>
                            <TableCell>{{ folder.fullPath }}</TableCell>
                            <TableCell>
                                <SwitchInput
                                    v-model="folder.active"
                                    @update:model-value="setActiveFolder(folder, $event)"
                                />
                            </TableCell>
                            <TableCell>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <Button
                                                size="sm"
                                                @click="settingsStore.scanFolder(folder.id)"
                                                class="me-2"
                                            >
                                                Scan folder
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                This will scan any existing files/folders and place
                                                them in the approval list (or queue depending on
                                                settings)
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Button size="sm" @click="setEditFolder(folder)" class="me-2"
                                    >Edit</Button
                                >
                                <Button
                                    size="sm"
                                    @click="settingsStore.deleteFolder(folder.id)"
                                    variant="outline_destructive"
                                    class="me-2"
                                    >Delete</Button
                                >
                            </TableCell>
                        </TableRow>
                    </template>
                </Table>
            </CardContent>
        </Card>
    </AppLayout>
</template>
