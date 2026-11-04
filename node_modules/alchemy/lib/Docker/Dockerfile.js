import * as Output from "../Output.js";
/** Structural guard for {@link InlineDockerfile} vs a path string. */
export const isInlineDockerfile = (value) => typeof value === "object" && value !== null && "content" in value;
/**
 * Tagged template producing {@link InlineDockerfile}. Interpolations may be
 * plain strings or `Output<string>`s (resolved at deploy time via
 * `Output.interpolate`); with no interpolations the content is a plain string.
 */
export const inline = (template, ...args) => ({
    content: args.length === 0
        ? template.raw.join("")
        : Output.interpolate(template, ...args),
});
//# sourceMappingURL=Dockerfile.js.map