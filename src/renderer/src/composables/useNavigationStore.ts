import type { NavGroup } from '@renderer/types/navigation';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useNavigationStore = defineStore('navigation', () => {
    const navs = reactive<Record<string, NavGroup[]>>({});

    async function loadNavigation(key: string): Promise<NavGroup[]> {
        if (navs[key]) {
            return navs[key];
        }

        try {
            const host = await import(`@renderer/navigation/${key}.ts`);
            navs[key] = host.default ?? [];
            return navs[key];
        } catch {
            try {
                const fallback = await import(`@renderer/navigation/${key}.ts`);

                navs[key] = fallback.default ?? [];

                return navs[key];
            } catch {
                console.warn(`[useNavigation] Navigation file "${key}.ts" not found.`);

                navs[key] = [];

                return [];
            }
        }
    }

    async function getNavigation(key: string): Promise<NavGroup[]> {
        if (!navs[key]) {
            await loadNavigation(key);
        }

        return navs[key] ?? [];
    }

    return {
        navs,
        getNavigation,
    };
});
