<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@renderer/lib/utils'
import { Input } from '@ui/input'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Input
    data-slot="input-group-control"
    :class="cn(
      'flex-1 rounded-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent ring-offset-transparent dark:bg-transparent',
      props.class,
    )"
  />
</template>
