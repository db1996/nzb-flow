<script setup lang="ts">
import ConfirmDialog from '@components/ConfirmDialog.vue'
import AppSidebarLayout from '@layout/app/AppSidebarLayout.vue'
import { useAppearance } from '@renderer/composables/useAppearance'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import { useUpdateStore } from '@renderer/composables/useUpdateStore'
import ReleasenotesDialog from '@renderer/pages/editPartials/ReleasenotesDialog.vue'
import TaskUploadNew from '@renderer/pages/editPartials/TaskUploadNew.vue'
import { BreadcrumbItem } from '@renderer/types/navigation'
import { PlusCircle } from 'lucide-vue-next'
import { onMounted, useSlots } from 'vue'
import { Toaster } from 'vue-sonner'
import { Theme } from 'vue-sonner/src/packages/types.js'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

interface Props {
    breadcrumbs?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => []
})

const appearanceStore = useAppearance()
const tasksStore = useTasksStore()
const slots = useSlots()

onMounted(() => {
    const updateStore = useUpdateStore()
    updateStore.checkUpdateOnStartup()

    tasksStore.loadApprovalTasks()
    tasksStore.loadQueueStatus()
})
</script>

<template>
    <AppSidebarLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div
                v-if="slots.header || slots.actions"
                class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center"
                :class="{ 'sm:justify-between': slots.header, 'sm:justify-end': !slots.header }"
            >
                <slot name="header" />
                <div v-if="slots.actions" class="flex shrink-0 gap-2">
                    <slot name="actions" />
                </div>
            </div>
            <TaskUploadNew />

            <slot
                v-if="
                    tasksStore.activeTaskConfig === null ||
                    (tasksStore.activeTaskConfig !== null && tasksStore.activeTaskConfigIsEdit)
                "
            />
        </div>
    </AppSidebarLayout>
    <Toaster :theme="(appearanceStore.appearance.value as Theme)" />
    <ConfirmDialog />
    <ReleasenotesDialog />

    <div
        v-if="tasksStore.isDraggingOver"
        class="fixed inset-0 z-500000 bg-black opacity-70 flex items-center justify-center pointer-events-none"
    >
        <PlusCircle :size="120" class="text-white animate-bounce pointer-events-none" />
    </div>
</template>
