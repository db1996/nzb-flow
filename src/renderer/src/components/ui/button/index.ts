import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',

                secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                success:
                    'bg-green-500 text-white shadow-xs hover:bg-green-600 focus-visible:ring-green-500/20 dark:bg-green-600 dark:hover:bg-green-500 dark:focus-visible:ring-green-400/40',
                warning:
                    'bg-amber-500 text-white shadow-xs hover:bg-amber-600 focus-visible:ring-amber-500/20 dark:bg-amber-600 dark:hover:bg-amber-500 dark:focus-visible:ring-amber-400/40',
                info:
                    'bg-blue-500 text-white shadow-xs hover:bg-blue-600 focus-visible:ring-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-blue-400/40',
                outline_default: 'border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',
                outline_destructive:
                    'border border-destructive text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
                outline_success:
                    'border border-green-500 text-green-500 hover:bg-green-500/10 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-400/40',
                outline_warning:
                    'border border-amber-500 text-amber-500 hover:bg-amber-500/10 focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-400/40',
                outline_info:
                    'border border-blue-500 text-blue-500 hover:bg-blue-500/10 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/40',
                outline_ghost:
                    'border border-transparent text-primary hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                xs: 'h-4 rounded-md gap-1 px-1 has-[>svg]:px-2 has-[>svg]:py-4 ',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
