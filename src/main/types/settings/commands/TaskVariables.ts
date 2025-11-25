import * as yup from 'yup'
import { CodeMirrorVariable } from '../../../../renderer/src/types/codemirror'

export type TaskVariableFile = {
    name: string
    absolutePath: string
    relativePath: string | null
    size: number
}

export const TaskVariableFileYupSchema: yup.Schema<TaskVariableFile> = yup.object({
    name: yup.string().default(''),
    absolutePath: yup.string().default(''),
    relativePath: yup.string().nullable().default(null),
    size: yup.number().default(0)
}) as yup.Schema<TaskVariableFile>

export type TaskVariables = {
    fname: string | null
    jobname: string | null

    raw_size: number | null // Size of choosen files and folders before RARing
    rar_size: number | null // Size of the RAR files
    rar_count: number | null // Number of RAR files created
    rar_time: number | null // Time taken to RAR the files in seconds
    par_size: number | null // Size of the PAR files
    par_count: number | null // Number of PAR files created
    par_time: number | null // Time taken to PAR the files in seconds
    nyuu_size: number | null // Size of the NYUU files (RAR + PAR)
    nyuu_time: number | null // Time taken to NYUU the files in seconds

    total_time: number | null // Total processing time (including queue pauses)

    raw_files: TaskVariableFile[] // List of original files selected
    rar_files: TaskVariableFile[] // List of RAR files created
    par_files: TaskVariableFile[] // List of PAR files created
    nyuu_files: TaskVariableFile[] // List of NYUU files created
}

export const TaskVariablesYupSchema: yup.Schema<TaskVariables> = yup.object({
    fname: yup.string().nullable().default(null),
    jobname: yup.string().nullable().default(null),

    raw_size: yup.number().nullable().default(null),
    rar_size: yup.number().nullable().default(null),
    rar_count: yup.number().nullable().default(null),
    rar_time: yup.number().nullable().default(null),
    par_size: yup.number().nullable().default(null),
    par_count: yup.number().nullable().default(null),
    par_time: yup.number().nullable().default(null),
    nyuu_size: yup.number().nullable().default(null),
    nyuu_time: yup.number().nullable().default(null),

    total_time: yup.number().nullable().default(null),

    raw_files: yup
        .array()
        .of(TaskVariableFileYupSchema)
        .default(() => []),
    rar_files: yup
        .array()
        .of(TaskVariableFileYupSchema)
        .default(() => []),
    par_files: yup
        .array()
        .of(TaskVariableFileYupSchema)
        .default(() => []),
    nyuu_files: yup
        .array()
        .of(TaskVariableFileYupSchema)
        .default(() => [])
}) as yup.Schema<TaskVariables>

export const BUILT_IN_VARIABLES_KEYS = new Set<string>([
    'fname',
    'jobname',

    'raw_size',

    'rar_size',
    'rar_count',
    'rar_time',

    'par_size',
    'par_count',
    'par_time',

    'nyuu_size',
    'nyuu_time',
    'total_time',

    'raw_files',
    'rar_files',
    'par_files',
    'nyuu_files'
])

export const CODEMIRROR_VARIABLES: CodeMirrorVariable[] = [
    {
        name: 'File Name',
        key: 'fname',
        loopable: false,
        description:
            'The name of the original file or folder selected for processing. This can be the folder or file name'
    },
    {
        name: 'Job Name',
        key: 'jobname',
        loopable: false,
        description:
            'The name of the job being processed. This will be the same as the name of the rar/par2/nzb files unless manually changed.'
    },
    {
        name: 'Raw Size',
        key: 'raw_size',
        customTemplate: '{{sizeHuman raw_size}}',
        loopable: false,
        description: 'The total size (in bytes) of the original files and folders before RARing.',
        variants: [
            { name: 'Human readable', template: '{{sizeHuman raw_size}}' },
            { name: 'Bytes', template: '{{raw_size}}' },
            { name: 'Kilobytes', template: '{{sizeKB raw_size}}' },
            { name: 'Megabytes', template: '{{sizeMB raw_size}}' },
            { name: 'Gigabytes', template: '{{sizeGB raw_size}}' },
            { name: 'Terabytes', template: '{{sizeTB raw_size}}' }
        ]
    },
    {
        name: 'RAR Size',
        key: 'rar_size',
        customTemplate: '{{sizeHuman rar_size}}',
        loopable: false,
        description: 'The total size (in bytes) of the RAR files created.',
        variants: [
            { name: 'Human readable', template: '{{sizeHuman rar_size}}' },
            { name: 'Bytes', template: '{{rar_size}}' },
            { name: 'Kilobytes', template: '{{sizeKB rar_size}}' },
            { name: 'Megabytes', template: '{{sizeMB rar_size}}' },
            { name: 'Gigabytes', template: '{{sizeGB rar_size}}' },
            { name: 'Terabytes', template: '{{sizeTB rar_size}}' }
        ]
    },
    {
        name: 'RAR Count',
        key: 'rar_count',
        loopable: false,
        description: 'The number of RAR files created.'
    },
    {
        name: 'RAR Time',
        key: 'rar_time',
        customTemplate: '{{timeHuman rar_time}}',
        loopable: false,
        description: 'The time taken to RAR the files (in milliseconds).',
        info: 'timeMS are the milliseconds left over after seconds are calculated. For example, if the RARing took 12.345 seconds, timeS would be 12 and timeMS would be 345.',
        variants: [
            { name: 'Human readable', template: '{{timeHuman rar_time}}' },
            { name: 'Milliseconds', template: '{{rar_time}}' },
            {
                name: 'Custom',
                template:
                    '{{timeH rar_time}}:{{timeM rar_time}}:{{timeS rar_time}} {{timeMS rar_time}}'
            }
        ]
    },
    {
        name: 'PAR Size',
        key: 'par_size',
        customTemplate: '{{sizeHuman par_size}}',
        loopable: false,
        description: 'The total size (in bytes) of the PAR files created.',
        variants: [
            { name: 'Human readable', template: '{{sizeHuman par_size}}' },
            { name: 'Bytes', template: '{{par_size}}' },
            { name: 'Kilobytes', template: '{{sizeKB par_size}}' },
            { name: 'Megabytes', template: '{{sizeMB par_size}}' },
            { name: 'Gigabytes', template: '{{sizeGB par_size}}' },
            { name: 'Terabytes', template: '{{sizeTB par_size}}' }
        ]
    },
    {
        name: 'PAR Count',
        key: 'par_count',
        loopable: false,
        description: 'The number of PAR files created.'
    },
    {
        name: 'PAR Time',
        key: 'par_time',
        customTemplate: '{{timeHuman par_time}}',
        loopable: false,
        description: 'The time taken to PAR the files (in milliseconds).',
        info: 'timeMS are the milliseconds left over after seconds are calculated. For example, if the PARing took 12.345 seconds, timeS would be 12 and timeMS would be 345.',
        variants: [
            { name: 'Human readable', template: '{{timeHuman par_time}}' },
            { name: 'Milliseconds', template: '{{par_time}}' },
            {
                name: 'Custom',
                template:
                    '{{timeH par_time}}:{{timeM par_time}}:{{timeS par_time}} {{timeMS par_time}}'
            }
        ]
    },
    {
        name: 'NYUU Size',
        key: 'nyuu_size',
        customTemplate: '{{sizeHuman nyuu_size}}',
        loopable: false,
        description:
            'The total size (in bytes) of the files posted. (This is RAR + PAR sizes, or if RAR is disabled PAR + raw).',
        variants: [
            { name: 'Human readable', template: '{{sizeHuman nyuu_size}}' },
            { name: 'Bytes', template: '{{nyuu_size}}' },
            { name: 'Kilobytes', template: '{{sizeKB nyuu_size}}' },
            { name: 'Megabytes', template: '{{sizeMB nyuu_size}}' },
            { name: 'Gigabytes', template: '{{sizeGB nyuu_size}}' },
            { name: 'Terabytes', template: '{{sizeTB nyuu_size}}' }
        ]
    },
    {
        name: 'NYUU Time',
        key: 'nyuu_time',
        customTemplate: '{{timeHuman nyuu_time}}',
        loopable: false,
        description: 'The time taken to post the files with nyuu (in milliseconds).',
        info: 'timeMS are the milliseconds left over after seconds are calculated. For example, if the NYUUing took 12.345 seconds, timeS would be 12 and timeMS would be 345.',
        variants: [
            { name: 'Human readable', template: '{{timeHuman nyuu_time}}' },
            { name: 'Milliseconds', template: '{{nyuu_time}}' },
            {
                name: 'Custom',
                template:
                    '{{timeH nyuu_time}}:{{timeM nyuu_time}}:{{timeS nyuu_time}} {{timeMS nyuu_time}}'
            }
        ]
    },
    {
        name: 'Total Time',
        key: 'total_time',
        customTemplate: '{{timeHuman total_time}}',
        loopable: false,
        description:
            'The total processing time including, waiting in the queue does not count. (in milliseconds).',
        info: 'timeMS are the milliseconds left over after seconds are calculated. For example, if the total processing took 12.345 seconds, timeS would be 12 and timeMS would be 345.',
        variants: [
            { name: 'Human readable', template: '{{timeHuman total_time}}' },
            { name: 'Milliseconds', template: '{{total_time}}' },
            {
                name: 'Custom',
                template:
                    '{{timeH total_time}}:{{timeM total_time}}:{{timeS total_time}} {{timeMS total_time}}'
            }
        ]
    },

    {
        name: 'Raw Files',
        key: 'raw_files',
        loopable: true,
        customTemplate: `
{{#each raw_files}}
    - {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}`,
        description:
            'List of original files selected for processing. Each file has the properties: name, absolutePath, relativePath, size.',
        loopKeys: ['name', 'absolutePath', 'relativePath', 'size']
    },
    {
        name: 'RAR Files',
        key: 'rar_files',
        loopable: true,
        customTemplate: `
{{#each rar_files}}
    - {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}`,
        description:
            'List of RAR files created. Each file has the properties: name, absolutePath, relativePath, size.',
        loopKeys: ['name', 'absolutePath', 'relativePath', 'size']
    },
    {
        name: 'PAR Files',
        key: 'par_files',
        loopable: true,
        customTemplate: `
{{#each par_files}}
    - {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}`,
        description:
            'List of PAR files created. Each file has the properties: name, absolutePath, relativePath, size.',
        loopKeys: ['name', 'absolutePath', 'relativePath', 'size']
    },
    {
        name: 'NYUU Files',
        key: 'nyuu_files',
        loopable: true,
        customTemplate: `
{{#each nyuu_files}}
    - {{this.relativePath}} ({{sizeHuman this.size}})
{{/each}}`,
        description:
            'List of NYUU files created. Each file has the properties: name, absolutePath, relativePath, size.',
        loopKeys: ['name', 'absolutePath', 'relativePath', 'size']
    }
]
