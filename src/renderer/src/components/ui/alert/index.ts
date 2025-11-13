import { cva, type VariantProps } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

export const alertVariants = cva(
    'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'border-destructive/20 bg-destructive/5 text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
                warning:
                    'border-yellow-500/20 bg-yellow-500/5 text-yellow-800 dark:text-yellow-200 [&>svg]:text-yellow-600 *:data-[slot=alert-description]:text-yellow-700 dark:*:data-[slot=alert-description]:text-yellow-300',
                success:
                    'border-green-500/20 bg-green-500/5 text-green-800 dark:text-green-200 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-700 dark:*:data-[slot=alert-description]:text-green-300',
                info: 'border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-200 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-700 dark:*:data-[slot=alert-description]:text-blue-300'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
)

export type AlertVariants = VariantProps<typeof alertVariants>
