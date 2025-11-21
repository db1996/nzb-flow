<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription } from '@components/ui/card'
import CardContent from '../ui/card/CardContent.vue'
import CardFooter from '../ui/card/CardFooter.vue'

defineProps({
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    footer_class: {
        type: String,
        required: false
    },
    description_class: {
        type: String,
        required: false
    }
})
</script>
<template>
    <Card class="shadow-sm">
        <CardHeader v-if="title || description || $slots.header">
            <CardTitle v-if="title">{{ title }}</CardTitle>
            <CardDescription v-if="description" :class="description_class">{{
                description
            }}</CardDescription>
            <slot name="header"></slot>
        </CardHeader>
        <CardContent>
            <div class="grid w-full gap-6">
                <slot name="body"></slot>
            </div>
        </CardContent>
        <CardFooter v-if="$slots.footer" :class="footer_class">
            <slot name="footer" />
        </CardFooter>
    </Card>
</template>
