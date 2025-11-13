<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(
    defineProps<{
        duration: number; // how long it takes to complete, ms
        size?: number; // size of SVG in px
        strokeWidth?: number; // stroke thickness
        trackColor?: string; // background circle
        progressColor?: string; // progress stroke
    }>(),
    {
        duration: 10000,
        size: 100,
        strokeWidth: 6,
        trackColor: '#e0e0e0',
        progressColor: '#fd6900',
    },
);

const emit = defineEmits(['reload']);

const progress = ref(0);

let interval: ReturnType<typeof setInterval> | null = null;

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() => circumference.value * (1 - progress.value));

const start = () => {
    if (interval) clearInterval(interval);
    progress.value = 0;
    const startTime = Date.now();

    interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress.value = Math.min(elapsed / props.duration, 1);

        if (progress.value >= 1) {
            emit('reload');
            start(); // restart automatically
        }
    }, 16);
};

onMounted(() => start());
onUnmounted(() => interval && clearInterval(interval));
</script>

<template>
    <div>
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg)">
            <!-- Track -->
            <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="transparent" :stroke="trackColor" :stroke-width="strokeWidth" />
            <!-- Progress -->
            <circle
                :cx="size / 2"
                :cy="size / 2"
                :r="radius"
                fill="transparent"
                :stroke="progressColor"
                :stroke-width="strokeWidth"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
            />
        </svg>
    </div>
</template>
