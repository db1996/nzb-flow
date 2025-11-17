import path from 'node:path'
import { AllSettings, AllSettingsYupSchema } from '../types/settings/AllSettings'
import { app } from 'electron'
import fs from 'fs'
import { RandomSettings } from '../types/settings/RandomSettings'
import {
    TaskConfig,
    TaskConfigYupSchema,
    TaskSettings,
    TaskSettingsYupSchema
} from '../types/settings/commands/taskSettings'
import { ServerSettings } from '../types/settings/ServerSettings'
import { ProfileSettings, ProfileSettingsYupSchema } from '../types/settings/ProfileSettings'
import { randomUUID } from 'crypto'
import Utils from './Utils'
import Migrator from './Migrator'
import { FolderSettings, FolderSettingsYupSchema } from '../types/settings/FolderSettings'
import { FolderWatched } from '../types/FolderWatched'
import TaskManager from '../commands/manager/TaskManager'

export default class Settings {
    private static loaded: boolean = false

    static allSettingsPath = path.join(app.getPath('userData'), 'settings.json')
    static defaultNzbOutputFolder = path.join(app.getPath('userData'), 'nzbs')
    static defaultRarparFolder = path.join(app.getPath('userData'), 'rarpars')
    static defaultTaskHistoryPath = path.join(app.getPath('userData'), 'history-log')
    static defaultProfileSettingsPath = path.join(app.getPath('userData'), 'profiles')
    static defaultFolderSettingsPath = path.join(app.getPath('userData'), 'folder-monitoring')

    static profiles: ProfileSettings[] = []

    static folders: FolderSettings[] = []
    static folderWatched: Record<string, FolderWatched> = {}

    static historyTasks: TaskConfig[] = []

    static historyTasksPromise: Promise<TaskConfig[]> | null = null

    static mainWindow: Electron.BrowserWindow | null = null

    static allSettings: AllSettings = AllSettingsYupSchema.cast({})

    static taskManager: TaskManager | null = null

    static async load(
        forceReload: boolean = false,
        taskManager: TaskManager | null = null
    ): Promise<void> {
        if (taskManager !== null) {
            Settings.taskManager = taskManager
        }

        if (Settings.loaded && !forceReload) {
            return
        }
        Settings.loaded = true

        Settings.allSettingsPath = path.join(app.getPath('userData'), 'settings.json')
        console.log('settings path:', Settings.allSettingsPath)
        Settings.defaultTaskHistoryPath = path.join(app.getPath('userData'), 'history-log')
        Settings.defaultProfileSettingsPath = path.join(app.getPath('userData'), 'profiles')
        Settings.defaultFolderSettingsPath = path.join(app.getPath('userData'), 'folder-monitoring')
        Settings.defaultNzbOutputFolder = path.join(app.getPath('userData'), 'nzbs')
        Settings.defaultRarparFolder = path.join(app.getPath('userData'), 'rarpars')

        if (!fs.existsSync(path.dirname(Settings.allSettingsPath))) {
            fs.mkdir(path.dirname(Settings.allSettingsPath), { recursive: true }, (err) => {
                if (err) {
                    console.error('Error creating settings directory', err)
                }
            })
        }

        await Settings.loadMainSettings()

        Settings.makePaths()

        await Settings.loadProfiles()
        Settings.loadFolders()
        Settings.loadHistoryTasks()
    }

    static makePaths() {
        if (!fs.existsSync(Settings.nzbOutputPath)) {
            fs.mkdirSync(Settings.nzbOutputPath, { recursive: true })
        }

        if (!fs.existsSync(Settings.rarparOutputPath)) {
            fs.mkdirSync(Settings.rarparOutputPath, { recursive: true })
        }

        if (!fs.existsSync(Settings.taskHistoryPath)) {
            fs.mkdirSync(Settings.taskHistoryPath, { recursive: true })
        }

        if (!fs.existsSync(Settings.profileSettingsPath)) {
            fs.mkdirSync(Settings.profileSettingsPath, { recursive: true })
        }

        if (!fs.existsSync(Settings.folderSettingsPath)) {
            fs.mkdirSync(Settings.folderSettingsPath, { recursive: true })
        }
    }

    static async loadMainSettings(): Promise<AllSettings> {
        if (fs.existsSync(Settings.allSettingsPath)) {
            const settings = fs.readFileSync(Settings.allSettingsPath, 'utf-8')
            try {
                const parsedSettings = JSON.parse(settings) as Partial<AllSettings>
                let validatedSettings = await AllSettingsYupSchema.validate(parsedSettings, {
                    stripUnknown: true,
                    abortEarly: false
                })

                const diff = Utils.diffObjects(parsedSettings, validatedSettings)
                if (diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0) {
                    console.log(
                        'Settings file had invalid or missing entries, updating settings file.',
                        diff
                    )
                    validatedSettings = Migrator.migrateAllSettings(
                        parsedSettings,
                        validatedSettings,
                        diff
                    )
                    Settings.saveAllSettings(validatedSettings)
                }

                Settings.allSettings = validatedSettings
            } catch (error) {
                console.error('Error parsing settings file', error)
            }
        }

        return Settings.allSettings
    }

    static async loadProfiles(): Promise<ProfileSettings[]> {
        Settings.profiles = []

        const files = fs.readdirSync(Settings.profileSettingsPath)
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(Settings.profileSettingsPath, file)
                const data = fs.readFileSync(filePath, 'utf-8')

                try {
                    const parsedProfile = JSON.parse(data) as ProfileSettings
                    let validatedSettings = await ProfileSettingsYupSchema.validate(parsedProfile, {
                        stripUnknown: true,
                        abortEarly: false
                    })

                    const diff = Utils.diffObjects(parsedProfile, validatedSettings)
                    if (
                        diff.added.length > 0 ||
                        diff.removed.length > 0 ||
                        diff.changed.length > 0
                    ) {
                        console.log(
                            'Profile file had invalid or missing entries, updating settings file.',
                            filePath,
                            diff
                        )
                        validatedSettings = Migrator.migrateProfileSettings(
                            parsedProfile,
                            validatedSettings,
                            diff
                        )
                        console.log('migrated', validatedSettings)
                        fs.rmSync(filePath)
                        Settings.saveProfile(validatedSettings)
                    }

                    Settings.profiles.push(validatedSettings)
                } catch (error) {
                    console.error('Error parsing settings file', error)
                }
            }
        }

        // If no profiles exist, create a default one
        if (Settings.profiles.length === 0) {
            const defaultProfile = ProfileSettingsYupSchema.cast({})
            defaultProfile.id = randomUUID().toString()
            defaultProfile.name = 'Default Profile'
            defaultProfile.isDefault = true
            defaultProfile.taskSettings = Settings.getNewTaskSettings()

            Settings.profiles.push(defaultProfile)
            Settings.saveProfile(defaultProfile)
        }

        return Settings.profiles
    }

    static async loadFolders(): Promise<FolderSettings[]> {
        Settings.folders = []

        const files = fs.readdirSync(Settings.folderSettingsPath)
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(Settings.folderSettingsPath, file)
                const data = fs.readFileSync(filePath, 'utf-8')

                try {
                    const parsedFolder = JSON.parse(data) as FolderSettings

                    let validatedSettings = await FolderSettingsYupSchema.validate(parsedFolder, {
                        stripUnknown: true,
                        abortEarly: false
                    })

                    const diff = Utils.diffObjects(parsedFolder, validatedSettings)
                    if (
                        diff.added.length > 0 ||
                        diff.removed.length > 0 ||
                        diff.changed.length > 0
                    ) {
                        console.log(
                            'Profile file had invalid or missing entries, updating settings file.',
                            filePath,
                            diff
                        )
                        validatedSettings = Migrator.migrateFolderSettings(
                            parsedFolder,
                            validatedSettings,
                            diff
                        )
                        console.log('migrated', validatedSettings)
                        fs.rmSync(filePath)
                        Settings.saveFolder(validatedSettings)
                    }
                    if (!Settings.folderWatched[validatedSettings.id]) {
                        Settings.folderWatched[validatedSettings.id] = {
                            lastScanned: 0,
                            watchActive: false,
                            promise: null
                        }
                    }
                    Settings.folders.push(validatedSettings)
                } catch (error) {
                    console.error('Error parsing folder settings file', error)
                }
            }
        }

        this.watchFolders()
        return Settings.folders
    }

    static processWatchFolderItem(folderId: string, filename: string) {
        // Placeholder for processing logic

        const updatedFolder = Settings.folders.find((f) => f.id === folderId)
        if (!updatedFolder || !Settings.taskManager) return

        const fname = path.join(updatedFolder.fullPath, filename)
        if (!fs.existsSync(fname)) return

        const isFolder = fs.lstatSync(fname).isDirectory()
        const isFile = fs.lstatSync(fname).isFile()
        if ((isFolder && updatedFolder.uploadFolder) || (isFile && updatedFolder.uploadFiles)) {
            // New folder added
            console.log(
                `New folder monitoring item detected: ${filename} in ${updatedFolder.fullPath}, ${updatedFolder.profileId}`
            )

            const newTask = Settings.taskManager.getFreshTask(updatedFolder.profileId, [fname])
            if (!newTask || !newTask.taskConfig) return

            newTask.taskConfig.folderWatchId = updatedFolder.id

            if (updatedFolder.deleteUploadedFiles) {
                newTask.taskConfig.taskSettings.postingSettings.deleteUploadedFiles = true
            }
            if (updatedFolder.autoApprove) {
                Settings.taskManager.queueTaskConfig(newTask.taskConfig)
            } else {
                Settings.taskManager.addApprovalTaskConfig(newTask.taskConfig)
            }
        }
    }

    static async watchFolders(): Promise<void> {
        console.log('activate folder watch')
        for (const [_folderId, folder] of Object.entries(Settings.folderWatched)) {
            if (folder.watchActive && folder.promise) {
                // close existing watcher
                folder.promise?.close()
                folder.watchActive = false
                folder.promise = null
            }
        }

        for (const folder of Settings.folders) {
            if (!Settings.folderWatched[folder.id]) {
                Settings.folderWatched[folder.id] = {
                    lastScanned: 0,
                    watchActive: false,
                    promise: null
                }
            }

            if (folder.active && !Settings.folderWatched[folder.id].watchActive) {
                Settings.folderWatched[folder.id].watchActive = true

                const promise = fs.watch(
                    folder.fullPath,
                    { persistent: true },
                    (eventType, filename) => {
                        if (!filename) return

                        if (eventType == 'rename') {
                            Settings.processWatchFolderItem(folder.id, filename)
                        }
                    }
                )

                Settings.folderWatched[folder.id].promise = promise
            }
        }
    }

    static async loadHistoryTasks(): Promise<TaskConfig[]> {
        if (Settings.historyTasksPromise) {
            await Settings.historyTasksPromise
            Settings.historyTasksPromise = null
            return Settings.historyTasks
        } else {
            Settings.historyTasks = []

            const files = fs.readdirSync(Settings.taskHistoryPath)
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(Settings.taskHistoryPath, file)
                    const data = fs.readFileSync(filePath, 'utf-8')

                    try {
                        const parsedTask = JSON.parse(data) as TaskConfig
                        let validatedSettings = await TaskConfigYupSchema.validate(parsedTask, {
                            stripUnknown: true,
                            abortEarly: false
                        })
                        Settings.historyTasks.push(validatedSettings)
                    } catch (error) {
                        console.error('Error parsing settings file', error)
                    }
                }
            }

            // Sort tasks by created_at descending
            Settings.historyTasks.sort((a, b) => (b.created_at ?? 1) - (a.created_at ?? 1))
            Settings.historyTasksPromise = Promise.resolve(Settings.historyTasks)
            return Settings.historyTasks
        }
    }

    static clearHistoryTasks(): void {
        const files = fs.readdirSync(Settings.taskHistoryPath)
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(Settings.taskHistoryPath, file)
                fs.rmSync(filePath)
            }
        }
        Settings.historyTasks = []
        Settings.historyTasksPromise = null
    }

    static deleteHistoryTask(id: string) {
        const task = Settings.historyTasks.find((t) => t.id === id)
        if (!task) return

        if (task.log_file && fs.existsSync(task.log_file)) {
            fs.rmSync(task.log_file)
        }
    }

    static saveTask(task: TaskConfig): string {
        const saveFolder = Settings.taskHistoryPath
        // utc timestamp
        const timestamp = Date.now()
        let fileName = `${timestamp} - ${task.name}.json`
        // sanitize file name
        fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-')

        const filePath = path.join(saveFolder, fileName)

        task.log_file = filePath

        if (!fs.existsSync(saveFolder)) {
            fs.mkdirSync(saveFolder, { recursive: true })
        }

        const validated = TaskConfigYupSchema.validateSync(task, {
            stripUnknown: true,
            abortEarly: false
        })

        fs.writeFileSync(filePath, JSON.stringify(validated, null, 4))

        Settings.loadHistoryTasks()
        return filePath
    }

    static saveProfile(profile: ProfileSettings) {
        if (profile.id === '') {
            profile.id = randomUUID().toString()
        }

        const filePath = path.join(Settings.profileSettingsPath, `${profile.id}.json`)

        if (!fs.existsSync(Settings.profileSettingsPath)) {
            fs.mkdirSync(Settings.profileSettingsPath, { recursive: true })
        }

        const validated = ProfileSettingsYupSchema.validateSync(profile, {
            stripUnknown: true,
            abortEarly: false
        })
        fs.writeFileSync(filePath, JSON.stringify(validated, null, 4))
    }

    static saveFolder(folder: FolderSettings) {
        if (folder.id === '') {
            folder.id = randomUUID().toString()
        }

        const filePath = path.join(Settings.folderSettingsPath, `${folder.id}.json`)

        if (!fs.existsSync(Settings.folderSettingsPath)) {
            fs.mkdirSync(Settings.folderSettingsPath, { recursive: true })
        }

        const validated = FolderSettingsYupSchema.validateSync(folder, {
            stripUnknown: true,
            abortEarly: false
        })
        fs.writeFileSync(filePath, JSON.stringify(validated, null, 4))
    }

    static deleteProfile(id: string) {
        const filePath = path.join(Settings.profileSettingsPath, `${id}.json`)

        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }
    }

    static deleteFolder(id: string) {
        const filePath = path.join(Settings.folderSettingsPath, `${id}.json`)

        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }
    }

    static scanFolder(id: string) {
        const folder = Settings.folders.find((f) => f.id === id)
        if (!folder) return

        // Scan the folder for files
        const filesAndFolders = fs.readdirSync(folder.fullPath)
        for (const item of filesAndFolders) {
            Settings.processWatchFolderItem(folder.id, item)
        }
    }

    static generateName(nameSettings: RandomSettings): string {
        if (!nameSettings.randomNameMode) {
            return nameSettings.customName
        }

        let characters = ''
        if (nameSettings.useLowercase) {
            characters += 'abcdefghijklmnopqrstuvwxyz'
        }
        if (nameSettings.useUppercase) {
            characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        }
        if (nameSettings.useNumbers) {
            characters += '0123456789'
        }
        // if (nameSettings.useSpecialCharacters) {
        //     characters += '!@#$%^&*()_+'
        // }

        let name = ''
        for (let i = 0; i < nameSettings.randomNameLength; i++) {
            name += characters[Math.floor(Math.random() * characters.length)]
        }

        return nameSettings.prefix + name + nameSettings.suffix
    }

    static generateString(length: number): string {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let result = ''
        for (let i = 0; i < length; i++) {
            result += characters[Math.floor(Math.random() * characters.length)]
        }
        return result
    }

    static sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    static saveAllSettings(allSettings: AllSettings) {
        allSettings.servers.forEach((server) => {
            if (server.id === '') {
                server.id = randomUUID().toString()
            }
        })

        const validated = AllSettingsYupSchema.validateSync(allSettings, {
            stripUnknown: true,
            abortEarly: false
        })
        Settings.allSettings = validated

        // Save settings to disk
        fs.writeFileSync(Settings.allSettingsPath, JSON.stringify(validated, null, 4))
    }

    static getNewTaskConfig(taskSettings: TaskSettings, profileId?: string): TaskConfig {
        // ✅ ensure taskSettings is its own deep copy
        const safeTaskSettings = structuredClone(taskSettings)

        const config = TaskConfigYupSchema.cast({})
        config.id = randomUUID().toString()
        config.taskSettings = safeTaskSettings

        if (profileId) {
            config.used_profile = profileId
        }

        return config
    }

    static getNewTaskSettings(profileId?: string): TaskSettings {
        let taskSettings: TaskSettings | null = null
        let serversettings: ServerSettings | null = null

        if (Settings.allSettings.servers.length > 0) {
            serversettings = Settings.allSettings.servers.filter((s) => s.isDefault)[0] || null
        }

        if (!serversettings && Settings.allSettings.servers.length > 0) {
            serversettings = Settings.allSettings.servers[0]
        }

        if (profileId) {
            const profile = Settings.profiles.find((p) => p.id === profileId)
            if (profile) {
                taskSettings = profile.taskSettings
            }
        }

        if (!taskSettings) {
            const defaultProfile = Settings.profiles.find((p) => p.isDefault)
            if (defaultProfile) {
                taskSettings = defaultProfile.taskSettings
            } else {
                taskSettings = TaskSettingsYupSchema.cast({})
            }
        }

        const clonedSettings: TaskSettings = structuredClone(taskSettings)

        if (serversettings) {
            clonedSettings.serverId = serversettings.id
        }

        return clonedSettings
    }

    // Let other classes register to receive webcontent updates by registering a callback function with channel name
    private static webcontentUpdateCallbacks: { channel: string; callback: (data: any) => void }[] =
        []

    static registerWebcontentUpdateCallback(channel: string, callback: (data: any) => void) {
        Settings.webcontentUpdateCallbacks.push({ channel, callback })
    }

    static unregisterWebcontentUpdateCallback(channel: string, callback: (data: any) => void) {
        Settings.webcontentUpdateCallbacks = Settings.webcontentUpdateCallbacks.filter(
            (item) => item.channel !== channel || item.callback !== callback
        )
    }

    static sendWebcontentUpdate(channel: string, data: any) {
        if (Settings.mainWindow) {
            Settings.mainWindow.webContents.send(channel, data)
        }

        // Also call registered callbacks
        for (const registeredCallback of Settings.webcontentUpdateCallbacks) {
            if (registeredCallback.channel === channel) {
                registeredCallback.callback(data)
            }
        }
    }

    static get taskHistoryPath(): string {
        if (
            Settings.allSettings.taskHistoryFolder &&
            Settings.allSettings.taskHistoryFolder !== ''
        ) {
            return Settings.allSettings.taskHistoryFolder
        }
        Settings.allSettings.taskHistoryFolder = Settings.defaultTaskHistoryPath
        return Settings.defaultTaskHistoryPath
    }

    static get profileSettingsPath(): string {
        if (
            Settings.allSettings.profilesSettingsFolder &&
            Settings.allSettings.profilesSettingsFolder !== ''
        ) {
            return Settings.allSettings.profilesSettingsFolder
        }
        Settings.allSettings.profilesSettingsFolder = Settings.defaultProfileSettingsPath
        return Settings.defaultProfileSettingsPath
    }

    static get folderSettingsPath(): string {
        if (
            Settings.allSettings.folderMonitoringFolder &&
            Settings.allSettings.folderMonitoringFolder !== ''
        ) {
            return Settings.allSettings.folderMonitoringFolder
        }
        Settings.allSettings.folderMonitoringFolder = Settings.defaultFolderSettingsPath
        return Settings.defaultFolderSettingsPath
    }

    static get nzbOutputPath(): string {
        if (Settings.allSettings.nzbOutputFolder && Settings.allSettings.nzbOutputFolder !== '') {
            return Settings.allSettings.nzbOutputFolder
        }
        Settings.allSettings.nzbOutputFolder = Settings.defaultNzbOutputFolder
        return Settings.defaultNzbOutputFolder
    }

    static get rarparOutputPath(): string {
        if (Settings.allSettings.rarparFolder && Settings.allSettings.rarparFolder !== '') {
            return Settings.allSettings.rarparFolder
        }
        Settings.allSettings.rarparFolder = Settings.defaultRarparFolder
        return Settings.defaultRarparFolder
    }

    static sanitize(data: string): string {
        return data
            .trim()
            .replace(/\n$/, '')
            .replace(/\r$/, '')
            .replace(/\n\r$/, '')
            .replace(/\\b$/, '')
            .replace(/[^\x20-\x7E]/g, '')
    }
}
