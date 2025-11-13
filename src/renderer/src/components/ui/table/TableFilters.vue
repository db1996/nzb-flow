<script setup lang="ts">
import { Check, CircleFadingPlus, CircleX } from 'lucide-vue-next';
import type { Component } from 'vue';
import { computed } from 'vue';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';

import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import { cn } from '@renderer/lib/utils';

type Option = {
    label: string;
    value: string;
    icon?: Component;
};

const props = defineProps<{
    modelValue?: string[];
    options: Option[];
    title?: string;
    placeholder?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
}>();

const selectedValues = computed(() => new Set(props.modelValue ?? []));
const hasOptions = computed(() => (props.options?.length ?? 0) > 0);

const toggleValue = (value: string) => {
    const current = new Set(selectedValues.value);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    current.has(value) ? current.delete(value) : current.add(value);

    emit('update:modelValue', [...current]);
};

const clearAll = () => emit('update:modelValue', []);
</script>

<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button variant="outline" class="mt-1">
                <CircleFadingPlus class="h-4 w-4" />
                {{ title ?? 'Filter' }}

                <template v-if="selectedValues.size > 0">
                    <Separator orientation="vertical" class="mx-1 h-4" />

                    <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
                        {{ selectedValues.size }}
                    </Badge>

                    <div class="hidden space-x-1 lg:flex">
                        <Badge v-if="selectedValues.size > 2" variant="secondary" class="rounded-sm px-1 font-normal">
                            {{ 'Selected {count}'.replace('{count}', selectedValues.size.toString()) }}
                        </Badge>
                        <template v-else>
                            <Badge
                                v-for="option in props.options.filter((o) => selectedValues.has(o.value))"
                                :key="option.value"
                                variant="secondary"
                                class="rounded-sm px-1 font-normal"
                            >
                                {{ option.label }}
                            </Badge>
                        </template>
                    </div>
                </template>
            </Button>
        </PopoverTrigger>

        <PopoverContent class="w-[200px] p-0" align="start">
            <Command>
                <CommandInput :placeholder="placeholder || 'Search'" />
                <CommandList>
                    <!-- When search yields nothing -->
                    <CommandEmpty class="text-muted-foreground py-4 text-center text-sm">
                        {{ 'No Results' }}
                    </CommandEmpty>

                    <CommandGroup>
                        <!-- When options array is empty -->
                        <template v-if="!hasOptions">
                            <div class="text-muted-foreground py-4 text-center text-sm">
                                {{ 'No Results' }}
                            </div>
                        </template>

                        <!-- Normal options rendering -->
                        <template v-else>
                            <CommandItem
                                v-for="option in props.options"
                                :key="option.value"
                                :value="option.label"
                                @select="() => toggleValue(option.value)"
                            >
                                <div
                                    :class="
                                        cn(
                                            'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                            selectedValues.has(option.value) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&>svg]:invisible',
                                        )
                                    "
                                >
                                    <Check class="h-4 w-4" color="#fff" />
                                </div>

                                <component :is="option.icon" v-if="option.icon" class="text-muted-foreground mr-2 h-4 w-4" />
                                <span>{{ option.label }}</span>
                            </CommandItem>
                        </template>
                    </CommandGroup>

                    <template v-if="selectedValues.size > 0">
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem :value="'Clear'" class="justify-center text-center" @select="clearAll">
                                <CircleX class="h-4 w-4" />
                                {{ 'Clear' }}
                            </CommandItem>
                        </CommandGroup>
                    </template>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>
