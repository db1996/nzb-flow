<script lang="ts" setup>
import { Button } from '@components/ui/button'
import CardForm from '@renderer/components/form/CardForm.vue'
import { PropType } from 'vue'
import { NyuuSettings } from '@main/types/settings/commands/NyuuSettings'
import CommandData from '@main/types/settings/commands/commandData'
import CommandDataView from './CommandDataView.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import ButtonGroup from '@renderer/components/ui/button-group/ButtonGroup.vue'
import ButtonGroupText from '@renderer/components/ui/button-group/ButtonGroupText.vue'
import Label from '@renderer/components/ui/label/Label.vue'
import InputGroup from '@renderer/components/ui/input-group/InputGroup.vue'
import InputGroupInput from '@renderer/components/ui/input-group/InputGroupInput.vue'
import InputGroupAddon from '@renderer/components/ui/input-group/InputGroupAddon.vue'
import Checkbox from '@renderer/components/ui/checkbox/Checkbox.vue'

defineProps({
    form: {
        type: Object as PropType<NyuuSettings>,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    commandData: {
        type: Object as PropType<CommandData>,
        required: false
    }
})

</script>
<template>
    <CardForm
        title="Nyuu CLI"
        description="This program uses Nyuu to upload to the usenet."
        footer_class="justify-end"
    >
        <template #body>
            <CommandDataView v-if="commandData" :commandData="commandData" />
            <div class="grid gap-2 grid-cols-2">
                <TextInput
                    :disabled="disabled"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Article Size"
                    help="Article size, default: 700K"
                    v-model="form.articleSize"
                />
                <SwitchInput
                    :disabled="disabled"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Include password in NZB"
                    help="Download clients will use this password when downloading the NZB if it is password protected."
                    v-model="form.includePasswordInNzb"
                />
            </div>
            <hr />
            <p>Post checking</p>
            <div class="grid gap-2 grid-cols-2 gap-4">
                <TextInput
                    :disabled="disabled"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check connections"
                    type="number"
                    help="Number of connections to use when checking posts, if set to 0 then no checking will be done. This will result in total server connections to be increased. Default: 0"
                    v-model="form.checkConnections"
                />
                <TextInput
                    :disabled="disabled || form.checkConnections === 0"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check tries"
                    type="number"
                    help="Number of tries checking posts, if set to 0 then no checking will be done. Default: 2"
                    v-model="form.checkTries"
                />
                <TextInput
                    :disabled="disabled || form.checkConnections === 0"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check delay"
                    help="Delay between posting and checking, example: 5s, 5000ms, 1m, 1h. Default: 5s"
                    v-model="form.checkDelay"
                />
                <TextInput
                    :disabled="disabled || form.checkConnections === 0"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check retry delay"
                    help="Delay between check retry attempts, example: 5s, 5000ms, 1m, 1h. Default: 30s"
                    v-model="form.checkRetryDelay"
                />
                <TextInput
                    :disabled="disabled"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check post tries"
                    type="number"
                    help="Maximum number of attempts to re-post articles that failed checking, set to 0 to disable. Default: 1"
                    v-model="form.checkPostTries"
                />
                <TextInput
                    :disabled="disabled"
                    height-class="min-h-[2.5rem]"
                    label-height-class="min-h-[1rem]"
                    label="Check queue size"
                    type="number"
                    help="Max number of articles queued for checking. Default: 10000"
                    v-model="form.checkQueueSize"
                />
            </div>
            <hr />
            <p>Advanced overrides <Button as="a" target="_blank" href="https://github.com/animetosho/Nyuu/blob/master/help-full.txt" variant="link" class="inline">Check nyuu documentation</Button></p>
            <div class="grid gap-2 grid-cols-2 gap-6">
                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Subject Override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.subjectOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="subject" v-model="form.subject" :disabled="disabled || !form.subjectOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--subject</code> parameter for nyuu</span>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Filename Override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.filenameOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="filename" v-model="form.filename" :disabled="disabled || !form.filenameOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--filename</code> parameter from nyuu</span>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Yenc name override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.yencNameOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="yencHeader" v-model="form.yencName" :disabled="disabled || !form.yencNameOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--yenc-name</code> parameter from nyuu</span>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Date Override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.dateOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="date" v-model="form.date" :disabled="disabled || !form.dateOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--date</code> parameter from nyuu</span>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Message-ID Override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.messageIdOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="messageId" v-model="form.messageId" :disabled="disabled || !form.messageIdOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--message-id</code> parameter from nyuu</span>
                </div>


                <div class="grid grid-cols-1 gap-2">
                    <Label for="messageId">Article encoding override</Label>
                    <ButtonGroup class="!gap-0 w-[auto]">
                        <ButtonGroupText as-child>
                            <InputGroupAddon>
                                <Checkbox :disabled="disabled" v-model="form.articleEncodingOverride" />
                            </InputGroupAddon>
                        </ButtonGroupText>
                        <InputGroup>
                            <InputGroupInput id="articleEncoding" v-model="form.articleEncoding" :disabled="disabled || !form.articleEncodingOverride" />
                        </InputGroup>
                    </ButtonGroup>
                    <span class="ms-1 mt-0 text-xs text-gray-500 italic">Check the checkbox to override the default (by default, no argument is used). This is the <code>--article-encoding</code> parameter from nyuu</span>
                </div>
            </div>
        </template>
    </CardForm>
</template>
