import { CommandStep } from '@main/enums/CommandStep'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import moment from 'moment'
import { ref, onUnmounted } from 'vue'
import { debounce } from 'lodash'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function setCookie(name: string, value: string, days: number = 365) {
    let expires = ''
    if (days) {
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        expires = '; expires=' + date.toUTCString()
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/'
}
export function getCookie(name: string) {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

export function timestampToLocale(timestamp: number) {
    return moment(timestamp).fromNow(true)
}

export function useTrackedDebounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
    const remaining = ref(0)
    const isRunning = ref(false)

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let startTime = 0
    let intervalId: ReturnType<typeof setInterval> | null = null

    const debounced = debounce((...args: Parameters<T>) => {
        clearInterval(intervalId!)
        isRunning.value = false
        remaining.value = 0
        fn(...args)
    }, wait)

    const wrapped = (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId)
        startTime = Date.now()
        isRunning.value = true
        remaining.value = wait

        // Start tracking time left
        clearInterval(intervalId!)
        intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime
            const timeLeft = Math.max(wait - elapsed, 0)
            remaining.value = timeLeft
            if (timeLeft <= 0) {
                clearInterval(intervalId!)
            }
        }, 16) // ~60fps update

        debounced(...args)
    }

    onUnmounted(() => {
        clearInterval(intervalId!)
        debounced.cancel()
    })

    return { call: wrapped, remaining, isRunning }
}
