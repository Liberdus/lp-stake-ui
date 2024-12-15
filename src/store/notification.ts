import { atom } from "jotai";

interface Notification {
    message: string;
    severity: "success" | "error" | "info" | "warning";
    variant: "filled" | "outlined" | "standard";
    duration?: number;
}

export const notificationAtom = atom<Notification | null>(null);
