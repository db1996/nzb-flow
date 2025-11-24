import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/router'
import { useSettingsStore } from './composables/settingsStore'
import { useTasksStore } from './composables/useTasksStore'
import { useUpdateStore } from './composables/useUpdateStore'
import { createTheme, Theme } from './components/codemirror/useTheme'
import VueCodeMirror from 'vue-codemirror'

const app = createApp(App)
app.use(createPinia())

const settingsStore = useSettingsStore()
settingsStore.init()

const tasksStore = useTasksStore()
tasksStore.init()

const updateStore = useUpdateStore()
updateStore.initUpdateStore()

app.use(router)
app.use(VueCodeMirror, {
    options: {
        tabSize: 4,
        indentWithTab: true,
        lineWrapping: true
    }
})
app.use(createTheme(Theme.Dark))
app.mount('#app')
