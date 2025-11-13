<script lang="ts" setup>
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@ui/command'
import Label from '@ui/label/Label.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
import { Check, ChevronDown, CircleCheck, CircleX } from 'lucide-vue-next'
import { computed, nextTick, ref, useId, watch } from 'vue'

export interface Option {
    value: string | number
    label: string
    disabled?: boolean
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | Array<string | number> | null): void
    (e: 'change', value: string | number | Array<string | number> | null): void
    (e: 'open-change', open: boolean): void
}>()

const props = withDefaults(
    defineProps<{
        modelValue: string | number | Array<string | number> | null
        label?: string
        required?: boolean
        placeholder?: string
        error?: string
        options?: Option[]
        disabled?: boolean
        help?: string
        withActions?: boolean
        searchable?: boolean
        maxSelected?: number
        triggerText?: string // e.g. "Selected {count}"
        multiple?: boolean
        disableClear?: boolean
    }>(),
    {
        withActions: true,
        searchable: true,
        disableClear: false
    }
)

const open = ref(false)
const proxyId = useId()

const internal = ref<string | number | null | (string | number)[]>(
    props.multiple
        ? Array.isArray(props.modelValue)
            ? [...props.modelValue]
            : []
        : (props.modelValue as string | number | null) ?? null
)

watch(
    () => props.modelValue,
    v => {
        if (props.multiple) {
            if (
                !arraysEqual(
                    internal.value as (string | number)[],
                    (v as (string | number)[]) ?? []
                )
            ) {
                internal.value = Array.isArray(v) ? [...(v as (string | number)[])] : []
            }
        } else {
            internal.value = (v as string | number | null) ?? null
        }
    },
    { immediate: true }
)

function arraysEqual(a: (string | number)[], b: (string | number)[]) {
    if (a.length !== b.length) return false
    const as = new Set(a)
    for (const x of b) if (!as.has(x)) return false
    return true
}

const allOptions = computed<Option[]>(() => props.options?.map(o => ({ ...o })) ?? [])
const disabled = computed(() => props.disabled)
const isAtMax = computed(
    () =>
        props.multiple &&
        !!props.maxSelected &&
        (internal.value as (string | number)[]).length >= (props.maxSelected ?? 0)
)

const selectedSet = computed(() => {
    if (Array.isArray(internal.value)) {
        return new Set(internal.value.filter(v => v != null))
    }
    return internal.value != null ? new Set([internal.value]) : new Set()
})

function updateModel(v: string | number | (string | number)[] | null) {
    internal.value = v as any
    emit('update:modelValue', v)
    emit('change', v)
}

function toggleValue(val: string | number) {
    if (props.multiple) {
        const set = new Set(internal.value as (string | number)[])
        if (set.has(val)) {
            set.delete(val)
        } else if (!isAtMax.value) {
            set.add(val)
        }
        updateModel(Array.from(set))
    } else {
        if (internal.value === val) {
            updateModel(null)
        } else {
            updateModel(val)
        }
        open.value = false
    }
}

const canSelect = (option: Option) => {
    if (disabled.value) return false
    if (option.disabled) return false
    if (props.multiple && isAtMax.value && !selectedSet.value.has(option.value)) return false
    return true
}

function onSelectOption(option: Option) {
    if (!canSelect(option)) return // stop selection
    toggleValue(option.value)
}

function clearAll() {
    updateModel(props.multiple ? [] : null)
}

function selectAll() {
    if (!props.multiple || !allOptions.value.length) return
    const selectable = allOptions.value.filter(o => !o.disabled).map(o => o.value)
    const limit = props.maxSelected ?? 0
    const final = limit > 0 ? selectable.slice(0, limit) : selectable
    updateModel(final)
}

function onOpenChange(next: boolean) {
    if (disabled.value) return
    open.value = next
    emit('open-change', next)
    if (next) nextTick(() => {})
}

function onTriggerKeydown(e: KeyboardEvent) {
    if (
        props.multiple &&
        e.key === 'Backspace' &&
        Array.isArray(internal.value) &&
        internal.value.length
    ) {
        e.preventDefault()
        const next = [...internal.value]
        next.pop()
        updateModel(next)
    }
}

const showClear = computed(() => selectedSet.value.size > 0 && !props.disableClear)

const showSelectAll = computed(() => {
    if (!props.multiple) return false
    if (!allOptions.value.length) return false
    return selectedSet.value.size < allOptions.value.filter(o => !o.disabled).length
})

/** ---------- Trigger display (badges, counts) ---------- **/
const maxInlineBadges = 3

const selectedValuesArray = computed<(string | number)[]>(() => {
    if (Array.isArray(internal.value)) return internal.value as (string | number)[]
    return internal.value != null ? [internal.value as string | number] : []
})

const selectedCount = computed(() => selectedValuesArray.value.length)

const displayedPairs = computed(() => {
    const lookup = new Map(allOptions.value.map(o => [o.value, o.label]))
    return selectedValuesArray.value.slice(0, maxInlineBadges).map(v => ({
        value: v,
        label: lookup.get(v) ?? String(v)
    }))
})

const manySelectedText = computed(() => {
    if (props.triggerText?.includes('{count}')) {
        return props.triggerText.replace('{count}', String(selectedCount.value))
    }
    return 'Selected {count} items'
})

/** ---------- Auto-clear if selected becomes disabled ---------- **/
watch([allOptions, selectedSet], () => {
    // Single
    if (!props.multiple && internal.value != null) {
        const opt = allOptions.value.find(o => o.value === internal.value)
        if (opt && opt.disabled) updateModel(null)
    }
    // Multiple
    if (props.multiple && Array.isArray(internal.value)) {
        const allowed = new Set(allOptions.value.filter(o => !o.disabled).map(o => o.value))
        const next = (internal.value as (string | number)[]).filter(v => allowed.has(v))
        if (!arraysEqual(next, internal.value as (string | number)[])) updateModel(next)
    }
})
</script>

<template>
    <div class="grid gap-2">
        <Label v-if="label" :for="proxyId">
            {{ label }}
            <span v-if="required" class="text-destructive">*</span>
        </Label>

        <Popover :open="open" @update:open="onOpenChange">
            <PopoverTrigger as-child :id="proxyId">
                <Button
                    variant="outline"
                    class="mt-1 w-full justify-between overflow-hidden"
                    :disabled="disabled"
                    @keydown="onTriggerKeydown"
                >
                    <div class="flex flex-wrap items-center gap-1 truncate font-normal">
                        <!-- Multiple mode -->
                        <template v-if="props.multiple && Array.isArray(internal)">
                            <span v-if="selectedCount === 0" class="text-muted-foreground">
                                {{ placeholder }}
                            </span>

                            <template v-else>
                                <Badge
                                    variant="secondary"
                                    class="rounded-sm px-1 font-normal lg:hidden"
                                >
                                    {{ selectedCount }}
                                </Badge>

                                <div class="hidden space-x-1 lg:flex">
                                    <Badge
                                        v-if="selectedCount > maxInlineBadges"
                                        variant="secondary"
                                        class="rounded-sm px-1 font-normal"
                                    >
                                        {{ manySelectedText }}
                                    </Badge>

                                    <template v-else>
                                        <Badge
                                            v-for="pair in displayedPairs"
                                            :key="pair.value"
                                            variant="secondary"
                                            class="flex items-center gap-1 rounded-sm px-1 font-normal"
                                        >
                                            <span class="max-w-[10rem] truncate">
                                                {{ pair.label }}
                                            </span>
                                        </Badge>
                                    </template>
                                </div>
                            </template>
                        </template>

                        <!-- Single mode -->
                        <template v-else-if="!props.multiple && internal != null">
                            <span class="truncate">
                                {{ allOptions.find(o => o.value === internal)?.label ?? internal }}
                            </span>
                        </template>

                        <!-- Placeholder for single/unset -->
                        <span v-else class="text-muted-foreground">
                            {{ placeholder }}
                        </span>
                    </div>
                    <ChevronDown class="opacity-30" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" :side-offset="4" class="p-0">
                <!-- SEARCHABLE -->
                <Command v-if="props.searchable" should-filter class="w-full">
                    <div>
                        <CommandInput :placeholder="placeholder || 'Search...'" />
                    </div>
                    <CommandList class="max-h=[min(60vh,20rem)] max-h-[min(60vh,20rem)]">
                        <CommandEmpty class="text-muted-foreground py-6 text-center text-sm">
                            {{ 'No results found' }}
                        </CommandEmpty>

                        <CommandGroup>
                            <template v-if="options && options.length">
                                <CommandItem
                                    v-for="option in options"
                                    :key="option.value"
                                    :disabled="
                                        disabled ||
                                        option.disabled ||
                                        (isAtMax && !selectedSet.has(option.value))
                                    "
                                    :value="String(option.label)"
                                    @select="onSelectOption(option)"
                                    :class="[
                                        'cursor-pointer',
                                        disabled || option.disabled
                                            ? 'pointer-events-none opacity-50 select-none'
                                            : ''
                                    ]"
                                >
                                    <Check
                                        class="h-4 w-4"
                                        :class="
                                            selectedSet.has(option.value)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        "
                                    />
                                    <span class="truncate">{{ option.label }}</span>
                                </CommandItem>
                            </template>

                            <template v-else>
                                <div
                                    class="text-muted-foreground py-4 text-center align-middle text-sm"
                                >
                                    {{ 'No options available' }}
                                </div>
                            </template>
                        </CommandGroup>

                        <template v-if="withActions && (showSelectAll || showClear)">
                            <CommandSeparator />
                            <CommandGroup class="flex items-center">
                                <CommandItem
                                    v-if="showSelectAll"
                                    value="select"
                                    @select="selectAll"
                                    class="flex flex-1 items-center justify-center"
                                >
                                    <CircleCheck class="h-4 w-4" />
                                    <span>{{ 'Select All' }}</span>
                                </CommandItem>

                                <CommandItem
                                    v-if="showClear"
                                    value="clear"
                                    @select="clearAll"
                                    class="flex flex-1 items-center justify-center"
                                >
                                    <CircleX class="h-4 w-4" />
                                    <span>{{ 'Clear' }}</span>
                                </CommandItem>
                            </CommandGroup>
                        </template>
                    </CommandList>
                </Command>

                <!-- NON-SEARCH -->
                <Command v-else class="w-full">
                    <CommandList class="max-h=[min(60vh,20rem)] max-h-[min(60vh,20rem)]">
                        <CommandGroup>
                            <template v-if="options && options.length">
                                <CommandItem
                                    v-for="option in options"
                                    :key="option.value"
                                    :disabled="
                                        disabled ||
                                        option.disabled ||
                                        (isAtMax && !selectedSet.has(option.value))
                                    "
                                    :value="String(option.label)"
                                    @select="onSelectOption(option)"
                                    :class="[
                                        'cursor-pointer',
                                        disabled || option.disabled
                                            ? 'pointer-events-none opacity-50 select-none'
                                            : ''
                                    ]"
                                >
                                    <Check
                                        class="h-4 w-4"
                                        :class="
                                            selectedSet.has(option.value)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        "
                                    />
                                    <span class="truncate">{{ option.label }}</span>
                                </CommandItem>
                            </template>

                            <template v-else>
                                <slot
                                    name="options"
                                    :selected="selectedSet"
                                    :toggle="toggleValue"
                                />
                            </template>
                        </CommandGroup>

                        <template v-if="withActions && (showSelectAll || showClear)">
                            <CommandSeparator />
                            <CommandGroup class="flex items-center">
                                <CommandItem
                                    v-if="showSelectAll"
                                    value="select"
                                    @select="selectAll"
                                    class="flex flex-1 items-center justify-center"
                                >
                                    <CircleCheck class="h-4 w-4" />
                                    <span>{{ 'Select All' }}</span>
                                </CommandItem>

                                <CommandItem
                                    v-if="showClear"
                                    value="clear"
                                    @select="clearAll"
                                    class="flex flex-1 items-center justify-center"
                                >
                                    <CircleX class="h-4 w-4" />
                                    <span>{{ 'Clear' }}</span>
                                </CommandItem>
                            </CommandGroup>
                        </template>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>

        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        <span v-if="help" class="ms-1 mt-0 text-xs text-gray-500 italic">{{ help }}</span>
    </div>
</template>
