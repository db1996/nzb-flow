<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@renderer/types/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { resolve } from '@renderer/helpers/route';
import { computed } from 'vue';

interface BreadcrumbItem {
    title: string;
    route?: string;
}

const props = defineProps<{ breadcrumbs: BreadcrumbItemType[] }>();

// How many items to always show at the end
const visibleTailCount = 3;

const len = computed(() => props.breadcrumbs.length);

// Tail starts at max(len - visibleTailCount, 1) so we never re-include the first item
const tailStart = computed(() => Math.max(len.value - visibleTailCount, 1));

// Items shown in the dropdown (between first and tail)
const hiddenMiddle = computed(() => (len.value > 1 ? props.breadcrumbs.slice(1, tailStart.value) : []));

// Items always visible at the end
const visibleTail = computed(() => (len.value > 1 ? props.breadcrumbs.slice(tailStart.value) : []));

// Convenience flags
const hasDropdown = computed(() => hiddenMiddle.value.length > 0);
const isSingle = computed(() => len.value === 1);
</script>

<template>
    <Breadcrumb>
        <BreadcrumbList>
            <!-- Single item: only page, no links -->
            <template v-if="isSingle">
                <BreadcrumbItem>
                    <BreadcrumbPage>{{ breadcrumbs[0].title }}</BreadcrumbPage>
                </BreadcrumbItem>
            </template>

            <!-- 2+ items -->
            <template v-else>
                <!-- First item (link) -->
                <BreadcrumbItem>
                    <BreadcrumbLink as-child>
                        <a :href="resolve(breadcrumbs[0].route)">
                            {{ breadcrumbs[0].title }}
                        </a>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <!-- Ellipsis dropdown for hidden middle items -->
                <template v-if="hasDropdown">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger class="px-2">…</DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem v-for="(item, idx) in hiddenMiddle" :key="`${item.title}-${idx}`">
                                    <a :href="resolve(item.route)">{{ item.title }}</a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BreadcrumbItem>
                </template>

                <!-- Visible tail (last N items). Last one is the current page -->
                <template v-for="(item, idx) in visibleTail" :key="`${item.title}-${idx}`">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <template v-if="idx === visibleTail.length - 1">
                            <BreadcrumbPage>{{ item.title }}</BreadcrumbPage>
                        </template>
                        <template v-else>
                            <BreadcrumbLink as-child>
                                <a :href="resolve(item.route)">{{ item.title }}</a>
                            </BreadcrumbLink>
                        </template>
                    </BreadcrumbItem>
                </template>
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>
