<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import TaskConfigEdit from './TaskConfigEdit.vue'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import Button from '@renderer/components/ui/button/Button.vue'

const tasksStore = useTasksStore()

const addToApprovals = () => {
    if(tasksStore.activeTaskConfig === null) return

    tasksStore.addApprovalTask(tasksStore.activeTaskConfig)
    tasksStore.removeActiveTask()
}
</script>

<template>
    <TaskConfigEdit
        v-if="tasksStore.activeTaskConfig !== null && !tasksStore.activeTaskConfigIsEdit"
        :open="tasksStore.activeTaskConfig !== null && !tasksStore.activeTaskConfigIsEdit"
        :form="tasksStore.activeTaskConfig"
        @close="tasksStore.activeTaskConfig = null"
        @profile-change="tasksStore.createNewTask(tasksStore.activeTaskConfig.taskSettings.postingSettings.files, $event)"
    >
        <template #header>
            <div class="flex justify-between mr-8">
                <DialogTitle>Create new upload</DialogTitle>
                <div class="flex gap-4 align-items-center">
                    <Button variant="default" @click="tasksStore.queueActiveTask()">
                        Add to queue
                    </Button>
                    <Button
                        variant="secondary"
                        @click="addToApprovals"
                    >
                        Add to approvals
                    </Button>
                </div>
            </div>
        </template>
    </TaskConfigEdit>
</template>
