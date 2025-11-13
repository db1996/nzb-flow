import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import HomePage from '@renderer/pages/HomePage.vue'
import SettingsPage from '@renderer/pages/SettingsPage.vue'
import FoldersPage from '@renderer/pages/FoldersPage.vue'
import HistoryPage from '@renderer/pages/HistoryPage.vue'
import ApprovalPage from '@renderer/pages/ApprovalPage.vue'
import ProfilesPage from '@renderer/pages/ProfilesPage.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'entry',
        redirect: 'home'
    },
    {
        path: '/home',
        name: 'home',
        component: HomePage
    },
    {
        path: '/approval',
        name: 'approval',
        component: ApprovalPage
    },
    {
        path: '/history',
        name: 'history',
        component: HistoryPage
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsPage
    },
    {
        path: '/folders',
        name: 'folders',
        component: FoldersPage
    },
    {
        path: '/profiles',
        name: 'profiles',
        component: ProfilesPage
    },
    {
        path: '/folders',
        name: 'folders',
        component: FoldersPage
    }
    // {
    //     path: '/edit/:index',
    //     name: 'edit',
    //     component: EditPage
    // },
    // {
    //     path: '/edit/:index/:plugin',
    //     name: 'edit-plugin',
    //     component: EditPage
    // },
    // {
    //     path: '/add/:code/:plugin?',
    //     name: 'add',
    //     component: AddPage
    // }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    linkActiveClass: 'border-indigo-500',
    linkExactActiveClass: 'border-indigo-700',
})

export default router
