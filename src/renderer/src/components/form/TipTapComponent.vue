<script setup lang="ts">
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
});
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
        return ['span', mergeAttributes(HTMLAttributes, { 'data-variable': true, style: 'color: purple;' }), `{${HTMLAttributes.id}}`];
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

    // ** This method ensures that only the `{variableId}` is saved in the content **
    toDOM({ attrs }) {
        return ['span', { 'data-variable': attrs.id }, `{${attrs.id}}`];
    },
});

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

const editor = ref(null);
const toolbarArray = computed(() => {
    switch (props.toolbar) {
        case 'basic':
            return ['italic', 'bold', 'headers', 'ul', 'ol'];
        default:
            return 'all';
    }
});

const getHeading = computed(() => {
    for (let i = 1; i <= 6; i++) {
        if (editor.value.isActive('heading', { level: i })) {
            return `H${i}`;
        }
    }
    if (editor.value.isActive('paragraph')) {
        return '<i class="bi bi-paragraph" />';
    }
    return 'H1';
});

const addImage = () => {
    const url = window.prompt('URL');

    if (url) {
        editor.value.chain().focus().setImage({ src: url }).run();
    }
};

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

onBeforeUnmount(() => {
    editor.value.destroy();
});

const getEditor = (val) => {
    if (toolbarArray.value === 'all' || toolbarArray.value.includes(val)) {
        return true;
    } else {
        return false;
    }
};

const groupedVariables = computed(() => {
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

const insertVariable = (variable) => {
    editor.value.chain().focus().insertVariable(variable).run(); // Insert the variable node
};

function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str
        .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
}
</script>

<template>
    <label v-if="label" class="form-label" :class="{ 'mb-1': help }">
        {{ label }}
        <span v-if="required" class="text-danger ms-1">*</span>
    </label>
    <div class="card" :class="{ 'is-invalid': error }">
        <div class="card-header sticky-top h-auto bg-white p-0">
            <div v-if="editor" class="menu">
                <div class="btn-toolbar">
                    <button class="btn" data-bs-toggle="dropdown" aria-expanded="false" v-if="props.variables != null">Variabelen</button>
                    <ul class="dropdown-menu" v-if="props.variables != null">
                        <li v-for="(group, groupName) in groupedVariables" :key="groupName" class="dropdown-submenu has-sub">
                            <button :id="'subdropdown_' + slugify(groupName)" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
                                {{ groupName }}
                            </button>
                            <ul class="dropdown-menu" :aria-labelledby="'subdropdown_' + slugify(groupName)">
                                <li v-for="variable in group" :key="variable.id">
                                    <a class="dropdown-item" @click="insertVariable(variable)">
                                        <span style="color: purple">{{ variable.id }}</span> - {{ variable.name }}
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <button
                        v-if="getEditor('bold')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleBold().run()"
                        :class="editor.isActive('bold') ? 'text-success' : ''"
                    >
                        <i class="bi bi-type-bold" title="Vetgedrukt"></i>
                    </button>
                    <button
                        v-if="getEditor('italic')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleItalic().run()"
                        :class="editor.isActive('italic') ? 'text-success' : ''"
                    >
                        <i class="bi bi-type-italic" title="Schuingedrukt"></i>
                    </button>
                    <button
                        v-if="getEditor('strikethrough')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleStrike().run()"
                        :class="editor.isActive('strike') ? 'text-success' : ''"
                    >
                        <i class="bi bi-type-strikethrough" title="Strikethrough"></i>
                    </button>
                    <button
                        v-if="getEditor('underline')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleUnderline().run()"
                        :class="editor.isActive('underline') ? 'text-success' : ''"
                    >
                        <i class="bi bi-type-underline" title="Underline"></i>
                    </button>
                    <button v-if="getEditor('break')" type="button" class="btn" @click="editor.chain().focus().setHardBreak().run()">
                        <i class="bi bi-arrow-return-left" title="Break"></i>
                    </button>
                    <button v-if="getEditor('clear_formatting')" type="button" class="btn" @click="editor.chain().focus().unsetAllMarks().run()">
                        <i class="bi bi-x-octagon" title="Formattering weghalen"></i>
                    </button>
                    <div class="vr mt-2 mb-2 opacity-25"></div>
                    <button
                        v-if="getEditor('headers')"
                        type="button"
                        class="btn"
                        id="headerSelect"
                        data-bs-toggle="dropdown"
                        :class="editor.isActive('heading') || editor.isActive('paragraph') ? 'text-success' : ''"
                    >
                        <span v-html="getHeading"></span>
                    </button>
                    <ul class="dropdown-menu header-dropdown">
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().setParagraph().run()"
                                :class="editor.isActive('paragraph') ? 'text-success' : ''"
                            >
                                <i class="bi bi-paragraph" title="Paragraaf"></i>
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                                :class="editor.isActive('heading', { level: 1 }) ? 'text-success' : ''"
                            >
                                H1
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                                :class="editor.isActive('heading', { level: 2 }) ? 'text-success' : ''"
                            >
                                H2
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                                :class="editor.isActive('heading', { level: 3 }) ? 'text-success' : ''"
                            >
                                H3
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                                :class="editor.isActive('heading', { level: 4 }) ? 'text-success' : ''"
                            >
                                H4
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                                :class="editor.isActive('heading', { level: 5 }) ? 'text-success' : ''"
                            >
                                H5
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                                :class="editor.isActive('heading', { level: 6 }) ? 'text-success' : ''"
                            >
                                H6
                            </button>
                        </li>
                    </ul>
                    <div class="vr mt-2 mb-2 opacity-25"></div>
                    <button
                        v-if="getEditor('ul')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleBulletList().run()"
                        :class="editor.isActive('bulletList') ? 'text-success' : ''"
                    >
                        <i class="bi bi-list-ul" title="Unordered list"></i>
                    </button>
                    <button
                        v-if="getEditor('ol')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleOrderedList().run()"
                        :class="editor.isActive('orderedList') ? 'text-success' : ''"
                    >
                        <i class="bi bi-list-ol" title="Ordered list"></i>
                    </button>
                    <button
                        v-if="getEditor('codeblock')"
                        type="button"
                        class="btn"
                        @click="editor.chain().focus().toggleCodeBlock().run()"
                        :class="editor.isActive('codeBlock') ? 'text-success' : ''"
                    >
                        <i class="bi bi-code-square" title="Codeblock"></i>
                    </button>
                    <button v-if="getEditor('line')" type="button" class="btn" @click="editor.chain().focus().setHorizontalRule().run()">
                        <i class="bi bi-hr" title="Horizontal line"></i>
                    </button>
                    <button
                        v-if="getEditor('link')"
                        type="button"
                        class="btn"
                        @click="() => (editor.isActive('link') ? editor.chain().focus().unsetLink().run() : setLink())"
                        :class="editor.isActive('link') ? 'text-success' : ''"
                    >
                        <i class="bi bi-link-45deg" title="Link"></i>
                    </button>
                    <button v-if="getEditor('image')" type="button" class="btn" @click="addImage">
                        <i class="bi bi-image" title="Image"></i>
                    </button>
                    <button v-if="getEditor('table')" type="button" class="btn" id="tableSelect" data-bs-toggle="dropdown">
                        <i class="bi bi-table" title="Table"></i>
                    </button>
                    <div class="dropdown-menu table-dropdown">
                        <div class="d-flex flex-column">
                            <button
                                type="button"
                                class="btn"
                                @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
                            >
                                Voeg tabel in
                            </button>
                            <button type="button" class="btn" @click="editor.chain().focus().addColumnBefore().run()">Voeg kolom toe voor</button>
                            <button type="button" class="btn" @click="editor.chain().focus().addColumnAfter().run()">Voeg kolom toe achter</button>
                            <button type="button" class="btn" @click="editor.chain().focus().deleteColumn().run()">Verwijder kolom</button>
                            <button type="button" class="btn" @click="editor.chain().focus().addRowBefore().run()">Voeg rij toe voor</button>
                            <button type="button" class="btn" @click="editor.chain().focus().addRowAfter().run()">Voe rij toe achter</button>
                            <button type="button" class="btn" @click="editor.chain().focus().deleteRow().run()">Verwijder rij</button>
                            <button type="button" class="btn" @click="editor.chain().focus().deleteTable().run()">Verwijder tabel</button>
                        </div>
                        <div class="d-flex flex-column">
                            <button type="button" class="btn" @click="editor.chain().focus().mergeCells().run()">Voeg cellen samen</button>
                            <button type="button" class="btn" @click="editor.chain().focus().splitCell().run()">Split cellen</button>
                        </div>
                    </div>
                    <div class="vr mt-2 mb-2 opacity-25"></div>
                    <button v-if="getEditor('undo')" type="button" class="btn" @click="editor.chain().focus().undo().run()">
                        <i class="bi bi-arrow-counterclockwise" title="Undo"></i>
                    </button>
                    <button v-if="getEditor('redo')" type="button" class="btn" @click="editor.chain().focus().redo().run()">
                        <i class="bi bi-arrow-clockwise" title="Redo"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <EditorContent :editor="editor" />
        </div>
    </div>
    <div v-if="error" class="invalid-feedback">
        {{ error }}
    </div>
</template>

<style lang="scss">
.header-dropdown {
    min-width: 0;
}
.dropdown-hover-all .dropdown-menu,
.dropdown-hover > .dropdown-menu.dropend {
    margin-left: -1px !important;
}
.ProseMirror {
    height: 200px;
    resize: vertical;
    overflow: auto;
    padding: 1.5rem !important;

    > * + * {
        margin-top: 0.75em;
    }

    a {
        color: #2c7be5;
        text-decoration: underline;
        cursor: auto;
    }

    table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        margin: 0;
        overflow: hidden;

        td,
        th {
            min-width: 1em;
            border: 2px solid #ced4da;
            padding: 3px 5px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;

            > * {
                margin-bottom: 0;
            }
        }

        th {
            font-weight: bold;
            text-align: left;
            background-color: #f1f3f5;
        }

        .selectedCell:after {
            z-index: 2;
            position: absolute;
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background: rgba(200, 200, 255, 0.4);
            pointer-events: none;
        }

        .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: -2px;
            width: 4px;
            background-color: #adf;
            pointer-events: none;
        }

        p {
            margin: 0;
        }
    }

    li > p:first-child {
        display: inline;
    }
}

.tableWrapper {
    padding: 1rem 0;
    overflow-x: auto;
}

.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
}

.table-dropdown.show {
    display: flex !important;
}

.ProseMirror span[data-variable] {
    background-color: #f3f0ff;
    color: purple;
    font-weight: bold;
}

.dropdown-submenu {
    position: relative;
}

.dropdown-submenu > .dropdown-menu {
    top: 0;
    left: 100%;
    margin-top: -1px;
    display: none;
}

.dropdown-submenu:hover > .dropdown-menu {
    display: block;
}

.dropdown-menu > .dropdown-submenu > .dropdown-item::after {
    content: '>';
    float: right;
}

.dropdown-menu {
    white-space: nowrap;
}

.has-sub {
    cursor: pointer;
    &::after {
        content: '>';
        float: right;
        height: 100%;
        margin-top: 5px;
        margin-right: 5px;
    }
}
.tiptap.ProseMirror {
    height: 350px;
}
</style>
