import { NavItem } from '@renderer/types/navigation'
import { Cog } from 'lucide-vue-next'

const sidebarFooter = [
    {
        items: [
            {
                title: 'Settings',
                route: 'settings',
                current: 'settings',
                icon: Cog,
                badgeVariant: 'destructive'
            },
        ] as NavItem[]
    }
]

export default sidebarFooter
