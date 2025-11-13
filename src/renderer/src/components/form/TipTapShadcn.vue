<script setup lang="ts">
import { Button } from '@ui/button';
import { Card, CardContent, CardHeader } from '@ui/card';
import { Label } from '@ui/label';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent, Node, mergeAttributes } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
    modelValue: String,
    error: String,
    toolbar: {
        type: String,
        default: 'all',
    },
    required: {
        type: Boolean,
        default: false,
    },
    label: String,
    help: String,
    variables: {
        type: Object,
        required: false,
    },
    editorHeight: {
        type: String,
        default: '350px',
    },
});

// Variable extension for handling template variables
const Variable = Node.create({
    name: 'variable',
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,
    addAttributes() {
        return {
            id: {
                default: null,
            },
            name: {
                default: null,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'span[data-variable]',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-variable': true }), `{${HTMLAttributes.id}}`];
    },
    addCommands() {
        return {
            insertVariable:
                (variable) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: variable,
                    });
                },
        };
    },
    toDOM({ attrs }) {
        return ['span', { 'data-variable': attrs.id }, `{${attrs.id}}`];
    },
});

// Process variables in content
const replaceVariablesInContent = (content) => {
    if (props.variables == null) {
        return content;
    }
    const variableRegex = /\{([^}]+)\}/g;
    if (!content) {
        return content;
    }
    const newContent = content.replace(variableRegex, (match, variableId) => {
        const variable = props.variables[variableId];

        if (variable) {
            return `<span data-variable id="${variable.id}">{${variable.id}}</span>`;
        } else {
            return match; // Keep it as is if not recognized
        }
    });

    return newContent;
};

// Editor state
const editor = ref(null);
const isVariableMenuOpen = ref(false);
const isHeadingMenuOpen = ref(false);
const isTableMenuOpen = ref(false);
const activeGroupName = ref(null);
const variableMenuRef = ref(null);
const variableTriggerRef = ref(null);

// Determine which toolbar buttons to show
const toolbarArray = computed(() => {
    switch (props.toolbar) {
        case 'basic':
            return ['italic', 'bold', 'headers', 'ul', 'ol'];
        default:
            return 'all';
    }
});

// Get current heading level for display
const getHeading = computed(() => {
    if (!editor.value) return 'H1';

    for (let i = 1; i <= 6; i++) {
        if (editor.value.isActive('heading', { level: i })) {
            return `H${i}`;
        }
    }
    if (editor.value.isActive('paragraph')) {
        return 'P';
    }
    return 'H1';
});

// Image insertion
const addImage = () => {
    const url = window.prompt('URL');

    if (url) {
        editor.value.chain().focus().setImage({ src: url }).run();
    }
};

// Link handling
const setLink = () => {
    const previousUrl = editor.value.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
        return;
    }

    if (url === '') {
        editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
    }

    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

// Editor initialization
onMounted(() => {
    const parsedContent = replaceVariablesInContent(props.modelValue);
    editor.value = new Editor({
        content: parsedContent,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Variable, // add the custom Variable extension here
        ],
        onUpdate: () => {
            // Before emitting the value, replace the variable spans with their {variableId} format
            let htmlContent = editor.value.getHTML();

            // Use a regex to replace <span data-variable> with the variableId format
            htmlContent = htmlContent.replace(/<span[^>]*data-variable[^>]*>(.*?)<\/span>/g, (match, variableId) => {
                return `${variableId}`;
            });

            // Emit the cleaned-up content
            emit('update:modelValue', htmlContent);
        },
    });
});

// Cleanup
onBeforeUnmount(() => {
    editor.value.destroy();
});

// Helper to check if a button should be displayed
const getEditor = (val) => {
    if (toolbarArray.value === 'all' || toolbarArray.value.includes(val)) {
        return true;
    } else {
        return false;
    }
};

// Group variables by their category
const groupedVariables = computed(() => {
    if (!props.variables) return {};

    const groups = {};

    Object.keys(props.variables).forEach((key) => {
        const variable = props.variables[key];
        if (!groups[variable.group]) {
            groups[variable.group] = [];
        }
        groups[variable.group].push({
            id: key,
            name: variable.name,
        });
    });

    return groups;
});

// Insert variable into editor
const insertVariable = (variable) => {
    editor.value.chain().focus().insertVariable(variable).run();
    isVariableMenuOpen.value = false;
};

// Toggle variable submenu
const toggleVariableGroup = (groupName) => {
    if (activeGroupName.value === groupName) {
        activeGroupName.value = null;
    } else {
        activeGroupName.value = groupName;
    }
};

// Handle click outside of dropdown menus
const handleClickOutside = (event) => {
    // Check if variable menu is open and click is outside
    if (
        isVariableMenuOpen.value &&
        variableMenuRef.value &&
        !variableMenuRef.value.contains(event.target) &&
        variableTriggerRef.value &&
        !variableTriggerRef.value.contains(event.target)
    ) {
        isVariableMenuOpen.value = false;
    }

    // Handle other menus similar way if needed
    if (isHeadingMenuOpen.value && !event.target.closest('.heading-dropdown-container')) {
        isHeadingMenuOpen.value = false;
    }

    if (isTableMenuOpen.value && !event.target.closest('.table-dropdown-container')) {
        isTableMenuOpen.value = false;
    }
};

// Add/remove event listener for click outside
onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <div class="w-full">
        <!-- Label -->
        <Label v-if="label" class="mb-2 block">
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>

        <!-- Help text -->
        <p v-if="help" class="text-muted-foreground mb-2 text-sm italic">{{ help }}</p>

        <!-- Editor container -->
        <Card :class="{ 'border-destructive': error }" class="overflow-hidden">
            <!-- Toolbar -->
            <CardHeader class="bg-background sticky top-0 z-10 h-auto p-0 shadow-sm">
                <div v-if="editor" class="flex flex-wrap items-center gap-0.5 p-1">
                    <!-- Variables dropdown -->
                    <div v-if="props.variables" class="relative">
                        <Button
                            ref="variableTriggerRef"
                            type="button"
                            variant="ghost"
                            size="sm"
                            @click="isVariableMenuOpen = !isVariableMenuOpen"
                            class="font-normal"
                        >
                            Variables
                        </Button>

                        <!-- Variables dropdown menu -->
                        <div
                            v-if="isVariableMenuOpen"
                            ref="variableMenuRef"
                            class="bg-popover absolute top-full left-0 z-50 mt-1 rounded-md border p-1 shadow-md"
                            style="width: 500px"
                        >
                            <div v-for="(group, groupName) in groupedVariables" :key="groupName" class="w-full">
                                <!-- Group header -->
                                <button
                                    type="button"
                                    class="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm"
                                    @click="toggleVariableGroup(groupName)"
                                >
                                    <span>{{ groupName }}</span>
                                    <span class="text-xs">▾</span>
                                </button>

                                <!-- Group items -->
                                <div v-if="activeGroupName === groupName" class="py-1 pl-2">
                                    <button
                                        v-for="variable in group"
                                        :key="variable.id"
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                                        @click="insertVariable(variable)"
                                    >
                                        <span class="font-medium text-purple-600">{{ variable.id }}</span>
                                        <span class="text-muted-foreground ml-1">- {{ variable.name }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Format buttons -->
                    <Button
                        v-if="getEditor('bold')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleBold().run()"
                        :class="editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''"
                        title="Bold"
                    >
                        <span class="font-bold">B</span>
                    </Button>

                    <Button
                        v-if="getEditor('italic')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleItalic().run()"
                        :class="editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''"
                        title="Italic"
                    >
                        <span class="italic">I</span>
                    </Button>

                    <Button
                        v-if="getEditor('strikethrough')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleStrike().run()"
                        :class="editor.isActive('strike') ? 'bg-accent text-accent-foreground' : ''"
                        title="Strikethrough"
                    >
                        <span class="line-through">S</span>
                    </Button>

                    <Button
                        v-if="getEditor('underline')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleUnderline().run()"
                        :class="editor.isActive('underline') ? 'bg-accent text-accent-foreground' : ''"
                        title="Underline"
                    >
                        <span class="underline">U</span>
                    </Button>

                    <Button
                        v-if="getEditor('break')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().setHardBreak().run()"
                        title="Line break"
                    >
                        ↵
                    </Button>

                    <Button
                        v-if="getEditor('clear_formatting')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().unsetAllMarks().run()"
                        title="Clear formatting"
                    >
                        <span class="text-xs">Clear</span>
                    </Button>

                    <!-- Divider -->
                    <div class="border-border mx-1 h-6 border-l"></div>

                    <!-- Headings dropdown -->
                    <div v-if="getEditor('headers')" class="heading-dropdown-container relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            @click="isHeadingMenuOpen = !isHeadingMenuOpen"
                            :class="editor.isActive('heading') || editor.isActive('paragraph') ? 'bg-accent text-accent-foreground' : ''"
                        >
                            {{ getHeading }}
                        </Button>

                        <div v-if="isHeadingMenuOpen" class="bg-popover absolute top-full left-0 z-50 mt-1 w-24 rounded-md border p-1 shadow-md">
                            <button
                                type="button"
                                class="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                                @click="
                                    editor.chain().focus().setParagraph().run();
                                    isHeadingMenuOpen = false;
                                "
                                :class="editor.isActive('paragraph') ? 'bg-accent text-accent-foreground' : ''"
                            >
                                Paragraph
                            </button>

                            <button
                                v-for="level in 6"
                                :key="level"
                                type="button"
                                class="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                                @click="
                                    editor.chain().focus().toggleHeading({ level }).run();
                                    isHeadingMenuOpen = false;
                                "
                                :class="editor.isActive('heading', { level }) ? 'bg-accent text-accent-foreground' : ''"
                            >
                                H{{ level }}
                            </button>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-border mx-1 h-6 border-l"></div>

                    <!-- Lists -->
                    <Button
                        v-if="getEditor('ul')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleBulletList().run()"
                        :class="editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''"
                        title="Bullet list"
                    >
                        • List
                    </Button>

                    <Button
                        v-if="getEditor('ol')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleOrderedList().run()"
                        :class="editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''"
                        title="Numbered list"
                    >
                        1. List
                    </Button>

                    <Button
                        v-if="getEditor('codeblock')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().toggleCodeBlock().run()"
                        :class="editor.isActive('codeBlock') ? 'bg-accent text-accent-foreground' : ''"
                        title="Code block"
                    >
                        &lt;/&gt;
                    </Button>

                    <Button
                        v-if="getEditor('line')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().setHorizontalRule().run()"
                        title="Horizontal line"
                    >
                        ―
                    </Button>

                    <Button
                        v-if="getEditor('link')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="() => (editor.isActive('link') ? editor.chain().focus().unsetLink().run() : setLink())"
                        :class="editor.isActive('link') ? 'bg-accent text-accent-foreground' : ''"
                        title="Link"
                    >
                        🔗
                    </Button>

                    <Button v-if="getEditor('image')" type="button" variant="ghost" size="sm" @click="addImage" title="Image"> 🖼️ </Button>

                    <!-- Table dropdown -->
                    <div v-if="getEditor('table')" class="table-dropdown-container relative">
                        <Button type="button" variant="ghost" size="sm" @click="isTableMenuOpen = !isTableMenuOpen" title="Table"> Table </Button>

                        <div v-if="isTableMenuOpen" class="bg-popover absolute top-full left-0 z-50 mt-1 w-48 rounded-md border p-1 shadow-md">
                            <div class="grid grid-cols-2 gap-1">
                                <div class="space-y-1">
                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Insert table
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().addColumnBefore().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Add column before
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().addColumnAfter().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Add column after
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().deleteColumn().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Delete column
                                    </button>
                                </div>

                                <div class="space-y-1">
                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().addRowBefore().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Add row before
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().addRowAfter().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Add row after
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().deleteRow().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Delete row
                                    </button>

                                    <button
                                        type="button"
                                        class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                        @click="
                                            editor.chain().focus().deleteTable().run();
                                            isTableMenuOpen = false;
                                        "
                                    >
                                        Delete table
                                    </button>
                                </div>
                            </div>

                            <div class="border-border mt-1 border-t pt-1">
                                <button
                                    type="button"
                                    class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                    @click="
                                        editor.chain().focus().mergeCells().run();
                                        isTableMenuOpen = false;
                                    "
                                >
                                    Merge cells
                                </button>

                                <button
                                    type="button"
                                    class="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm"
                                    @click="
                                        editor.chain().focus().splitCell().run();
                                        isTableMenuOpen = false;
                                    "
                                >
                                    Split cells
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-border mx-1 h-6 border-l"></div>

                    <!-- Undo/Redo -->
                    <Button
                        v-if="getEditor('undo')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().undo().run()"
                        title="Undo"
                    >
                        ↩
                    </Button>

                    <Button
                        v-if="getEditor('redo')"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="editor.chain().focus().redo().run()"
                        title="Redo"
                    >
                        ↪
                    </Button>
                </div>
            </CardHeader>

            <!-- Editor content -->
            <CardContent class="p-0">
                <div class="tiptap-wrapper">
                    <EditorContent :editor="editor" :style="{ height: editorHeight }" />
                </div>
            </CardContent>
        </Card>

        <!-- Error message -->
        <div v-if="error" class="text-destructive mt-1.5 text-sm">
            {{ error }}
        </div>
    </div>
</template>

<style lang="scss">
.tiptap-wrapper .ProseMirror {
    min-height: 350px;
    padding: 1.5rem;
    outline: none;
    resize: vertical;
    overflow: auto;
}

.tiptap-wrapper .ProseMirror > * + * {
    margin-top: 0.75rem;
}

.tiptap-wrapper .ProseMirror a {
    color: hsl(var(--primary));
    text-decoration: underline;
    cursor: pointer;
}

.tiptap-wrapper .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
}

.tiptap-wrapper .ProseMirror table td,
.tiptap-wrapper .ProseMirror table th {
    border: 2px solid hsl(var(--border));
    padding: 0.5rem;
    vertical-align: top;
    position: relative;
    min-width: 1em;
}

.tiptap-wrapper .ProseMirror table th {
    font-weight: 500;
    text-align: left;
    background-color: hsl(var(--muted));
}

.tiptap-wrapper .ProseMirror table .selectedCell:after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    content: '';
    background: rgba(200, 200, 255, 0.4);
}

.tiptap-wrapper .ProseMirror table .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 0.25rem;
    background-color: hsl(var(--primary) / 0.5);
    pointer-events: none;
}

.tiptap-wrapper .ProseMirror table p {
    margin: 0;
}

.tiptap-wrapper .ProseMirror .tableWrapper {
    padding-top: 1rem;
    padding-bottom: 1rem;
    overflow-x: auto;
}

.tiptap-wrapper .resize-cursor {
    cursor: col-resize;
}

.tiptap-wrapper .ProseMirror span[data-variable] {
    background-color: rgba(147, 51, 234, 0.1);
    color: rgb(147, 51, 234);
    font-weight: 500;
    border-radius: 0.25rem;
    padding-left: 0.125rem;
    padding-right: 0.125rem;
}

.tiptap-wrapper .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
}

.tiptap-wrapper .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
}

.tiptap-wrapper .ProseMirror li > p:first-child {
    display: inline;
}

.tiptap-wrapper .ProseMirror h1 {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror h2 {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror h3 {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror h4 {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror h5 {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror h6 {
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 700;
}

.tiptap-wrapper .ProseMirror pre {
    background-color: hsl(var(--muted));
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
}

.tiptap-wrapper .ProseMirror hr {
    margin-top: 1rem;
    margin-bottom: 1rem;
    border-top-width: 1px;
    border-color: hsl(var(--border));
}

.tiptap-wrapper .ProseMirror blockquote {
    padding-left: 1rem;
    border-left-width: 4px;
    border-color: hsl(var(--border));
    font-style: italic;
}
</style>
