import { isPlainObject } from "./data.js";
export const normalizeNulls = (value) => {
    if (value === null) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeNulls(item));
    }
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value)
            .map(([key, nested]) => [key, normalizeNulls(nested)])
            .filter(([, nested]) => nested !== undefined));
    }
    return value;
};
export const stableValue = (value) => {
    if (Array.isArray(value)) {
        return value.map(stableValue);
    }
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, nested]) => [key, stableValue(nested)]));
    }
    return value;
};
export const stableStringify = (value) => JSON.stringify(stableValue(normalizeNulls(value) ?? null));
//# sourceMappingURL=stable.js.map