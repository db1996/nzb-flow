<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    duration: number // total countdown duration in ms
    remaining: number // current remaining ms (reactive ref)
}

const props = defineProps<Props>()

// Circle constants
const radius = 16
const circumference = 2 * Math.PI * radius

// Derived stroke offset
const progress = computed(() => {
    const fraction = 1 - Math.max(0, Math.min(1, props.remaining / props.duration))
    // reverse so that it counts down
    return circumference * (1 + fraction)
})
</script>

<template>
    <div class="relative">
        <!-- Background ring -->
        <svg class="w-full h-full rotate-[-90deg]" viewBox="0 0 40 40">
            <circle
                class="text-muted stroke-current"
                stroke-width="4"
                fill="transparent"
                r="16"
                cx="20"
                cy="20"
                opacity="0.2"
            />
            <!-- Progress ring -->
            <circle
                class="text-blue-500 stroke-current transition-[stroke-dashoffset] duration-100 ease-linear"
                stroke-width="4"
                fill="transparent"
                r="16"
                cx="20"
                cy="20"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progress"
                stroke-linecap="round"
            />
        </svg>
    </div>
</template>
