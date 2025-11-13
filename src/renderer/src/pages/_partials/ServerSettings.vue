<script lang="ts" setup>
import { PropType } from 'vue'
import TextInput from '@renderer/components/form/TextInput.vue'
import CardForm from '@renderer/components/form/CardForm.vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import { ServerSettings } from '@main/types/settings/ServerSettings'
import SelectInput from '@renderer/components/form/SelectInput.vue'
import { useSettingsStore } from '@renderer/composables/settingsStore'

const props = defineProps({
    form: {
        type: Object as PropType<ServerSettings>,
        required: true
    },
    useName: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    use_dropdown: {
        type: Boolean,
        default: true
    }
})

const settingsStore = useSettingsStore()

function updateModelValue(value: any) {
    console.log('updating server', value)

    const newServer = settingsStore.settings?.servers.find(server => server.id === value)
    console.log(newServer)

    props.form.connections = newServer?.connections || 1
    props.form.server = newServer?.server || ''
    props.form.port = newServer?.port || 222
    props.form.ssl = newServer?.ssl || false
    props.form.username = newServer?.username || ''
    props.form.password = newServer?.password || ''
    props.form.id = newServer?.id || ''
}
</script>
<template>
    <CardForm>
        <template #body>
            <SelectInput
                v-if="use_dropdown && settingsStore.settings"
                v-model="form.id"
                :options="
                    settingsStore.settings.servers.map(server => ({
                        label: server.server,
                        value: server.id
                    }))
                "
                :disable-clear="true"
                @update:model-value="updateModelValue($event)"
            />

            <div class="grid grid-cols-[2fr_2fr_1fr] gap-4 items-center">
                <TextInput
                    :disabled="disabled"
                    label="Server"
                    help="The server address of the usenet provider"
                    v-model="form.server"
                />
                <TextInput
                    :disabled="disabled"
                    label="Port"
                    help="The port number of the usenet provider"
                    v-model="form.port"
                    type="number"
                />
                <SwitchInput :disabled="disabled" class="ml-4" label="SSL" v-model="form.ssl" />
            </div>
            <div class="grid grid-cols-[2fr_2fr_1fr] gap-4 items-center">
                <TextInput
                    :disabled="disabled"
                    label="Username"
                    help="The username for the usenet provider"
                    v-model="form.username"
                />
                <TextInput
                    :disabled="disabled"
                    label="Password"
                    help="The password for the usenet provider"
                    v-model="form.password"
                    type="password"
                />
            </div>
            <div class="grid grid-cols-[2fr_2fr_1fr] gap-4 items-center">
                <TextInput
                    :disabled="disabled"
                    label="Connections"
                    help="The number of connections to the usenet provider"
                    v-model="form.connections"
                    type="number"
                />
            </div>
        </template>
    </CardForm>
</template>
