import { CommandStep } from '@main/enums/CommandStep'
import { QueueStatus } from '@main/types/settings/commands/QueueStatus'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'
import { debounce } from 'lodash'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
    const taskPercentages = ref<
        Record<
            string,
            {
                percentage: number
                currentStep: CommandStep
            }
        >
    >({})

    const compressionQueued = ref<TaskConfig[]>([])
    const compressionRunning = ref<TaskConfig[]>([])
    const uploadQueued = ref<TaskConfig[]>([])
    const uploadRunning = ref<TaskConfig[]>([])

    const finishedTasks = ref<TaskConfig[]>([])
    const historyTasks = ref<TaskConfig[]>([])
    const historyTasksLoading = ref(false)

    // Approval tasks
    const approvalTasks = ref<TaskConfig[]>([])
    const activeTaskApprovalSettings = ref<TaskConfig | null>(null)

    // Queue control
    const queueActive = ref<boolean>(true)

    const activeTaskConfig = ref<TaskConfig | null>(null)
    const activeTaskConfigIsEdit = ref(false)
    const generatingTask = ref(false)

    const activeTaskLog = ref<TaskConfig | null>(null)

    const commandProgressMessage = ref('')

    const isDraggingOver = ref(false)

    async function loadHistoryTasks() {
        historyTasksLoading.value = true
        const tasks = await window.api.getHistoryTasks()
        historyTasks.value = tasks
        historyTasksLoading.value = false
    }

    const debounceNewTask = debounce(async (files: string[], profileId?: string) => {
        const task = await window.api.generateEmptyTask(profileId, files)
        activeTaskConfigIsEdit.value = false
        generatingTask.value = false
        activeTaskConfig.value = task
    }, 400)

    // Queue status polling with interval management
    let queueStatusInterval: NodeJS.Timeout | null = null

    const loadQueueStatusPoll = async () => {
        try {
            const status = await window.api.getQueueStatus()
            queueActive.value = status.uploadActive || status.compressionActive
            uploadQueued.value = status.uploadQueuedSettings
            uploadRunning.value = status.uploadRunningSettings
            compressionQueued.value = status.compressionQueuedSettings
            compressionRunning.value = status.compressionRunningSettings
            uploadRunning.value.forEach((task) => {
                taskPercentages.value[task.id] = {
                    percentage: task.nyuuCommandOutput.lastKnownProgress,
                    currentStep: CommandStep.POST
                }
            })

            compressionRunning.value.forEach((task) => {
                let percentage = 0
                if (task.rarCommandOutput.lastKnownProgress > 0) {
                    percentage = task.rarCommandOutput.lastKnownProgress
                } else if (task.parCommandOutput.lastKnownProgress > 0) {
                    percentage = task.parCommandOutput.lastKnownProgress
                }

                taskPercentages.value[task.id] = {
                    percentage: percentage,
                    currentStep: CommandStep.POST
                }
            })
        } catch (error) {
            console.error('Error polling queue status:', error)
        }
    }

    const startQueueStatusPolling = () => {
        // Clear existing interval if any
        if (queueStatusInterval) {
            clearInterval(queueStatusInterval)
        }

        // Start new interval
        queueStatusInterval = setInterval(loadQueueStatusPoll, 2000)

        // Run immediately on start
        loadQueueStatusPoll()
    }

    const resetQueueStatusPolling = () => {
        // Clear existing interval and restart
        if (queueStatusInterval) {
            clearInterval(queueStatusInterval)
        }
        queueStatusInterval = setInterval(loadQueueStatusPoll, 2000)
    }

    const stopQueueStatusPolling = () => {
        if (queueStatusInterval) {
            clearInterval(queueStatusInterval)
            queueStatusInterval = null
        }
    }

    const init = () => {
        window.api.onCommandFinish((data) => {
            finishedTasks.value.push(data)

            console.log('Command finish:', data)
        })

        window.api.onApprovalQueueUpdated((data) => {
            approvalTasks.value = data
        })

        window.api.onQueueUpdated((data: QueueStatus) => {
            queueActive.value = data.uploadActive || data.compressionActive
            uploadQueued.value = data.uploadQueuedSettings
            uploadRunning.value = data.uploadRunningSettings
            compressionQueued.value = data.compressionQueuedSettings
            compressionRunning.value = data.compressionRunningSettings

            uploadRunning.value.forEach((task) => {
                taskPercentages.value[task.id] = {
                    percentage: task.nyuuCommandOutput.lastKnownProgress,
                    currentStep: CommandStep.POST
                }
            })

            compressionRunning.value.forEach((task) => {
                let percentage = 0
                if (
                    task.currentStep == CommandStep.RAR &&
                    task.rarCommandOutput.lastKnownProgress > 0
                ) {
                    percentage = task.rarCommandOutput.lastKnownProgress
                } else if (
                    task.currentStep == CommandStep.PAR &&
                    task.parCommandOutput.lastKnownProgress > 0
                ) {
                    percentage = task.parCommandOutput.lastKnownProgress
                }

                taskPercentages.value[task.id].percentage = percentage
            })

            resetQueueStatusPolling()
        })

        window.api.onCommandProgressPercentage((data) => {
            taskPercentages.value[data.id] = {
                percentage: data.percentage,
                currentStep: data.currentStep
            }
        })

        window.api.onFilesDropped(async (filePaths: string[]) => {
            isDraggingOver.value = false
            console.log('Dropped files with paths:', filePaths)
            if (filePaths.length === 0) {
                console.warn('No files were dropped.')
                return
            }

            if (activeTaskConfig.value !== null) {
                activeTaskConfig.value.taskSettings.postingSettings.files.push(...filePaths)
            } else {
                createNewTask(filePaths)
            }
        })

        window.api.onWindowDragOver(async (dragging: boolean) => {
            isDraggingOver.value = dragging
        })

        startQueueStatusPolling()
    }

    async function removeActiveTask() {
        activeTaskConfig.value = null
    }

    async function createNewTask(files: string[], profileId?: string) {
        generatingTask.value = true
        await debounceNewTask(files, profileId)
    }

    async function generateNewTask(files: string[], profileId?: string) {
        const task = await window.api.generateEmptyTask(profileId, files)
        console.log('Generated task', task)

        return task
    }

    async function queueTask(task: TaskConfig) {
        await window.api.queueTask(JSON.parse(JSON.stringify(task)))
    }

    async function queueActiveTask() {
        if (activeTaskConfig.value) {
            console.log('queueing active task config', activeTaskConfig.value)

            await queueTask(activeTaskConfig.value)
            activeTaskConfig.value = null
        }
    }

    async function unQueueTaskId(id: string) {
        await window.api.unQueueTask(id)
    }

    function removeTask(taskId: string) {
        const indexCurrent = finishedTasks.value.findIndex((task) => task.id === taskId)

        if (indexCurrent !== -1) {
            finishedTasks.value = [
                ...finishedTasks.value.slice(0, indexCurrent),
                ...finishedTasks.value.slice(indexCurrent + 1)
            ]
        }
    }

    async function loadApprovalTasks() {
        try {
            const tasks = await window.api.getApprovalTasks()
            approvalTasks.value = tasks
        } catch (error) {
            console.error('Error loading approval tasks:', error)
        }
    }

    async function addApprovalTask(taskSettings: TaskConfig) {
        try {
            const success = await window.api.addApprovalTask(
                JSON.parse(JSON.stringify(taskSettings))
            )
            if (success) {
                await loadApprovalTasks() // Refresh the list
            }
            return success
        } catch (error) {
            console.error('Error adding task to approval:', error)
            return false
        }
    }

    async function removeApprovalTask(id: string) {
        try {
            const success = await window.api.removeApprovalTask(id)
            if (success) {
                approvalTasks.value = approvalTasks.value.filter((task) => task.id !== id)
                // Clear active if it's the one being removed
                if (activeTaskApprovalSettings.value?.id === id) {
                    activeTaskApprovalSettings.value = null
                }
            }
            return success
        } catch (error) {
            console.error('Error removing approval task:', error)
            return false
        }
    }

    async function removeMultipleApprovalTasks(ids: string[]) {
      try {
            let success = true
            for (const id of ids) {
                // Clear active if it's the one being removed
                await removeApprovalTask(id)
            }
            return success
        } catch (error) {
            console.error('Error removing multiple approval tasks:', error)
            return false
        }
    }

    async function queueApprovalTask(id: string) {
        try {
            const success = await window.api.queueApprovalTask(id)
            return success
        } catch (error) {
            console.error('Error queueing approval task:', error)
            return false
        }
    }

    async function queueMultipleApprovalTasks(ids: string[]) {
        try {
            const success = await window.api.queueMultipleApprovalTasks(
                JSON.parse(JSON.stringify(ids))
            )
            return success
        } catch (error) {
            console.error('Error queueing multiple approval tasks:', error)
            return false
        }
    }

    async function saveAndQueueActiveApprovalTask() {
        const taskSettings = activeTaskApprovalSettings.value
        if (!taskSettings) {
            console.error('No active approval task to save and queue.')
            return false
        }
        const success = await saveApprovalTask(taskSettings)
        activeTaskApprovalSettings.value = null
        if (success) {
            await queueApprovalTask(taskSettings.id)
        }
        return success
    }

    async function saveActiveApprovalTask() {
        const taskSettings = activeTaskApprovalSettings.value
        if (!taskSettings) {
            console.error('No active approval task to save.')
            return false
        }

        await saveApprovalTask(taskSettings)
        activeTaskApprovalSettings.value = null

        return true
    }

    async function saveApprovalTask(taskSettings: TaskConfig) {
        try {
            const success = await window.api.saveApprovalTask(
                JSON.parse(JSON.stringify(taskSettings))
            )
            if (success) {
                // Update the local list
                const index = approvalTasks.value.findIndex((task) => task.id === taskSettings.id)
                if (index !== -1) {
                    approvalTasks.value[index] = { ...taskSettings }
                }
            }
            return success
        } catch (error) {
            console.error('Error saving approval task:', error)
            return false
        }
    }

    function setActiveApprovalTask(taskSettings: TaskConfig | null) {
        activeTaskApprovalSettings.value = taskSettings
    }

    async function addActiveTaskToApproval() {
        if (activeTaskConfig.value) {
            const success = await addApprovalTask(activeTaskConfig.value)
            if (success) {
                activeTaskConfig.value = null // Clear active task after adding to approval
            }
            return success
        }
        return false
    }

    // Queue control functions
    async function loadQueueStatus() {
        try {
            const status = await window.api.getQueueStatus()
            queueActive.value = status.uploadActive || status.compressionActive
            uploadQueued.value = status.uploadQueuedSettings
            uploadRunning.value = status.uploadRunningSettings
            compressionQueued.value = status.compressionQueuedSettings
            compressionRunning.value = status.compressionRunningSettings
        } catch (error) {
            console.error('Error loading queue status:', error)
        }
    }

    async function pauseQueue() {
        try {
            const success = await window.api.pauseQueue()
            if (success) {
                queueActive.value = false
                console.log('Queue paused')
            }
            return success
        } catch (error) {
            console.error('Error pausing queue:', error)
            return false
        }
    }

    async function resumeQueue() {
        try {
            const success = await window.api.resumeQueue()
            if (success) {
                queueActive.value = true
                console.log('Queue resumed')
            }
            return success
        } catch (error) {
            console.error('Error resuming queue:', error)
            return false
        }
    }

    return {
        finishedTasks,
        commandProgressMessage,
        activeTaskConfig,
        activeTaskLog,
        generatingTask,
        historyTasks,
        historyTasksLoading,

        // Compression tasks
        compressionQueued,
        compressionRunning,

        // Upload tasks
        uploadQueued,
        uploadRunning,
        // Approval tasks
        approvalTasks,
        activeTaskApprovalSettings,

        // Queue control
        queueActive,
        taskPercentages,
        activeTaskConfigIsEdit,
        isDraggingOver,
        init,
        queueTask,
        unQueueTaskId,
        removeTask,
        queueActiveTask,
        createNewTask,
        removeActiveTask,
        loadHistoryTasks,

        // Approval task functions
        loadApprovalTasks,
        addApprovalTask,
        removeApprovalTask,
        removeMultipleApprovalTasks,
        queueApprovalTask,
        queueMultipleApprovalTasks,
        saveApprovalTask,
        setActiveApprovalTask,
        addActiveTaskToApproval,
        saveAndQueueActiveApprovalTask,
        saveActiveApprovalTask,

        // Queue control functions
        loadQueueStatus,
        pauseQueue,
        resumeQueue,

        // Queue polling control
        startQueueStatusPolling,
        stopQueueStatusPolling,
        resetQueueStatusPolling,
        generateNewTask
    }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
