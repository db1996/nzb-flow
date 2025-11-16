import { WebSocketServer, WebSocket } from 'ws'
import Settings from '../classes/Settings'
import { CommandStep } from '../enums/CommandStep'
import { QueueStatus } from '../types/settings/commands/QueueStatus'
import { TaskConfig } from '../types/settings/commands/taskSettings'
import url from 'url'
import { IncomingMessage } from 'http'

export class WebSocketApiServer {
    private wss: WebSocketServer | null = null
    private clients = new Set<WebSocket>()

    /**
     * Start WebSocket Server
     */
    public start() {
        if (this.wss) return // prevent double start
        console.log(`Starting WebSocket server on port ${Settings.allSettings.wsServerPort}...`)

        this.wss = new WebSocketServer({ port: Settings.allSettings.wsServerPort })

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            if (!this.isAuthorized(req)) {
                console.log('WebSocket connection rejected: Unauthorized')
                ws.close(4401, 'Unauthorized')
                return
            }
            this.clients.add(ws)

            ws.on('close', () => {
                this.clients.delete(ws)
            })

            ws.send(
                JSON.stringify({
                    success: true,
                    data: { message: 'Connected to NZBFlow WebSocket' }
                })
            )
        })

        this.initializeHandlers()

        console.log(`WebSocket running on ws://localhost:${Settings.allSettings.wsServerPort}`)
    }

    /**
     * Stop WebSocket Server
     */
    public stop() {
        if (!this.wss) return

        this.unregisterHandlers()

        for (const client of this.clients) {
            client.close()
        }
        this.clients.clear()

        this.wss.close()
        this.wss = null
        console.log(`WebSocket stopped`)
    }

    /**
     * Broadcast a JSON response with your consistent structure
     */
    private broadcast(obj: any) {
        const message = JSON.stringify(obj)

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        }
    }

    private isAuthorized(req: IncomingMessage): boolean {
        if (
            !Settings.allSettings.wsServerApiToken ||
            Settings.allSettings.wsServerApiToken.trim() === ''
        )
            return true // no token = no auth required

        // URL query token
        const parsedUrl = url.parse(req.url ?? '', true)
        const queryToken = parsedUrl.query.token

        if (queryToken === Settings.allSettings.wsServerApiToken) return true

        return false
    }

    /**
     * Connect this WebSocket service to your task manager events.
     * Call this after creating the service.
     */
    public initializeHandlers() {
        Settings.registerWebcontentUpdateCallback(
            'command-progress-percentage',
            (update: { id: string; currentStep: CommandStep; percentage: number }) =>
                this.commandProgressHandler(update)
        )

        Settings.registerWebcontentUpdateCallback('queue-update', (update: QueueStatus) =>
            this.queueUpdateHandler(update)
        )

        Settings.registerWebcontentUpdateCallback('command-finish', (taskConfig: TaskConfig) =>
            this.taskFinishedHandler(taskConfig)
        )

        Settings.registerWebcontentUpdateCallback(
            'approval-queue-updated',
            (update: TaskConfig[]) => this.approvalQueueUpdatedHandler(update)
        )

        console.log('WebSocketService: Attached to events.')
    }

    public unregisterHandlers() {
        Settings.unregisterWebcontentUpdateCallback(
            'command-progress-percentage',
            (update: { id: string; currentStep: CommandStep; percentage: number }) =>
                this.commandProgressHandler(update)
        )
        Settings.unregisterWebcontentUpdateCallback('queue-update', (update: QueueStatus) =>
            this.queueUpdateHandler(update)
        )
        Settings.unregisterWebcontentUpdateCallback('command-finish', (taskConfig: TaskConfig) =>
            this.taskFinishedHandler(taskConfig)
        )
        Settings.unregisterWebcontentUpdateCallback(
            'approval-queue-updated',
            (update: TaskConfig[]) => this.approvalQueueUpdatedHandler(update)
        )
    }

    private commandProgressHandler = (update: {
        id: string
        currentStep: CommandStep
        percentage: number
    }) => {
        this.broadcast({
            success: true,
            data: {
                type: 'command-progress-percentage',
                id: update.id,
                currentStep: update.currentStep,
                percentage: update.percentage
            }
        })
    }

    private queueUpdateHandler = (update: QueueStatus) => {
        this.broadcast({
            success: true,
            data: {
                type: 'queue-update',
                queueStatus: update
            }
        })
    }

    private taskFinishedHandler = (taskConfig: TaskConfig) => {
        this.broadcast({
            success: true,
            data: {
                type: 'task-finished',
                taskConfig: taskConfig
            }
        })
    }

    private approvalQueueUpdatedHandler = (update: TaskConfig[]) => {
        this.broadcast({
            success: true,
            data: {
                type: 'approval-queue-updated',
                approvalQueue: update
            }
        })
    }
}
