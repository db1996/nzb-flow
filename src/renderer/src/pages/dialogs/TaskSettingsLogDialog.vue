<script lang="ts" setup>
import { useTasksStore } from '@renderer/composables/useTasksStore'
import TaskConfigEdit from './TaskConfigEdit.vue'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import { FolderOpen } from 'lucide-vue-next'
import DialogDescription from '@renderer/components/ui/dialog/DialogDescription.vue'

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
            <div class="flex justify-between mr-8">
                <DialogTitle>Full upload log</DialogTitle>
                <div class="flex gap-4 align-items-center">
                    <Button
                        v-if="tasksStore.activeTaskLog.log_file"
                        variant="default"
                        @click="openFile(tasksStore.activeTaskLog.log_file)"
                    >
                        <FolderOpen /> Open log file in explorer
                    </Button>
                </div>
            </div>
            <DialogDescription>
                Check the rar, par and nyuu command outputs for full command logs
            </DialogDescription>
        </template>
    </TaskConfigEdit>
</template>
