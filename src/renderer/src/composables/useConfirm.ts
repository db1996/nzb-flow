import { ref } from 'vue';

type ConfirmOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
};

const isOpen = ref(false);
const options = ref<ConfirmOptions>({});
let resolver: ((confirmed: boolean) => void) | null = null;

export function useConfirm() {
    function confirm(opts: ConfirmOptions = {}) {
        options.value = {
            title: opts.title ?? 'Confirm Action',
            description: opts.description ?? 'Are you sure you want to proceed?',
            confirmText: opts.confirmText ?? 'Confirm',
            cancelText: opts.cancelText ?? 'Cancel',
        };

        isOpen.value = true;

        return new Promise<boolean>((resolve) => {
            resolver = resolve;
        });
    }

    function resolve(result: boolean) {
        isOpen.value = false;
        if (resolver) {
            resolver(result);
            resolver = null;
        }
    }

    return {
        isOpen,
        options,
        confirm,
        resolve,
    };
}
