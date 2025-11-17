import { spawn } from 'child_process'
import { randomUUID } from 'crypto'
import CommandData from '../../types/settings/commands/commandData'
import Settings from '../../classes/Settings'
import { TaskConfig } from '../../types/settings/commands/taskSettings'
import { CommandStep } from '../../enums/CommandStep'
import fs from 'fs'

export default class BaseCommand {
    public taskId: string = ''
    public name: string = ''
    public commandData: CommandData = new CommandData()
    public _settings: TaskConfig

    public constructor(taskConfig?: TaskConfig) {
        this._settings = taskConfig ?? Settings.getNewTaskConfig(Settings.getNewTaskSettings())
    }

    public id(id: string) {
        this.taskId = id
        return this
    }

    public set(name: string, prefix: string = '') {
        this.name = prefix + name
        return this
    }

    public async run(): Promise<boolean> {
        if (this.taskId === '') this.taskId = randomUUID().toString()

        try {
            console.log('making rarpar', Settings.rarparOutputPath)

            if (!fs.existsSync(Settings.rarparOutputPath)) {
                fs.mkdirSync(Settings.rarparOutputPath, { recursive: true })
            }
        } catch (error) {
            this.commandData.error += `Failed to create RAR/PAR folder path: ${error}\n`
            console.log('Error happened', error)

            return false
        }

        return new Promise<boolean>((resolve) => {
            try {
                this.commandData.error = ''
                this.commandData.output = ''
                this.commandData.executedCommand = ''

                const command = this.command()
                const args = this.args()

                if (this.commandData.error !== '') {
                    console.error(this.commandData.error)
                    resolve(false)
                    return
                }

                this.commandData.executedCommand = `${command} ${args.join(' ')}`
                console.log(`Executing: ${this.commandData.executedCommand}`)

                const spawnOptions = process.platform === 'win32' ? { shell: true } : {}
                const sp = spawn(command, args, spawnOptions)

                sp.stdout.on('data', (data) => {
                    const message = Settings.sanitize(data.toString())
                    if (this._settings.currentStep === CommandStep.PAR) {
                    }

                    if (this.checkIsProgress(message) > 0) {
                        this.progressPercentage(message)
                        return
                    } else {
                        if (this.checkStderr(message)) {
                            this.progress(message, 'stderr')
                        } else {
                            this.progress(message, 'stdout')
                        }
                    }
                })

                sp.stderr.on('data', (data) => {
                    const message = Settings.sanitize(data.toString())
                    if (this.checkIsProgress(message) > 0) {
                        this.progressPercentage(message)
                        return
                    } else {
                        if (this.checkStderr(message)) {
                            this.progress(message, 'stderr')
                        } else {
                            this.progress(message, 'stdout')
                        }
                    }
                })

                sp.on('error', (err) => {
                    this.commandData.exitCode = 1
                    this.commandData.error += `Process error: ${err.message}\n`
                    resolve(false)
                })

                sp.on('close', (code) => {
                    this.commandData.exitCode = code
                    this.commandData.output += `Command exited with code ${code}\n`
                    if (code !== 0) {
                        this.commandData.error += `Command exited with code ${code}\n`
                    }
                    console.log(`Command exited with code ${code}`)
                    resolve(code === 0)
                })
            } catch (error) {
                this.commandData.error += `${error}\n`
                resolve(false)
            }
        })
    }

    private progress(message: string, type: 'stdout' | 'stderr' = 'stdout') {
        this.commandData.output += `${message}\n`
        if (type === 'stderr') {
            this.commandData.error += `${message}\n`
        }
    }

    private progressPercentage(message: string) {
        if (this.checkIsProgress(message) === 0) {
            return
        }

        this.commandData.lastKnownProgress = this.checkIsProgress(message)

        Settings.sendWebcontentUpdate('command-progress-percentage', {
            id: this.taskId,
            currentStep: this._settings.currentStep,
            percentage: this.commandData.lastKnownProgress
        })
    }

    // checks if it is actually an error, true if it is
    public checkStderr(message: string): boolean {
        if (message.includes('Error')) {
            return true
        }
        return true
    }

    public checkIsProgress(_message: string): number {
        return 0
    }

    // Sanitize a string for shell safety and wrap in quotes
    protected cmdString(str: string): string {
        let sanitized = str.replace(/"/g, '\\"')

        if (process.platform === 'win32' && this._settings.currentStep !== CommandStep.POST) {
            sanitized = sanitized.replace(/([&|<>^%])/g, '^$1')
        }

        return `"${sanitized}"`
    }

    // Sanitize and quote each string in an array
    protected cmdStringArray(strs: string[], prefix?: string): string[] {
        return strs.map((str) => this.cmdString((prefix ?? '') + str))
    }

    public command(): string {
        return ''
    }
    public args(): string[] {
        return []
    }
}
