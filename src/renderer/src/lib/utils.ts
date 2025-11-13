import { CommandStep } from "@main/enums/CommandStep";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setCookie(name: string, value: string, days: number = 365) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
export function getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function timestampToLocale(timestamp: number) {
    return moment(timestamp).fromNow(true);
}


export function currentStepToStatusCol(currentStep: CommandStep) {
    switch (currentStep) {
        case CommandStep.RAR:
            return "RAR-ing file";
        case CommandStep.PAR:
            return "PAR-ing file";
        case CommandStep.POST:
            return "Posting file";
        case CommandStep.ERROR:
            return "Failed";
        case CommandStep.FINISH:
            return "Finished";
        default:
            return "Unknown";
    }
  }
