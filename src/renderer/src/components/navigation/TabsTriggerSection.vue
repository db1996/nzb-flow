<script lang="ts" setup>
import { SettingsTabSection } from '@renderer/types/SettingsTabSection';
import Badge from '../ui/badge/Badge.vue';
import TabsTrigger from '../ui/tabs/TabsTrigger.vue';

defineProps<{
    section: SettingsTabSection;
    badge?: boolean;
}>();



</script>
<template>
    <TabsTrigger :value="section.id" >
        {{ section.label }}
        <Badge v-if="badge" :variant="section.badgeVariant">
            <template v-if="badge">
                <component :is="section.badgeIcon" />
            </template>
        </Badge>

    </TabsTrigger>
</template>
