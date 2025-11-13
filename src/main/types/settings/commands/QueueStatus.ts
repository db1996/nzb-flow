import { TaskConfig } from "./taskSettings"

export type QueueStatus = {
    compressionActive: boolean
    uploadActive: boolean
    compressionRunning: number
    compressionRunningSettings: TaskConfig[]
    uploadRunning: number
    uploadRunningSettings: TaskConfig[]
    compressionQueued: number
    compressionQueuedSettings: TaskConfig[]
    uploadQueued: number
    uploadQueuedSettings: TaskConfig[]
    compressionPaused: boolean
}
