<script lang="ts" setup>
import { PropType, watch } from 'vue'
import { PostingSettings } from '@main/types/settings/commands/PostingSettings'
import RandomSettings from './RandomSettings.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import CardForm from '@renderer/components/form/CardForm.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import { TaskConfig } from '@main/types/settings/commands/taskSettings'
import Button from '@renderer/components/ui/button/Button.vue'
import { Dices } from 'lucide-vue-next'
import Label from '@renderer/components/ui/label/Label.vue'
import CopyInput from '@renderer/components/form/CopyInput.vue'
import Alert from '@renderer/components/ui/alert/Alert.vue'
import AlertTitle from '@renderer/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@renderer/components/ui/alert/AlertDescription.vue'

const props = defineProps({
    form: {
        type: Object as PropType<PostingSettings>,
        required: true
    },
    useName: {
        type: Boolean,
        default: false
    },
    taskSettings: {
        type: Object as PropType<TaskConfig>,
        required: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    skipRarCreation: {
        type: Boolean,
        default: false
    }
})

const emits = defineEmits(['update:form'])

function randomizeFrom() {
    props.form.post_from = `${generateString(6)}@${generateString(4)}.${generateString(2)}`
}

function generateString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters[Math.floor(Math.random() * characters.length)]
    }
    return result
}

watch(
    () => props.form,
    newVal => {
        console.log('posting settings changed', newVal)
    },
    { deep: true }
)
</script>
<template>
    <div class="grid grid-cols-1 gap-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RandomSettings
                :form="form.nameSettings"
                :useSpecialChars="false"
                v-if="!useName"
                :is-name="true"
            />
            <RandomSettings
                v-if="!useName"
                :form="form.passwordSettings"
                :disabled="skipRarCreation"
                title="Password settings"
                description="Automatically generate random password for each upload"
                label="Generate random password"
                labelType="password"
                :useSpecialChars="true"
            />
        </div>
        <CardForm
            title="Other posting Settings"
            description="Configure various settings for posting to usenet. Check the nyuu tab for more posting related settings"
        >
            <template #body>
                <div class="grid gap-2 grid-cols-2" v-if="taskSettings">
                    <CopyInput
                        :disabled="disabled"
                        v-model="taskSettings.name"
                        label="Post title"
                        height-class="min-h-[2.5rem]"
                        label-height-class="min-h-[1.5rem]"
                        help-class="min-h-[3rem] md:min-h-[2.5rem]"
                        help="Title of the post, if no other obfuscation is used, this will used for rar/par2 filenames, NZB filename and eventually the post subject"
                    />
                    <CopyInput
                        :disabled="disabled"
                        v-model="taskSettings.password"
                        label="Password"
                        height-class="min-h-[2.5rem]"
                        label-height-class="min-h-[1.5rem]"
                        help-class="min-h-[3rem] md:min-h-[2.5rem]"
                        :help="
                            taskSettings.taskSettings.rarSettings.skipRarCreation
                                ? 'RAR creation is disabled, so a password will not be applied.'
                                : 'This password will be used for RAR file encryption if it is not empty.'
                        "
                    />
                </div>
                <div class="grid grid-cols-[1fr_75px_49%] gap-2">
                    <TextInput
                        :disabled="disabled"
                        height-class="min-h-[2.5rem]"
                        label-height-class="min-h-[1.5rem]"
                        label="From"
                        help="The email address to use when posting to usenet. Do not use spaces."
                        v-model="form.post_from"
                    />
                    <SwitchInput
                        :disabled="disabled"
                        v-if="!taskSettings"
                        height-class="min-h-[2.5rem]"
                        label-height-class="min-h-[1.5rem]"
                        label="Randomize from"
                        v-model="form.postFromRandomized"
                    />
                    <div
                        class="grid grid-rows-[2.3rem_2.5rem_1fr] grid-cols-1 gap-0"
                        v-if="taskSettings"
                    >
                        <div>
                            <Label class="min-h-[1.5rem]">Randomize</Label>
                        </div>
                        <Button :disabled="disabled" class="m-0 w-[50px]" @click="randomizeFrom()">
                            <Dices />
                        </Button>
                    </div>
                    <TextInput
                        :disabled="disabled"
                        height-class="min-h-[2.5rem]"
                        label-height-class="min-h-[1.5rem]"
                        label="Groups"
                        help="Newsgroups to post to, separated by commas. Do not use spaces"
                        v-model="form.post_groups"
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <SwitchInput
                        :disabled="disabled"
                        label="Save Rar and par2 files"
                        v-model="form.saveRarPars"
                        help="Keep the RAR and par2 files after upload"
                    />
                </div>
                <hr />
                <div class="grid grid-cols-3 gap-4">
                    <SwitchInput
                        :disabled="disabled"
                        label="Obfuscate subject"
                        v-model="form.obfuscateSubject"
                        help="Obfuscate the subject of the posts to make it harder to identify the content. Will generate a UUID as subject."
                    />
                    <SwitchInput
                        :disabled="disabled"
                        label="Obfuscate filename"
                        v-model="form.obfuscateFilename"
                        help="Obfuscate the filenames info of usenet posts to make it harder to identify the content. This will only affect the filename parameter to the usenet poster, the rar/par/nzb files will remain unchanged."
                    />
                    <SwitchInput
                        :disabled="disabled"
                        label="Obfuscate YENC name"
                        v-model="form.obfuscateYencName"
                        help="Obfuscate the YENC name of the posts to make it harder to identify the content."
                    />
                </div>
                <Alert variant="info">
                    <AlertTitle>Obfuscation</AlertTitle>
                    <AlertDescription>
                        Obfuscation settings will override any custom name/subject/filename settings
                        in the nyuu tab. Enabling all 3 of these options will make it very hard to
                        identify the content being posted. And the only way to download the content
                        is to use the original NZB file. <br />
                        Even then, sometimes usenet downloaders will have issues downloading
                        obfuscated content.
                    </AlertDescription>
                </Alert>
            </template>
        </CardForm>
    </div>
</template>
