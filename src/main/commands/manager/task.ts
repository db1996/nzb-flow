import RarCommand from '../rar'
import ParCommand from '../par'
import { CommandStep } from '../../enums/CommandStep'
import { randomUUID } from 'crypto'
import Nyuu from '../nyuu'
import { TaskConfig, TaskSettings } from '../../types/settings/commands/taskSettings'
import Settings from '../../classes/Settings'
import path from 'path'
import fs from 'fs'

export default class Task {
    public currentlyRunning: boolean = false
    public taskConfig: TaskConfig | null = null

    public setSettings(settings: TaskSettings): Task {
        this.taskConfig = Settings.getNewTaskConfig(settings)
        return this
    }

    public setConfig(config: TaskConfig): Task {
        this.taskConfig = config
        return this
    }

    public generateRandoms(): Task {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        if (this.taskConfig.id === '') {
            this.taskConfig.id = randomUUID().toString()
        }

        if (this.taskConfig.name === '') {
            this.taskConfig.name = Settings.generateName(
                this.taskConfig.taskSettings.postingSettings.nameSettings
            )
        }

        if (this.taskConfig.password === '') {
            this.taskConfig.password = Settings.generateName(
                this.taskConfig.taskSettings.postingSettings.passwordSettings
            )
        }

        if (this.taskConfig.taskSettings.postingSettings.postFromRandomized) {
            this.taskConfig.taskSettings.postingSettings.post_from = `${Settings.generateString(6)}@${Settings.generateString(4)}.${Settings.generateString(2)}`
        }

        this.taskConfig.rarParFilename = this.taskConfig.name

        if (this.taskConfig.taskSettings.postingSettings.files.length > 0) {
            const fname = path
                .basename(this.taskConfig.taskSettings.postingSettings.files[0])
                .replace(path.extname(this.taskConfig.taskSettings.postingSettings.files[0]), '')
            this.taskConfig.taskVariables.fname = fname
        }

        this.taskConfig.rarParFolderPath = path.join(
            Settings.allSettings.rarparFolder,
            this.taskConfig.name
        )

        this.replaceVariables()

        return this
    }

    public replaceSizeVariable(variable: string, sizeInBytes: number) {
        const sizeInMB = Math.ceil(sizeInBytes / (1024 * 1024))
        const sizeInKb = Math.ceil(sizeInBytes / 1024)
        const sizeInGb = Math.ceil(sizeInBytes / (1024 * 1024 * 1024))
        this.replaceVariableInConfigs(`${variable}_gb`, sizeInGb.toString())
        this.replaceVariableInConfigs(`${variable}_kb`, sizeInKb.toString())
        this.replaceVariableInConfigs(`${variable}_mb`, sizeInMB.toString())
    }

    public replaceVariableInConfigs(variable: string, value: string) {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        this.taskConfig.name = this.taskConfig.name.split(`{${variable}}`).join(value)
        this.taskConfig.taskSettings.nyuuSettings.subject =
            this.taskConfig.taskSettings.nyuuSettings.subject.split(`{${variable}}`).join(value)
        this.taskConfig.rarParFilename = this.taskConfig.rarParFilename
            .split(`{${variable}}`)
            .join(value)
        this.taskConfig.rarParFolderPath = this.taskConfig.rarParFolderPath
            .split(`{${variable}}`)
            .join(value)
    }

    public async runNextStep(): Promise<boolean> {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        console.log('Running step:', this.taskConfig.currentStep)

        // Skip RAR if configured to do so
        if (
            this.taskConfig.taskSettings.rarSettings.skipRarCreation &&
            this.taskConfig.currentStep === CommandStep.RAR
        ) {
            console.log('Skipping RAR creation as per settings')
            this.taskConfig.currentStep = CommandStep.PAR
        }

        if (
            this.taskConfig.taskSettings.parSettings.skipParCreation &&
            this.taskConfig.currentStep === CommandStep.PAR
        ) {
            console.log('Skipping PAR creation as per settings')
            this.taskConfig.currentStep = CommandStep.POST
        }

        Settings.mainWindow?.webContents.send('command-progress', {
            id: this.taskConfig.id,
            currentStep: this.taskConfig.currentStep,
            type: 'stdout',
            message: 'Starting step...'
        })

        let success = false
        switch (this.taskConfig.currentStep) {
            case CommandStep.RAR:
                success = await this.runRar()
                break
            case CommandStep.PAR:
                success = await this.runPar()
                this.fileSizes()
                break
            case CommandStep.POST:
                success = await this.post()
                break
            case CommandStep.FINISH:
                return true
            case CommandStep.ERROR:
                return false
        }

        if (success) {
            Settings.mainWindow?.webContents.send('command-progress', {
                id: this.taskConfig.id,
                currentStep: this.taskConfig.currentStep,
                type: 'stdout',
                message: 'Step completed successfully'
            })
        }

        return success
    }

    public fileSizes() {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }
        this.taskConfig.taskVariables.rar_size = 0
        this.taskConfig.taskVariables.rar_count = 0

        this.taskConfig.taskVariables.par_size = 0
        this.taskConfig.taskVariables.par_count = 0
        this.taskConfig.taskVariables.total_size = 0
        const files = fs
            .readdirSync(this.taskConfig.rarParFolderPath)
            .map((file) => {
                if (this.taskConfig === null) {
                    return null
                }
                const ext = path.extname(file).toLowerCase()
                if (ext.startsWith('par') || ext.startsWith('.r')) {
                    const stats = fs.statSync(path.join(this.taskConfig.rarParFolderPath, file))
                    if (ext.startsWith('.r')) {
                        this.taskConfig.taskVariables.rar_size! += stats.size
                        this.taskConfig.taskVariables.rar_count! += 1
                    } else {
                        this.taskConfig.taskVariables.par_size! += stats.size
                        this.taskConfig.taskVariables.par_count! += 1
                    }
                }

                return path.join(this.taskConfig.rarParFolderPath, file)
            })
            .filter((file) => file !== null) as string[]

        this.taskConfig.taskVariables.total_size =
            this.taskConfig.taskVariables.rar_size + this.taskConfig.taskVariables.par_size
        this.taskConfig.rarParFiles = files

        this.replaceVariables()
    }

    public finish(err: boolean = false): void {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }
        this.taskConfig.currentStep = CommandStep.FINISH
        if (err) {
            this.taskConfig.currentStep = CommandStep.ERROR
        }

        this.taskConfig.error =
            this.taskConfig.rarCommandOutput.error +
            '\n' +
            this.taskConfig.parCommandOutput.error +
            '\n' +
            this.taskConfig.nyuuCommandOutput.error
        this.taskConfig.finished = true

        if (
            !this.taskConfig.taskSettings.postingSettings.saveRarPars &&
            this.taskConfig.currentStep !== CommandStep.ERROR
        ) {
            console.log('deleting rarpars', this.taskConfig.rarParFolderPath)
            if (fs.existsSync(this.taskConfig.rarParFolderPath)) {
                fs.rmSync(this.taskConfig.rarParFolderPath, { recursive: true })
            }
        }

        if (
            this.taskConfig.taskSettings.postingSettings.deleteUploadedFiles &&
            this.taskConfig.currentStep !== CommandStep.ERROR
        ) {
            console.log(
                'deleting uploaded files',
                this.taskConfig.taskSettings.postingSettings.files
            )
            for (const file of this.taskConfig.taskSettings.postingSettings.files) {
                if (fs.existsSync(file)) {
                    // check if file is directory or file
                    const stat = fs.lstatSync(file)
                    if (stat.isDirectory()) {
                        fs.rmSync(file, { recursive: true })
                        continue
                    } else {
                        fs.unlinkSync(file)
                    }
                }
            }
        }

        this.replaceVariables()

        // save to json file
        Settings.saveTask(this.taskConfig)
    }

    public async runRar(): Promise<boolean> {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }
        this.taskConfig.rarCommandOutput.started = true
        const rarCommand = new RarCommand(this.taskConfig)
        const success = await rarCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        this.taskConfig.rarCommandOutput.executedCommand = rarCommand.commandData.executedCommand
        this.taskConfig.rarCommandOutput.output = rarCommand.commandData.output
        this.taskConfig.rarCommandOutput.error = rarCommand.commandData.error
        this.taskConfig.rarCommandOutput.exitCode = rarCommand.commandData.exitCode
        this.taskConfig.rarCommandOutput.finished = true

        return success
    }

    public async runPar(): Promise<boolean> {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }
        if (this.taskConfig.taskSettings.rarSettings === null) {
            this.taskConfig.error = 'No rar information found'
            return Promise.resolve(false)
        }
        this.taskConfig.parCommandOutput.started = true
        const parCommand = new ParCommand(this.taskConfig)
        const success = await parCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        this.taskConfig.parCommandOutput.executedCommand = parCommand.commandData.executedCommand
        this.taskConfig.parCommandOutput.output = parCommand.commandData.output
        this.taskConfig.parCommandOutput.error = parCommand.commandData.error
        this.taskConfig.parCommandOutput.exitCode = parCommand.commandData.exitCode
        this.taskConfig.parCommandOutput.finished = true

        return success
    }

    public async post(): Promise<boolean> {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        if (
            this.taskConfig.taskSettings.rarSettings === null ||
            this.taskConfig.taskSettings.parSettings === null
        ) {
            this.taskConfig.error = 'No rar or par information found'
            return Promise.resolve(false)
        }
        this.taskConfig.nyuuCommandOutput.started = true
        const nyuuCommand = new Nyuu(this.taskConfig)
        const success = await nyuuCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        this.taskConfig.nzbFile = nyuuCommand.nzbFile

        this.taskConfig.nyuuCommandOutput.executedCommand = nyuuCommand.commandData.executedCommand
        this.taskConfig.nyuuCommandOutput.output = nyuuCommand.commandData.output
        this.taskConfig.nyuuCommandOutput.error = nyuuCommand.commandData.error
        this.taskConfig.nyuuCommandOutput.exitCode = nyuuCommand.commandData.exitCode
        this.taskConfig.nyuuCommandOutput.finished = true

        return success
    }

    public replaceVariables() {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        if (this.taskConfig.taskVariables.fname !== null) {
            this.replaceVariableInConfigs('fname', this.taskConfig.taskVariables.fname)
        }

        if (this.taskConfig.taskVariables.rar_size !== null) {
            this.replaceSizeVariable('rar_size', this.taskConfig.taskVariables.rar_size)
        }

        if (this.taskConfig.taskVariables.par_size !== null) {
            this.replaceSizeVariable('par_size', this.taskConfig.taskVariables.par_size)
        }

        if (this.taskConfig.taskVariables.total_size !== null) {
            this.replaceSizeVariable('total_size', this.taskConfig.taskVariables.total_size)
        }

        if (this.taskConfig.taskVariables.rar_count !== null) {
            this.replaceVariableInConfigs(
                'rar_count',
                this.taskConfig.taskVariables.rar_count.toString()
            )
        }

        if (this.taskConfig.taskVariables.par_count !== null) {
            this.replaceVariableInConfigs(
                'par_count',
                this.taskConfig.taskVariables.par_count.toString()
            )
        }

        if (this.taskConfig.taskVariables.rar_time !== null) {
            const minutesSeconds = `${Math.floor(this.taskConfig.taskVariables.rar_time / 60)}m ${this.taskConfig.taskVariables.rar_time % 60}s`
            this.replaceVariableInConfigs(
                'rar_time',
                this.taskConfig.taskVariables.rar_time.toString()
            )
            this.replaceVariableInConfigs('rar_time_min_sec', minutesSeconds)
        }

        if (this.taskConfig.taskVariables.par_time !== null) {
            const minutesSeconds = `${Math.floor(this.taskConfig.taskVariables.par_time / 60)}m ${this.taskConfig.taskVariables.par_time % 60}s`
            this.replaceVariableInConfigs(
                'par_time',
                this.taskConfig.taskVariables.par_time.toString()
            )
            this.replaceVariableInConfigs('par_time_min_sec', minutesSeconds)
        }

        if (this.taskConfig.taskVariables.nyuu_time !== null) {
            const minutesSeconds = `${Math.floor(this.taskConfig.taskVariables.nyuu_time / 60)}m ${this.taskConfig.taskVariables.nyuu_time % 60}s`
            this.replaceVariableInConfigs(
                'nyuu_time',
                this.taskConfig.taskVariables.nyuu_time.toString()
            )
            this.replaceVariableInConfigs('nyuu_time_min_sec', minutesSeconds)
        }

        if (this.taskConfig.taskVariables.total_time !== null) {
            const minutesSeconds = `${Math.floor(this.taskConfig.taskVariables.total_time / 60)}m ${this.taskConfig.taskVariables.total_time % 60}s`
            this.replaceVariableInConfigs(
                'total_time',
                this.taskConfig.taskVariables.total_time.toString()
            )
            this.replaceVariableInConfigs('total_time_min_sec', minutesSeconds)
        }

        for (const [key, value] of Object.entries(this.taskConfig.taskVariables)) {
            if (value !== null) {
                this.replaceVariableInConfigs(key, value.toString())
            }
        }
    }
}
