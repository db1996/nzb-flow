import { BadgeVariants } from '@renderer/components/ui/badge'
import { LucideIcon } from 'lucide-vue-next'

export interface SettingsTabSection {
    id: string
    label: string
    badgeVariant?: BadgeVariants['variant']
    badgeIcon?: LucideIcon
}
