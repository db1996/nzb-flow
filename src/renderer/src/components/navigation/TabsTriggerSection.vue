<script lang="ts" setup>
import { SettingsTabSection } from '@renderer/types/SettingsTabSection';
import Badge from '../ui/badge/Badge.vue';
import TabsTrigger from '../ui/tabs/TabsTrigger.vue';

defineProps<{
    section: SettingsTabSection;
}>();



</script>
<template>
    <TabsTrigger :value="section.id" >
        {{ section.label }}
        <Badge v-if="section.badge" :variant="section.badgeVariant">
            <template v-if="section.badge">
                <component :is="section.badgeIcon" />
            </template>
        </Badge>

    </TabsTrigger>
</template>
