import * as yup from 'yup'

export type TaskVariables = {
    fname: string | null
    rar_size: number | null
    rar_count: number | null
    rar_time: number | null
    par_size: number | null
    par_count: number | null
    par_time: number | null
    nyuu_time: number | null

    total_size: number | null
    total_time: number | null
}

export const TaskVariablesYupSchema: yup.Schema<TaskVariables> = yup.object({
    fname: yup.string().nullable().default(null),
    rar_size: yup.number().nullable().default(null),
    rar_count: yup.number().nullable().default(null),
    rar_time: yup.number().nullable().default(null),
    par_size: yup.number().nullable().default(null),
    par_count: yup.number().nullable().default(null),
    par_time: yup.number().nullable().default(null),
    nyuu_time: yup.number().nullable().default(null),

    total_size: yup.number().nullable().default(null),
    total_time: yup.number().nullable().default(null),
}) as yup.Schema<TaskVariables>

