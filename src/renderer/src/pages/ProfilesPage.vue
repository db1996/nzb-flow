<script setup lang="ts">
import AppLayout from '@renderer/layout/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Table from '@renderer/components/table/Table.vue'
import TableHead from '@renderer/components/ui/table/TableHead.vue'
import TableRow from '@renderer/components/ui/table/TableRow.vue'
import TableCell from '@renderer/components/ui/table/TableCell.vue'
import { Button } from '@components/ui/button'
import { useSettingsStore } from '@renderer/composables/settingsStore'
import { ProfileSettings } from '@main/types/settings/ProfileSettings'
import ProfileEditDialog from './dialogs/ProfileEditDialog.vue'
import { Plus } from 'lucide-vue-next'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'

const settingsStore = useSettingsStore()

const setEditProfile = (profile: ProfileSettings) => {
    settingsStore.activeProfileEdit = JSON.parse(JSON.stringify(profile))
}

async function setDefaultProfile(id: string, isDefault: boolean) {
    if (isDefault) {
        settingsStore.profiles.forEach(profile => {
            if (profile.id === id) {
                profile.isDefault = isDefault
            } else if (isDefault) {
                profile.isDefault = false
            }
        })
    } else {
        // Prevent unsetting the default profile
        const profile = settingsStore.profiles.find(profile => profile.id === id)
        if (profile) {
            profile.isDefault = false
        }
    }

    await settingsStore.saveProfiles(settingsStore.profiles)
}
</script>

<template>
    <AppLayout>
        <ProfileEditDialog @close="settingsStore.activeProfileEdit = null" />

        <Card>
            <CardHeader>
                <div class="flex gap-2 justify-between">
                    <CardTitle>Posting profiles</CardTitle>
                    <Button
                        as="a"
                        target="_blank"
                        href="https://github.com/db1996/nzb-flow/blob/main/docs/profiles.md"
                        variant="link"
                        class="inline m-0 p-0"
                        >Check the profiles docs here</Button
                    >
                </div>
            </CardHeader>
            <CardContent>
                <Table :columns="4">
                    <template #head>
                        <TableHead>ID</TableHead>
                        <TableHead>name</TableHead>
                        <TableHead>default</TableHead>
                        <TableHead
                            >#
                            <Button class="w-8" @click="settingsStore.newProfile"><Plus /></Button
                        ></TableHead>
                    </template>
                    <template #body>
                        <TableRow v-for="(profile, index) in settingsStore.profiles" :key="index">
                            <TableCell>{{ profile.id }}</TableCell>
                            <TableCell>{{ profile.name }}</TableCell>
                            <TableCell>
                                <SwitchInput
                                    v-model="profile.isDefault"
                                    @update:model-value="setDefaultProfile(profile.id, $event)"
                                />
                            </TableCell>
                            <TableCell>
                                <Button size="sm" @click="setEditProfile(profile)" class="me-2"
                                    >Edit</Button
                                >
                                <Button
                                    size="sm"
                                    @click="settingsStore.deleteProfile(profile.id)"
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
