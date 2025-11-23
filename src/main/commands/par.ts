import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import BaseCommand from './Base/BaseCommand'
import Settings from '../classes/Settings'
import { computePar2Parameters } from '../classes/Par2Utils'

export default class ParCommand extends BaseCommand {
    public command(): string {
        return Settings.allSettings.commands.par
    }

    public args(): string[] {
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
        } else {
            files = fs
                .readdirSync(this._settings.rarParFolderPath)
                .map((file) => path.join(this._settings.rarParFolderPath, file))
        }

        let rawSize = 0

        if (this._settings.taskVariables.rar_size !== null) {
            rawSize = this._settings.taskVariables.rar_size
            console.log('size found by rar_size')
        } else {
            if (this._settings.taskVariables.raw_size !== null) {
                rawSize = this._settings.taskVariables.raw_size
                console.log('size found by raw_size')
            }
        }

        if (rawSize === 0) {
            // Fallback: calculate size from files
            rawSize = files.reduce((acc, file) => {
                try {
                    const stats = fs.statSync(file)
                    return acc + stats.size
                } catch (err) {
                    console.error(`Error getting size for file ${file}:`, err)
                    return acc
                }
            }, 0)
            console.log('size calculated from files as fallback')
        }

        const sizes = {
            sliceSize: this._settings.taskSettings.parSettings.slices,
            redundancy: this._settings.taskSettings.parSettings.redundancy
        }

        if (this._settings.taskSettings.parSettings.automaticParams) {
            const { sliceSize, redundancy } = computePar2Parameters(
                rawSize,
                this._settings.taskSettings.nyuuSettings.articleSize
            )

            sizes.sliceSize = sliceSize
            sizes.redundancy = redundancy
        }

        console.log(`Calculated PAR2 params with size ${rawSize}:`, sizes)

        // const { sliceSize, redundancy } =

        const args: string[] = [
            `-r${sizes.redundancy}`, // Set redundancy percentage
            `-s${sizes.sliceSize}`,
            '--min-input-slices',
            this._settings.taskSettings.parSettings.minSlices,
            '--max-input-slices',
            this._settings.taskSettings.parSettings.maxSlices,
            '--out',
            this.cmdString(parFile), // Specify output base name
            ...this.cmdStringArray(files)
        ]

        return args
    }

    public checkStderr(message: string): boolean {
        const checks = ['error', 'failed', 'fail']
        return checks.some((check) => message.toLowerCase().includes(check))
    }

    public checkIsProgress(line: string): number {
        const trimmed = line.trim()

        // parpar output example:
        // Calculating       :  10,85%
        const match = trimmed.match(/^Calculating\s*:\s*([\d.,]+)%/)

        if (!match) return 0

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
