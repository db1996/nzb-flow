// src/main/api/ApiServer.ts
import express, { Express, Request, Response } from 'express'
import http from 'http'
import TaskManager from '../commands/manager/TaskManager'
import fs from 'fs'
import { TaskConfig } from '../types/settings/commands/taskSettings'

interface QueueRequestBody {
    files: string[]
    profileId?: string
    autoQueue?: boolean
}

export class ApiServer {
    private app: Express
    private server: http.Server | null = null

    constructor(
        private port: number,
        private taskManager: TaskManager
    ) {
        this.app = express()
        this.configureMiddleware()
        this.registerRoutes()
    }

    private configureMiddleware() {
        this.app.use(express.json())

        this.app.use((req, res, next) => {
            if (req.headers['x-api-token'] !== 'asdasd') {
                return res.status(401).json({ success: false, error: 'Unauthorized', data: null })
            }
            next()
        })
    }

    // Unified consistent response wrapper
    private respond(
        res: Response,
        success: boolean,
        data: any = null,
        error: string | null = null
    ) {
        return res.json({ success, error, data })
    }

    private registerRoutes() {
        // --- APPROVAL TASK MANAGEMENT -------------------------------------------
        this.app.post('/approve-task', (req: Request, res: Response) => {
            const params = req.body as { id: string }

            if (!params.id) {
                return this.respond(res, false, null, "Missing required query parameter: 'id'")
            }

            try {
                this.taskManager.queueApprovalTask(params.id)
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to approve task')
            }

            console.log('API /approve-task called for task ID:', params.id)
            return this.respond(res, true, { approved: true })
        })

        this.app.post('/approve-multiple-tasks', (req: Request, res: Response) => {
            const body = req.body as { ids: string[] }

            if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
                return this.respond(
                    res,
                    false,
                    null,
                    "Missing required field: 'ids' must be a non-empty array."
                )
            }

            try {
                this.taskManager.queueMultipleApprovalTaskConfigs(body.ids)
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to approve tasks')
            }

            console.log('API /approve-multiple-tasks:', body.ids)
            return this.respond(res, true, { approved: body.ids })
        })

        this.app.post('/reject-task', (req: Request, res: Response) => {
            const params = req.body as { id: string }

            if (!params.id) {
                return this.respond(res, false, null, "Missing required query parameter: 'id'")
            }

            try {
                this.taskManager.removeApprovalTaskConfig(params.id)
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to reject task')
            }

            console.log('API /reject-task:', params.id)
            return this.respond(res, true, { rejected: params.id })
        })

        this.app.post('/reject-multiple-tasks', (req: Request, res: Response) => {
            const body = req.body as { ids: string[] }

            if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
                return this.respond(
                    res,
                    false,
                    null,
                    "Missing required field: 'ids' must be a non-empty array."
                )
            }

            try {
                for (const id of body.ids) {
                    this.taskManager.removeApprovalTaskConfig(id)
                }
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to reject tasks')
            }

            console.log('API /reject-multiple-tasks:', body.ids)
            return this.respond(res, true, { rejected: body.ids })
        })

        this.app.post('/update-approval-task', (req: Request, res: Response) => {
            const body = req.body as { taskConfig: TaskConfig }

            if (!body.taskConfig || !body.taskConfig.id) {
                return this.respond(
                    res,
                    false,
                    null,
                    "Missing required field: 'taskConfig' with valid 'id'."
                )
            }

            try {
                this.taskManager.saveApprovalTaskConfig(body.taskConfig)
                return this.respond(res, true, { saved: body.taskConfig.id })
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to save task')
            }
        })

        // --- TASK QUEUE MANAGEMENT ----------------------------------------------
        this.app.post('/pause-queue', (_req: Request, res: Response) => {
            this.taskManager.pauseAllQueues()
            console.log('API /pause-queue')
            return this.respond(res, true, { paused: true })
        })

        this.app.post('/resume-queue', (_req: Request, res: Response) => {
            this.taskManager.resumeAllQueues()
            console.log('API /resume-queue')
            return this.respond(res, true, { resumed: true })
        })

        this.app.get('/get-queue-status', (_req: Request, res: Response) => {
            const queueStatus = this.taskManager.getQueueStatus()
            const approvalQueue = this.taskManager.getApprovalTaskConfig()

            return this.respond(res, true, {
                queueStatus,
                approvalQueue
            })
        })

        this.app.post('/unqueue-task', (req: Request, res: Response) => {
            const body = req.body as { id: string }

            if (!body.id) {
                return this.respond(res, false, null, "Missing required field: 'id'.")
            }

            try {
                this.taskManager.unQueueTaskId(body.id)
                console.log('API /unqueue-task:', body.id)
                return this.respond(res, true, { unqueued: body.id })
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to remove task from queue')
            }
        })

        this.app.post('/queue-config', (req: Request, res: Response) => {
            const body = req.body as { taskConfig: TaskConfig }

            if (!body.taskConfig || !body.taskConfig.id) {
                return this.respond(
                    res,
                    false,
                    null,
                    "Missing required field: 'taskConfig' with valid 'id'."
                )
            }

            try {
                this.taskManager.queueTaskConfig(body.taskConfig)
                console.log('API /queue-config:', body.taskConfig.id)
                return this.respond(res, true, { queued: body.taskConfig.id })
            } catch (error: any) {
                return this.respond(res, false, null, 'Failed to queue task')
            }
        })

        this.app.post('/queue', (req: Request, res: Response) => {
            const body = req.body as QueueRequestBody
            console.log('API /queue called:', body)

            if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
                return this.respond(
                    res,
                    false,
                    null,
                    "Missing required field: 'files' must be a non-empty array."
                )
            }

            for (const file of body.files) {
                if (!fs.existsSync(file)) {
                    return this.respond(res, false, null, `File does not exist: ${file}`)
                }
            }

            try {
                const newTask = this.taskManager.getFreshTask(body.profileId, body.files)

                if (!newTask || !newTask.taskConfig) {
                    return this.respond(
                        res,
                        false,
                        null,
                        'Failed to create task with provided profile/files.'
                    )
                }

                if (body.autoQueue) {
                    this.taskManager.queueTaskConfig(newTask.taskConfig)
                } else {
                    this.taskManager.addApprovalTaskConfig(newTask.taskConfig)
                }

                console.log('[API] /queue', {
                    profileId: body.profileId,
                    autoQueue: body.autoQueue,
                    count: body.files.length
                })

                return this.respond(res, true, {
                    createdTask: newTask.taskConfig,
                    currentApprovalQueue: this.taskManager.tasksApproval,
                    currentQueue: this.taskManager.getQueueStatus()
                })
            } catch (err: any) {
                console.error('Error creating task:', err)
                return this.respond(res, false, null, err.message ?? 'Failed to create task')
            }
        })
    }

    // --- SERVER MANAGEMENT ---------------------------------------------------
    public start() {
        if (this.server) return
        this.server = this.app.listen(this.port, () => {
            console.log(`API Server running on http://localhost:${this.port}`)
        })
    }

    public stop() {
        if (!this.server) return
        this.server.close(() => {
            console.log('API Server stopped.')
            this.server = null
        })
    }
}
