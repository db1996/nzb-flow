<script lang="ts" setup>
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import Label from '@ui/label/Label.vue';
import { ScrollArea } from '@ui/scroll-area';
import { cn } from '@renderer/lib/utils';
import { FileText, Loader2, Trash2, Upload } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

export type UploadStatus = 'pending' | 'accepted' | 'rejected';

export interface UploadItem {
    id: number;
    file: File;
    name: string;
    size: number;
    mime: string;
    status: UploadStatus;
    reason?: string;
    meta?: Record<string, unknown>;
}

const props = withDefaults(
    defineProps<{
        modelValue?: UploadItem[];
        label?: string;
        help?: string;
        placeholder?: string;
        accept?: string[];
        maxSizeBytes?: number;
        maxFiles?: number;
        multiple?: boolean;
        disabled?: boolean;
        loading?: boolean;
        browseText?: string;
        emptyText?: string;
        listHeight?: string;
        /** Raw backend errors (can include keys like:
         *  'meta.0.report_type_id', 'files.0.error', 'files.0', 'files.error', 'files'
         */
        itemErrors?: Record<string, string | undefined>;
        /** Show red asterisk next to label */
        required?: boolean;
        /** Optional explicit general error (fallback) */
        error?: string | null;
    }>(),
    {
        modelValue: () => [],
        multiple: true,
        placeholder: () => 'placeholder',
        browseText: () => 'browse',
        emptyText: () => 'empty',
        listHeight: '14rem',
        itemErrors: () => ({}),
        loading: false,
        required: false,
        error: null,
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: UploadItem[]): void;
    (e: 'change', value: UploadItem[]): void;
    (e: 'added', items: UploadItem[]): void;
    (e: 'removed', item: UploadItem): void;
    (e: 'error', message: string): void;
}>();

const inputEl = ref<HTMLInputElement | null>(null);
// Use a stable, deterministic id that matches the header label's :for.
// Per your request, we just use index 0.
const inputId = 'dz-input-0';

const isDragging = ref(false);
const items = ref<UploadItem[]>([...props.modelValue]);

watch(
    () => props.modelValue,
    (v) => {
        if (v) items.value = [...v];
    },
);

const acceptMatchers = computed(() => (props.accept ?? []).map((a) => a.toLowerCase().trim()));

function isAccepted(file: File) {
    if (!acceptMatchers.value.length) return true;
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    return acceptMatchers.value.some((rule) => {
        if (rule.endsWith('/*')) return type.startsWith(rule.replace('/*', '/'));
        if (rule.startsWith('.')) return name.endsWith(rule);
        return type === rule;
    });
}

function fmt(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

function addFiles(fileList: FileList | File[]) {
    const list = Array.from(fileList);
    const next: UploadItem[] = [];

    list.forEach((f, idx) => {
        const it: UploadItem = {
            id: items.value.length + idx,
            file: f,
            name: f.name,
            size: f.size,
            mime: f.type || '',
            status: 'pending',
        };
        if (props.maxSizeBytes && f.size > props.maxSizeBytes) {
            it.status = 'rejected';
            it.reason = 'File is too large';
        } else if (!isAccepted(f)) {
            it.status = 'rejected';
            it.reason = 'File type is not allowed';
        } else {
            it.status = 'accepted';
        }
        next.push(it);
    });

    if (props.maxFiles && props.maxFiles > 0) {
        const remaining = props.maxFiles - items.value.length;
        if (remaining <= 0) {
            emit('error', 'Maximum file limit reached');
            return;
        }
        commitAdd(next.slice(0, remaining));
    } else {
        commitAdd(next);
    }
}

function commitAdd(added: UploadItem[]) {
    if (!added.length) return;
    const updated = [...items.value, ...added];
    items.value = updated;
    emit('update:modelValue', updated);
    emit('change', updated);
    emit('added', added);
}

function removeItem(it: UploadItem) {
    const updated = items.value.filter((x) => x.id !== it.id);
    items.value = updated;
    emit('update:modelValue', updated);
    emit('change', updated);
    emit('removed', it);
}

function clearAll() {
    const prev = items.value;
    items.value = [];
    emit('update:modelValue', []);
    emit('change', []);
    prev.forEach((p) => emit('removed', p));
}

function patchItem(id: number, patch: Partial<UploadItem>) {
    const idx = items.value.findIndex((x) => x.id === id);
    if (idx === -1) return;
    items.value[idx] = { ...items.value[idx], ...patch };
    emit('update:modelValue', [...items.value]);
    emit('change', [...items.value]);
}

function onDrop(e: DragEvent) {
    if (props.disabled) return;
    e.preventDefault();
    isDragging.value = false;
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
}

function onDragOver(e: DragEvent) {
    if (!props.disabled) {
        e.preventDefault();
        isDragging.value = true;
    }
}

function onDragLeave() {
    isDragging.value = false;
}

function onChange(e: Event) {
    const t = e.target as HTMLInputElement;
    if (t.files?.length) addFiles(t.files);
    t.value = '';
}

function browse() {
    if (!props.disabled) inputEl.value?.click();
}

const hasItems = computed(() => items.value.length > 0);

/** Per-item errors: support multiple patterns
 *  - meta.{index}.*
 *  - files.{index}.error
 *  - files.{index}
 */
const normalizedErrors = computed<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    if (!props.itemErrors) return map;

    for (const [key, raw] of Object.entries(props.itemErrors)) {
        const msg = raw || '';
        let m = key.match(/^meta\.(\d+)\./);
        if (m) {
            map[parseInt(m[1])] = msg;
            continue;
        }
        m = key.match(/^files\.(\d+)\.error$/);
        if (m) {
            map[parseInt(m[1])] = msg;
            continue;
        }
        m = key.match(/^files\.(\d+)$/);
        if (m) {
            map[parseInt(m[1])] = msg;
            continue;
        }
    }
    return map;
});

/** General (non-indexed) error:
 *  Accept 'files.error', 'files', or explicit props.error
 */
const generalError = computed<string>(() => {
    return props.itemErrors?.['files.error'] || props.itemErrors?.['files'] || props.error || '';
});

defineExpose({ clearAll, removeItem, patchItem, fmt, open: browse, hasItems });
</script>

<template>
    <div class="relative grid gap-2">
        <!-- Header row: label (if exists) + actions -->
        <div class="flex items-center justify-between">
            <Label v-if="label" :for="inputId">
                {{ label }}
                <span v-if="required" class="text-destructive">*</span>
            </Label>
            <div class="flex gap-3 text-sm">
                <Button variant="ghost" @click="browse">
                    Browse
                </Button>
                <Button variant="ghost" :disabled="!items.length" @click="clearAll">
                    Clear
                </Button>
            </div>
        </div>

        <!-- Dropzone -->
        <div
            :class="
                cn(
                    'bg-secondary/25 relative w-full overflow-hidden rounded-xl border-1 border-dashed p-4 transition-colors',
                    isDragging ? 'border-primary/60 bg-primary/20' : 'border-muted-foreground/40',
                    generalError ? 'border-destructive/60' : '',
                    disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                )
            "
            role="group"
            :aria-invalid="!!generalError"
            @click="browse"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
        >
            <input
                :id="inputId"
                ref="inputEl"
                class="hidden"
                type="file"
                :multiple="multiple"
                :accept="(accept || []).join(',')"
                :disabled="disabled || loading"
                @change="onChange"
            />

            <!-- Loading overlay -->
            <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40">
                <Loader2 class="text-muted-foreground h-6 w-6 animate-spin" />
            </div>

            <!-- Empty state -->
            <div v-if="!hasItems" class="text-muted-foreground flex min-h-40 flex-col items-center justify-center gap-2 text-center select-none">
                <Upload class="h-6 w-6" />
                <p class="text-sm">{{ placeholder }}</p>
            </div>

            <!-- Files list -->
            <div v-else class="relative cursor-default select-none" @click.stop>
                <ScrollArea :style="{ height: listHeight }" class="w-full">
                    <ul class="divide-y">
                        <li v-for="(it, index) in items" :key="it.id" class="flex flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:gap-3">
                            <div class="flex min-w-0 flex-1 items-start gap-2 sm:items-center md:gap-3">
                                <FileText class="text-muted-foreground h-4 w-4 shrink-0" />
                                <div class="min-w-0 whitespace-nowrap">
                                    <span class="mr-2 align-middle">
                                        <Badge v-if="!normalizedErrors[index] && it.status === 'accepted'" variant="secondary" class="rounded-sm">
                                            {{ 'OK' }}
                                        </Badge>
                                        <Badge v-else variant="destructive" class="rounded-sm">
                                            {{ 'Rejected' }}
                                        </Badge>
                                    </span>
                                    <span class="truncate align-middle text-sm font-medium">
                                        {{ it.name }}
                                    </span>
                                    <span class="text-muted-foreground ml-2 align-middle text-xs"> • {{ fmt(it.size) }} </span>
                                    <br />
                                    <span v-if="normalizedErrors[index] || it.reason" class="text-destructive block text-xs sm:inline">
                                        {{ normalizedErrors[index] ?? it.reason }}
                                    </span>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 sm:ml-2 sm:gap-3">
                                <slot
                                    name="item-actions"
                                    :item="it"
                                    :error="normalizedErrors[index] || ''"
                                    :update="(patch: Partial<UploadItem>) => patchItem(it.id, patch)"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8 shrink-0"
                                    @click.stop="removeItem(it)"
                                    :aria-label="`Remove ${it.name}`"
                                >
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    </ul>
                </ScrollArea>
            </div>
        </div>

        <!-- General error -->
        <p v-if="generalError" class="text-destructive text-xs leading-snug">
            {{ generalError }}
        </p>

        <!-- Helper text -->
        <p v-if="help" class="text-muted-foreground text-xs leading-snug italic">
            {{ help }}
        </p>
    </div>
</template>
