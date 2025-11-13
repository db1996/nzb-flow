<script setup lang="ts">
import TablePagination from '@components/table/TablePagination.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Table, TableHeader, TableRow } from '@ui/table'
import type { PaginationLink } from '@renderer/types/pagination'
import { useSlots } from 'vue'
import TableLoading from './TableLoading.vue'

const props = withDefaults(
    defineProps<{
        filters?: { perPage: number | string }
        links?: PaginationLink[]
        loading?: boolean
        columns?: number
        autoWidth?: boolean
    }>(),
    {
        autoWidth: true
    }
)

const slots = useSlots()
const filters = props.filters
</script>

<template>
    <div
        v-if="slots.header || slots.actions"
        class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center"
        :class="{ 'sm:justify-between': slots.header, 'sm:justify-end': !slots.header }"
    >
        <slot name="header" />
        <slot name="actions" />
    </div>

    <div class="relative overflow-x-auto rounded-md border">
        <template v-if="loading">
            <TableLoading :columns="props.columns ?? 4" />
        </template>
        <template v-else>
            <Table :class="props.autoWidth ? 'w-full table-auto' : 'w-full table-fixed'">
                <slot name="colgroup" />
                <TableHeader class="bg-muted">
                    <TableRow>
                        <slot name="head" />
                    </TableRow>
                </TableHeader>
                <tbody>
                    <slot name="body" />
                </tbody>
            </Table>
        </template>
    </div>

    <div
        v-if="links?.length"
        class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
        <div v-if="filters" class="flex items-center gap-2">
            <label for="perPage" class="text-muted-foreground text-sm"> {{ 'Per Page' }}: </label>
            <Select v-model="filters.perPage">
                <SelectTrigger class="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="ml-auto">
            <TablePagination :links="links" />
        </div>
    </div>
</template>
