<script setup lang="ts">
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '@components/ui/accordion'
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import type { CodeMirrorVariable } from '@renderer/types/codemirror'

const props = defineProps<{
    variable: CodeMirrorVariable
}>()

const emit = defineEmits<{
    (e: 'select', template: string): void
}>()

function getBaseTemplate() {
    return props.variable.customTemplate || `{{${props.variable.key}}}`
}

function selectBase() {
    emit('select', getBaseTemplate())
}

function selectVariant(tpl: string) {
    emit('select', tpl)
}
</script>

<template>
    <Accordion type="single" collapsible class="border rounded-lg bg-background">
        <AccordionItem :value="variable.key">
            <!-- Header -->
            <AccordionTrigger
                class="flex justify-between items-center px-3 py-2 hover:bg-accent rounded-lg"
            >
                <div class="flex items-center gap-2">
                    <span class="font-medium">{{ variable.name }}</span>

                    <!-- Loopable indicator -->
                    <span
                        v-if="variable.loopable"
                        class="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-600 rounded-full"
                    >
                        loopable
                    </span>
                </div>

                <!-- Info tooltip -->
                <Tooltip v-if="variable.description">
                    <TooltipTrigger>
                        <span class="text-xs text-muted-foreground">?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p class="text-sm">{{ variable.description }}</p>
                        <p v-if="variable.info" class="text-xs mt-1 text-muted-foreground">
                            {{ variable.info }}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </AccordionTrigger>

            <!-- Content -->
            <AccordionContent class="px-3 pb-3 space-y-2">
                <!-- Base variable -->
                <button
                    @click="selectBase"
                    class="w-full text-left px-2 py-1 rounded hover:bg-accent text-sm"
                >
                    Insert: <span class="font-mono">{{ getBaseTemplate() }}</span>
                </button>

                <!-- Variants -->
                <div v-if="variable.variants" class="pl-2 space-y-1 pt-1 border-l">
                    <div class="text-xs font-semibold text-muted-foreground">Variants</div>

                    <button
                        v-for="variant in variable.variants"
                        :key="variant.template"
                        @click="selectVariant(variant.template)"
                        class="w-full text-left px-2 py-1 rounded hover:bg-accent text-sm"
                    >
                        {{ variant.name }} —
                        <span class="font-mono text-xs">{{ variant.template }}</span>
                    </button>
                </div>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
</template>
