<script setup lang="ts">
import { Skeleton } from '@ui/skeleton';

defineProps({
    columns: {
        type: Number,
        default: 3,
    },
    rows: {
        type: Number,
        default: 7,
    },
});
</script>

<template>
    <div class="mt-4 rounded-xl border bg-white shadow-sm">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b p-4">
            <div class="flex items-center gap-2">
                <Skeleton class="h-4 w-8" />
                <Skeleton class="h-4 w-32" />
            </div>
            <div class="flex gap-2">
                <Skeleton class="h-4 w-20" />
            </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="border-b">
                        <th v-for="(col, colIndex) in columns" :key="'head-' + colIndex" class="p-4">
                            <Skeleton class="h-4 w-16" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" class="border-b">
                        <td v-for="(col, colIndex) in columns" :key="'cell-' + rowIndex + '-' + colIndex" class="p-4">
                            <Skeleton class="h-4" :style="{ width: '4rem' }" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
