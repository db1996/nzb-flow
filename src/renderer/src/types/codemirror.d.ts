export interface LanguageInfo {
    id: string
    name: string
}

export interface CodeMirrorVariable {
    name: string
    key: string
    loopable: boolean
    variants?: CodeMirrorVariableVariant[]

    loopKeys?: string[]

    description?: string
    help?: string
    info?: string
}

export interface CodeMirrorVariableVariant {
    name: string
    template: string
}
