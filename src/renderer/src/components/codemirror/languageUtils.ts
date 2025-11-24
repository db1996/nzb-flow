import { LanguageInfo } from '@renderer/types/codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { LanguageSupport } from '@codemirror/language'
import { json } from '@codemirror/lang-json'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { handlebarsLanguage } from '@xiechao/codemirror-lang-handlebars'

export const SupportedLanguages: LanguageInfo[] = [
    { id: 'markdown', name: 'Markdown' },
    { id: 'json', name: 'JSON' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' }
]

export function getLanguageExtension(language: LanguageInfo): LanguageSupport {
    switch (language.id) {
        case 'markdown':
            return markdown()
        case 'json':
            return json()
        case 'javascript':
            return javascript()
        case 'typescript':
            return javascript({ typescript: true })
        case 'python':
            return python()
        case 'java':
            return java()
        case 'cpp':
            return cpp()
        case 'html':
            return html()
        case 'css':
            return css()
        case 'handlebars':
            return new LanguageSupport(handlebarsLanguage)
        default:
            return markdown()
    }
}
