<script lang="ts" setup>
import Button from '@renderer/components/ui/button/Button.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import FileSelectInput from '@renderer/components/form/FileSelectInput.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import Tabs from '@renderer/components/ui/tabs/Tabs.vue'
import TabsList from '@renderer/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@renderer/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '@renderer/components/ui/tabs/TabsContent.vue'
import CodeMirrorComponent from '@renderer/components/codemirror/CodeMirrorComponent.vue'
import { ref } from 'vue'
import { CODEMIRROR_VARIABLES } from '@main/types/settings/commands/TaskVariables'
import Label from '@renderer/components/ui/label/Label.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { Copy, X } from 'lucide-vue-next'
import CardDescription from '@renderer/components/ui/card/CardDescription.vue'
import { copyToClipboard } from '@renderer/lib/utils'
import { useContentTemplateStore } from '@renderer/composables/useContentTemplateStore'

const props = defineProps({
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const copyUtils = copyToClipboard()

const contentTemplateStore = useContentTemplateStore()

const emits = defineEmits(['close'])

const save = () => {
    if (contentTemplateStore.activeContentTemplateEdit === null) return

    contentTemplateStore.saveContentTemplate(contentTemplateStore.activeContentTemplateEdit)
    emits('close')
}

const variables = ref(CODEMIRROR_VARIABLES)
</script>

<template>
    <Card v-if="contentTemplateStore.activeContentTemplateEdit">
        <CardHeader>
            <div class="flex gap-2 justify-between">
                <CardTitle
                    >Content template -
                    {{ contentTemplateStore.activeContentTemplateEdit?.name }}</CardTitle
                >
                <div class="flex gap-2 align-items-center">
                    <Button variant="default" @click="save"> Save content template </Button>
                    <Button variant="secondary" @click="emits('close')"> <X /> </Button>
                </div>
            </div>
            <CardDescription>
                ID:
                <code class="mx-1 mt-0 text-xs text-gray-500 italic"
                    >{{ contentTemplateStore.activeContentTemplateEdit?.id }}
                </code>
                <Copy
                    class="inline cursor-pointer"
                    :class="{
                        'text-green-500':
                            copyUtils.flashCopied.value && copyUtils.copiedSuccess.value,
                        'text-red-500':
                            copyUtils.flashCopied.value && !copyUtils.copiedSuccess.value
                    }"
                    :size="14"
                    @click="copyUtils.copy(contentTemplateStore.activeContentTemplateEdit?.id)"
                />
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs default-value="general" class="flex flex-col gap-4">
                <TabsList class="grid w-full grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="file">File and Contents</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <TextInput
                        v-model="contentTemplateStore.activeContentTemplateEdit.name"
                        label="Content template name (UI)"
                        :disabled="disabled"
                        class="mb-4"
                    />

                    <hr />

                    <h3 class="text-md font-medium mb-2 mb-4">Where to save</h3>

                    <p class="text-sm text-muted-foreground mb-4">
                        The generated file will always be available in the task log screen
                    </p>

                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <SwitchInput
                            :disabled="disabled"
                            label="Save with NZB file after posting"
                            v-model="contentTemplateStore.activeContentTemplateEdit.saveWithNzb"
                            helpt="The generated file will be saved alongside the NZB file after posting."
                        />

                        <!-- <SwitchInput
                            :disabled="disabled"
                            label="Include in the post archive"
                            help="Include the generated file in the post archive uploaded to the news server. Some variables can not be used when this is enabled."
                            v-model="contentTemplateStore.activeContentTemplateEdit.includeInPost"
                        /> -->
                    </div>

                    <FileSelectInput
                        v-model="contentTemplateStore.activeContentTemplateEdit.customLocation"
                        label="Custom save location"
                        help="Keep empty to not use it"
                        :disabled="disabled"
                        class="mb-4"
                    />
                </TabsContent>

                <TabsContent value="file">
                    <div class="grid grid-cols-2 gap-2">
                        <TextInput
                            v-model="contentTemplateStore.activeContentTemplateEdit.fileName"
                            label="File name"
                            :disabled="disabled"
                            class="mb-4"
                            help="{jobname} is the name of the nzb, rar files, par files and post name if you do not obfuscate. <br>{fname} is the name of the first file or folder in the post"
                        />

                        <TextInput
                            v-model="contentTemplateStore.activeContentTemplateEdit.fileType"
                            label="File extension"
                            :disabled="disabled"
                            placeholder=".txt, .nfo, .json"
                            class="mb-4"
                        />
                    </div>
                    <Label class="mb-2">Content</Label>
                    <!-- <span class="ms-1 mt-0 text-xs text-gray-500 italic mb-2"
                        >You can use custom variables like <code v-html="'{{thisVariable}}'" />. You
                        will be asked to fill these in manually per post
                    </span> -->
                    <br />
                    <Button
                        as="a"
                        target="_blank"
                        href="https://github.com/db1996/nzb-flow/blob/main/docs/Content%20Templates%20Variables.md"
                        variant="link"
                        class="inline m-0 p-0"
                        >Check the docs here</Button
                    >
                    <CodeMirrorComponent
                        v-model="contentTemplateStore.activeContentTemplateEdit.templateContent"
                        :variables="variables"
                        :disabled="disabled"
                        :show-language="false"
                    />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
</template>
