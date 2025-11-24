import * as yup from 'yup'

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
]);
