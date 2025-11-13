<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import { DialogTitle } from '@components/ui/dialog'
import Button from '@renderer/components/ui/button/Button.vue'
import TaskConfigEdit from './TaskConfigEdit.vue'

const tasksStore = useTasksStore()

async function generateNewWithProfile(profileId: string) {
    if (tasksStore.activeTaskApprovalSettings === null) return

    console.log(' Generating new task with profile:', profileId)

    const oldId = tasksStore.activeTaskApprovalSettings.id

    const newTask = await tasksStore.generateNewTask(
        tasksStore.activeTaskApprovalSettings.taskSettings.postingSettings.files,
        profileId
    )
    newTask.id = oldId // Keep the same ID so it updates correctly
    tasksStore.activeTaskApprovalSettings = newTask
}
</script>

<template>
    <TaskConfigEdit
        v-if="tasksStore.activeTaskApprovalSettings !== null"
        :open="tasksStore.activeTaskApprovalSettings !== null"
        :form="tasksStore.activeTaskApprovalSettings"
        @close="tasksStore.activeTaskApprovalSettings = null"
        @profile-change="generateNewWithProfile($event)"
        :disabled="false"
    >
        <template #header>
            <div class="flex justify-between mr-8">
                <DialogTitle>Edit Upload task</DialogTitle>
                <div class="flex gap-4 align-items-center">
                    <Button variant="secondary" @click="tasksStore.saveActiveApprovalTask()">
                        Save changes and close
                    </Button>
                </div>
            </div>
        </template>
    </TaskConfigEdit>
</template>
