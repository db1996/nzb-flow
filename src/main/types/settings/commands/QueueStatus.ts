import { TaskConfig } from './taskSettings'

export type QueueStatus = {
    compressionActive: boolean
    uploadActive: boolean
    compressionRunning: number
    compressionRunningConfigs: TaskConfig[]
    uploadRunning: number
    uploadRunningConfigs: TaskConfig[]
    compressionQueued: number
    compressionQueuedConfigs: TaskConfig[]
    uploadQueued: number
    uploadQueuedConfigs: TaskConfig[]
    compressionPaused: boolean
}
