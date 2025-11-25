<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import TableCellHidden from '@renderer/components/table/TableCellHidden.vue'
import { CheckCircle, Logs, OctagonX, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '@components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import TaskLog from './editPartials/TaskLog.vue'
import TableCellOpenFile from '@renderer/components/table/TableCellOpenFile.vue'
import TableCellCopy from '@renderer/components/table/TableCellCopy.vue'
import { timestampToLocale } from '@renderer/lib/utils'
import TableCellTaskStatus from '@renderer/components/table/TableCellTaskStatus.vue'
import TaskEditQueue from './editPartials/TaskEditQueue.vue'
import { CommandStep } from '@main/enums/CommandStep'

const tasksStore = useTasksStore()

const setEditTask = (task: any) => {
    tasksStore.activeTaskConfig = task
    tasksStore.activeTaskConfigIsEdit = true
}
</script>

<template>
    <AppLayout>
        <TaskLog />
        <TaskEditQueue />
        <template v-if="tasksStore.activeTaskConfig === null && tasksStore.activeTaskLog === null">
            <Card>
                <CardHeader>
                    <div class="flex gap-2 justify-between">
                        <CardTitle>In-Progress Tasks</CardTitle>
                        <Button
                            as="a"
                            target="_blank"
                            href="https://github.com/db1996/nzb-flow/blob/main/docs/Queues.md"
                            variant="link"
                            class="inline m-0 p-0"
                            >Check the queue docs here</Button
                        >
                    </div>
                </CardHeader>
                <CardContent>
                    <Table :columns="4">
                        <template #head>
                            <TableHead>Name</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead class="min-w-[100px]">Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Report</TableHead>
                        </template>
                        <template #body>
                            <TableRow
                                v-for="(task, index) in tasksStore.uploadRunning"
                                :key="index"
                            >
                                <TableCell>{{ task.name }}</TableCell>
                                <TableCellHidden :value="task.password" />
                                <TableCellTaskStatus :task="task" />
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
                            <TableRow
                                v-for="(task, index) in tasksStore.compressionRunning"
                                :key="index"
                            >
                                <TableCell>{{ task.name }}</TableCell>
                                <TableCellHidden :value="task.password" />
                                <TableCellTaskStatus :task="task" />
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

            <Card>
                <CardHeader>
                    <CardTitle>Queued Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table :columns="3">
                        <template #head>
                            <TableHead>Name</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead class="min-w-[100px]">Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>#</TableHead>
                        </template>
                        <template #body>
                            <TableRow v-for="(task, index) in tasksStore.uploadQueued" :key="index">
                                <TableCell>{{ task.name }}</TableCell>
                                <TableCellHidden :value="task.password" />
                                <TableCell>Waiting to upload</TableCell>
                                <TableCell>
                                    {{ timestampToLocale(task.created_at || 0) }}
                                </TableCell>
                            </TableRow>
                            <TableRow
                                v-for="(task, index) in tasksStore.compressionQueued"
                                :key="index"
                            >
                                <TableCell>{{ task.name }}</TableCell>
                                <TableCellHidden :value="task.password" />
                                <TableCell>Waiting to compress/par</TableCell>
                                <TableCell>
                                    {{ timestampToLocale(task.created_at || 0) }}
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <Button
                                                    class="mr-1"
                                                    size="sm"
                                                    variant="outline_info"
                                                    @click="setEditTask(task)"
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
                                                    variant="outline_destructive"
                                                    @click="tasksStore.unQueueTaskId(task.id)"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Remove from queue</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        </template>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recently finished Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table :columns="7">
                        <template #head>
                            <TableHead>Name</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead class="min-w-[100px]">Status</TableHead>
                            <TableHead>NZB file</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Report</TableHead>
                            <TableHead>#</TableHead>
                        </template>
                        <template #body>
                            <TableRow
                                v-for="(task, index) in tasksStore.finishedTasks"
                                :key="index + '_finished'"
                            >
                                <TableCellCopy :value="task.name">
                                    {{ task.name }}
                                </TableCellCopy>
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
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <Button
                                                    variant="outline_destructive"
                                                    @click="tasksStore.removeTask(task.id)"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Remove Task from this list. It will be available
                                                    in the history tab
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        </template>
                    </Table>
                </CardContent>
            </Card>
        </template>
    </AppLayout>
</template>
