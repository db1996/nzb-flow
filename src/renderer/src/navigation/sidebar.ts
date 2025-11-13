import { NavItem } from '@renderer/types/navigation'
import { Clock, FolderSync, Home, ListCheck, UserCog } from 'lucide-vue-next'

const sidebar = [
    {
        items: [
            {
                isDivider: true
            },
            {
                title: 'Upload/queue',
                route: 'home',
                current: 'home',
                icon: Home
            },
            {
                title: 'Approve',
                route: 'approval',
                current: 'approval',
                icon: ListCheck
            },
            {
                title: 'History',
                route: 'history',
                current: 'history',
                icon: Clock
            },
            {
                title: 'Profiles',
                route: 'profiles',
                current: 'profiles',
                icon: UserCog
            },
            {
                title: 'Folder monitoring',
                route: 'folders',
                icon: FolderSync,
                current: 'folders.*',
                isVisible: true
            }
        ] as NavItem[]
    }
]

export default sidebar
