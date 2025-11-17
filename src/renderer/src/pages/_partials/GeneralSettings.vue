<script setup lang="ts">
import { Label } from '@ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { AllSettings } from '@main/types/settings/AllSettings'
import { PropType, watch } from 'vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import CardForm from '@renderer/components/form/CardForm.vue'
import { Button } from '@components/ui/button'
import { useUpdateStore } from '@renderer/composables/useUpdateStore'
import { LoaderCircle } from 'lucide-vue-next'
import Alert from '@renderer/components/ui/alert/Alert.vue'
import AlertTitle from '@renderer/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@renderer/components/ui/alert/AlertDescription.vue'
import { useAppearance } from '@renderer/composables/useAppearance'
import { Appearance } from '@renderer/types/appearance'
import FileSelectInput from '@renderer/components/form/FileSelectInput.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'
const updateStore = useUpdateStore()

const props = defineProps({
    form: {
        type: Object as PropType<AllSettings>,
        required: true
    }
})
const appearanceStore = useAppearance()
const settingsStore = useSettingsStore()
watch(
    () => props.form.theme.type,
    newVal => {
        appearanceStore.updateAppearance(newVal as Appearance)
    }
)
</script>

<template>
    <div class="grid grid-cols-1 gap-2">
        <CardForm title="Theme settings">
            <template #body>
                <div class="grid grid-cols-2">
                    <div class="space-y-2">
                        <Label for="theme">Theme</Label>
                        <Select v-model="form.theme.type" required>
                            <SelectTrigger id="theme" class="w-[200px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                        <p class="text-sm text-muted-foreground">
                            Choose between light, dark, or system theme.
                        </p>
                    </div>
                    <div class="space-y-2">
                        <Label for="date-formats">Date format</Label>
                        <Select v-model="form.theme.datesLocale" required>
                            <SelectTrigger id="date-formats" class="w-[250px]">
                                <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="us-US">mm/dd/yyyy hh:mm:ss AM</SelectItem>
                                <SelectItem value="nl-NL">dd-mm-yyyy hh:mm:ss</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </template>
        </CardForm>

        <CardForm title="System tray options">
            <template #body>
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <Label for="show-tray-icon">Show system tray icon</Label>
                        <p class="text-sm text-muted-foreground mr-2">
                            When enabled, the system tray icon will be shown.
                        </p>
                    </div>
                    <SwitchInput id="show-tray-icon" v-model="form.theme.showTrayIcon" />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <Label for="minimize-to-tray">Minimize to System Tray</Label>
                        <p class="text-sm text-muted-foreground mr-2">
                            When enabled, closing the window will minimize the app to the system
                            tray instead of quitting. Requires "Show system tray icon" to be
                            enabled.
                        </p>
                    </div>
                    <SwitchInput
                        :disabled="!form.theme.showTrayIcon"
                        id="minimize-to-tray"
                        v-model="form.theme.minimizeToTray"
                    />
                </div>
            </template>
        </CardForm>
        <CardForm title="Folders and files">
            <template #body>
                <SwitchInput
                    id="replace-existing-posted-files"
                    v-model="form.replaceExistingPostedFiles"
                    label="Replace existing posted files"
                    help="If existing rar/par/nzb files exist, they will be replaced. If you turn this off the post will be renamed to {name} - 1 etc"
                />
                <FileSelectInput
                    id="rarpar-folder"
                    label="RAR/PAR temp folder"
                    v-model="form.rarparFolder"
                    placeholder="Select RAR/PAR temp folder"
                >
                    <template #append>
                        <Button
                            size="lg"
                            variant="outline_default"
                            @click="
                                () =>
                                    (form.rarparFolder = settingsStore.defaultFolders.rarparFolder)
                            "
                        >
                            Default
                        </Button>
                    </template>
                </FileSelectInput>
                <FileSelectInput
                    id="nzb-folder"
                    label="NZB output folder"
                    v-model="form.nzbOutputFolder"
                    placeholder="Select NZB output folder"
                >
                    <template #append>
                        <Button
                            size="lg"
                            variant="outline_default"
                            @click="
                                () =>
                                    (form.nzbOutputFolder =
                                        settingsStore.defaultFolders.nzbOutputFolder)
                            "
                        >
                            Default
                        </Button>
                    </template>
                </FileSelectInput>
                <FileSelectInput
                    id="history-folder"
                    label="Task history folder"
                    v-model="form.taskHistoryFolder"
                    help="Post logs are stored in this folder."
                    placeholder="Select Task history folder"
                >
                    <template #append>
                        <Button
                            size="lg"
                            variant="outline_default"
                            @click="
                                () =>
                                    (form.taskHistoryFolder =
                                        settingsStore.defaultFolders.taskHistoryFolder)
                            "
                        >
                            Default
                        </Button>
                    </template>
                </FileSelectInput>
            </template>
        </CardForm>

        <CardForm title="Updates">
            <template #body>
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-4 space-y-2">
                        <Button
                            v-if="
                                updateStore.updateState === 'checking' ||
                                updateStore.updateState === 'downloading'
                            "
                            variant="outline_default"
                            disabled
                        >
                            {{
                                updateStore.updateState === 'checking'
                                    ? 'Checking for updates...'
                                    : 'Downloading update...'
                            }}
                            <LoaderCircle class="animate-spin" />
                        </Button>
                        <Button
                            v-if="
                                updateStore.updateState === 'idle' ||
                                updateStore.updateState === 'unavailable'
                            "
                            variant="outline_default"
                            @click="() => updateStore.checkForUpdates()"
                        >
                            Check for Updates
                        </Button>

                        <Button
                            v-if="updateStore.updateState === 'available'"
                            variant="outline_info"
                            @click="() => updateStore.downloadUpdate()"
                        >
                            Download Update
                        </Button>
                        <Button
                            v-if="updateStore.updateState === 'downloaded'"
                            variant="default"
                            @click="() => updateStore.installUpdate()"
                        >
                            Install Update
                        </Button>
                        <Alert
                            v-if="updateStore.updateState === 'error'"
                            variant="destructive"
                            title="Update Error"
                            description="An error occurred while checking for updates."
                        >
                            <AlertTitle>Error with updater</AlertTitle>
                            <AlertDescription>
                                {{ updateStore.errorMessage }}
                            </AlertDescription>
                        </Alert>
                        <div>
                            <p class="text-sm text-muted-foreground">
                                Current Version: {{ updateStore.currentVersion }}
                            </p>
                            <p class="text-sm text-muted-foreground">
                                Latest Version:
                                {{
                                    updateStore.updateInfo ? updateStore.updateInfo.version : 'N/A'
                                }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 space-y-2 mt-4 gap-2">
                        <SwitchInput
                            id="auto-check-updates"
                            v-model="form.updateCheckAutomatically"
                            label="Automatically check updates at startup"
                        />
                        <SwitchInput
                            id="auto-download-updates"
                            v-model="form.updateDownloadAutomatically"
                            label="Automatically download updates"
                        />
                        <SwitchInput
                            id="auto-install-updates"
                            v-model="form.updateInstallAutomatically"
                            label="Automatically install updates"
                        />
                    </div>
                </div>
            </template>
        </CardForm>
    </div>
</template>
