<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import Button from '@renderer/components/ui/button/Button.vue'
import TaskConfigBase from './TaskConfigBase.vue'
import CardTitle from '@renderer/components/ui/card/CardTitle.vue'
import { X } from 'lucide-vue-next'

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
    <TaskConfigBase
        v-if="tasksStore.activeTaskConfig !== null && tasksStore.activeTaskConfigIsEdit"
        :open="tasksStore.activeTaskConfig !== null && tasksStore.activeTaskConfigIsEdit"
        :form="tasksStore.activeTaskConfig"
        @close="tasksStore.activeTaskConfig = null"
        @profile-change="generateNewWithProfile($event)"
        :disabled="false"
    >
        <template #header>
            <CardTitle>Edit upload settings</CardTitle>
            <div class="flex gap-2 align-items-center">
                <Button variant="default" @click="tasksStore.queueActiveTask()">
                    Save changes</Button
                >
                <Button variant="secondary" @click="tasksStore.activeTaskConfig = null">
                    <X />
                </Button>
            </div>
        </template>
    </TaskConfigBase>
</template>
