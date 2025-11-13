<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import { DialogTitle } from '@components/ui/dialog'
import Button from '@renderer/components/ui/button/Button.vue'
import TaskConfigEdit from './TaskConfigEdit.vue'

const tasksStore = useTasksStore()

async function generateNewWithProfile(profileId: string) {
    if (tasksStore.activeTaskConfig === null) return

    console.log(' Generating new task with profile:', profileId)

    const oldId = tasksStore.activeTaskConfig.id

    const newTask = await tasksStore.generateNewTask(
        tasksStore.activeTaskConfig.taskSettings.postingSettings.files,
        profileId
    )
    newTask.id = oldId // Keep the same ID so it updates correctly
    tasksStore.activeTaskConfig = newTask
}
</script>

<template>
    <TaskConfigEdit
        v-if="tasksStore.activeTaskConfig !== null && tasksStore.activeTaskConfigIsEdit"
        :open="tasksStore.activeTaskConfig !== null && tasksStore.activeTaskConfigIsEdit"
        :form="tasksStore.activeTaskConfig"
        @close="tasksStore.activeTaskConfig = null"
        @profile-change="generateNewWithProfile($event)"
        :disabled="false"
    >
        <template #header>
            <div class="flex justify-between mr-8">
                <DialogTitle>Edit Upload task</DialogTitle>
                <div class="flex gap-4 align-items-center">
                    <Button variant="default" @click="tasksStore.queueActiveTask()">
                        Save changes and close
                    </Button>
                </div>
            </div>
        </template>
    </TaskConfigEdit>
</template>
