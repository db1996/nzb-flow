import * as yup from 'yup'

export type RandomSettings = {
    randomNameMode: boolean
    customName: string
    prefix: string
    suffix: string
    randomNameLength: number
    useLowercase: boolean
    useUppercase: boolean
    useNumbers: boolean
    useSpecialCharacters: boolean
}

export const RandomSettingsYupSchema: yup.Schema<RandomSettings> = yup.object({
    randomNameMode: yup.boolean().default(true),
    customName: yup.string().default(''),
    prefix: yup.string().default(''),
    suffix: yup.string().default(''),
    randomNameLength: yup.number().default(10),
    useLowercase: yup.boolean().default(true),
    useUppercase: yup.boolean().default(true),
    useNumbers: yup.boolean().default(true),
    useSpecialCharacters: yup.boolean().default(false)
}) as yup.Schema<RandomSettings>

export const RandomSettingsYupSchemaName: yup.Schema<RandomSettings> = yup.object({
    randomNameMode: yup.boolean().default(false),
    customName: yup.string().default('{fname}'),
    prefix: yup.string().default(''),
    suffix: yup.string().default(''),
    randomNameLength: yup.number().default(10),
    useLowercase: yup.boolean().default(true),
    useUppercase: yup.boolean().default(true),
    useNumbers: yup.boolean().default(true),
    useSpecialCharacters: yup.boolean().default(false)
}) as yup.Schema<RandomSettings>
