export function formatDate(d?: string | Date, withTime = false): string {
    if (!d) return "—";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(d));
}

export function formatSize(bytes: number): string {
    if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
    if (bytes >= 1_048_576)     return (bytes / 1_048_576).toFixed(1)     + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
}

export function formatBalance(balance: number | undefined): string {
    const n = Number(balance ?? 0);
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
    if (n >= 10_000)    return "$" + (n / 1_000).toFixed(1)     + "K";
    return "$" + n.toFixed(2);
}

interface ApiError {
    response?: {
        data?: {
            error?: string | { message?: string } | Array<{ message?: string }>;
        };
    };
    message?: string;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
    if (!err || typeof err !== "object") return fallback;
    const e = err as ApiError;
    const msg = e.response?.data?.error;
    if (Array.isArray(msg)) return msg.map(m => m.message ?? String(m)).join(", ");
    if (typeof msg === "object" && msg !== null) return msg.message ?? fallback;
    if (typeof msg === "string") return msg;
    return e.message ?? fallback;
}
