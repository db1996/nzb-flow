<script setup lang="ts">
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '@components/ui/accordion'
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import type { CodeMirrorVariable } from '@renderer/types/codemirror'
import { Item, ItemContent } from '@components/ui/item'
import Button from '../ui/button/Button.vue'
import { ChevronDown } from 'lucide-vue-next'
import Table from '../table/Table.vue'
import TableRow from '../ui/table/TableRow.vue'
import TableHead from '../ui/table/TableHead.vue'
import TableCell from '../ui/table/TableCell.vue'

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
    <Accordion type="single" collapsible>
        <AccordionItem :value="variable.key">
            <Item variant="outline" class="py-0">
                <ItemContent>
                    <div class="flex justify-between items-center relative">
                        <div class="flex items-center gap-2">
                            <Button variant="outline_info" size="xs" class="p-3" @click="selectBase"
                                >Insert</Button
                            >
                            <span>{{ variable.name }}</span>
                        </div>
                        <div class="h-[35px]">
                            <AccordionTrigger v-if="variable.variants" class="p-0">
                                <template #icon>
                                    <Button variant="ghost" size="xs" class="p-0"
                                        ><ChevronDown
                                    /></Button>
                                </template>
                            </AccordionTrigger>
                        </div>
                        <div>
                            <Tooltip v-if="variable.description">
                                <TooltipTrigger>
                                    <span class="text-xs text-muted-foreground">?</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p class="text-sm">{{ variable.description }}</p>
                                    <p v-if="variable.info" class="text-xs mt-1">
                                        {{ variable.info }}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <AccordionContent class="">
                        <span class="ms-1 mt-0 text-xs text-gray-500 italic">{{
                            getBaseTemplate()
                        }}</span>

                        <p class="ms-1 mt-0 text-xs text-gray-500 italic">
                            {{ variable.description }}
                        </p>

                        <div v-if="variable.variants" class="mt-2 ms-2">
                            <div class="text-xs font-semibold text-muted-foreground mb-2">
                                Variants
                            </div>
                            <div class="text-xs font-semibold text-muted-foreground mb-2">
                                Click the rows to insert
                            </div>
                            <Table>
                                <template #head>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Template</TableHead>
                                </template>
                                <template #body>
                                    <TableRow
                                        v-for="variant in variable.variants"
                                        :key="variant.template"
                                        class="cursor-pointer"
                                        @click="selectVariant(variant.template)"
                                    >
                                        <TableCell class="font-medium">{{
                                            variant.name
                                        }}</TableCell>
                                        <TableCell>
                                            <span class="font-mono text-xs">{{
                                                variant.template
                                            }}</span>
                                        </TableCell>
                                    </TableRow>
                                </template>
                            </Table>
                        </div>
                    </AccordionContent>
                </ItemContent>
            </Item>
        </AccordionItem>
    </Accordion>
</template>
