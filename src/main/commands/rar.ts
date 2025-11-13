import fs from 'fs'
import path from 'path'
import BaseCommand from './Base/BaseCommand'
import { spawn } from 'child_process'
import Settings from '../classes/Settings'

export default class RarCommand extends BaseCommand {
    public name: string = ''

    public command(): string {
        return this.cmdString(Settings.allSettings.commands.rar)
    }

    public args(): string[] {
        const args: string[] = ['a', '-x*@eaDir/*']

        if (!this._settings.taskSettings.rarSettings.recursion) {
            args.push('-r0')
        }

        args.push('-m0')

        // Ensure file name has .rar extension
        let fileName = this._settings.rarParFilename
        if (path.extname(fileName).toLowerCase() !== '.rar') {
            fileName += '.rar'
        }

        // Output archive
        args.push(this.cmdString(path.join(this._settings.rarParFolderPath, fileName)))

        // Password (escaped)
        if (this._settings.password !== '') {
            const pass = this._settings.password

            args.push(
                `-${this._settings.taskSettings.rarSettings.encryptHeaders ? 'hp' : 'p'}${this.cmdString(pass)}`
            )
        }

        // Volume size (manual or automatic)
        if (!this._settings.taskSettings.rarSettings.automaticVolumes) {
            args.push(`-v${this._settings.taskSettings.rarSettings.volumes}`)
        }

        if (this._settings.taskSettings.rarSettings.solidArchive) {
            args.push('-s')
        }

        // Exclusions
        if (this._settings.taskSettings.rarSettings.excludes.length > 0) {
            args.push(
                ...this._settings.taskSettings.rarSettings.excludes.map((exclude) => `-x${exclude}`)
            )
        }

        args.push('-ep1')

        // Files to include
        if (this._settings.taskSettings.postingSettings.files.length > 0) {
            args.push(...this.cmdStringArray(this._settings.taskSettings.postingSettings.files))
        }

        return args
    }

    public async testConnection(customCommand: string | null = null): Promise<boolean> {
        console.log('Rar command:', customCommand || Settings.allSettings.commands.rar)
        try {
            return new Promise<boolean>((resolve) => {
                try {
                    const sp = spawn(customCommand || Settings.allSettings.commands.rar)
                    // sp.stdout.on('data', (data) => {
                    //     // console.log(`${data}`)
                    // })

                    // sp.stderr.on('data', (data) => {
                    //     // console.error(`${data}`)
                    // })

                    sp.on('close', (code) => {
                        console.log(`RAR process exited with code ${code}`)
                        resolve(code === 0)
                    })
                    sp.on('error', (error) => {
                        console.error('Rar Error:', error)
                        resolve(false)
                    })
                } catch (error) {
                    console.error('Rar Error:', error)
                    resolve(false)
                }
            })
        } catch (error) {
            console.error('Rar Error:', error)
            return false
        }
    }

    public getTotalFilesSize(): number {
        let totalSize = 0

        const calculateSize = (filePath: string) => {
            const stats = fs.statSync(filePath)
            if (stats.isDirectory()) {
                const files = fs.readdirSync(filePath)
                files.forEach((file) => calculateSize(path.join(filePath, file)))
            } else {
                totalSize += stats.size
            }
        }

        this._settings.taskSettings.postingSettings.files.forEach((file) => calculateSize(file))
        return totalSize
    }

    public checkIsProgress(line: string): number {
        // Trim right but not left (RAR lines start with space)
        const trimmed = line.trim()

        // Match a pure percentage line like "0%", " 42%", or "100%"
        const match = trimmed.match(/^(\d{1,3})%$/)

        if (!match) return 0

        const percent = parseInt(match[1], 10)
        return isNaN(percent) ? 0 : percent
    }

    public getVolumeSize(fileSizeMB: number): string {
        if (fileSizeMB < 100) return '50m'
        if (fileSizeMB < 1000) return '100m'
        if (fileSizeMB < 10000) return '200m'
        return '500m'
    }
}
