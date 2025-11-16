<script setup lang="ts">
import { Label } from '@ui/label'
import { AllSettings } from '@main/types/settings/AllSettings'
import { PropType, watch } from 'vue'
import SwitchInput from '@renderer/components/form/SwitchInput.vue'
import CardForm from '@renderer/components/form/CardForm.vue'
import { Button } from '@components/ui/button'
import { useAppearance } from '@renderer/composables/useAppearance'
import { Appearance } from '@renderer/types/appearance'
import Input from '@renderer/components/ui/input/Input.vue'
import CopyInput from '@renderer/components/form/CopyInput.vue'

const props = defineProps({
    form: {
        type: Object as PropType<AllSettings>,
        required: true
    }
})
const appearanceStore = useAppearance()
watch(
    () => props.form.theme.type,
    newVal => {
        appearanceStore.updateAppearance(newVal as Appearance)
    }
)

async function getUUID() {
    const id = await window.api.getUUID()
    props.form.httpServerApiToken = id
}

async function getWSUUID() {
    const id = await window.api.getUUID()
    props.form.wsServerApiToken = id
}
</script>

<template>
    <div class="grid grid-cols-1 gap-2">
        <CardForm title="HTTP Server">
            <template #body>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label for="show-tray-icon">Turn on HTTP server</Label>
                        <p class="text-sm text-muted-foreground">
                            Gives access to an API server for remote control and integration.
                        </p>
                    </div>
                    <SwitchInput id="show-tray-icon" v-model="form.httpServerEnabled" />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label for="http-server-port">Server port</Label>
                    </div>
                    <Input
                        id="http-server-port"
                        type="number"
                        v-model="form.httpServerPort"
                        class="w-24"
                    />
                </div>
                <CopyInput
                    id="http-server-api-token"
                    label="Server API Token"
                    v-model="form.httpServerApiToken"
                    placeholder="Enter server API token"
                    help="Use header 'x-api-token' to authenticate requests. If you leave this field blank, no authentication will be required."
                >
                    <template #append>
                        <Button size="lg" variant="outline_default" @click="getUUID()">
                            Generate
                        </Button>
                    </template>
                </CopyInput>
                <CopyInput
                    id="http-server-connection-string"
                    label="HTTP Server"
                    :value="`http://localhost:${form.httpServerPort}`"
                    help="Use this host to connect to the HTTP server, use the x-api-token header to authenticate."
                    :disabled="true"
                ></CopyInput>
            </template>
        </CardForm>

        <CardForm title="Websocket Server">
            <template #body>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label for="show-tray-icon">Turn on Websocket server</Label>
                        <p class="text-sm text-muted-foreground">
                            Gives access to an API server for remote control and integration.
                        </p>
                    </div>
                    <SwitchInput id="show-tray-icon" v-model="form.wsServerEnabled" />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label for="ws-server-port">Server port</Label>
                    </div>
                    <Input
                        id="ws-server-port"
                        type="number"
                        v-model="form.wsServerPort"
                        class="w-24"
                    />
                </div>
                <CopyInput
                    id="ws-server-api-token"
                    label="Websocket API Token"
                    v-model="form.wsServerApiToken"
                    placeholder="Enter API token"
                    help="Use the token URL parameter 'token' to authenticate requests. If you leave this field blank, no authentication will be required."
                >
                    <template #append>
                        <Button size="lg" variant="outline_default" @click="getWSUUID()">
                            Generate
                        </Button>
                    </template>
                </CopyInput>
                <CopyInput
                    id="ws-server-connection-string"
                    label="Websocket Connection String"
                    :value="`ws://localhost:${form.wsServerPort}${
                        form.wsServerApiToken ? `?token=${form.wsServerApiToken}` : ''
                    }`"
                    placeholder="Websocket connection string"
                    help="Use this connection string to connect to the Websocket server."
                    :disabled="true"
                ></CopyInput>
            </template>
        </CardForm>
    </div>
</template>
