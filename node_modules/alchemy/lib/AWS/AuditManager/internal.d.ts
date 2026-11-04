import * as Redacted from "effect/Redacted";
/**
 * Distilled decodes `smithy.api#sensitive` strings to `Redacted<string>` on
 * responses while accepting plain strings on requests. Attributes expose
 * plain strings, so unwrap defensively.
 */
export declare const unredact: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
/**
 * Audit Manager tag maps arrive as `{ [key]: string | undefined }` — narrow
 * to the `Record<string, string>` shape the Tags helpers expect.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
//# sourceMappingURL=internal.d.ts.map