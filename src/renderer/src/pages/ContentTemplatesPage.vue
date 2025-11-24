<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import { Button } from '@components/ui/button'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import { Plus } from 'lucide-vue-next'
import CardDescription from '@renderer/components/ui/card/CardDescription.vue'
import { ContentTemplateSettings } from '@main/types/settings/ContentTemplateSettings'
import ContentTemplateEditDialog from './dialogs/ContentTemplateEditDialog.vue'

const settingsStore = useSettingsStore()

const setContentTemplate = (contentTemplate: ContentTemplateSettings) => {
    settingsStore.activeContentTemplateEdit = JSON.parse(JSON.stringify(contentTemplate))
}
</script>

<template>
    <AppLayout>
        <ContentTemplateEditDialog @close="settingsStore.activeContentTemplateEdit = null" />

        <Card>
            <CardHeader>
                <div class="flex gap-2 justify-between">
                    <CardTitle>Content templates</CardTitle>
                    <Button
                        as="a"
                        target="_blank"
                        href="https://github.com/db1996/nzb-flow/blob/main/docs/profiles.md"
                        variant="link"
                        class="inline m-0 p-0"
                        >Check the content template docs here</Button
                    >
                </div>
                <CardDescription>
                    With content templates, you can generate files with variables from the post,
                    either include them in the post, save them to disk, or just show them in the
                    logs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table :columns="4">
                    <template #head>
                        <TableHead>Name</TableHead>
                        <TableHead>File Type</TableHead>
                        <TableHead class="w-[270px]"
                            >#
                            <Button class="w-8" @click="settingsStore.newContentTemplate">
                                <Plus /> </Button
                        ></TableHead>
                    </template>
                    <template #body>
                        <TableRow
                            v-for="(contentTemplate, index) in settingsStore.contentTemplates"
                            :key="index"
                        >
                            <TableCell>{{ contentTemplate.name }}</TableCell>
                            <TableCell>{{ contentTemplate.fileType }}</TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    @click="setContentTemplate(contentTemplate)"
                                    class="me-2"
                                    >Edit</Button
                                >
                                <Button
                                    size="sm"
                                    @click="settingsStore.deleteContentTemplate(contentTemplate.id)"
                                    variant="outline_destructive"
                                    class="me-2"
                                    >Delete</Button
                                >
                            </TableCell>
                        </TableRow>
                    </template>
                </Table>
            </CardContent>
        </Card>
    </AppLayout>
</template>
