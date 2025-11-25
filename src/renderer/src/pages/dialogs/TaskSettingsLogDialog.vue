<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import TaskConfigEdit from './TaskConfigEdit.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import { X } from 'lucide-vue-next'
import CardTitle from '@renderer/components/ui/card/CardTitle.vue'

const tasksStore = useTasksStore()

const openFile = (path: string) => {
    window.api.openFileInExplorer(path)
}
</script>

<template>
    <TaskConfigEdit
        v-if="tasksStore.activeTaskLog !== null"
        :open="tasksStore.activeTaskLog !== null"
        :form="tasksStore.activeTaskLog"
        @close="tasksStore.activeTaskLog = null"
        :disabled="true"
    >
        <template #header>
            <CardTitle>Full upload log</CardTitle>
            <div class="flex gap-2 align-items-center">
                <Button
                    :variant="tasksStore.activeTaskLog.log_file ? 'default' : 'outline'"
                    @click="openFile(tasksStore.activeTaskLog.log_file)"
                    >Open log file in explorer
                </Button>
                <Button variant="secondary" @click="tasksStore.activeTaskLog = null">
                    <X />
                </Button>
            </div>
        </template>
    </TaskConfigEdit>
</template>
