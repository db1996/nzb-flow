<script setup lang="ts">
import { Button } from '@ui/button';
import type { PaginationLink } from '@renderer/types/pagination';

defineProps<{
    links: PaginationLink[];
}>();
</script>

<template>
    <div class="mt-4 flex justify-end gap-1">
        <Button
            v-for="link in links"
            :key="link.label"
            size="sm"
            variant="outline"
            :disabled="!link.url"
            :class="{ 'bg-muted': link.active }"
        >
            <span v-html="link.label" />
        </Button>
    </div>
</template>
