<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppLayout from '@renderer/layout/AppLayout.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import {
    CheckIcon,
    ExternalLink,
    LoaderCircle,
    RotateCcw,
    SquareTerminal,
    X
} from 'lucide-vue-next'
import { BadgeVariants } from '@renderer/components/ui/badge'
import ServersSettings from './_partials/ServersSettings.vue'
import GeneralSettings from './_partials/GeneralSettings.vue'
import { Tabs, TabsContent, TabsList } from '@components/ui/tabs'
import TabsTriggerSection from '@renderer/components/navigation/TabsTriggerSection.vue'
import QueueSettings from './_partials/QueueSettings.vue'
import ButtonGroup from '@renderer/components/ui/button-group/ButtonGroup.vue'
import ButtonGroupText from '@renderer/components/ui/button-group/ButtonGroupText.vue'
import Label from '@renderer/components/ui/label/Label.vue'
import InputGroup from '@renderer/components/ui/input-group/InputGroup.vue'
import InputGroupInput from '@renderer/components/ui/input-group/InputGroupInput.vue'
import InputGroupAddon from '@renderer/components/ui/input-group/InputGroupAddon.vue'
import Button from '@renderer/components/ui/button/Button.vue'
import Alert from '@renderer/components/ui/alert/Alert.vue'
import AlertTitle from '@renderer/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@renderer/components/ui/alert/AlertDescription.vue'
import { AllSettings } from '@main/types/settings/AllSettings'

const settingsStore = useSettingsStore()


const sections = ref([
    {
        id: 'general',
        label: 'General',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'queues',
        label: 'Queues',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'servers',
        label: 'Servers',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'posting',
        label: 'Posting',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'rar',
        label: 'Compression (RAR)',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'par',
        label: 'Par',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    },
    {
        id: 'nyuu',
        label: 'Nyuu',
        badgeVariant: 'destructive' as BadgeVariants['variant'],
        badgeIcon: X
    }
])

const badgeSections = computed(() => {
    let returnValue = {
        servers: false,
        rar: false,
        par: false,
        nyuu: false
    }

    if (settingsStore.settings?.servers.length === 0) {
        returnValue.servers = true
    }
    if (!settingsStore.commands.rar.active && !settingsStore.commands.rar.checking) {
        returnValue.rar = true
    }
    if (!settingsStore.commands.par.active && !settingsStore.commands.par.checking) {
        returnValue.par = true
    }
    if (!settingsStore.commands.nyuu.active && !settingsStore.commands.nyuu.checking) {
        returnValue.nyuu = true
    }
    return returnValue
})

const lastSettingsForm = ref<AllSettings | null>(null)

watch(
    () => settingsStore.form,
    (newVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(lastSettingsForm.value) && lastSettingsForm.value !== null) {
            settingsStore.saveSettingsFormDebounce()
        }
        lastSettingsForm.value = JSON.parse(JSON.stringify(newVal))
    },
    { deep: true }
)
</script>

<template>
    <AppLayout>
        <Tabs default-value="general" class="flex flex-col gap-4">
            <TabsList class="grid w-full grid-cols-[1fr_1fr_2fr_2fr_1fr_1fr]">
                <TabsTriggerSection :section="sections.find(s => s.id === 'general')!" />
                <TabsTriggerSection :section="sections.find(s => s.id === 'queues')!" />
                <TabsTriggerSection :badge="badgeSections['servers']" :section="sections.find(s => s.id === 'servers')!" />
                <TabsTriggerSection :badge="badgeSections['rar']" :section="sections.find(s => s.id === 'rar')!" />
                <TabsTriggerSection :badge="badgeSections['par']" :section="sections.find(s => s.id === 'par')!" />
                <TabsTriggerSection :badge="badgeSections['nyuu']" :section="sections.find(s => s.id === 'nyuu')!" />
            </TabsList>
            <TabsContent value="general">
                <GeneralSettings v-if="settingsStore.form" :form="settingsStore.form" />
            </TabsContent>
            <TabsContent value="queues">
                <QueueSettings v-if="settingsStore.form" :form="settingsStore.form.queue" />
            </TabsContent>
            <TabsContent value="rar" v-if="settingsStore.form">
                <div class="grid grid-cols-1 gap-4">
                    <Label>RAR command</Label>
                    <ButtonGroup class="!gap-0 w-full">
                        <ButtonGroupText as-child>
                            <Label for="url">
                                <CheckIcon
                                    v-if="
                                        settingsStore.commands.rar.active &&
                                        !settingsStore.commands.rar.checking
                                    "
                                    class="text-green-700"
                                />
                                <X
                                    v-if="
                                        !settingsStore.commands.rar.active &&
                                        !settingsStore.commands.rar.checking
                                    "
                                    class="text-red-700"
                                />
                                <LoaderCircle
                                    v-if="settingsStore.commands.rar.checking"
                                    class="animate-spin text-amber-500"
                                />
                            </Label>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput
                                id="url"
                                placeholder="RAR Command"
                                v-model="settingsStore.form.commands.rar"
                            />
                            <InputGroupAddon>
                                <SquareTerminal />
                            </InputGroupAddon>
                        </InputGroup>
                        <ButtonGroupText class="px-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                @click="
                                    settingsStore.checkRar(false, settingsStore.form.commands.rar)
                                "
                            >
                                <RotateCcw />
                            </Button>
                        </ButtonGroupText>
                    </ButtonGroup>
                    <div class="grid grid-cols-1 gap-1">
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >For compressing files, the RAR CLI is used. When it is installed, point
                            the above input to the executable location.</span
                        >
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >In the profile settings or when creating a new upload, you can change a
                            bunch of other rar specific settings.</span
                        >
                    </div>
                    <Alert
                        v-if="
                            !settingsStore.commands.rar.active &&
                            !settingsStore.commands.rar.checking
                        "
                        variant="destructive"
                    >
                        <AlertTitle>RAR CLI not found</AlertTitle>
                        <AlertDescription>
                            The RAR command line tool could not be found. Please ensure it is
                            installed and accessible in your system's PATH. <br />
                            Or you can provide the full path to the executable in the field above

                            <a
                                href="https://www.win-rar.com/download.html"
                                target="_blank"
                                class="underline flex align-start"
                                >Download RAR CLI here
                                <ExternalLink class="inline ms-1" :size="12" />
                            </a>
                        </AlertDescription>
                    </Alert>
                </div>
            </TabsContent>
            <TabsContent value="par" v-if="settingsStore.form">
                <div class="grid grid-cols-1 gap-4">
                    <Label>parpar command</Label>
                    <ButtonGroup class="!gap-0 w-full">
                        <ButtonGroupText as-child>
                            <Label for="url">
                                <CheckIcon
                                    v-if="
                                        settingsStore.commands.par.active &&
                                        !settingsStore.commands.par.checking
                                    "
                                    class="text-green-700"
                                />
                                <X
                                    v-if="
                                        !settingsStore.commands.par.active &&
                                        !settingsStore.commands.par.checking
                                    "
                                    class="text-red-700"
                                />
                                <LoaderCircle
                                    v-if="settingsStore.commands.par.checking"
                                    class="animate-spin text-amber-500"
                                />
                            </Label>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput
                                id="url"
                                placeholder="parpar Command"
                                v-model="settingsStore.form.commands.par"
                            />
                            <InputGroupAddon>
                                <SquareTerminal />
                            </InputGroupAddon>
                        </InputGroup>
                        <ButtonGroupText class="px-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                @click="
                                    settingsStore.checkPar(false, settingsStore.form.commands.par)
                                "
                            >
                                <RotateCcw />
                            </Button>
                        </ButtonGroupText>
                    </ButtonGroup>
                    <div class="grid grid-cols-1 gap-1">
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >For generating par2 files, the parpar CLI is used, if the command is
                            not found it can be automatically installed.
                        </span>
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >If you installed it manually and it is not working, point the above
                            input to the executable location.</span
                        >
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >In the profile settings or when creating a new upload, you can change a
                            bunch of other par specific settings.</span
                        >
                    </div>
                    <Alert
                        v-if="
                            !settingsStore.commands.par.active &&
                            !settingsStore.commands.par.checking
                        "
                        variant="destructive"
                    >
                        <AlertTitle>Parpar CLI not found</AlertTitle>
                        <AlertDescription>
                            The Parpar command line tool could not be found. Please ensure it is
                            installed and accessible in your system's PATH. <br />
                            Or you can provide the full path to the executable in the field above
                            <a
                                href="https://github.com/animetosho/ParPar"
                                target="_blank"
                                class="underline flex align-start"
                                >Download Parpar CLI here
                                <ExternalLink class="inline ms-1" :size="12" />
                            </a>

                            Parpar can also be installed via npm, I can run the following command to
                            install it globally: <br />
                            <code class="bg-muted px-2 py-1 rounded-md block mt-2"
                                >npm install -g @animetosho/parpar</code
                            >

                            <Button
                                variant="default"
                                size="sm"
                                class="mt-2"
                                @click="settingsStore.installParpar"
                                :disabled="settingsStore.commands.par.installing"
                            >
                                Install Parpar via npm
                                <LoaderCircle
                                    v-if="settingsStore.commands.par.installing"
                                    class="animate-spin"
                                />
                            </Button>

                            The installation can take up to 5 or 10 minutes, once the installation
                            is complete, please re-check the command above. You can leave this
                            window while the installation is in progress
                        </AlertDescription>
                    </Alert>
                </div>
            </TabsContent>
            <TabsContent value="nyuu" v-if="settingsStore.form">
                <div class="grid grid-cols-1 gap-4">
                    <Label>nyuu command</Label>
                    <ButtonGroup class="!gap-0 w-full">
                        <ButtonGroupText as-child>
                            <Label for="url">
                                <CheckIcon
                                    v-if="
                                        settingsStore.commands.nyuu.active &&
                                        !settingsStore.commands.nyuu.checking
                                    "
                                    class="text-green-700"
                                />
                                <X
                                    v-if="
                                        !settingsStore.commands.nyuu.active &&
                                        !settingsStore.commands.nyuu.checking
                                    "
                                    class="text-red-700"
                                />
                                <LoaderCircle
                                    v-if="settingsStore.commands.nyuu.checking"
                                    class="animate-spin text-amber-500"
                                />
                            </Label>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput
                                id="url"
                                placeholder="nyuu Command"
                                v-model="settingsStore.form.commands.nyuu"
                            />
                            <InputGroupAddon>
                                <SquareTerminal />
                            </InputGroupAddon>
                        </InputGroup>
                        <ButtonGroupText class="px-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                @click="
                                    settingsStore.checkNyuu(false, settingsStore.form.commands.nyuu)
                                "
                            >
                                <RotateCcw />
                            </Button>
                        </ButtonGroupText>
                    </ButtonGroup>
                    <div class="grid grid-cols-1 gap-1">
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >For uploading to the usenet, the nyuu CLI is used, if the command is
                            not found it can be automatically installed.</span
                        >
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >If you installed it manually and it is not working, point the above
                            input to the executable location.</span
                        >
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic"
                            >In the profile settings or when creating a new upload, you can change a
                            bunch of other nyuu specific settings. Servers are managed
                            seperately</span
                        >
                    </div>
                    <Alert
                        v-if="
                            !settingsStore.commands.nyuu.active &&
                            !settingsStore.commands.nyuu.checking
                        "
                        variant="destructive"
                    >
                        <AlertTitle>Nyuu CLI not found</AlertTitle>
                        <AlertDescription>
                            The Nyuu command line tool could not be found. Please ensure it is
                            installed and accessible in your system's PATH. <br />
                            Or you can provide the full path to the executable in the field above
                            <a
                                href="https://github.com/animetosho/Nyuu/blob/master/README.md"
                                target="_blank"
                                class="underline flex align-start"
                                >Download Nyuu CLI here
                                <ExternalLink class="inline ms-1" :size="12" />
                            </a>

                            Nyuu can also be installed via npm, I can run the following command to
                            install it globally: <br />
                            <code class="bg-muted px-2 py-1 rounded-md block mt-2"
                                >npm install -g nyuu</code
                            >

                            <Button
                                variant="default"
                                size="sm"
                                class="mt-2"
                                @click="settingsStore.installNyuu"
                                :disabled="settingsStore.commands.nyuu.installing"
                                >Install Nyuu via npm
                                <LoaderCircle
                                    v-if="settingsStore.commands.nyuu.installing"
                                    class="animate-spin"
                                />
                            </Button>
                            The installation can take up to a few minutes, once the installation is
                            complete, please re-check the command above. You can leave this window
                            while the installation is in progress
                        </AlertDescription>
                    </Alert>
                </div>
            </TabsContent>
            <TabsContent value="servers">
                <ServersSettings v-if="settingsStore.form" :form="settingsStore.form.servers" />
            </TabsContent>
        </Tabs>
    </AppLayout>
</template>
