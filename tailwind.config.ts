import type { Config } from 'tailwindcss'

export default {
    content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {}
    },
    plugins: []
} satisfies Config
