<!-- components/form/DatePickerInput.vue -->
<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { CalendarDate, parseDate } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { computed } from 'vue';

import { Button } from '@ui/button';
import { Calendar } from '@ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { cn, dateFormat } from '@renderer/lib/utils';

type StringDate = string | null; // must be 'YYYY-MM-DD' or null

const props = withDefaults(
    defineProps<{
        modelValue: StringDate;
        label?: string;
        placeholder?: string;
        help?: string;
        error?: string;
        disabled?: boolean;
        required?: boolean;
        min?: string | null; // 'YYYY-MM-DD' or null
        max?: string | null; // 'YYYY-MM-DD' or null
        numberOfMonths?: number;
        id?: string;
        displayFormat?: string; // e.g. 'DD-MM-YYYY',
        locale?: string; // e.g. 'nl-NL'
    }>(),
    {
        modelValue: null,
        placeholder: '',
        min: null,
        max: null,
        numberOfMonths: 1,
        displayFormat: 'DD-MM-YYYY',
        locale: 'nl-NL',
    },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: StringDate): void }>();

// Calendar expects/returns @internationalized/date values. We keep external v-model as 'YYYY-MM-DD'.
const internal = computed<DateValue | undefined>({
    get() {
        return props.modelValue ? parseDate(props.modelValue) : undefined;
    },
    set(v) {
        // CalendarDate#toString() -> 'YYYY-MM-DD'
        emit('update:modelValue', v ? (v as CalendarDate).toString() : null);
    },
});

const minValue = computed<DateValue | undefined>(() => (props.min ? parseDate(props.min) : undefined));
const maxValue = computed<DateValue | undefined>(() => (props.max ? parseDate(props.max) : undefined));

const hasError = computed(() => Boolean(props.error));
const inputId = computed(() => props.id ?? `dp-${Math.random().toString(36).slice(2, 10)}`);

const labelText = computed(() => (props.modelValue ? dateFormat(props.modelValue, props.displayFormat) : props.placeholder));
</script>

<template>
    <div class="space-y-1">
        <label v-if="label" :for="inputId" class="block text-sm leading-none font-medium">
            {{ label }} <span v-if="required" class="text-destructive">*</span>
        </label>

        <Popover>
            <PopoverTrigger as-child>
                <Button
                    :id="inputId"
                    variant="outline"
                    :disabled="disabled"
                    :aria-invalid="hasError || undefined"
                    :class="
                        cn('w-[280px] justify-between text-left font-normal', !internal && 'text-muted-foreground', hasError && 'border-destructive')
                    "
                >
                    <span class="inline-flex items-center">
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        <span class="truncate">{{ labelText }}</span>
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent class="w-auto p-0" align="start">
                <Calendar
                    v-model="internal"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :number-of-months="numberOfMonths"
                    initial-focus
                    :locale="locale"
                />
            </PopoverContent>
        </Popover>

        <p v-if="help" class="text-muted-foreground text-[13px] italic">{{ help }}</p>
        <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    </div>
</template>
