import { BadgeVariants } from '@renderer/components/ui/badge'
import { Route } from '@renderer/types/routes'
import type { LucideIcon } from 'lucide-vue-next'

export interface BreadcrumbItem {
    title: string
    route?: Route
}

export interface NavItem {
    title: string
    route?: Route
    icon?: LucideIcon
    current?: Route
    isVisible?: boolean
    badge?: string | number
    badgeVariant?: BadgeVariants['variant']
    children?: NavItem[]
    isExpanded?: boolean
    isDivider?: boolean
}

export interface NavGroup {
    name: string
    items: NavItem[]
}
