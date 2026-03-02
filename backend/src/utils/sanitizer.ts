export function sanitizeSearchQuery(query: string | undefined): string | undefined {
    if (!query) return undefined;

    let sanitized = query.trim();

    if (sanitized.length === 0) return undefined;

    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }

    sanitized = sanitized.replace(/[^\p{L}\p{N}\s\-_.]/gu, "");

    sanitized = sanitized.replace(/\s+/g, " ").trim();

    return sanitized || undefined;
}

export function sanitizeNumericInput(value: any, defaultValue: number, min: number, max: number): number {
    const num = typeof value === "number" ? value : Number(value);

    if (isNaN(num) || num < min) return defaultValue;
    if (num > max) return max;

    return Math.floor(num);
}
