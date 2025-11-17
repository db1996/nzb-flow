<script lang="ts" setup>
import CardForm from '@renderer/components/form/CardForm.vue'
import { PropType } from 'vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import Checkbox from '@renderer/components/ui/checkbox/Checkbox.vue'
import { RandomSettings } from '@main/types/settings/RandomSettings'
import TextInput from '@renderer/components/form/TextInput.vue'
import { Alert } from '@renderer/components/ui/alert'
import AlertTitle from '@renderer/components/ui/alert/AlertTitle.vue'
import AlertDescription from '@renderer/components/ui/alert/AlertDescription.vue'

defineProps({
    form: {
        type: Object as PropType<RandomSettings>,
        required: true
    },
    title: {
        type: String,
        required: false,
        default: 'Post title settings'
    },
    description: {
        type: String,
        required: false,
        default: 'Automatically generate random post title for each upload'
    },
    useSpecialChars: {
        type: Boolean,
        required: false,
        default: false
    },
    label: {
        type: String,
        required: false,
        default: 'Generate random post title'
    },
    labelType: {
        type: String,
        required: false,
        default: 'subject'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    isName: {
        type: Boolean,
        default: false
    }
})
</script>
<template>
    <CardForm :title="title" :description="description" description_class="min-h-[2.5rem]">
        <template #body>
            <Alert v-if="disabled" variant="info">
                <AlertTitle>RAR disabled</AlertTitle>
                <AlertDescription>
                    RAR creation is disabled, so a password will not be applied.
                </AlertDescription>
            </Alert>
            <div class="space-y-4">
                <SwitchInput :label="label" v-model="form.randomNameMode" :disabled="disabled" />
            </div>
            <div class="space-y-4" v-if="!form.randomNameMode">
                <TextInput
                    :disabled="disabled"
                    label="Custom"
                    help="The same value will always be used"
                    v-model="form.customName"
                />
            </div>
            <div class="space-y-4" v-if="form.randomNameMode">
                <div class="flex">
                    <div class="flex items-center space-x-2 me-2">
                        <Checkbox
                            :disabled="!form.randomNameMode || disabled"
                            id="a-z"
                            v-model="form.useLowercase"
                        />
                        <label
                            for="a-z"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            a-z
                        </label>
                    </div>
                    <div class="flex items-center space-x-2 me-2">
                        <Checkbox
                            :disabled="!form.randomNameMode || disabled"
                            id="A-Z"
                            v-model="form.useUppercase"
                        />
                        <label
                            for="A-Z"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            A-Z
                        </label>
                    </div>
                    <div class="flex items-center space-x-2 me-2">
                        <Checkbox
                            :disabled="!form.randomNameMode || disabled"
                            id="0-9"
                            v-model="form.useNumbers"
                        />
                        <label
                            for="0-9"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            0-9
                        </label>
                    </div>
                </div>
            </div>
            <div class="grid gap-2 grid-cols-3" v-if="form.randomNameMode">
                <TextInput
                    :disabled="!form.randomNameMode || disabled"
                    label="Default Length"
                    :help="`Length of the random ${labelType}`"
                    v-model="form.randomNameLength"
                />
                <TextInput
                    :disabled="disabled"
                    label="Prefix"
                    :help="`Always used when generating ${labelType}s`"
                    v-model="form.prefix"
                />
                <TextInput
                    :disabled="disabled"
                    label="Suffix"
                    :help="`Always used when generating ${labelType}s`"
                    v-model="form.suffix"
                />
            </div>
            <p v-if="isName">Use {fname} to use the filename/foldername of the first file/folder</p>
        </template>
    </CardForm>
</template>
