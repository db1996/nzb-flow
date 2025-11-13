import  { NavItem } from '@renderer/types/navigation';
import { Route } from '@renderer/types/routes';
import { useRoute } from 'vue-router';


export function resolve(input?: Route | null): string {
    if (!input) {
        return '#';
    }

    if (Array.isArray(input)) {
        const [name, params = {}] = input;
        const str = name + '?' + new URLSearchParams(params as Record<string, string>).toString();
        return str;
    }

    return input as string;
}



export function isCurrent(input?: Route | null): boolean {
    if (!input) {
        return false;
    }
    const route = useRoute();

    if (Array.isArray(input)) {
        const [name, params = {}] = input;
        if(route.name === name) {
            for (const [key, value] of Object.entries(params as Record<string, string>)) {
                if (route.params[key] != value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    if(typeof input === 'string') {
        // Handle wildcard matching
        if (input.endsWith('.*')) {
            const baseRoute = input.slice(0, -2);
            return route.name?.toString().startsWith(baseRoute) ?? false;
        }
        return route.name === input;
    }

    return false;
}

export function back(): void {
    window.history.back();
}

export function isExpanded(item: NavItem): boolean {
    if (item.route && isCurrent(item.route)) {
        return true;
    }

    if (item.children) {
        return item.children.some((child) => isCurrent(child.route));
    }

    return false;
}

export function isVisible(item: NavItem): boolean {
    if (item.isVisible === false) {
        return false;
    }

    if (item.children) {
        return item.children.some((child) => isVisible(child));
    }

    return true;
}
