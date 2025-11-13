<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import TableCellHidden from '@renderer/components/table/TableCellHidden.vue'
import { Logs } from 'lucide-vue-next'
import { Button } from '@components/ui/button'
import { onMounted } from 'vue'
import TaskSettingsLogDialog from './dialogs/TaskSettingsLogDialog.vue'
import TableCellOpenFile from '@renderer/components/table/TableCellOpenFile.vue'
import { currentStepToStatusCol, timestampToLocale } from '@renderer/lib/utils'

const tasksStore = useTasksStore()

onMounted(async () => {
    tasksStore.loadHistoryTasks()
})
</script>

<template>
    <AppLayout>
        <TaskSettingsLogDialog />

        <Card>
            <CardHeader>
                <CardTitle>Upload history</CardTitle>
            </CardHeader>
            <CardContent>
                <Table :columns="4">
                    <template #head>
                        <TableHead>Name</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>NZB file</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Report</TableHead>
                    </template>
                    <template #body>
                        <TableRow v-for="(task, index) in tasksStore.historyTasks" :key="index">
                            <TableCell>{{ task.name }}</TableCell>
                            <TableCellHidden :value="task.password" />
                            <TableCell>{{ currentStepToStatusCol(task.currentStep) }}</TableCell>
                            <TableCellOpenFile :full_path="task.nzbFile" />
                            <TableCell>
                                {{ timestampToLocale(task.created_at || 0) }}
                            </TableCell>
                            <TableCell>
                                <Button size="sm" variant="outline" @click="tasksStore.activeTaskLog = task"> <Logs /> </Button>
                            </TableCell>
                        </TableRow>
                    </template>
                </Table>
            </CardContent>
        </Card>
    </AppLayout>
</template>
