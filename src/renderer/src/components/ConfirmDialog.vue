<script setup lang="ts">
import { Button } from '@ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { useConfirm } from '@composables/useConfirm';

const { isOpen, options, resolve } = useConfirm();
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ options.title }}</DialogTitle>
                <DialogDescription>{{ options.description }}</DialogDescription>
            </DialogHeader>

            <DialogFooter class="gap-2">
                <DialogClose as-child>
                    <Button variant="secondary" @click="resolve(false)">
                        {{ options.cancelText }}
                    </Button>
                </DialogClose>
                <Button variant="destructive" @click="resolve(true)">
                    {{ options.confirmText }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
