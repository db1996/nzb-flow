import RarCommand from '../rar'
import ParCommand from '../par'
import { CommandStep } from '../../enums/CommandStep'
import { randomUUID } from 'crypto'
import Nyuu from '../nyuu'
import { TaskConfig, TaskSettings } from '../../types/settings/commands/taskSettings'
import Settings from '../../classes/Settings'
import path from 'path'
import fs from 'fs'
import { TaskVariableFile } from '../../types/settings/commands/TaskVariables'
import { ContentTemplate } from '../../classes/ContentTemplate'

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

        if (this.taskConfig.taskSettings.postingSettings.files.length > 0) {
            const duplicate = JSON.parse(
                JSON.stringify(this.taskConfig.taskSettings.postingSettings.files)
            )

            const fname = path.basename(duplicate[0])
            const isFile = fs.lstatSync(duplicate[0]).isFile()
            if (isFile) {
                this.taskConfig.taskVariables.fname = fname.replace(path.extname(duplicate[0]), '')
            } else {
                this.taskConfig.taskVariables.fname = fname
            }
        }

        this.replaceVariables()

        return this
    }

    private preRunChecks(): boolean {
        if (this.taskConfig === null) {
            return false
        }

        this.taskConfig.rarParFilename = this.taskConfig.name

        this.taskConfig.rarParFolderPath = path.join(
            Settings.rarparOutputPath,
            this.taskConfig.name
        )

        this.taskConfig.nzbFile = path.join(Settings.nzbOutputPath, `${this.taskConfig.name}.nzb`)

        // What to do if the folder or NZB file already exists
        if (Settings.allSettings.replaceExistingPostedFiles) {
            if (fs.existsSync(this.taskConfig.rarParFolderPath)) {
                console.log('Removing existing rarpar folder as per settings')
                fs.rmdirSync(this.taskConfig.rarParFolderPath, { recursive: true })
            }
            if (fs.existsSync(this.taskConfig.nzbFile)) {
                console.log('Removing existing NZB file as per settings')
                fs.unlinkSync(this.taskConfig.nzbFile)
            }
        } else {
            if (
                fs.existsSync(this.taskConfig.rarParFolderPath) ||
                fs.existsSync(this.taskConfig.nzbFile)
            ) {
                console.log('Conflict detected with existing folder or NZB file')

                const baseFolder = this.taskConfig.rarParFolderPath
                const baseNzbFile = this.taskConfig.nzbFile.replace('.nzb', '')

                let foundUnique = false
                let currentNumber = 0
                let newFolderPath = `${baseFolder} - ${currentNumber}`
                let newNzbFile = `${baseNzbFile} - ${currentNumber}.nzb`
                while (!foundUnique) {
                    currentNumber++
                    newFolderPath = `${baseFolder} - ${currentNumber}`
                    newNzbFile = `${baseNzbFile} - ${currentNumber}.nzb`

                    const folderPathExists = fs.existsSync(newFolderPath)
                    const nzbFileExists = fs.existsSync(newNzbFile)
                    if (!folderPathExists && !nzbFileExists) {
                        foundUnique = true
                    } else {
                        if (nzbFileExists) {
                            continue
                        }

                        if (folderPathExists) {
                            const existingFiles = fs
                                .readdirSync(this.taskConfig.rarParFolderPath)
                                .filter((file) => file.endsWith('.rar') || file.endsWith('.par2'))

                            if (existingFiles.length === 0) {
                                foundUnique = true
                            }
                        }
                    }
                }
                console.log(
                    'Renaming task to avoid conflicts:',
                    `${this.taskConfig.name} - ${currentNumber}`
                )

                this.taskConfig.name = `${this.taskConfig.name} - ${currentNumber}`
                return this.preRunChecks()
            }
        }

        if (!fs.existsSync(this.taskConfig.rarParFolderPath)) {
            fs.mkdirSync(this.taskConfig.rarParFolderPath, { recursive: true })
        }

        // Get stats for raw files
        const rawFiles = this.recursiveListFiles(this.taskConfig.taskSettings.postingSettings.files)
        const totalSize = rawFiles.reduce((acc, file) => acc + file.size, 0)

        this.taskConfig.taskVariables.raw_size = totalSize
        this.taskConfig.taskVariables.raw_files = rawFiles
        return true
    }

    public recursiveListFiles(filesFolders: string[]): TaskVariableFile[] {
        const result: TaskVariableFile[] = []

        // Helper: walk a directory and push files into result
        const walkDir = (rootDir: string, currentDir: string) => {
            const entries = fs.readdirSync(currentDir)
            for (const entry of entries) {
                const full = path.join(currentDir, entry)
                const stats = fs.statSync(full)
                if (stats.isDirectory()) {
                    walkDir(rootDir, full)
                } else {
                    // archive-relative: <basename(rootDir)>/<path-inside-root>
                    // For files selected as root (rootDir === full) we handle that earlier,
                    // but this logic still works because path.relative(rootDir, full) === entry
                    const relativeInside = path.relative(rootDir, full)
                    // join with the root folder name so the folder becomes top-level in the archive
                    const topName = path.basename(rootDir)
                    // Use posix-style separators for archives (forward slashes)
                    const rel = path.posix.join(topName, ...relativeInside.split(path.sep))
                    result.push({
                        name: path.basename(full),
                        absolutePath: path.resolve(full),
                        relativePath: rel,
                        size: stats.size
                    })
                }
            }
        }

        for (const selected of filesFolders) {
            const stat = fs.statSync(selected)
            if (stat.isDirectory()) {
                // Directory selected: include all files under it, rooted at the directory name
                walkDir(selected, selected)
            } else {
                // File selected: it should appear in the archive root as basename
                result.push({
                    name: path.basename(selected),
                    absolutePath: path.resolve(selected),
                    relativePath: path.basename(selected), // file goes into archive root
                    size: stat.size
                })
            }
        }

        return result
    }

    public recursiveFileSize(files: string[]): number {
        let totalSize = 0
        for (const file of files) {
            const isDir = fs.lstatSync(file).isDirectory()
            if (isDir) {
                const dirFiles = fs.readdirSync(file).map((f) => path.join(file, f))
                totalSize += this.recursiveFileSize(dirFiles)
            } else {
                const stats = fs.statSync(file)
                totalSize += stats.size
            }
        }

        return totalSize
    }

    public async runNextStep(): Promise<boolean> {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        if (!this.currentlyRunning) {
            this.currentlyRunning = true

            if (this.taskConfig.currentStep === CommandStep.RAR) {
                const preRun = this.preRunChecks()
                if (!preRun) {
                    this.currentlyRunning = false
                    return false
                }
            }
        }

        console.log('Running step:', this.taskConfig.currentStep)

        // Skip RAR if configured to do so
        if (
            this.taskConfig.taskSettings.rarSettings.skipRarCreation &&
            this.taskConfig.currentStep === CommandStep.RAR
        ) {
            console.log('Skipping RAR creation as per settings')
            return true
        }

        if (
            this.taskConfig.taskSettings.parSettings.skipParCreation &&
            this.taskConfig.currentStep === CommandStep.PAR
        ) {
            console.log('Skipping PAR creation as per settings')
            return true
        }

        let success = false
        switch (this.taskConfig.currentStep) {
            case CommandStep.RAR:
                success = await this.runRar()
                this.betweenSteps()
                break
            case CommandStep.PAR:
                success = await this.runPar()
                this.betweenSteps()
                break
            case CommandStep.POST:
                success = await this.post()
                break
            case CommandStep.FINISH:
                return true
            case CommandStep.ERROR:
                return false
        }

        return success
    }

    private betweenSteps() {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }

        switch (this.taskConfig.currentStep) {
            case CommandStep.RAR:
                this.fileSizes()
                break
            case CommandStep.PAR:
                this.fileSizes()
                break
            case CommandStep.POST:
                const totalTime =
                    this.taskConfig.taskVariables.rar_time! +
                    this.taskConfig.taskVariables.par_time! +
                    this.taskConfig.taskVariables.nyuu_time!
                this.taskConfig.taskVariables.total_time = totalTime
                break
        }
    }

    public fileSizes() {
        if (this.taskConfig === null) {
            throw new Error('Task settings not set')
        }
        this.taskConfig.taskVariables.rar_size = 0
        this.taskConfig.taskVariables.rar_count = 0

        this.taskConfig.taskVariables.par_size = 0
        this.taskConfig.taskVariables.par_count = 0
        this.taskConfig.taskVariables.nyuu_size = 0

        const taskVariableFiles: TaskVariableFile[] = fs
            .readdirSync(this.taskConfig.rarParFolderPath)
            .map((file) => {
                if (this.taskConfig === null) {
                    return null
                }
                const absolutePath = path.join(this.taskConfig.rarParFolderPath, file)
                if (!fs.existsSync(absolutePath)) {
                    return null
                }

                const relativePath = path.relative(this.taskConfig.rarParFolderPath, absolutePath)

                const stats = fs.statSync(absolutePath)
                return {
                    name: file,
                    absolutePath: absolutePath,
                    relativePath: relativePath,
                    size: stats.size
                } as TaskVariableFile
            })
            .filter((file) => file !== null) as TaskVariableFile[]

        this.taskConfig.taskVariables.rar_files = taskVariableFiles.filter((file) => {
            const ext = path.extname(file.absolutePath).toLowerCase()
            if (ext.startsWith('.r')) {
                return true
            }
            return false
        })

        this.taskConfig.taskVariables.par_files = taskVariableFiles.filter((file) => {
            const ext = path.extname(file.absolutePath).toLowerCase()
            if (ext.startsWith('.par')) {
                return true
            }
            return false
        })

        this.taskConfig.taskVariables.nyuu_files = [
            ...this.taskConfig.taskVariables.rar_files,
            ...this.taskConfig.taskVariables.par_files
        ]

        if (this.taskConfig.taskSettings.rarSettings.skipRarCreation) {
            this.taskConfig.taskVariables.nyuu_files.push(
                ...this.taskConfig.taskVariables.raw_files
            )
        }

        this.taskConfig.taskVariables.rar_size = this.taskConfig.taskVariables.rar_files.reduce(
            (acc, file) => acc + file.size,
            0
        )
        this.taskConfig.taskVariables.rar_count = this.taskConfig.taskVariables.rar_files.length

        this.taskConfig.taskVariables.par_size = this.taskConfig.taskVariables.par_files.reduce(
            (acc, file) => acc + file.size,
            0
        )
        this.taskConfig.taskVariables.par_count = this.taskConfig.taskVariables.par_files.length

        this.taskConfig.taskVariables.nyuu_size = this.taskConfig.taskVariables.nyuu_files.reduce(
            (acc, file) => acc + file.size,
            0
        )

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

        if (!err) {
            const profile = Settings.profiles.find((p) => p.id === this.taskConfig?.used_profile)

            if (profile) {
                for (const [templateId, enabled] of Object.entries(
                    this.taskConfig.taskSettings.contentTemplates
                )) {
                    const contentTemplateSettings = Settings.contentTemplates.find(
                        (ct) => ct.id === templateId
                    )
                    if (contentTemplateSettings) {
                        const contentTemplate = new ContentTemplate(contentTemplateSettings)
                        const result = contentTemplate.getResult(this.taskConfig.taskVariables)

                        this.taskConfig.contentTemplateData.push({
                            active: enabled,
                            contentTemplateId: templateId,
                            content: result,
                            custom_variables: {},
                            fileName: contentTemplateSettings.fileName + '.txt'
                        })
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
        const totalTime = Date.now()

        const rarCommand = new RarCommand(this.taskConfig)
        const success = await rarCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        this.taskConfig.taskVariables.rar_time = Math.floor(Date.now() - totalTime)

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
        const startTime = Date.now()
        const parCommand = new ParCommand(this.taskConfig)
        const success = await parCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        this.taskConfig.taskVariables.par_time = Math.floor(Date.now() - startTime)
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
        const startTime = Date.now()
        const nyuuCommand = new Nyuu(this.taskConfig)
        const success = await nyuuCommand.id(this.taskConfig.id).set(this.taskConfig.name).run()

        const totalTime = Math.floor(Date.now() - startTime)
        this.taskConfig.taskVariables.nyuu_time = totalTime

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

        if (this.taskConfig.taskVariables.nyuu_size !== null) {
            this.replaceSizeVariable('total_size', this.taskConfig.taskVariables.nyuu_size)
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
            this.replaceTimeVariable('rar_time', this.taskConfig.taskVariables.rar_time)
        }

        if (this.taskConfig.taskVariables.par_time !== null) {
            this.replaceTimeVariable('par_time', this.taskConfig.taskVariables.par_time)
        }

        if (this.taskConfig.taskVariables.nyuu_time !== null) {
            this.replaceTimeVariable('nyuu_time', this.taskConfig.taskVariables.nyuu_time)
        }

        if (this.taskConfig.taskVariables.total_time !== null) {
            this.replaceTimeVariable('total_time', this.taskConfig.taskVariables.total_time)
        }
    }

    private replaceTimeVariable(variable: string, timeInMs: number) {
        const timeInSeconds = timeInMs / 1000

        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = timeInSeconds % 60
        this.replaceVariableInConfigs(`${variable}_human`, `${minutes}m ${seconds}s`)
        this.replaceVariableInConfigs(`${variable}`, timeInMs.toString())
    }

    public replaceSizeVariable(variable: string, sizeInBytes: number) {
        const sizeInMB = Math.ceil(sizeInBytes / (1024 * 1024))
        const sizeInKb = Math.ceil(sizeInBytes / 1024)
        const sizeInGb = Math.ceil(sizeInBytes / (1024 * 1024 * 1024))
        this.replaceVariableInConfigs(`${variable}_gb`, sizeInGb.toString())
        this.replaceVariableInConfigs(`${variable}_kb`, sizeInKb.toString())
        this.replaceVariableInConfigs(`${variable}_mb`, sizeInMB.toString())

        if (sizeInGb > 0) {
            this.replaceVariableInConfigs(`${variable}_human`, `${sizeInGb} GB`)
        } else if (sizeInMB > 0) {
            this.replaceVariableInConfigs(`${variable}_human`, `${sizeInMB} MB`)
        } else {
            this.replaceVariableInConfigs(`${variable}_human`, `${sizeInKb} KB`)
        }
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

        this.taskConfig.contentTemplateData.map((ct) => {
            ct.fileName = ct.fileName.split(`{${variable}}`).join(value)
            return ct
        })
    }
}
