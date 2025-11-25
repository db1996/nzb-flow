<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import TableCellHidden from '@renderer/components/table/TableCellHidden.vue'
import { CheckCircle, Logs, OctagonX, Trash2 } from 'lucide-vue-next'
import { Button } from '@components/ui/button'
import { computed, onMounted, ref } from 'vue'
import TaskSettingsLogDialog from './dialogs/TaskSettingsLogDialog.vue'
import TableCellOpenFile from '@renderer/components/table/TableCellOpenFile.vue'
import { timestampToLocale } from '@renderer/lib/utils'
import Checkbox from '@renderer/components/ui/checkbox/Checkbox.vue'
import { CommandStep } from '@main/enums/CommandStep'

const tasksStore = useTasksStore()

onMounted(async () => {
    tasksStore.loadHistoryTasks()
})

const selectedTasks = ref<string[]>([])
const selectAll = computed({
    get: () => {
        return (
            selectedTasks.value.length === tasksStore.historyTasks.length &&
            tasksStore.historyTasks.length > 0
        )
    },
    set: (value: boolean) => {
        if (value) {
            selectedTasks.value = tasksStore.historyTasks.map(task => task.id)
        } else {
            selectedTasks.value = []
        }
    }
})

function toggleSelectAll() {
    if (selectAll.value) {
        selectedTasks.value = tasksStore.historyTasks.map(task => task.id)
        selectAll.value = true
    } else {
        selectedTasks.value = []
        selectAll.value = false
    }
}

function handleChange(taskId: string, isChecked: boolean) {
    console.log('handleChange', taskId, isChecked)

    if (isChecked) {
        selectedTasks.value.push(taskId)
    } else {
        selectedTasks.value = selectedTasks.value.filter(id => id !== taskId)
    }
}
</script>

<template>
    <AppLayout>
        <TaskSettingsLogDialog />

        <Card v-if="tasksStore.activeTaskLog === null">
            <CardHeader>
                <CardTitle>Upload history</CardTitle>
            </CardHeader>
            <CardContent>
                <Button
                    class="mr-1 text-red-600 hover:text-red-600"
                    size="sm"
                    :variant="selectedTasks.length === 0 ? 'outline' : 'outline_destructive'"
                    @click="tasksStore.deleteHistoryTasks(selectedTasks)"
                >
                    <Trash2 />
                </Button>
                <Table :columns="4">
                    <template #head>
                        <TableHead class="w-[90px]">
                            <Checkbox v-model="selectAll" @update:modelValue="toggleSelectAll" />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>NZB file</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Report</TableHead>
                    </template>
                    <template #body>
                        <TableRow v-for="(task, index) in tasksStore.historyTasks" :key="index">
                            <TableCell>
                                <Checkbox
                                    :model-value="selectedTasks.includes(task.id)"
                                    :value="task.id"
                                    @update:model-value="handleChange(task.id, $event as boolean)"
                                />
                            </TableCell>
                            <TableCell>{{ task.name }}</TableCell>
                            <TableCellHidden :value="task.password" />
                            <TableCell>
                                <CheckCircle
                                    v-if="task.currentStep === CommandStep.FINISH"
                                    class="text-green-600"
                                />
                                <OctagonX
                                    v-else-if="task.currentStep === CommandStep.ERROR"
                                    class="text-destructive"
                                />
                            </TableCell>
                            <TableCellOpenFile :full_path="task.nzbFile" />
                            <TableCell>
                                {{ timestampToLocale(task.created_at || 0) }}
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    @click="tasksStore.activeTaskLog = task"
                                >
                                    <Logs />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </template>
                </Table>
            </CardContent>
        </Card>
    </AppLayout>
</template>
