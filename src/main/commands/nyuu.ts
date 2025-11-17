import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import BaseCommand from './Base/BaseCommand'
import Settings from '../classes/Settings'
import { randomUUID } from 'crypto'

export default class Nyuu extends BaseCommand {
    public nzbFile: string = ''

    public args(): string[] {
        const server = Settings.allSettings.servers.find(
            (s) => s.id === this._settings.taskSettings.serverId
        )

        if (!server) {
            this.commandData.error = `Server with ID ${this._settings.taskSettings.serverId} not found`
            return []
        }

        const args: string[] = [
            '--host',
            this.cmdString(server.server),
            '--port',
            server.port.toString(),
            '--user',
            this.cmdString(server.username),
            '--password',
            this.cmdString(server.password),
            '--connections',
            server.connections.toString(),
            '--groups',
            this._settings.taskSettings.postingSettings.post_groups
        ]

        if (this._settings.taskSettings.postingSettings.post_from !== '') {
            args.push('--from', this._settings.taskSettings.postingSettings.post_from)
        }

        if (server.ssl) {
            args.push('--ssl')
        }

        if (this._settings.name !== '') {
            args.push('--nzb-title', this.cmdString(this._settings.name))
        }

        if (this._settings.taskSettings.nyuuSettings.checkConnections > 0) {
            args.push(
                '--check-connections',
                this._settings.taskSettings.nyuuSettings.checkConnections.toString()
            )
        }

        args.push('--check-tries', this._settings.taskSettings.nyuuSettings.checkTries.toString())
        args.push('--check-delay', this._settings.taskSettings.nyuuSettings.checkDelay)
        args.push('--check-retry-delay', this._settings.taskSettings.nyuuSettings.checkRetryDelay)
        args.push(
            '--check-post-tries',
            this._settings.taskSettings.nyuuSettings.checkPostTries.toString()
        )
        args.push(
            '--check-queue-size',
            this._settings.taskSettings.nyuuSettings.checkQueueSize.toString()
        )

        if (this._settings.taskSettings.postingSettings.obfuscateYencName) {
            const uuid = randomUUID().toString()
            args.push('--yenc-name', this.cmdString(uuid))
        } else if (this._settings.taskSettings.nyuuSettings.yencNameOverride) {
            args.push(
                '--yenc-name',
                this.cmdString(this._settings.taskSettings.nyuuSettings.yencName)
            )
        }

        if (this._settings.taskSettings.postingSettings.obfuscateSubject) {
            const uuid = randomUUID().toString()
            args.push('--subject', this.cmdString(uuid))
        } else if (this._settings.taskSettings.nyuuSettings.subjectOverride) {
            args.push('--subject', this.cmdString(this._settings.taskSettings.nyuuSettings.subject))
        }

        if (this._settings.taskSettings.postingSettings.obfuscateFilename) {
            const uuid = randomUUID().toString()
            args.push('--filename', this.cmdString(uuid))
        } else if (this._settings.taskSettings.nyuuSettings.filenameOverride) {
            args.push(
                '--filename',
                this.cmdString(this._settings.taskSettings.nyuuSettings.filename)
            )
        }

        if (this._settings.taskSettings.nyuuSettings.dateOverride) {
            args.push('--date', this.cmdString(this._settings.taskSettings.nyuuSettings.date))
        }

        if (this._settings.taskSettings.nyuuSettings.messageIdOverride) {
            args.push(
                '--message-id',
                this.cmdString(this._settings.taskSettings.nyuuSettings.messageId)
            )
        }

        if (this._settings.taskSettings.nyuuSettings.articleEncodingOverride) {
            args.push(
                '--article-encoding',
                this.cmdString(this._settings.taskSettings.nyuuSettings.articleEncoding)
            )
        }

        if (
            this._settings.password !== '' &&
            this._settings.taskSettings.nyuuSettings.includePasswordInNzb
        ) {
            args.push('--nzb-password', this.cmdString(this._settings.password))
        }

        args.push('--article-size', this._settings.taskSettings.nyuuSettings.articleSize)

        args.push('--nzb-file-mode', 'defer')
        args.push('--progress', 'stdout')

        const outputPath = path.join(Settings.nzbOutputPath, this.name)
        this.nzbFile = outputPath + '.nzb'
        args.push('-o', this.cmdString(this.nzbFile), '-O')

        // Collect all files in the rarparFolder for upload
        const files = fs
            .readdirSync(this._settings.rarParFolderPath)
            .map((file) => path.join(this._settings.rarParFolderPath, file))

        if (this._settings.taskSettings.rarSettings.skipRarCreation) {
            this._settings.taskSettings.postingSettings.files.forEach((file) => {
                if (!files.includes(file)) {
                    files.push(file)
                }
            })
        }

        if (files.length === 0) {
            this.commandData.error = `No files found in ${this._settings.rarParFolderPath}`
        }
        const sorted = files.sort((a, b) => {
            if (a.endsWith('.rar')) return -1
            if (b.endsWith('.rar')) return 1
            return 0
        })

        args.push(...sorted.map((file) => `"${file}"`))

        return args
    }

    public command(): string {
        return Settings.allSettings.commands.nyuu
    }

    public checkStderr(message: string): boolean {
        const checks = ['error', 'failed', 'fail']
        return checks.some((check) => message.toLowerCase().includes(check))
    }

    public checkIsProgress(line: string): number {
        // Nyuu percentage line example:
        // [0G[0K  2.67%  [..
        const isProgress = line.startsWith('\u001b[0G\u001b[0K') || line.startsWith('[0G[0K')
        if (!isProgress) return 0

        // Get the exact percentage
        const match = line.match(/(\d{1,3}\.\d{2})%/)
        if (match) {
            return parseFloat(match[1])
        }

        return 0
    }

    public async testCommand(customCommand: string | null = null): Promise<boolean> {
        console.log('Nyuu command:', customCommand || Settings.allSettings.commands.nyuu)
        return new Promise<boolean>((resolve) => {
            exec(
                (customCommand || Settings.allSettings.commands.nyuu) + ' --help',
                (error, _stdout, stderr) => {
                    if (error) {
                        console.error('Nyuu Error:', stderr)
                        resolve(false)
                    } else {
                        console.log('Nyuu Output exited with code 0')
                        resolve(true)
                    }
                }
            )
        })
    }

    public async testConnection(customCommand: string | null = null): Promise<boolean> {
        if (!(await this.testCommand(customCommand))) {
            return false
        }

        return true
    }
}
