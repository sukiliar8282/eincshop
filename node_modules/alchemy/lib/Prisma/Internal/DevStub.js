import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.js";
export const DEV_TIMESTAMP = "1970-01-01T00:00:00.000Z";
export const devId = (type, id) => `dev:${type}:${id}`;
export const isRecord = (value) => typeof value === "object" && value !== null;
const attr = (value, key) => isRecord(value) ? value[key] : undefined;
export const attrOrString = (value, attrName) => typeof value === "string"
    ? value
    : isRecord(value) && typeof value[attrName] === "string"
        ? value[attrName]
        : undefined;
export const attrOrNullableString = (value, key) => {
    const candidate = attr(value, key);
    return candidate === null || typeof candidate === "string"
        ? candidate
        : undefined;
};
export const attrOrRedactedString = (value, key) => {
    const candidate = attr(value, key);
    return Redacted.isRedacted(candidate)
        ? Redacted.make(String(Redacted.value(candidate)))
        : typeof candidate === "string"
            ? Redacted.make(candidate)
            : undefined;
};
/**
 * Build a stateless local provider stub: reconcile merges the previous
 * outputs with freshly fabricated attributes, read echoes persisted state,
 * and delete is a no-op.
 */
export const devProvider = (resource, stables, attrs) => Provider.succeed(resource, {
    stables,
    list: () => Effect.succeed([]),
    diff: Effect.fn(function* () {
        return { action: "update" };
    }),
    read: Effect.fn(function* ({ output }) {
        return output;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const newsRecord = isRecord(news) ? news : {};
        const outputRecord = isRecord(output) ? output : undefined;
        return {
            ...outputRecord,
            ...attrs({ id, news: newsRecord, output: outputRecord }),
        };
    }),
    delete: Effect.fn(function* () { }),
});
//# sourceMappingURL=DevStub.js.map