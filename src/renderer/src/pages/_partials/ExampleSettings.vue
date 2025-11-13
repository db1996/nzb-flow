<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Badge } from '@renderer/components/ui/badge'
import {
    CheckIcon,
    CreditCardIcon,
    Link2Icon,
    CopyIcon
} from 'lucide-vue-next'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@components/ui/input-group'
import { ButtonGroup, ButtonGroupText } from '@components/ui/button-group'

const publicApis = [
    { name: 'Public Data API', date: 'Sep 6, 2024 2:08 am', status: 'Active' },
    { name: 'Product Info API', date: 'Sep 12, 2024 2:07 pm', status: 'Active' },
    { name: 'User Data API', date: 'Aug 20, 2024 7:59 am', status: 'Revoke' }
]
</script>
<template>
    <main class="flex-1 p-10 space-y-6">
        <Card class="shadow-sm">
            <CardHeader>
                <CardTitle>Card details</CardTitle>
                <CardDescription>View and update your card details here.</CardDescription>
            </CardHeader>
            <div class="grid w-full max-w-sm gap-6  px-6 pb-6">
                <InputGroup>
                    <InputGroupInput placeholder="Card number" />
                    <InputGroupAddon>
                        <CreditCardIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <CheckIcon />
                    </InputGroupAddon>
                </InputGroup>
                <ButtonGroup class="!gap-0">
                    <ButtonGroupText as-child>
                        <Label for="url">
                            <Link2Icon />
                          </Label>
                    </ButtonGroupText>
                    <InputGroup>
                        <InputGroupInput id="url"  />
                        <InputGroupAddon align="inline-end">
                            <Link2Icon />
                        </InputGroupAddon>
                    </InputGroup>
                    <ButtonGroupText class="px-0 border-green-700" >
                        <Button variant="ghost" size="sm">
                            <CopyIcon />
                        </Button>
                    </ButtonGroupText>
                </ButtonGroup>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
                <div>
                    <Label for="name">Name on card</Label>
                    <Input id="name" placeholder="Kathy Pacheco" />
                </div>
                <div>
                    <Label for="number">Card number</Label>
                    <Input id="number" placeholder="1414 1412 4141 1422" />
                </div>
                <div>
                    <Label for="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="05/2025" />
                </div>
                <div>
                    <Label for="cvv">CVV</Label>
                    <Input id="cvv" type="password" placeholder="•••" />
                </div>
            </div>

            <div class="flex justify-end px-6 pb-6">
                <Button>Save</Button>
            </div>
        </Card>
        <Card class="shadow-sm">
            <CardHeader class="flex justify-between items-center">
                <div>
                    <CardTitle>Public API Settings</CardTitle>
                    <CardDescription
                        >Manage and configure access to the Public API.</CardDescription
                    >
                </div>
                <Button size="sm">+ New</Button>
            </CardHeader>

            <CardContent>
                <Button variant="success"></Button>
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2 font-medium">API Name</th>
                            <th class="text-left py-2 font-medium">Date of Creation</th>
                            <th class="text-left py-2 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="api in publicApis"
                            :key="api.name"
                            class="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                            <td class="py-3">{{ api.name }}</td>
                            <td class="py-3">{{ api.date }}</td>
                            <td class="py-3">
                                <Badge
                                    v-if="api.status === 'Active'"
                                    variant="secondary"
                                    class="bg-black text-white"
                                >
                                    Active
                                </Badge>
                                <Badge v-else-if="api.status === 'Revoke'" variant="success">
                                    Revoke
                                </Badge>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    </main>
</template>
