import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import BaseCommand from './Base/BaseCommand'
import Settings from '../classes/Settings'

export default class ParCommand extends BaseCommand {
    public command(): string {
        return Settings.allSettings.commands.par
    }

    public args(): string[] {
        let totalsize: number = 0
        let files: string[] = []
        console.log('par args', this._settings.rarParFolderPath)

        const parFile = path.join(
            this._settings.rarParFolderPath,
            `${this._settings.rarParFilename}.par2`
        )
        if (this._settings.taskSettings.rarSettings.skipRarCreation) {
            // par the files directly
            console.log('Skipping RAR creation as per settings, paring files directly')
            files = this._settings.taskSettings.postingSettings.files
            try {
                totalsize = files.reduce((acc, file) => {
                    const stats = fs.statSync(file)
                    return acc + stats.size
                }, 0)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                this.commandData.error = error.message
            }
        } else {
            files = fs
                .readdirSync(this._settings.rarParFolderPath)
                .map((file) => path.join(this._settings.rarParFolderPath, file))
            try {
                totalsize = files.reduce((acc, file) => {
                    const stats = fs.statSync(file)
                    return acc + stats.size
                }, 0)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                this.commandData.error = error.message
            }
        }
        const { sliceSize, redundancy } = this.calculateParParams()

        const args: string[] = [
            `-r${redundancy}`, // Set redundancy percentage
            `-s${sliceSize}`,
            '--out',
            this.cmdString(parFile), // Specify output base name
            ...this.cmdStringArray(files)
        ]

        return args
    }

    public calculateParParams(): { sliceSize: string; redundancy: string } {
        let sliceSize: string = '0.5w*10'
        let redundancy: string = '15%'

        if (!this._settings.taskSettings.parSettings.automaticSlices) {
            sliceSize = this._settings.taskSettings.parSettings.slices
        }

        if (!this._settings.taskSettings.parSettings.automaticRedundancy) {
            redundancy = this._settings.taskSettings.parSettings.redundancy
        }

        return { sliceSize, redundancy }
    }

    public checkStderr(message: string): boolean {
        const checks = ['error', 'failed', 'fail']
        return checks.some((check) => message.toLowerCase().includes(check))
    }

    public checkIsProgress(line: string): number {
        // Trim to remove stray newlines/spaces
        const trimmed = line.trim()

        // Match only "Calculating" lines like:
        // Calculating       :  10,85%
        const match = trimmed.match(/^Calculating\s*:\s*([\d.,]+)%/)

        if (!match) return 0

        // Convert comma to dot and parse as float
        const percent = parseFloat(match[1].replace(',', '.'))
        return isNaN(percent) ? 0 : percent
    }

    public async testConnection(customCommand: string | null = null): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            exec(
                (customCommand || Settings.allSettings.commands.par) + ' --help',
                (error, _stdout, stderr) => {
                    if (error) {
                        console.error('ParPar Error:', stderr)
                        resolve(false)
                    } else {
                        console.log('ParPar Output exited with code 0')
                        resolve(true)
                    }
                }
            )
        })
    }
}
