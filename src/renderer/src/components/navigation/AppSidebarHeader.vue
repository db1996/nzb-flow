<script setup lang="ts">
import Breadcrumbs from '@components/Breadcrumbs.vue'
import type { BreadcrumbItem } from '@renderer/types/navigation'
import { Button } from '@ui/button'
import { isCurrent } from '@renderer/helpers/route'
import { BadgeCheck, LoaderCircle, Pause, Play } from 'lucide-vue-next'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import { useTasksStore } from '@renderer/composables/useTasksStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import LoadCircle from '../LoadCircle.vue'

const settingsStore = useSettingsStore()
const tasksStore = useTasksStore()

withDefaults(
    defineProps<{
        breadcrumbs?: BreadcrumbItem[]
    }>(),
    {
        breadcrumbs: () => []
    }
)

async function selectFiles() {
    window.api.chooseFiles().then(async files => {
        console.log('choosen files:', files)
        if (settingsStore.settings && files.length > 0) {
            await tasksStore.createNewTask(files)
        }
    })
}
async function selectFolders() {
    window.api.chooseFolders().then(async folders => {
        console.log('choosen folders:', folders, settingsStore.settings)
        if (settingsStore.settings && folders.length > 0) {
            await tasksStore.createNewTask(folders)
        }
    })
}
</script>

<template>
    <header
        class="border-sidebar-border/70 flex h-16 shrink-0 items-center gap-2 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
    >
        <div
            class="flex justify-between gap-2 w-full items-center border-b pb-3 pt-3"
            v-if="!isCurrent('settings')"
        >
            <div>
                <Button variant="default" class="mr-2" @click="selectFiles">Select files</Button>
                <Button @click="selectFolders">Select folders</Button>
                Or drag/drop files anywhere
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button v-if="tasksStore.queueActive" @click="tasksStore.pauseQueue">
                            <Pause /> Pause queue
                        </Button>
                        <Button v-else @click="tasksStore.resumeQueue">
                            <Play /> Resume queue
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p v-if="tasksStore.queueActive">
                            Pausing the queue will pause all queued tasks, currently running uploads
                            will be paused once the current operation is finished
                        </p>
                        <p v-else>
                            Resuming the queue will continue where it left off, if a task is paused
                            in between steps it will just resume
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>
        <div
            class="flex justify-between gap-2 w-full items-center border-b pb-3 pt-3"
            v-if="isCurrent('settings')"
        >
            <div class="flex-1 md:flex md:justify-end items-center">
                <Button @click="settingsStore.fireDebounceNow">
                    Save Settings
                    <LoaderCircle
                        v-if="settingsStore.formIsSaving"
                        class="animate-spin text-amber-500"
                    />
                    <BadgeCheck v-if="settingsStore.flashSavedIndicator" class="text-green-500" />
                    <LoadCircle
                        v-if="settingsStore.remainingTimeSaveSettings > 10"
                        :duration="settingsStore.debounceTime"
                        :remaining="settingsStore.remainingTimeSaveSettings"
                    />
                </Button>
            </div>

            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>
    </header>
</template>
