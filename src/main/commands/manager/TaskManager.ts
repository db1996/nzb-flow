import Settings from '../../classes/Settings'
import { TaskConfig, TaskSettings } from '../../types/settings/commands/taskSettings'
import { QueueSettings } from '../../types/settings/QueueSettings'
import { CommandStep } from '../../enums/CommandStep'
import Task from './task'
import { QueueStatus } from '../../types/settings/commands/QueueStatus'

export default class TaskManager {
    // Separate queues for different stages
    private compressionQueue: Task[] = [] // RAR + PAR steps
    private uploadQueue: Task[] = [] // POST step
    public tasksApproval: Task[] = []

    // Queue control flags
    private compressionPaused: boolean = false
    private uploadPaused: boolean = false
    private compressionAutoPaused: boolean = false

    // Running intervals
    private compressionInterval: NodeJS.Timeout | null = null
    private uploadInterval: NodeJS.Timeout | null = null

    constructor() {
        this.startQueueProcessors()
    }

    private startQueueProcessors(): void {
        // Process compression queue every 1 second
        this.compressionInterval = setInterval(() => {
            this.processCompressionQueue()
        }, 1000)

        // Process upload queue every 1 second
        this.uploadInterval = setInterval(() => {
            this.processUploadQueue()
        }, 1000)
    }

    private getQueueConfig(): QueueSettings {
        return Settings.allSettings.queue
    }

    public pauseCompressionQueue(): void {
        this.compressionPaused = true
    }

    public resumeCompressionQueue(): void {
        this.compressionPaused = false
        this.compressionAutoPaused = false
    }

    public pauseUploadQueue(): void {
        this.uploadPaused = true
    }

    public resumeUploadQueue(): void {
        this.uploadPaused = false
    }

    public pauseAllQueues(): void {
        this.compressionPaused = true
        this.uploadPaused = true
    }

    public resumeAllQueues(): void {
        this.compressionPaused = false
        this.uploadPaused = false
        this.compressionAutoPaused = false
    }

    public setConfig(config: Partial<QueueSettings>): void {
        Settings.allSettings.queue = { ...Settings.allSettings.queue, ...config }
        // Save settings if needed
    }

    public getConfig(): QueueSettings {
        return Settings.allSettings.queue
    }

    public getQueueStatus(): QueueStatus {
        const compressionRunning = this.compressionQueue.filter(
            (t) =>
                t.currentlyRunning &&
                t.taskConfig &&
                [CommandStep.RAR, CommandStep.PAR].includes(t.taskConfig.currentStep)
        ).length

        const compressionRunningConfigs = this.compressionQueue
            .filter((t) => t.currentlyRunning && t.taskConfig)
            .map((t) => t.taskConfig) as TaskConfig[]

        const uploadRunning = this.uploadQueue.filter(
            (t) =>
                t.currentlyRunning && t.taskConfig && t.taskConfig.currentStep === CommandStep.POST
        ).length

        const uploadRunningConfigs = this.uploadQueue
            .filter((t) => t.currentlyRunning && t.taskConfig)
            .map((t) => t.taskConfig) as TaskConfig[]

        const compressionQueued = this.compressionQueue.filter((t) => !t.taskConfig?.started).length

        const compressionQueuedConfigs = this.compressionQueue
            .filter((t) => !t.taskConfig?.started)
            .map((t) => t.taskConfig) as TaskConfig[]

        const uploadQueued = this.uploadQueue.filter((t) => !t.taskConfig?.started).length

        const uploadQueuedConfigs = this.uploadQueue
            .filter((t) => !t.taskConfig?.started)
            .map((t) => t.taskConfig) as TaskConfig[]

        return {
            compressionActive: !this.compressionPaused,
            uploadActive: !this.uploadPaused,
            compressionRunning,
            compressionRunningConfigs,
            uploadRunning,
            uploadRunningConfigs,
            compressionQueued,
            compressionQueuedConfigs,
            uploadQueued,
            uploadQueuedConfigs,
            compressionPaused: this.compressionPaused || this.compressionAutoPaused
        }
    }

    public settingsToTask(settings: TaskSettings): Task {
        const task = new Task().setSettings(settings).generateRandoms()
        return task
    }

    public configToTask(config: TaskConfig): Task {
        const task = new Task().setConfig(config).generateRandoms()
        return task
    }

    public getFreshTask(profileId?: string, files?: string[]): Task {
        if (!profileId) {
            profileId = Settings.profiles.filter((p) => p.isDefault)[0]?.id
        }

        const taskSettings = Settings.getNewTaskSettings(profileId)
        if (files && files.length > 0) {
            taskSettings.postingSettings.files = files
        }
        const config = Settings.getNewTaskConfig(taskSettings)
        config.used_profile = profileId

        return this.configToTask(config)
    }

    public async queueTaskSettings(taskSettings: TaskSettings, profileId?: string): Promise<void> {
        const newTask = this.settingsToTask(taskSettings)

        if (newTask.taskConfig) newTask.taskConfig.used_profile = profileId || ''

        await this.addTaskToCompressionQueue(newTask)
    }

    public queueTaskConfig(taskConfig: TaskConfig): void {
        // console.log(JSON.stringify(taskConfig));

        const newTask = this.configToTask(taskConfig)
        // console.log(JSON.stringify(newTask));

        // check if id already exists in either queue
        const existsInCompressionQueue = this.compressionQueue.some(
            (t) => t.taskConfig?.id === newTask.taskConfig?.id
        )
        if (existsInCompressionQueue) {
            this.compressionQueue = this.compressionQueue.map((t) => {
                if (t.taskConfig?.id === newTask.taskConfig?.id) {
                    if (newTask.taskConfig && t.taskConfig) {
                        newTask.taskConfig.nyuuCommandOutput = t.taskConfig.nyuuCommandOutput
                        newTask.taskConfig.parCommandOutput = t.taskConfig.parCommandOutput
                        newTask.taskConfig.rarCommandOutput = t.taskConfig.rarCommandOutput
                        newTask.taskConfig.currentStep = t.taskConfig.currentStep
                        newTask.taskConfig.started = t.taskConfig.started
                    }

                    return newTask
                }
                return t
            })
            return
        }

        const existsInUploadQueue = this.uploadQueue.some(
            (t) => t.taskConfig?.id === newTask.taskConfig?.id
        )
        if (existsInUploadQueue) {
            this.uploadQueue = this.uploadQueue.map((t) => {
                if (t.taskConfig?.id === newTask.taskConfig?.id) {
                    if (newTask.taskConfig && t.taskConfig) {
                        newTask.taskConfig.nyuuCommandOutput = t.taskConfig.nyuuCommandOutput
                        newTask.taskConfig.parCommandOutput = t.taskConfig.parCommandOutput
                        newTask.taskConfig.rarCommandOutput = t.taskConfig.rarCommandOutput
                        newTask.taskConfig.currentStep = t.taskConfig.currentStep
                        newTask.taskConfig.started = t.taskConfig.started
                    }

                    return newTask
                }
                return t
            })

            return
        }

        const existingInApproval = this.tasksApproval.find(
            (t) => t.taskConfig?.id === newTask.taskConfig?.id
        )
        if (existingInApproval) {
            console.log(
                'Task ID already exists in approval queue, removing before queuing:',
                newTask.taskConfig?.id
            )
            this.removeApprovalTaskConfig(newTask.taskConfig?.id || '')
        }

        this.addTaskToCompressionQueue(newTask)
    }

    public async unQueueTaskId(id: string): Promise<void> {
        this.removeTaskFromCompressionQueue(id)
        this.removeTaskFromUploadQueue(id)
    }

    private async processCompressionQueue(): Promise<void> {
        if (this.compressionPaused) {
            return
        }

        // Check if upload queue is too full and auto-pause compression
        const config = this.getQueueConfig()
        const uploadQueueSize = this.uploadQueue.filter((t) => !t.taskConfig?.started).length
        if (
            this.compressionAutoPaused &&
            (uploadQueueSize < config.maxUploadQueueBeforePause ||
                config.maxUploadQueueBeforePause === 0)
        ) {
            this.compressionAutoPaused = false
            console.log(
                `Compression auto-resumed: Upload queue now has ${uploadQueueSize} tasks waiting`
            )
        }

        if (this.compressionAutoPaused) {
            return
        }

        if (
            uploadQueueSize >= config.maxUploadQueueBeforePause &&
            config.maxUploadQueueBeforePause > 0
        ) {
            this.compressionAutoPaused = true
            return
        }

        // Count currently running compression workers
        const runningWorkers = this.compressionQueue.filter(
            (t) =>
                t.currentlyRunning &&
                t.taskConfig &&
                [CommandStep.RAR, CommandStep.PAR].includes(t.taskConfig.currentStep)
        ).length

        if (runningWorkers >= config.maxCompressionWorkers) {
            return
        }

        // Find next task to start or continue
        const nextTask = this.compressionQueue.find((t) => {
            if (!t.taskConfig) return false
            if (t.currentlyRunning) return false // Skip if already running

            // Task not started yet and is in compression phase
            if (
                !t.taskConfig.started &&
                [CommandStep.RAR, CommandStep.PAR].includes(t.taskConfig.currentStep)
            ) {
                return true
            }

            // Task is waiting between steps (finished a step but not the whole task)
            if (
                t.taskConfig.started &&
                !t.taskConfig.finished &&
                [CommandStep.RAR, CommandStep.PAR].includes(t.taskConfig.currentStep)
            ) {
                return true
            }

            return false
        })

        if (nextTask && nextTask.taskConfig) {
            await this.runCompressionStep(nextTask)
        }
    }

    private async processUploadQueue(): Promise<void> {
        if (this.uploadPaused) {
            return
        }

        // Count currently running upload workers
        const config = this.getQueueConfig()
        const runningWorkers = this.uploadQueue.filter(
            (t) =>
                t.currentlyRunning && t.taskConfig && t.taskConfig.currentStep === CommandStep.POST
        ).length

        if (runningWorkers >= config.maxUploadWorkers) {
            return
        }

        // Find next task to start or continue
        const nextTask = this.uploadQueue.find((t) => {
            if (!t.taskConfig) return false
            if (t.currentlyRunning) return false // Skip if already running

            // Task not started yet and is in upload phase
            if (!t.taskConfig.started && t.taskConfig.currentStep === CommandStep.POST) {
                return true
            }

            // Task is waiting and ready for upload
            if (
                t.taskConfig.started &&
                !t.taskConfig.finished &&
                t.taskConfig.currentStep === CommandStep.POST
            ) {
                return true
            }

            return false
        })

        if (nextTask && nextTask.taskConfig) {
            await this.runUploadStep(nextTask)
        }
    }

    private async runCompressionStep(task: Task): Promise<void> {
        if (!task.taskConfig) return

        if (!task.taskConfig.started) {
            task.taskConfig.started = true
        }

        Settings.sendWebcontentUpdate('queue-update', this.getQueueStatus())

        try {
            const stepSuccess = await task.runNextStep()

            if (!stepSuccess) {
                this.finishTask(task, true)
                return
            }

            // Advance to next compression step first
            this.advanceCompressionStep(task)

            // Check if compression steps are done after advancing
            if (task.taskConfig.currentStep === CommandStep.POST) {
                // Move task to upload queue
                this.moveTaskToUploadQueue(task)
            }
        } catch (error) {
            console.error('Error running compression step:', error)
            this.finishTask(task, true)
        } finally {
            task.currentlyRunning = false
        }
    }

    private async finishTask(task: Task, error: boolean = false): Promise<void> {
        if (!task.taskConfig) return

        task.finish(error)

        this.removeTaskFromCompressionQueue(task.taskConfig.id)
        this.removeTaskFromUploadQueue(task.taskConfig.id)

        Settings.sendWebcontentUpdate('command-finish', task.taskConfig)
        Settings.sendWebcontentUpdate('queue-update', this.getQueueStatus())
    }

    private async runUploadStep(task: Task): Promise<void> {
        if (!task.taskConfig) return

        if (!task.taskConfig.started) {
            task.taskConfig.started = true
        }

        task.currentlyRunning = true
        Settings.sendWebcontentUpdate('queue-update', this.getQueueStatus())
        try {
            const stepSuccess = await task.runNextStep()
            this.finishTask(task, !stepSuccess)
        } catch (error) {
            console.error('Error running upload step:', error)
            this.finishTask(task, true)
        } finally {
            task.currentlyRunning = false
        }
    }

    private advanceCompressionStep(task: Task): void {
        if (!task.taskConfig) return

        switch (task.taskConfig.currentStep) {
            case CommandStep.RAR:
                task.taskConfig.currentStep = CommandStep.PAR
                break
            case CommandStep.PAR:
                task.taskConfig.currentStep = CommandStep.POST
                break
        }
    }

    private moveTaskToUploadQueue(task: Task): void {
        if (!task.taskConfig) return

        // Remove from compression queue
        this.compressionQueue = this.compressionQueue.filter(
            (t) => t.taskConfig?.id !== task.taskConfig?.id
        )

        // Ensure task is set to POST step and reset started flag so it can be picked up by upload queue
        task.taskConfig.currentStep = CommandStep.POST
        task.taskConfig.started = false
        task.currentlyRunning = false

        // Add to upload queue
        this.uploadQueue.push(task)
    }
    private removeTaskFromCompressionQueue(taskId: string): void {
        this.compressionQueue = this.compressionQueue.filter((t) => t.taskConfig?.id !== taskId)
    }

    private removeTaskFromUploadQueue(taskId: string): void {
        this.uploadQueue = this.uploadQueue.filter((t) => t.taskConfig?.id !== taskId)
    }

    public addApprovalTaskConfig(taskConfig: TaskConfig): void {
        const newTask = this.configToTask(taskConfig)
        this.tasksApproval.push(newTask)
        this.sendApprovalQueueUpdate()
    }

    public removeApprovalTaskConfig(id: string): void {
        this.tasksApproval = this.tasksApproval.filter((ts) => ts.taskConfig?.id !== id)
        this.sendApprovalQueueUpdate()
    }

    public removeMultipleApprovalTaskConfigs(ids: string[]): void {
        this.tasksApproval = this.tasksApproval.filter(
            (ts) => !ids.includes(ts.taskConfig?.id || '')
        )
        this.sendApprovalQueueUpdate()
    }

    public getApprovalTaskConfig(): TaskConfig[] {
        return this.tasksApproval.map((ts) => ts.taskConfig) as TaskConfig[]
    }

    private sendApprovalQueueUpdate(): void {
        const approvalQueue = this.getApprovalTaskConfig()
        Settings.sendWebcontentUpdate('approval-queue-updated', approvalQueue)
    }

    public queueApprovalTask(id: string): void {
        const task = this.tasksApproval.find((ts) => ts.taskConfig?.id === id)
        if (!task) {
            throw new Error('Task ID not found in approval queue')
        }
        this.removeApprovalTaskConfig(id)
        this.addTaskToCompressionQueue(task)
    }

    public queueMultipleApprovalTaskConfigs(ids: string[]): void {
        for (const id of ids) {
            const task = this.tasksApproval.find((ts) => ts.taskConfig?.id === id)
            if (!task) {
                throw new Error(`Task ID ${id} not found in approval queue`)
            }
            this.removeApprovalTaskConfig(id)
            this.addTaskToCompressionQueue(task)
        }
    }

    public saveApprovalTaskConfig(taskConfig: TaskConfig): void {
        const existing = this.tasksApproval.find((ts) => ts.taskConfig?.id === taskConfig.id)
        if (existing) {
            existing.taskConfig = taskConfig
            existing.generateRandoms()
        } else {
            throw new Error('Task ID not found in approval queue')
        }

        this.sendApprovalQueueUpdate()
    }

    private addTaskToCompressionQueue(task: Task): void {
        if (task.taskConfig) {
            task.taskConfig.created_at = Date.now()
        }
        this.compressionQueue.push(task)
        Settings.sendWebcontentUpdate('queue-update', this.getQueueStatus())
    }

    // Updated methods for new queue system
    public getAllTasks(): { compression: Task[]; upload: Task[] } {
        return {
            compression: this.compressionQueue,
            upload: this.uploadQueue
        }
    }

    public getTasks(): Task[] {
        // Legacy method - returns all tasks from both queues
        return [...this.compressionQueue, ...this.uploadQueue]
    }

    public removeTask(id: string): TaskManager {
        this.compressionQueue = this.compressionQueue.filter((task) => task.taskConfig?.id !== id)
        this.uploadQueue = this.uploadQueue.filter((task) => task.taskConfig?.id !== id)
        return this
    }

    public getTask(id: string): Task | undefined {
        return (
            this.compressionQueue.find((task) => task.taskConfig?.id === id) ||
            this.uploadQueue.find((task) => task.taskConfig?.id === id)
        )
    }

    public setTasks(tasks: Task[]): TaskManager {
        // Legacy method - clear both queues and add all tasks to compression queue
        this.compressionQueue = tasks
        this.uploadQueue = []
        return this
    }

    public clearTasks(): TaskManager {
        this.compressionQueue = []
        this.uploadQueue = []
        return this
    }

    public clearCompressionQueue(): TaskManager {
        this.compressionQueue = []
        return this
    }

    public clearUploadQueue(): TaskManager {
        this.uploadQueue = []
        return this
    }

    public getCompressionQueue(): Task[] {
        return this.compressionQueue
    }

    public getUploadQueue(): Task[] {
        return this.uploadQueue
    }

    // Cleanup method
    public destroy(): void {
        if (this.compressionInterval) {
            clearInterval(this.compressionInterval)
            this.compressionInterval = null
        }
        if (this.uploadInterval) {
            clearInterval(this.uploadInterval)
            this.uploadInterval = null
        }
    }
}
