<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { Theme, useTheme } from './useTheme'
import * as themes from './themes'
import { CodeMirrorVariable, LanguageInfo } from '@renderer/types/codemirror'

import { getLanguageExtension, SupportedLanguages } from './languageUtils'
import SelectInput, { Option } from '../form/SelectInput.vue'
import Label from '../ui/label/Label.vue'
import { EditorView } from '@codemirror/view'
import SidebarContainer from './SidebarContainer.vue'

const props = defineProps({
    modelValue: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    default_lang: {
        type: String,
        required: false,
        default: 'handlebars'
    },
    placeholder: {
        type: String,
        required: false,
        default: ''
    },
    variables: {
        type: Array as PropType<CodeMirrorVariable[]>,
        required: false
    },
    showLanguage: {
        type: Boolean,
        required: false,
        default: true
    }
})

const emit = defineEmits<{
    (e: 'update:modelValue', val: string): void
}>()

const proxyValue = computed({
    get: () => props.modelValue,
    set: val => {
        emit('update:modelValue', val)
    }
})

const config = ref({
    disabled: false,
    indentWithTab: false,
    tabSize: 2,
    autofocus: true,
    language: props.default_lang,
    theme: useTheme().theme.value === Theme.Dark ? 'oneDark' : 'default'
})

const supportedLanguages = ref<LanguageInfo[]>(SupportedLanguages)

const languagesList = computed<Option[]>(() =>
    supportedLanguages.value.map(lang => ({
        label: lang.name,
        value: lang.id
    }))
)
const currentTheme = computed(() =>
    config.value.theme !== 'default' ? (themes as any)[config.value.theme] : undefined
)

const extensionComp = computed(() => {
    const extensions: any[] = []

    extensions.push(currentTheme.value)
    extensions.push(EditorView.lineWrapping)

    const langInfo = supportedLanguages.value.find(lang => lang.id === config.value.language)

    if (!langInfo) return extensions

    extensions.push(getLanguageExtension(langInfo))

    return extensions
})
</script>
<template>
    <div class="grid grid-cols-3">
        <SelectInput
            v-if="showLanguage"
            class="col-span-1"
            label="Language"
            :disabled="disabled"
            v-model="config.language"
            :options="languagesList"
        />
    </div>

    <Label class="mb-2">Content</Label>
    <div class="grid grid-cols-[3fr_1fr] gap-2">
        <codemirror
            v-model="proxyValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :autofocus="config.autofocus"
            :indent-with-tab="config.indentWithTab"
            :tab-size="2"
            :style="{ height: '400px' }"
            :extensions="extensionComp"
        />
        <div v-if="variables" style="height: 400px; overflow-y: auto; overflow-x: clip">
            <SidebarContainer
                :variables="variables"
                @select="template => (proxyValue += template)"
            />
        </div>
    </div>
</template>
