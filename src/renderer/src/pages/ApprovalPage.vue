<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import TableCellHidden from '@renderer/components/table/TableCellHidden.vue'
import { CheckCheck, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '@components/ui/button'
import { onMounted } from 'vue'
import { timestampToLocale } from '@renderer/lib/utils'
import CardDescription from '@renderer/components/ui/card/CardDescription.vue'
import Checkbox from '@renderer/components/ui/checkbox/Checkbox.vue'
import { ref } from 'vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import UploadEditApprovalDialog from './dialogs/UploadEditApprovalDialog.vue'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'
import { useSettingsStore } from '@renderer/composables/settingsStore'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
    tasksStore.loadApprovalTasks()
})

const selectedTasks = ref<string[]>([])
const selectAll = ref(false)

function toggleSelectAll() {
    if (selectAll.value) {
        selectedTasks.value = tasksStore.approvalTasks.map(task => task.id)
    } else {
        selectedTasks.value = []
    }
}

function handleChange(taskId: string, isChecked: boolean) {
    if (isChecked) {
        if (!selectedTasks.value.includes(taskId)) {
            selectedTasks.value.push(taskId)
        }
    } else {
        selectedTasks.value = selectedTasks.value.filter(id => id !== taskId)
    }

    selectAll.value = selectedTasks.value.length === tasksStore.approvalTasks.length
}

function getProfileName(task: TaskConfig): string {
    if (task.used_profile) {
        const profile = settingsStore.profiles.find(p => p.id === task.used_profile)
        if (profile) {
            return profile.name
        }
    }
    return '-'
}

function getAddedBy(task: TaskConfig): string {
    if (task.folderWatchId) {
        const folder = settingsStore.folders.find(u => u.id === task.folderWatchId)
        if (folder) {
            return `Folder: ${folder.name}`
        }
    }
    return '-'
}
</script>

<template>
    <AppLayout>
        <UploadEditApprovalDialog />

        <TooltipProvider>
            <Card v-if="tasksStore.activeTaskApprovalSettings == null">
                <CardHeader>
                    <CardTitle>Approve uploads</CardTitle>
                    <CardDescription>
                        Uploads scanned by folders or batch add that are pending your approval will
                        appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button
                                class="mr-1 text-green-600 hover:text-green-600"
                                size="sm"
                                :variant="
                                    selectedTasks.length === 0 ? 'outline' : 'outline_success'
                                "
                                @click="tasksStore.queueMultipleApprovalTasks(selectedTasks)"
                            >
                                <CheckCheck />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Queue selected uploads</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button
                                class="mr-1 text-red-600 hover:text-red-600"
                                size="sm"
                                :variant="
                                    selectedTasks.length === 0 ? 'outline' : 'outline_destructive'
                                "
                                @click="tasksStore.removeMultipleApprovalTasks(selectedTasks)"
                            >
                                <Trash2 />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                Delete selected queued uploads (may come back later if you don't
                                delete the files)
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    <div class="mt-2"></div>
                    <Table :columns="4">
                        <template #head>
                            <TableHead class="w-[90px]">
                                <Checkbox
                                    v-model="selectAll"
                                    @update:modelValue="toggleSelectAll"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead>Profile</TableHead>
                            <TableHead>Added by</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead class="w-[140px] min-w-[140px]">Actions</TableHead>
                        </template>
                        <template #body>
                            <TableRow
                                v-for="(task, index) in tasksStore.approvalTasks"
                                :key="index"
                            >
                                <TableCell>
                                    <Checkbox
                                        :model-value="selectedTasks.includes(task.id)"
                                        :value="task.id"
                                        @update:model-value="
                                            handleChange(task.id, $event as boolean)
                                        "
                                    />
                                </TableCell>
                                <TableCell>{{ task.name }}</TableCell>
                                <TableCellHidden :value="task.password" />
                                <TableCell>{{ getProfileName(task) }}</TableCell>
                                <TableCell>{{ getAddedBy(task) }}</TableCell>
                                <TableCell>
                                    {{ timestampToLocale(task.created_at || 0) }}
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <Button
                                                class="mr-1"
                                                size="sm"
                                                variant="outline"
                                                @click="
                                                    tasksStore.activeTaskApprovalSettings = task
                                                "
                                            >
                                                <Pencil />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit settings</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <Button
                                                class="mr-1"
                                                size="sm"
                                                variant="outline_success"
                                                @click="tasksStore.queueApprovalTask(task.id)"
                                            >
                                                <CheckCheck />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Queue upload</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <Button
                                                size="sm"
                                                variant="outline_destructive"
                                                @click="tasksStore.removeApprovalTask(task.id)"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Delete queued job (may come back later if you don't
                                                delete the files)
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </template>
                    </Table>
                </CardContent>
            </Card>
        </TooltipProvider>
    </AppLayout>
</template>
