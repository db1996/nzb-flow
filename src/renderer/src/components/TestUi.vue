<script setup lang="ts">
import { ref } from 'vue'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@components/ui/accordion"
import { Progress } from "@components/ui/progress"
import { Badge } from "@components/ui/badge"
import { CheckCircle2, Clock, Loader2 } from 'lucide-vue-next'

interface UploadJob {
  id: string
  name: string
  password?: string
  nzbFile?: string
  status: 'queued' | 'in_progress' | 'finished'
  progress: number
  logs: string[]
}

const jobs = ref<UploadJob[]>([
  {
    id: '123',
    name: 'My Game Upload',
    password: 'abc123',
    status: 'in_progress',
    progress: 42,
    logs: ['Rarring file 1...', 'Rarring file 2...']
  },
  {
    id: '456',
    name: 'Another Upload',
    status: 'queued',
    progress: 0,
    logs: []
  }
])

const statusIcon = (status: string) => {
  switch (status) {
    case 'queued':
      return Clock
    case 'in_progress':
      return Loader2
    case 'finished':
      return CheckCircle2
  }
}
</script>

<template>
  <Accordion type="single" collapsible>
    <AccordionItem
      v-for="job in jobs"
      :key="job.id"
      value="asd"
      class="border rounded-lg shadow-sm mb-2"
    >
      <AccordionTrigger class="flex justify-between items-center px-4 py-3">
        <div class="flex items-center gap-3">
          <component :is="statusIcon(job.status)" :class="[
            'w-5 h-5',
            job.status === 'queued' ? 'text-gray-400' : '',
            job.status === 'in_progress' ? 'text-blue-500 animate-spin' : '',
            job.status === 'finished' ? 'text-green-500' : ''
          ]" />
          <div>
            <div class="font-medium">{{ job.name }}</div>
            <div class="text-xs text-muted-foreground">ID: {{ job.id }}</div>
          </div>
        </div>
        <Badge variant="outline" v-if="job.password">Pwd: {{ job.password }}</Badge>
      </AccordionTrigger>

      <AccordionContent class="px-4 pb-3">
        <div class="space-y-3">
          <div>
            <div class="text-sm text-muted-foreground">Progress</div>
            <Progress :model-value="job.progress" class="h-2 mt-1" />
          </div>

          <div>
            <div class="text-sm text-muted-foreground mb-1">Logs</div>
            <div class="bg-muted rounded-md p-2 text-xs max-h-40 overflow-auto font-mono">
              <div v-for="line in job.logs" :key="line">{{ line }}</div>
            </div>
          </div>

          <div v-if="job.nzbFile">
            <div class="text-sm text-muted-foreground">NZB File</div>
            <div class="font-medium text-sm">{{ job.nzbFile }}</div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
