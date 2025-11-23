<script lang="ts" setup>
import Dialog from '@renderer/components/ui/dialog/Dialog.vue'
import DialogContent from '@renderer/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@renderer/components/ui/dialog/DialogDescription.vue'
import DialogHeader from '@renderer/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@renderer/components/ui/dialog/DialogTitle.vue'
import { useUpdateStore } from '@renderer/composables/useUpdateStore'
import { marked } from 'marked'

const updateStore = useUpdateStore()
</script>

<template>
    <Dialog
        :open="updateStore.showReleaseNotes"
        class="overflow-auto"
        @update:open="updateStore.showReleaseNotes = false"
    >
        <DialogContent class="max-w-xxl sm:max-w-xxl overflow-auto flex flex-col">
            <DialogHeader>
                <DialogTitle>Release notes</DialogTitle>
                <DialogDescription>
                    Version {{ updateStore.currentVersion }} -
                    {{ updateStore.updateInfo ? updateStore.updateInfo.version : 'N/A' }}
                </DialogDescription>
            </DialogHeader>

            <div
                v-if="
                    updateStore.updateInfo &&
                    updateStore.updateInfo.releaseNotes &&
                    typeof updateStore.updateInfo.releaseNotes === 'object'
                "
                v-for="releasenote in updateStore.updateInfo.releaseNotes"
                :key="releasenote.version"
                class="mb-4"
            >
                <h3 class="text-lg font-semibold mb-2">Version {{ releasenote.version }}</h3>
                <div class="markdown-output" v-html="marked.parse(releasenote.note || '')" />

                <hr class="my-4" />
            </div>
        </DialogContent>
    </Dialog>
</template>
