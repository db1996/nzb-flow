import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { AllSettings } from '@main/types/settings/AllSettings'
import { ProfileSettings, ProfileSettingsYupSchema } from '@main/types/settings/ProfileSettings'
import { FolderSettings, FolderSettingsYupSchema } from '@main/types/settings/FolderSettings'
import { debounce } from 'lodash'
import { toast } from 'vue-sonner'
import {
    ContentTemplateSettings,
    ContentTemplateSettingsYupSchema
} from '@main/types/settings/ContentTemplateSettings'
import { contentTemplateExamples } from '@main/classes/ContentTemplate'

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<AllSettings | null>(null)
    const profiles = ref<ProfileSettings[]>([])
    const folders = ref<FolderSettings[]>([])
    const contentTemplates = ref<ContentTemplateSettings[]>([])

    const defaultFolders = ref<{
        rarparFolder: string
        nzbOutputFolder: string
        taskHistoryFolder: string
        profilesSettingsFolder: string
        folderMonitoringFolder: string
    }>({
        rarparFolder: '',
        nzbOutputFolder: '',
        taskHistoryFolder: '',
        profilesSettingsFolder: '',
        folderMonitoringFolder: ''
    })

    let activeSettingsPromise: Promise<AllSettings> | null = null
    let activeRarPromise: Promise<boolean> | null = null
    let activeParPromise: Promise<boolean> | null = null
    let activeNyuuPromise: Promise<boolean> | null = null

    const activeProfileEdit = ref<ProfileSettings | null>(null)
    const activeFolderEdit = ref<FolderSettings | null>(null)
    const activeContentTemplateEdit = ref<ContentTemplateSettings | null>(null)

    const form = ref<AllSettings | null>(null)
    const formErrors = ref<Record<string, string>>({})
    const formInitialized = ref(false)
    const formIsSaving = ref(false)

    watch(activeProfileEdit, () => {
        console.log('Active profile edit changed:', activeProfileEdit.value)

        contentTemplates.value.forEach((template) => {
            if (!activeProfileEdit.value || activeProfileEdit.value === null) return

            if (!activeProfileEdit.value.taskSettings.contentTemplates[template.id]) {
                activeProfileEdit.value.taskSettings.contentTemplates[template.id] = false
            }
        })

        console.log('Updated active profile edit content templates:', activeProfileEdit.value)
    })

    const commands = ref<{
        rar: {
            checking: boolean
            active: boolean
        }
        par: {
            checking: boolean
            active: boolean
            installing: boolean
        }
        nyuu: {
            checking: boolean
            active: boolean
            installing: boolean
        }
    }>({
        rar: {
            checking: false,
            active: false
        },
        par: {
            checking: false,
            active: false,
            installing: false
        },
        nyuu: {
            checking: false,
            active: false,
            installing: false
        }
    })

    async function init() {
        await getSettings()
        await getProfiles()

        form.value = settings.value
        form.value = settings.value
        formInitialized.value = true

        checkRar()
        checkPar()
        checkNyuu()
        getFolders()
        getDefaultFolders()
        getContentTemplates()
    }

    async function getDefaultFolders() {
        if (window.api) {
            defaultFolders.value = await window.api.getDefaultFolders()
            console.log('Default folders loaded:', defaultFolders.value)
        }
    }

    async function getSettings(): Promise<AllSettings> {
        if (!activeSettingsPromise && window.api) {
            activeSettingsPromise = window.api.getAllSettings()
            settings.value = await activeSettingsPromise
            activeSettingsPromise = null
            console.log('Settings loaded:', settings.value)
        }

        if (!settings.value) {
            return Promise.reject('Settings not loaded')
        } else {
            return settings.value
        }
    }

    async function newProfile() {
        const newProfile: ProfileSettings = ProfileSettingsYupSchema.cast({})
        activeProfileEdit.value = newProfile
    }

    async function deleteProfile(id: string): Promise<void> {
        if (window.api) {
            await window.api.deleteProfile(id)
            await getProfiles()
        }
    }

    async function getProfiles(): Promise<ProfileSettings[]> {
        if (window.api) {
            profiles.value = await window.api.getProfiles()
            console.log('Profiles loaded:', profiles.value)
        }

        return profiles.value
    }

    async function saveProfile(profile: ProfileSettings): Promise<void> {
        if (window.api) {
            await window.api.saveProfile(JSON.parse(JSON.stringify(profile)))
            await getProfiles()
        }
    }

    async function saveProfiles(profilesToSave: ProfileSettings[]): Promise<void> {
        if (window.api) {
            await window.api.saveProfiles(JSON.parse(JSON.stringify(profilesToSave)))
            await getProfiles()
        }
    }

    async function newFolder() {
        const newFolder: FolderSettings = FolderSettingsYupSchema.cast({})

        const defaultProfileId = profiles.value.find((profile) => profile.isDefault)?.id || null
        if (defaultProfileId) {
            newFolder.profileId = defaultProfileId
        }
        activeFolderEdit.value = newFolder
    }

    async function getFolders(): Promise<FolderSettings[]> {
        if (window.api) {
            folders.value = await window.api.getFolders()
            console.log('Folders loaded:', folders.value)
        }

        return folders.value
    }

    async function saveFolder(folder: FolderSettings): Promise<void> {
        if (window.api) {
            await window.api.saveFolder(JSON.parse(JSON.stringify(folder)))
            await getFolders()
        }
    }

    async function saveFolders(foldersToSave: FolderSettings[]): Promise<void> {
        if (window.api) {
            await window.api.saveFolders(JSON.parse(JSON.stringify(foldersToSave)))
            await getFolders()
        }
    }

    async function deleteFolder(id: string): Promise<void> {
        if (window.api) {
            await window.api.deleteFolder(id)
            await getFolders()
        }
    }

    async function scanFolder(id: string): Promise<void> {
        if (window.api) {
            await window.api.scanFolder(id)
        }
    }

    async function newContentTemplate() {
        const newContentTemplate: ContentTemplateSettings = ContentTemplateSettingsYupSchema.cast(
            {}
        )

        newContentTemplate.templateContent = contentTemplateExamples[0] || ''

        activeContentTemplateEdit.value = newContentTemplate
    }

    async function saveContentTemplate(contentTemplate: ContentTemplateSettings): Promise<void> {
        if (window.api) {
            await window.api.saveContentTemplate(JSON.parse(JSON.stringify(contentTemplate)))
            await getContentTemplates()
        }
    }

    async function deleteContentTemplate(id: string): Promise<void> {
        if (window.api) {
            await window.api.deleteContentTemplate(id)
            await getContentTemplates()
        }
    }

    async function getContentTemplates(): Promise<ContentTemplateSettings[]> {
        if (window.api) {
            contentTemplates.value = await window.api.getContentTemplates()
            console.log('Content Templates loaded:', contentTemplates.value)
        }

        return contentTemplates.value
    }

    async function saveSettings(newSettings: AllSettings) {
        settings.value = JSON.parse(JSON.stringify(newSettings))

        await window.api?.saveAllSettings(JSON.parse(JSON.stringify(newSettings)))
    }

    async function savePartialSettings(partialSettings: Partial<AllSettings>) {
        const updatedSettings = { ...settings.value, ...partialSettings } as AllSettings
        await saveSettings(updatedSettings)
    }

    window.api?.reloadSettings(async () => {
        console.log('reload requested from back-end')

        await getSettings()
    })

    async function checkRar(smallDelay: boolean = false, customCommand: string | null = null) {
        if (!activeRarPromise) {
            commands.value.rar.checking = true
            commands.value.rar.active = false
            if (smallDelay) {
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
            activeRarPromise = window.api.checkRar(customCommand)
            commands.value.rar.active = await activeRarPromise
            console.log('Rar active:', commands.value.rar.active)
            commands.value.rar.checking = false
            activeRarPromise = null
        } else {
            commands.value.rar.active = await activeRarPromise
        }
    }

    async function checkPar(smallDelay: boolean = false, customCommand: string | null = null) {
        if (!activeParPromise) {
            commands.value.par.checking = true
            commands.value.par.active = false
            if (smallDelay) {
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
            activeParPromise = window.api.checkParpar(customCommand)
            commands.value.par.active = await activeParPromise
            console.log('Par active:', commands.value.par.active)
            commands.value.par.checking = false
            activeParPromise = null
        } else {
            commands.value.par.active = await activeParPromise
        }
    }

    async function setServerDefault(index: number, isDefault: boolean) {
        if (!form.value) {
            console.error('Settings not loaded')
            return
        }

        if (isDefault) {
            form.value.servers.forEach((server, i) => {
                server.isDefault = i === index
            })
        } else {
            form.value.servers[index].isDefault = false
        }
    }

    async function checkNyuu(smallDelay: boolean = false, customCommand: string | null = null) {
        if (!activeNyuuPromise) {
            commands.value.nyuu.checking = true
            commands.value.nyuu.active = false
            if (smallDelay) {
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
            activeNyuuPromise = window.api.checkNyuu(customCommand)
            commands.value.nyuu.active = await activeNyuuPromise
            console.log('Nyuu active:', commands.value.nyuu.active)
            commands.value.nyuu.checking = false
            activeNyuuPromise = null
        } else {
            commands.value.nyuu.active = await activeNyuuPromise
        }
    }

    async function installNyuu() {
        console.log('Installing nyuu via npm...')
        commands.value.nyuu.installing = true
        await window.api.installNyuu()
        await checkNyuu(true)
        commands.value.nyuu.installing = false
    }

    async function installParpar() {
        console.log('Installing parpar via npm...')
        commands.value.par.installing = true
        await window.api.installParpar()
        await checkPar(true)
        commands.value.par.installing = false
    }

    async function saveSettingsForm() {
        if (!form.value) {
            console.error('⚠️ Form is null or undefined before validation!')
            return
        }

        formIsSaving.value = true

        try {
            const toCheckRar = form.value.commands.rar !== settings.value?.commands.rar
            const toCheckPar = form.value.commands.par !== settings.value?.commands.par
            const toCheckNyuu = form.value.commands.nyuu !== settings.value?.commands.nyuu

            await saveSettings(form.value)
            if (toCheckRar) {
                await checkRar(true, form.value.commands.rar)
            }
            if (toCheckPar) {
                await checkPar(true, form.value.commands.par)
            }
            if (toCheckNyuu) {
                await checkNyuu(true, form.value.commands.nyuu)
            }
            formErrors.value = {}
            formIsSaving.value = false
        } catch (err: any) {
            if (err.inner) {
                console.error('Validation errors:', err.inner)
                formErrors.value = err.inner.reduce((acc: Record<string, string>, error) => {
                    acc[error.path] = error.message
                    return acc
                }, {})
                formIsSaving.value = false
            }
        }
    }

    const debounceTime = 3000
    const remainingTimeSaveSettings = ref(0)
    const flashSavedIndicator = ref(false)
    let countdownInterval: number | null = null

    const debounceSaveSettingForm = debounce(async () => {
        clearCountdown()
        remainingTimeSaveSettings.value = 0

        await saveSettingsForm()
        toast('Settings saved!', {
            duration: 1200,
            closeButton: true
        })
        flashSavedIndicator.value = true
        setTimeout(() => {
            flashSavedIndicator.value = false
        }, 500)
    }, debounceTime)

    function clearCountdown() {
        if (countdownInterval !== null) {
            clearInterval(countdownInterval)
            countdownInterval = null
        }
    }

    async function saveSettingsFormDebounce() {
        clearCountdown()
        remainingTimeSaveSettings.value = debounceTime
        const start = Date.now()

        countdownInterval = window.setInterval(() => {
            const elapsed = Date.now() - start
            const remaining = Math.max(debounceTime - elapsed, 0)
            remainingTimeSaveSettings.value = remaining

            // stop interval when done
            if (remaining === 0) clearCountdown()
        }, 16) // ~60fps smoothness

        debounceSaveSettingForm()
    }

    async function fireDebounceNow() {
        clearCountdown()
        remainingTimeSaveSettings.value = debounceTime
        debounceSaveSettingForm()
        debounceSaveSettingForm.flush()
    }

    return {
        init,
        settings,
        saveSettings,
        getSettings,
        savePartialSettings,
        commands,
        checkRar,
        checkPar,
        checkNyuu,
        installNyuu,
        installParpar,
        form,
        errors: formErrors,
        formInitialized,
        saveSettingsForm,
        setServerDefault,
        formIsSaving,
        profiles,
        getProfiles,
        saveProfile,
        saveProfiles,
        newProfile,
        deleteProfile,
        activeProfileEdit,
        folders,
        getFolders,
        saveFolder,
        saveFolders,
        deleteFolder,
        scanFolder,
        activeFolderEdit,
        newFolder,
        saveSettingsFormDebounce,
        fireDebounceNow,
        flashSavedIndicator,
        remainingTimeSaveSettings,
        debounceTime,
        defaultFolders,
        contentTemplates,
        activeContentTemplateEdit,
        getContentTemplates,
        saveContentTemplate,
        deleteContentTemplate,
        newContentTemplate
    }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
