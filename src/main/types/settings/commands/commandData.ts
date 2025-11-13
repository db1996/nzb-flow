import * as yup from 'yup'

export default class CommandData {
    public output: string = ''
    public error: string = ''
    public started: boolean = false
    public finished: boolean = false
    public exitCode: number | null = null
    public executedCommand: string = ''
    public lastMessage: string = ''
    public lastKnownProgress: number = 0
}

export const CommandDataYupSchema: yup.Schema<CommandData> = yup.object({
    output: yup.string().default(''),
    error: yup.string().default(''),
    started: yup.boolean().default(false),
    finished: yup.boolean().default(false),
    exitCode: yup.number().nullable().default(null),
    executedCommand: yup.string().default(''),
    lastMessage: yup.string().default(''),
    lastKnownProgress: yup.number().default(0)
})
