/**
 * Normalize the accepted `domain` prop shapes (`string` shorthand, `null`
 * clear) into the object form. A bare string is always a standalone
 * canonical hostname, so the shorthand result satisfies any accepted
 * domain shape.
 * @internal
 */
export const normalizeWebsiteDomain = (domain) => domain == null
    ? undefined
    : typeof domain === "string"
        ? { name: domain }
        : domain;
//# sourceMappingURL=shared.js.map