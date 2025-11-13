<script setup lang="ts">
import { cn } from '@renderer/lib/utils'
import { BadgeVariants, Badge } from '../ui/badge'

defineProps({
    section: {
        type: Object,
        required: true
    },
    activeSectionId: {
        type: String,
        required: false,
        default: null
    },
    badge: {
        type: Boolean,
        default: false
    },
    badge_variant: {
        type: String as () => BadgeVariants['variant'],
        default: 'default'
    }
})
</script>

<template>
    <button
        :class="
            cn(
                'text-sm rounded-md px-3 py-2 text-left transition-all hover:bg-muted cursor-pointer flex justify-between items-center',
                activeSectionId === section.id ? 'bg-muted font-medium' : 'text-muted-foreground'
            )
        "
    >
        {{ section.label }}
        <Badge v-if="badge" :variant="badge_variant" class="ml-2">
            <slot name="badge" />
        </Badge>
    </button>
</template>
