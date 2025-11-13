<script setup lang="ts">
import { useTasksStore } from '@renderer/composables/useTasksStore'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { CommandStep } from '@main/enums/CommandStep'
import Progress from '../ui/progress/Progress.vue'

const tasksStore = useTasksStore()
const props = defineProps<{
    task: TaskConfig
}>()

const progressTest = ref(0)

const statusText = computed(() => {
    // Here you can customize the status text based on task properties
    switch (props.task.currentStep) {
        case CommandStep.RAR:
            return 'Creating RAR files'
        case CommandStep.PAR:
            return 'Creating PAR files'
        case CommandStep.POST:
            return 'Posting to usenet'
    }
})

watchEffect(cleanupFn => {
    const timer = setTimeout(() => (progressTest.value = 66), 500)
    cleanupFn(() => clearTimeout(timer))
})

const previousProgress = ref({
    percentage: 0,
    currentStep: CommandStep.RAR,
})

const progress = computed(() => {
    const progressData = tasksStore.taskPercentages[props.task.id]

    if(!progressData && previousProgress.value.percentage == 0 ) {

        return 0
    }else if(!progressData && previousProgress.value.percentage > 0 && previousProgress.value.currentStep == props.task.currentStep) {
        return previousProgress.value.percentage
    }

    if(progressData.percentage > previousProgress.value.percentage && progressData.currentStep == previousProgress.value.currentStep) {
        previousProgress.value = progressData
    }else if(progressData.percentage < previousProgress.value.percentage && progressData.currentStep == previousProgress.value.currentStep) {
        progressData.percentage = previousProgress.value.percentage
    }

    if(previousProgress.value.currentStep != progressData.currentStep) {
        previousProgress.value = progressData
    }

    return progressData ? progressData.percentage : 0
})
</script>
<template>
    <TableCell>
        {{ statusText }}
        <div class="relative">
            <div class="absolute z-20 left-1/2 transform -translate-x-1/2 text-xs">{{ progress }}%</div>
            <Progress v-model="progress" />
        </div>
    </TableCell>
</template>
