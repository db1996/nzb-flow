<script setup lang="ts">
import { PropType } from 'vue'
import CardForm from '@renderer/components/form/CardForm.vue'
import { QueueSettings } from '@main/types/settings/QueueSettings'
import TextInput from '@renderer/components/form/TextInput.vue'

const props = defineProps({
    form: {
        type: Object as PropType<QueueSettings>,
        required: true
    }
})
</script>

<template>
    <CardForm
        title="Queue Settings"
        description="Configure queue behavior and limits. There are effectively 2 seperate queues. One for processing uploads (compression, parring, etc) and one for uploading to usenet. These settings allow you to control how many uploads can be processed and uploaded at once, as well as pausing compression when the upload queue gets too full."
    >
        <template #body>
            <TextInput
                id="max-compression-workers"
                label="Max compression workers"
                help="The maximum amount of uploads that can be compressed at once. "
                type="number"
                v-model="form.maxCompressionWorkers"
            />

            <div class="grid grid-cols-2 gap-4">
                <TextInput
                    id="max-upload-workers"
                    label="Max upload workers"
                    help="The maximum amount of uploads that can be processed at once."
                    type="number"
                    v-model="form.maxUploadWorkers"
                />
                <TextInput
                    id="max-upload-queue-before-pause-compression"
                    label="Max uploads in queue before pausing compression"
                    help="The maximum amount of uploads that can be queued before compression is paused.
                    This will keep the upload queue from becoming too full, and at the same time make sure it never stops uploading. If set to 0, compression will not be paused. "
                    type="number"
                    v-model="form.maxUploadQueueBeforePause"
                />
            </div>
        </template>
    </CardForm>
</template>
