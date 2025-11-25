<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import TaskConfigBase from './TaskConfigBase.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import CardTitle from '@renderer/components/ui/card/CardTitle.vue'
import { X } from 'lucide-vue-next'

const tasksStore = useTasksStore()

const addToApprovals = () => {
    if (tasksStore.activeTaskConfig === null) return

    tasksStore.addApprovalTask(tasksStore.activeTaskConfig)
    tasksStore.removeActiveTask()
}
</script>

<template>
    <TaskConfigBase
        v-if="tasksStore.activeTaskConfig !== null && !tasksStore.activeTaskConfigIsEdit"
        :open="tasksStore.activeTaskConfig !== null && !tasksStore.activeTaskConfigIsEdit"
        :form="tasksStore.activeTaskConfig"
        @close="tasksStore.activeTaskConfig = null"
        @profile-change="
            tasksStore.createNewTask(
                tasksStore.activeTaskConfig.taskSettings.postingSettings.files,
                $event
            )
        "
    >
        <template #header>
            <CardTitle>Create New upload</CardTitle>
            <div class="flex gap-2 align-items-center">
                <Button variant="default" @click="tasksStore.queueActiveTask()">
                    Add to queue
                </Button>
                <Button variant="default" @click="addToApprovals"> Add to approvals </Button>
                <Button variant="secondary" @click="tasksStore.removeActiveTask()"> <X /> </Button>
            </div>
        </template>
    </TaskConfigBase>
</template>
